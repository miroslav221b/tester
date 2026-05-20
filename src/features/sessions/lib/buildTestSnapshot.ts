import type { TestSnapshot } from "@/features/sessions/types/testSnapshot";
import type { Question } from "@/features/tests/types/question";
import type { Test } from "@/features/tests/types/test";

export function buildTestSnapshot(test: Test, questions: Question[]): TestSnapshot {
  return { test, questions };
}

export function buildTestSnapshotFromStore(
  tests: Test[],
  questions: Question[],
  testId: string,
): TestSnapshot | null {
  const test = tests.find((t) => t.id === testId);
  if (!test) {
    return null;
  }

  const testQuestions = test.questionIds
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined);

  return buildTestSnapshot(test, testQuestions);
}
