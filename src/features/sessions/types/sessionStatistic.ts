import type { TestResult } from "@/features/stats/type/testResult";
import type { TestTrace } from "@/features/stats/type/testTrace";

export type SessionStatistic = {
  id: string;
  sessionId: string;
  testId: string;
  ownerName: string;
  trace: TestTrace;
  result: TestResult;
  importedAt: string;
};
