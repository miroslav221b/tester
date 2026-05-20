import type { Question } from "@/features/tests/types/question";
import type { Test } from "@/features/tests/types/test";

import { parseTraceTimestamp } from "./traceTimestamps";
import type { TestResult } from "../type/testResult";
import type { TestTrace } from "../type/testTrace";

export function isAnswerCorrect(
  question: Question,
  selectedOptions: number[],
): boolean {
  const { correctOptions, type } = question;

  switch (type) {
    case "single":
      return (
        selectedOptions.length === 1 &&
        correctOptions.includes(selectedOptions[0])
      );
    case "multiple": {
      if (selectedOptions.length !== correctOptions.length) return false;
      const selected = [...selectedOptions].sort((a, b) => a - b);
      const correct = [...correctOptions].sort((a, b) => a - b);
      return selected.every((value, index) => value === correct[index]);
    }
    case "order":
      return (
        selectedOptions.length === correctOptions.length &&
        selectedOptions.every((value, index) => value === correctOptions[index])
      );
  }
}

export function computeTestResult(
  test: Test,
  trace: TestTrace,
  questions: Question[],
): TestResult {
  const questionById = new Map(questions.map((q) => [q.id, q]));
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let skippedAnswers = 0;
  const problematicQuestions: string[] = [];

  for (const answer of trace.answers) {
    if (answer.selectedOptions === undefined) {
      skippedAnswers += 1;
      continue;
    }

    const question = questionById.get(answer.questionId);
    if (!question) continue;

    if (isAnswerCorrect(question, answer.selectedOptions)) {
      correctAnswers += 1;
    } else {
      incorrectAnswers += 1;
      problematicQuestions.push(answer.questionId);
    }
  }

  const endMs = trace.endTime
    ? parseTraceTimestamp(trace.endTime)
    : Date.now();
  const totalTime = endMs - parseTraceTimestamp(trace.startTime);

  return {
    testId: test.id,
    totalTime,
    correctAnswers,
    incorrectAnswers,
    skippedAnswers,
    totalQuestions: test.questionIds.length,
    totalAnswers: correctAnswers + incorrectAnswers,
    problematicQuestions,
  };
}
