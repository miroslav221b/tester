"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Question } from "@/features/tests/types/question";
import type {
  SequenceScheme,
  SequenceSchemeEntry,
} from "@/features/tests/types/sequenceScheme";
import type { Test } from "@/features/tests/types/test";
import {
  endTrace,
  recordAnswer,
  setActiveTrace,
  startTrace,
} from "@/features/store/slices/testTracesSlice";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import {
  selectIsSessionSnapshotReady,
  selectQuestionsForAttempt,
  selectTestForAttempt,
  selectTraceById,
} from "@/features/store/selectors";

import {
  isBranchString,
  normalizeFlowStartEntry,
  parseBranch,
} from "@/features/tests/lib/sequenceSchemeGraph";

import {
  computeTestResult,
  isAnswerCorrect,
} from "../lib/computeTestResult";
import type { TestResult } from "../type/testResult";
import type { TestTrace } from "../type/testTrace";

export type StartTestResult = {
  traceId: string;
  firstQuestionId: string;
};

export type TracerReturnType = {
  currentQuestionId: string | null;
  traceId: string | null;
  submitAnswer: (
    questionId: string,
    selectedOptions: number[],
  ) => string | null;
  skipQuestion: () => string | null;
  startTest: () => StartTestResult;
  endTest: () => TestResult;
};

type SchemeValue = SequenceScheme[string];

function isBranchEntry(
  entry: SchemeValue,
): entry is `${SequenceSchemeEntry}-W|R-${SequenceSchemeEntry}` {
  return typeof entry === "string" && isBranchString(entry);
}

function parseBranchEntry(entry: string) {
  return parseBranch(entry);
}

function resolveSequenceTarget(
  test: Test,
  entry: SequenceSchemeEntry,
): string | null {
  if (entry === null || entry === "__flow_finish__") {
    return null;
  }
  return test.questionIds.includes(entry) ? entry : null;
}

function getFlowStartQuestionId(test: Test): string | null {
  const startEntry = normalizeFlowStartEntry(test.sequenceScheme.__flow_start__);
  return resolveSequenceTarget(test, startEntry);
}

function getFirstQuestionId(test: Test): string | null {
  return getFlowStartQuestionId(test);
}

function getNextQuestionId(
  test: Test,
  questionId: string,
  isCorrect: boolean,
): string | null {
  const entry = test.sequenceScheme[questionId];
  if (entry === undefined) return null;

  if (isBranchEntry(entry)) {
    const { wrong, correct } = parseBranchEntry(entry);
    return resolveSequenceTarget(test, isCorrect ? correct : wrong);
  }

  return resolveSequenceTarget(test, entry);
}

function resolveCurrentQuestionId(
  test: Test,
  trace: TestTrace,
  questions: Question[],
): string | null {
  if (trace.endTime) return null;
  if (trace.answers.length === 0) {
    return getFirstQuestionId(test);
  }

  const last = trace.answers[trace.answers.length - 1];
  const question = questions.find((q) => q.id === last.questionId);
  const isCorrect =
    last.selectedOptions !== undefined &&
    question !== undefined &&
    isAnswerCorrect(question, last.selectedOptions);

  return getNextQuestionId(test, last.questionId, isCorrect);
}

export function useTracer({
  testId,
  traceId: initialTraceId,
  sessionId,
}: {
  testId: string;
  traceId?: string;
  sessionId?: string;
}): TracerReturnType {
  const dispatch = useAppDispatch();
  const test = useAppSelector(selectTestForAttempt(testId));
  const questions = useAppSelector(selectQuestionsForAttempt(testId));
  const isSessionSnapshotReady = useAppSelector(
    selectIsSessionSnapshotReady(sessionId ?? "", testId),
  );
  const [traceId, setTraceId] = useState<string | null>(initialTraceId ?? null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null,
  );
  const stepCountRef = useRef(0);
  const trace = useAppSelector(selectTraceById(traceId ?? ""));
  const hydratedTraceIdRef = useRef<string | null>(null);
  const sessionSnapshotReadyRef = useRef(false);

  const canHydrateFromTrace =
    sessionId === undefined || (testId !== "" && isSessionSnapshotReady);

  useEffect(() => {
    if (sessionId !== undefined && isSessionSnapshotReady && !sessionSnapshotReadyRef.current) {
      hydratedTraceIdRef.current = null;
    }
    sessionSnapshotReadyRef.current =
      sessionId === undefined || isSessionSnapshotReady;
  }, [isSessionSnapshotReady, sessionId]);

  useEffect(() => {
    if (!initialTraceId || !test || !trace || !canHydrateFromTrace) return;
    if (trace.id !== initialTraceId || trace.testId !== testId) return;
    if (hydratedTraceIdRef.current === initialTraceId) return;

    hydratedTraceIdRef.current = initialTraceId;
    dispatch(setActiveTrace(initialTraceId));
    setTraceId(initialTraceId);
    stepCountRef.current = trace.answers.length;
    setCurrentQuestionId(resolveCurrentQuestionId(test, trace, questions));
  }, [
    canHydrateFromTrace,
    dispatch,
    initialTraceId,
    questions,
    test,
    testId,
    trace,
  ]);

  const requireTest = useCallback((): Test => {
    if (!test) {
      throw new Error(`Test "${testId}" was not found.`);
    }
    return test;
  }, [test, testId]);

  const requireActiveSession = useCallback(() => {
    const activeTest = requireTest();
    if (!traceId || !currentQuestionId) {
      throw new Error(
        "Call startTest() before submitting or skipping questions.",
      );
    }
    return {
      test: activeTest,
      traceId,
      currentQuestionId,
    };
  }, [currentQuestionId, requireTest, traceId]);

  const advance = useCallback(
    (
      questionId: string,
      selectedOptions: number[] | undefined,
    ): string | null => {
      const { test: activeTest, traceId: activeTraceId } =
        requireActiveSession();

      dispatch(
        recordAnswer({
          traceId: activeTraceId,
          questionId,
          selectedOptions,
        }),
      );

      const question = questions.find((q) => q.id === questionId);
      const isCorrect =
        selectedOptions !== undefined &&
        question !== undefined &&
        isAnswerCorrect(question, selectedOptions);

      stepCountRef.current += 1;

      const nextQuestionId = getNextQuestionId(
        activeTest,
        questionId,
        isCorrect,
      );
      setCurrentQuestionId(nextQuestionId);
      return nextQuestionId;
    },
    [dispatch, questions, requireActiveSession],
  );

  const startTest = useCallback(() => {
    const activeTest = requireTest();
    const firstQuestionId = getFirstQuestionId(activeTest);
    if (!firstQuestionId) {
      throw new Error(`Test "${testId}" has no questions.`);
    }

    const newTraceId = crypto.randomUUID();
    dispatch(
      startTrace({
        id: newTraceId,
        testId: activeTest.id,
        ...(sessionId !== undefined && { sessionId }),
      }),
    );

    setTraceId(newTraceId);
    setCurrentQuestionId(firstQuestionId);
    stepCountRef.current = 0;
    return { traceId: newTraceId, firstQuestionId };
  }, [dispatch, requireTest, sessionId, testId]);

  const submitAnswer = useCallback(
    (questionId: string, selectedOptions: number[]) => {
      const { currentQuestionId } = requireActiveSession();
      if (questionId !== currentQuestionId) {
        throw new Error(
          `Expected answer for question "${currentQuestionId}", received "${questionId}".`,
        );
      }
      return advance(questionId, selectedOptions);
    },
    [advance, requireActiveSession],
  );

  const skipQuestion = useCallback(() => {
    const { currentQuestionId } = requireActiveSession();
    return advance(currentQuestionId, undefined);
  }, [advance, requireActiveSession]);

  const endTest = useCallback(() => {
    const activeTest = requireTest();
    if (!traceId || !trace) {
      throw new Error("Call startTest() before ending the test.");
    }

    dispatch(endTrace({ id: traceId }));
    return computeTestResult(activeTest, trace, questions);
  }, [dispatch, questions, requireTest, trace, traceId]);

  return {
    currentQuestionId,
    traceId,
    startTest,
    submitAnswer,
    skipQuestion,
    endTest,
  };
}

export const tracer = useTracer;
