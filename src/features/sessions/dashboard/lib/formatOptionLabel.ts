import type { Question } from "@/features/tests/types/question";

export function formatOptionLabel(
  question: Question | undefined,
  optionIndex: number,
): string {
  if (!question) {
    return `Option ${optionIndex + 1}`;
  }

  const option = question.options.find((item) => item.index === optionIndex);
  return option?.text ?? `Option ${optionIndex + 1}`;
}

export function formatOptionLabels(
  question: Question | undefined,
  optionIndices: number[],
): string {
  if (optionIndices.length === 0) {
    return "—";
  }

  return optionIndices
    .map((index) => formatOptionLabel(question, index))
    .join(", ");
}
