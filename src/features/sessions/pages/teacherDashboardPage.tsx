"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SessionDashboard } from "@/features/sessions/dashboard/components/SessionDashboard";
import { TeacherGate } from "@/features/sessions/components/teacherGate";
import { TeacherSessionPanel } from "@/features/sessions/components/teacherSessionPanel";
import { useSessionPoll } from "@/features/sessions/hooks/useSessionPoll";
import type { TestSession } from "@/features/sessions/types/testSession";
import { getSession } from "@/lib/supabase/sessions";

export function TeacherDashboardPage() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [teacherKey, setTeacherKey] = useState("");
  const [verified, setVerified] = useState(false);
  const [pollEnabled, setPollEnabled] = useState(true);

  const pollActive = pollEnabled && verified;
  const {
    results,
    loading: resultsLoading,
    error: resultsError,
  } = useSessionPoll(sessionId, pollActive);

  useEffect(() => {
    const keyFromUrl = searchParams.get("key");
    if (keyFromUrl) {
      setTeacherKey(keyFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      setLoading(true);
      setLoadError(null);

      try {
        const loaded = await getSession(sessionId);
        if (cancelled) {
          return;
        }

        setSession(loaded);
        if (!loaded) {
          setPollEnabled(false);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load this session.");
          setPollEnabled(false);
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
    };
  }, [sessionId]);

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleEnded = useCallback(() => {
    setSession((current) =>
      current ? { ...current, active: false } : current,
    );
    setPollEnabled(false);
  }, []);

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">Loading session…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>
        <Link href="/share">
          <Button variant="outline">Back to share</Button>
        </Link>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Session not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This session does not exist or may have been removed.
        </p>
        <Link href="/share">
          <Button variant="outline">Back to share</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-6 sm:p-8">
      {!session.active ? (
        <div
          className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
          role="status"
        >
          This session has ended. You can still view and import remaining results.
        </div>
      ) : null}

      <TeacherGate
        session={session}
        teacherKey={teacherKey}
        onTeacherKeyChange={setTeacherKey}
        verified={verified}
        onVerify={handleVerify}
      >
        <div className="flex w-full flex-col gap-8">
          <SessionDashboard session={session} results={results} />
          <TeacherSessionPanel
            sessionId={sessionId}
            session={session}
            ownerName={session.ownerName}
            active={session.active}
            results={results}
            resultsLoading={resultsLoading}
            resultsError={resultsError}
            onEnded={handleEnded}
          />
        </div>
      </TeacherGate>
    </main>
  );
}
