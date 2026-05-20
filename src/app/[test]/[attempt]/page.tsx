"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { useTracer } from "@/features/stats/hooks/tracer";
import { useAppSelector } from "@/features/store/hooks";
import {
  selectQuestionById,
  selectTestById,
  selectTraceById,
} from "@/features/store/selectors";
import { QuestionPage } from "@/features/tests/pages/questionPage";

export default function TestAttemptRoutePage() {
  const router = useRouter();
  const params = useParams<{ test: string; attempt: string }>();
  const testId = params.test;
  const attemptId = params.attempt;
  const test = useAppSelector(selectTestById(testId));
  const trace = useAppSelector(selectTraceById(attemptId));
  const {
    currentQuestionId,
    submitAnswer,
    skipQuestion,
    endTest,
  } = useTracer({ testId, traceId: attemptId });
  const question = useAppSelector(selectQuestionById(currentQuestionId ?? ""));

  const finishIfDone = useCallback(
    (nextQuestionId: string | null) => {
      if (nextQuestionId === null) {
        endTest();
        router.push(`/${testId}/${attemptId}/statistic`);
      }
    },
    [attemptId, endTest, router, testId],
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
      router.replace(`/${testId}/${attemptId}/statistic`);
    }
  }, [attemptId, router, testId, trace?.endTime]);

  if (trace?.endTime) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Redirecting to results…</p>
      </main>
    );
  }

  if (!test || !trace || trace.testId !== testId) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Attempt not found.</p>
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
