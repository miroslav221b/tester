import { importSessionStatistic } from "@/features/store/slices/sessionStatisticsSlice";
import { createTrace } from "@/features/store/slices/testTracesSlice";
import type { AppDispatch } from "@/features/store/store";
import type { SessionStatistic } from "@/features/sessions/types/sessionStatistic";
import type { TestSession } from "@/features/sessions/types/testSession";
import type { SessionResultRow } from "@/lib/supabase/sessionResults";

export function importSessionResult(
  dispatch: AppDispatch,
  session: TestSession,
  resultRow: SessionResultRow,
): void {
  const trace = {
    ...resultRow.trace,
    sessionId: session.id,
    sharedWithOwner: true,
  };

  const statistic: SessionStatistic = {
    id: resultRow.id,
    sessionId: session.id,
    testId: session.testId,
    ownerName: session.ownerName,
    trace,
    result: resultRow.result,
    importedAt: new Date().toISOString(),
  };

  dispatch(importSessionStatistic(statistic));
  dispatch(createTrace(trace));
}
