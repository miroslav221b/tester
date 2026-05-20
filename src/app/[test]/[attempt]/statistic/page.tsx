"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { computeTestResult } from "@/features/stats/lib/computeTestResult";
import { StatisticsPage } from "@/features/stats/pages/statisticsPage";
import { useAppSelector } from "@/features/store/hooks";
import {
  selectQuestionsForTest,
  selectTestById,
  selectTraceById,
} from "@/features/store/selectors";

export default function TestStatisticRoutePage() {
  const router = useRouter();
  const params = useParams<{ test: string; attempt: string }>();
  const testId = params.test;
  const attemptId = params.attempt;
  const test = useAppSelector(selectTestById(testId));
  const trace = useAppSelector(selectTraceById(attemptId));
  const questions = useAppSelector(selectQuestionsForTest(testId));

  const result = useMemo(() => {
    if (!test || !trace || trace.testId !== testId || !trace.endTime) {
      return null;
    }
    return computeTestResult(test, trace, questions);
  }, [questions, test, testId, trace]);

  if (!test || !trace || trace.testId !== testId) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Results not found.</p>
      </main>
    );
  }

  if (!trace.endTime || !result) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">This attempt is not finished yet.</p>
      </main>
    );
  }

  return (
    <StatisticsPage
      testTitle={test.title}
      result={result}
      onReturnToTests={() => router.push("/tests")}
    />
  );
}
