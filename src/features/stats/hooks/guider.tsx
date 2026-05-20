"use client";

import { useMemo } from "react";

import { useAppSelector } from "@/features/store/hooks";
import {
  selectQuestionsForAttempt,
  selectTestForAttempt,
  selectTraceById,
} from "@/features/store/selectors";

import {
  getNextQuestionId,
  resolveCurrentQuestionId,
} from "./tracer";

export type SequenceGuiderResult = {
  currentQuestionId: string | null;
  nextAfterCorrect: string | null;
  nextAfterWrong: string | null;
  nextAfterSkip: string | null;
};

export function useSequenceGuider({
  testId,
  traceId,
}: {
  testId: string;
  traceId: string | null | undefined;
}): SequenceGuiderResult {
  const test = useAppSelector(selectTestForAttempt(testId));
  const questions = useAppSelector(selectQuestionsForAttempt(testId));
  const trace = useAppSelector(selectTraceById(traceId ?? ""));

  return useMemo(() => {
    const empty: SequenceGuiderResult = {
      currentQuestionId: null,
      nextAfterCorrect: null,
      nextAfterWrong: null,
      nextAfterSkip: null,
    };

    if (!test || !trace) {
      return empty;
    }

    const currentQuestionId = resolveCurrentQuestionId(test, trace, questions);
    if (!currentQuestionId) {
      return empty;
    }

    return {
      currentQuestionId,
      nextAfterCorrect: getNextQuestionId(test, currentQuestionId, true),
      nextAfterWrong: getNextQuestionId(test, currentQuestionId, false),
      nextAfterSkip: getNextQuestionId(test, currentQuestionId, false),
    };
  }, [questions, test, trace]);
}
