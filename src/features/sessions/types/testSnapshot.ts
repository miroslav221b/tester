import type { Question } from "@/features/tests/types/question";
import type { Test } from "@/features/tests/types/test";

export type TestSnapshot = {
  test: Test;
  questions: Question[];
};
