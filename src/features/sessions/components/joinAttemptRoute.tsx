"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { useSessionTest } from "@/features/sessions/hooks/useSessionTest";
import { useTracer } from "@/features/stats/hooks/tracer";
import { useAppSelector } from "@/features/store/hooks";
import {
  selectIsSessionSnapshotReady,
  selectQuestionForAttempt,
  selectTestForAttempt,
  selectTraceById,
} from "@/features/store/selectors";
import { QuestionPage } from "@/features/tests/pages/questionPage";

export function JoinAttemptRoute() {
  const router = useRouter();
  const params = useParams<{ sessionId: string; attempt: string }>();
  const sessionId = params.sessionId;
  const attemptId = params.attempt;
  const {
    test: contextTest,
    questions: sessionQuestions,
    loading,
    error,
    sessionEnded,
  } = useSessionTest();
  const testId = contextTest?.id ?? "";
  const snapshotReady = useAppSelector(
    selectIsSessionSnapshotReady(sessionId, testId),
  );
  const test = useAppSelector(selectTestForAttempt(testId));
  const trace = useAppSelector(selectTraceById(attemptId));
  const {
    currentQuestionId,
    submitAnswer,
    skipQuestion,
    endTest,
  } = useTracer({ testId, traceId: attemptId, sessionId });
  const questionFromStore = useAppSelector(
    selectQuestionForAttempt(currentQuestionId ?? ""),
  );
  const question = useMemo(() => {
    if (!currentQuestionId) return undefined;
    return (
      sessionQuestions.find((q) => q.id === currentQuestionId) ??
      questionFromStore
    );
  }, [currentQuestionId, questionFromStore, sessionQuestions]);

  const finishIfDone = useCallback(
    (nextQuestionId: string | null) => {
      if (nextQuestionId === null) {
        endTest();
        router.push(`/join/${sessionId}/${attemptId}/statistic`);
      }
    },
    [attemptId, endTest, router, sessionId],
  );

  const handleSubmit = useCallback(
    (answer: number | number[]) => {
      if (!currentQuestionId) return;
      const selectedOptions = Array.isArray(answer) ? answer : [answer];
      const nextQuestionId = submitAnswer(currentQuestionId, selectedOptions);
      finishIfDone(nextQuestionId);
    },
    [currentQuestionId, finishIfDone, submitAnswer],
  );

  const handleSkip = useCallback(() => {
    const nextQuestionId = skipQuestion();
    finishIfDone(nextQuestionId);
  }, [finishIfDone, skipQuestion]);

  useEffect(() => {
    if (trace?.endTime) {
      router.replace(`/join/${sessionId}/${attemptId}/statistic`);
    }
  }, [attemptId, router, sessionId, trace?.endTime]);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Loading session…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-destructive" role="alert">
          {error}
        </p>
      </main>
    );
  }

  if (sessionEnded) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">This test session has ended.</p>
      </main>
    );
  }

  if (trace?.endTime) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Redirecting to results…</p>
      </main>
    );
  }

  if (!snapshotReady || !test || !trace || trace.testId !== testId) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">
          {!snapshotReady ? "Loading session…" : "Attempt not found."}
        </p>
      </main>
    );
  }

  if (!currentQuestionId || !question) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Loading question…</p>
      </main>
    );
  }

  return (
    <QuestionPage
      key={`${attemptId}-${currentQuestionId}`}
      question={question}
      onSkip={handleSkip}
      onSubmit={handleSubmit}
    />
  );
}
