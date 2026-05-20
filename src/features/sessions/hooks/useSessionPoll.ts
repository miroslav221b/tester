"use client";

import { useEffect, useState } from "react";

import {
  listSessionResults,
  type SessionResultRow,
} from "@/lib/supabase/sessionResults";

export function useSessionPoll(sessionId: string, enabled: boolean) {
  const [results, setResults] = useState<SessionResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    let cancelled = false;

    async function fetchResults() {
      try {
        const rows = await listSessionResults(sessionId);
        if (!cancelled) {
          setResults(rows);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load session results.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchResults();
    const intervalId = window.setInterval(() => {
      void fetchResults();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [sessionId, enabled]);

  return { results, loading, error };
}
