import { normalizeFlowStartEntry } from "@/features/tests/lib/sequenceSchemeGraph";
import type { SequenceSchemeEntry } from "@/features/tests/types/sequenceScheme";
import type { Test } from "@/features/tests/types/test";

function resolveSequenceTarget(
  test: Test,
  entry: SequenceSchemeEntry,
): string | null {
  if (entry === null || entry === "__flow_finish__") {
    return null;
  }
  return test.questionIds.includes(entry) ? entry : null;
}

function getFlowStartQuestionId(test: Test): string | null {
  const startEntry = normalizeFlowStartEntry(test.sequenceScheme.__flow_start__);
  return resolveSequenceTarget(test, startEntry);
}

export function isTestStartable(test: Test): boolean {
  if (test.questionIds.length === 0) return false;
  return getFlowStartQuestionId(test) !== null;
}
