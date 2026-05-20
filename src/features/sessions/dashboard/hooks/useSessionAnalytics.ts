"use client";

import { useMemo } from "react";

import {
  aggregateSessionAnalytics,
  type SessionAnalytics,
} from "@/features/sessions/dashboard/lib/aggregateSessionAnalytics";
import type { TestSession } from "@/features/sessions/types/testSession";
import type { SessionResultRow } from "@/lib/supabase/sessionResults";

export function useSessionAnalytics(
  session: TestSession,
  results: SessionResultRow[],
): SessionAnalytics | null {
  const questions = session.testSnapshot.questions;

  return useMemo(
    () => aggregateSessionAnalytics(results, questions),
    [results, questions],
  );
}
