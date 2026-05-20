"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useSessionTest } from "@/features/sessions/hooks/useSessionTest";
import { useTracer } from "@/features/stats/hooks/tracer";
import { isTestStartable } from "@/features/tests/lib/isTestStartable";
import { WelcomePage } from "@/features/tests/pages/welcomePage";

export function JoinWelcomeRoute() {
  const router = useRouter();
  const {
    sessionId,
    session,
    loading,
    error,
    sessionEnded,
    test,
    questions,
  } = useSessionTest();
  const testId = test?.id ?? "";
  const { startTest } = useTracer({ testId, sessionId });
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = useCallback(() => {
    if (!test || !isTestStartable(test) || sessionEnded) return;
    setIsStarting(true);
    try {
      const { traceId } = startTest();
      router.push(`/join/${sessionId}/${traceId}`);
    } catch {
      setIsStarting(false);
    }
  }, [router, sessionEnded, sessionId, startTest, test]);

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

  if (!session || !test) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Session not found.</p>
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
