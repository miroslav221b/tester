"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useSessionTest } from "@/features/sessions/hooks/useSessionTest";
import { computeTestResult } from "@/features/stats/lib/computeTestResult";
import {
  StatisticsPage,
  type ShareStatus,
} from "@/features/stats/pages/statisticsPage";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import {
  selectQuestionsForAttempt,
  selectTestForAttempt,
  selectTraceById,
} from "@/features/store/selectors";
import { updateTrace } from "@/features/store/slices/testTracesSlice";
import { submitSessionResult } from "@/lib/supabase/sessionResults";

export function JoinStatisticRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams<{ sessionId: string; attempt: string }>();
  const attemptId = params.attempt;
  const { sessionId, test: contextTest, loading, error } = useSessionTest();
  const testId = contextTest?.id ?? "";
  const test = useAppSelector(selectTestForAttempt(testId));
  const trace = useAppSelector(selectTraceById(attemptId));
  const questions = useAppSelector(selectQuestionsForAttempt(testId));

  const alreadyShared = trace?.sharedWithOwner === true;
  const [shareStatus, setShareStatus] = useState<ShareStatus>(() =>
    alreadyShared ? "sent" : "idle",
  );

  useEffect(() => {
    if (trace?.sharedWithOwner) {
      setShareStatus("sent");
    }
  }, [trace?.sharedWithOwner]);

  const result = useMemo(() => {
    if (!test || !trace || trace.testId !== testId || !trace.endTime) {
      return null;
    }
    return computeTestResult(test, trace, questions);
  }, [questions, test, testId, trace]);

  const handleShareWithOwner = useCallback(async () => {
    if (!trace || !result || shareStatus === "sending" || shareStatus === "sent") {
      return;
    }

    setShareStatus("sending");
    try {
      await submitSessionResult({ sessionId, trace, result });
      dispatch(
        updateTrace({
          id: attemptId,
          changes: { sharedWithOwner: true },
        }),
      );
      setShareStatus("sent");
    } catch {
      setShareStatus("error");
    }
  }, [attemptId, dispatch, result, sessionId, shareStatus, trace]);

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

  const canShare = !alreadyShared && shareStatus !== "sent";

  return (
    <StatisticsPage
      testTitle={test.title}
      result={result}
      onReturnToTests={() => router.push(`/join/${sessionId}`)}
      onShareWithOwner={canShare ? handleShareWithOwner : undefined}
      shareStatus={shareStatus}
    />
  );
}
