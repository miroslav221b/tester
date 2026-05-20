"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useTracer } from "@/features/stats/hooks/tracer";
import { useAppSelector } from "@/features/store/hooks";
import {
  selectQuestionsForTest,
  selectTestById,
} from "@/features/store/selectors";
import { isTestStartable } from "@/features/tests/lib/isTestStartable";
import { WelcomePage } from "@/features/tests/pages/welcomePage";

export function TestWelcomeRoute() {
  const router = useRouter();
  const params = useParams<{ test: string }>();
  const testId = params.test;
  const test = useAppSelector(selectTestById(testId));
  const questions = useAppSelector(selectQuestionsForTest(testId));
  const { startTest } = useTracer({ testId });
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = useCallback(() => {
    if (!test || !isTestStartable(test)) return;
    setIsStarting(true);
    try {
      const { traceId } = startTest();
      router.push(`/${testId}/${traceId}`);
    } catch {
      setIsStarting(false);
    }
  }, [router, startTest, test, testId]);

  if (!test) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Test not found.</p>
      </main>
    );
  }

  return (
    <WelcomePage
      test={test}
      questionCount={questions.length}
      canStart={isTestStartable(test)}
      onStart={handleStart}
      isStarting={isStarting}
    />
  );
}
