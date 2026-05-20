import type { TestResult } from "@/features/stats/type/testResult";
import type { TestTrace } from "@/features/stats/type/testTrace";
import { getSupabase } from "@/lib/supabase/client";

export type SessionResultRow = {
  id: string;
  sessionId: string;
  trace: TestTrace;
  result: TestResult;
  createdAt: string;
};

type SessionResultDbRow = {
  id: string;
  session_id: string;
  trace: TestTrace;
  result: TestResult;
  created_at: string;
};

function toSessionResultRow(row: SessionResultDbRow): SessionResultRow {
  return {
    id: row.id,
    sessionId: row.session_id,
    trace: row.trace,
    result: row.result,
    createdAt: row.created_at,
  };
}

export async function submitSessionResult(params: {
  sessionId: string;
  trace: TestTrace;
  result: TestResult;
}): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("session_results")
    .insert({
      session_id: params.sessionId,
      trace: params.trace,
      result: params.result,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function listSessionResults(
  sessionId: string,
): Promise<SessionResultRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("session_results")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    toSessionResultRow(row as SessionResultDbRow),
  );
}
