import type { TestSnapshot } from "@/features/sessions/types/testSnapshot";
import type { TestSession } from "@/features/sessions/types/testSession";
import { getSupabase } from "@/lib/supabase/client";

export type { TestSnapshot } from "@/features/sessions/types/testSnapshot";

export type SessionRow = TestSession;

type SessionDbRow = {
  id: string;
  test_id: string;
  owner_name: string;
  teacher_key: string;
  test_snapshot: TestSnapshot;
  active: boolean;
  created_at: string;
};

function toSessionRow(row: SessionDbRow): SessionRow {
  return {
    id: row.id,
    testId: row.test_id,
    ownerName: row.owner_name,
    teacherKey: row.teacher_key,
    testSnapshot: row.test_snapshot,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function createSession(params: {
  testId: string;
  ownerName: string;
  teacherKey: string;
  testSnapshot: TestSnapshot;
}): Promise<{ sessionId: string; teacherKey: string }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      test_id: params.testId,
      owner_name: params.ownerName,
      teacher_key: params.teacherKey,
      test_snapshot: params.testSnapshot,
      active: true,
    })
    .select("id, teacher_key")
    .single();

  if (error) {
    throw error;
  }

  return { sessionId: data.id, teacherKey: data.teacher_key };
}

export async function getSession(sessionId: string): Promise<SessionRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return toSessionRow(data as SessionDbRow);
}

export async function endSession(sessionId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("sessions")
    .update({ active: false })
    .eq("id", sessionId);

  if (error) {
    throw error;
  }
}
