import type { Question } from "../types/question";

/** Парсить числове значення з тексту варіанта (дроби, десяткові, цілі, градуси). */
export function parseOrderOptionValue(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fraction = trimmed.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (fraction) {
    const denom = Number(fraction[2]);
    if (denom === 0) return null;
    return Number(fraction[1]) / denom;
  }

  const numberMatch = trimmed.match(/-?\d+(?:[,.]\d+)?/);
  if (!numberMatch) return null;

  const normalized = numberMatch[0].replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Чи всі варіанти мають різні числові значення (одна правильна послідовність). */
export function hasUniqueOrderValues(question: Question): boolean {
  if (question.type !== "order" || question.options.length < 2) return false;

  const values = question.options.map((o) => parseOrderOptionValue(o.text));
  if (values.some((v) => v === null)) return false;

  return new Set(values).size === values.length;
}

/** Єдиний правильний порядок: від найменшого значення до найбільшого. */
export function uniqueAscendingOrder(
  options: Question["options"],
): number[] | null {
  const parsed = options.map((o) => ({
    index: o.index,
    value: parseOrderOptionValue(o.text),
  }));

  if (parsed.some((p) => p.value === null)) return null;
  if (new Set(parsed.map((p) => p.value)).size !== parsed.length) return null;

  return [...parsed]
    .sort((a, b) => a.value! - b.value!)
    .map((p) => p.index);
}

export function getOrderQuestionAmbiguityError(question: Question): string | null {
  if (question.type !== "order") return null;
  if (question.options.length < 2) {
    return "Додайте щонайменше два варіанти.";
  }

  const texts = question.options.map((o) => o.text.trim());
  if (new Set(texts).size !== texts.length) {
    return "Тексти варіантів мають відрізнятися.";
  }

  const values = question.options.map((o) => parseOrderOptionValue(o.text));
  if (values.every((v) => v !== null)) {
    if (new Set(values).size !== values.length) {
      return "Усі значення мають бути різними — інакше можливі кілька правильних послідовностей.";
    }
    return null;
  }

  return "Для питання на послідовність використовуйте різні числа (наприклад: 0,4; −2; 90°).";
}

export function normalizeOrderCorrectOptions(question: Question): number[] {
  const unique = uniqueAscendingOrder(question.options);
  if (unique) return unique;

  return question.correctOptions.filter((i) =>
    question.options.some((o) => o.index === i),
  );
}
