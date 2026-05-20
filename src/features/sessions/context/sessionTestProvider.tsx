"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  clearSessionRuntime,
  setSessionRuntime,
} from "@/features/store/slices/sessionRuntimeSlice";
import { useAppDispatch } from "@/features/store/hooks";
import type { Question } from "@/features/tests/types/question";
import type { Test } from "@/features/tests/types/test";
import type { TestSession } from "@/features/sessions/types/testSession";
import { getSession } from "@/lib/supabase/sessions";

export type SessionTestContextValue = {
  sessionId: string;
  session: TestSession | null;
  loading: boolean;
  error: string | null;
  sessionEnded: boolean;
  test: Test | undefined;
  questions: Question[];
};

export const SessionTestContext = createContext<SessionTestContextValue | null>(
  null,
);

export function SessionTestProvider({
  sessionId,
  children,
}: {
  sessionId: string;
  children: ReactNode;
}) {
  const dispatch = useAppDispatch();
  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      setLoading(true);
      setError(null);

      try {
        const loaded = await getSession(sessionId);
        if (cancelled) {
          return;
        }

        if (!loaded) {
          setSession(null);
          return;
        }

        setSession(loaded);
        dispatch(
          setSessionRuntime({
            sessionId,
            testSnapshot: loaded.testSnapshot,
          }),
        );
      } catch {
        if (!cancelled) {
          setError("Could not load this session.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
      dispatch(clearSessionRuntime());
    };
  }, [dispatch, sessionId]);

  const sessionEnded = session !== null && !session.active;
  const test = session?.testSnapshot.test;
  const questions = session?.testSnapshot.questions ?? [];

  const value = useMemo<SessionTestContextValue>(
    () => ({
      sessionId,
      session,
      loading,
      error,
      sessionEnded,
      test,
      questions,
    }),
    [sessionId, session, loading, error, sessionEnded, test, questions],
  );

  return (
    <SessionTestContext.Provider value={value}>
      {children}
    </SessionTestContext.Provider>
  );
}
