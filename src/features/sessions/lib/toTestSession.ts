import type { TestSession } from "@/features/sessions/types/testSession";
import type { SessionRow } from "@/lib/supabase/sessions";

export function toTestSession(row: SessionRow): TestSession {
  return {
    id: row.id,
    testId: row.testId,
    ownerName: row.ownerName,
    teacherKey: row.teacherKey,
    testSnapshot: row.testSnapshot,
    active: row.active,
    createdAt: row.createdAt,
  };
}
