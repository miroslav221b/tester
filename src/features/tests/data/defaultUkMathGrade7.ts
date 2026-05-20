import type { Question } from "../types/question";
import type { SequenceScheme } from "../types/sequenceScheme";
import type { Test } from "../types/test";

function q(n: number) {
  return `uk-m7-${String(n).padStart(2, "0")}`;
}

/** 10 питань, 3 типи (single / multiple / order). Мін. шлях — 4 відповіді, макс. — 10. */
export const defaultUkMathGrade7Questions: Question[] = [
  {
    id: q(1),
    type: "single",
    text: "[Натуральні числа] Обчисліть: 48 ÷ 6 + 7",
    options: [
      { index: 0, text: "13" },
      { index: 1, text: "15" },
      { index: 2, text: "14" },
      { index: 3, text: "16" },
    ],
    correctOptions: [1],
  },
  {
    id: q(2),
    type: "multiple",
    text: "[Дроби] Оберіть усі вирази, що дорівнюють 3/4",
    options: [
      { index: 0, text: "0,75" },
      { index: 1, text: "6/8" },
      { index: 2, text: "9/12" },
      { index: 3, text: "4/3" },
    ],
    correctOptions: [0, 1, 2],
  },
  {
    id: q(3),
    type: "order",
    text: "[Порівняння] Розташуйте числа від найменшого до найбільшого.",
    options: [
      { index: 0, text: "0,5" },
      { index: 1, text: "0,375" },
      { index: 2, text: "0,45" },
      { index: 3, text: "0,4" },
    ],
    correctOptions: [1, 3, 2, 0],
  },
  {
    id: q(4),
    type: "single",
    text: "[Відсотки] Скільки відсотків становить 15 з 60?",
    options: [
      { index: 0, text: "20%" },
      { index: 1, text: "25%" },
      { index: 2, text: "30%" },
      { index: 3, text: "40%" },
    ],
    correctOptions: [1],
  },
  {
    id: q(5),
    type: "multiple",
    text: "[Пропорції] Для яких пар чисел співвідношення 2 : 5 виконується?",
    options: [
      { index: 0, text: "4 і 10" },
      { index: 1, text: "6 і 15" },
      { index: 2, text: "8 і 18" },
      { index: 3, text: "10 і 25" },
    ],
    correctOptions: [0, 1, 3],
  },
  {
    id: q(6),
    type: "order",
    text: "[Геометрія] Розташуйте кути за зростанням їхньої міри (у градусах).",
    options: [
      { index: 0, text: "180°" },
      { index: 1, text: "45°" },
      { index: 2, text: "135°" },
      { index: 3, text: "90°" },
    ],
    correctOptions: [1, 3, 2, 0],
  },
  {
    id: q(7),
    type: "single",
    text: "[Рівняння] Знайдіть x: x − 12 = 28",
    options: [
      { index: 0, text: "36" },
      { index: 1, text: "40" },
      { index: 2, text: "16" },
      { index: 3, text: "48" },
    ],
    correctOptions: [1],
  },
  {
    id: q(8),
    type: "multiple",
    text: "[Дільність] Оберіть усі дільники числа 36",
    options: [
      { index: 0, text: "4" },
      { index: 1, text: "7" },
      { index: 2, text: "9" },
      { index: 3, text: "12" },
    ],
    correctOptions: [0, 2, 3],
  },
  {
    id: q(9),
    type: "order",
    text: "[Цілі числа] Розташуйте числа від найменшого до найбільшого.",
    options: [
      { index: 0, text: "3" },
      { index: 1, text: "−5" },
      { index: 2, text: "0" },
      { index: 3, text: "−2" },
    ],
    correctOptions: [1, 3, 2, 0],
  },
  {
    id: q(10),
    type: "single",
    text: "[Степінь] Обчисліть: 2⁴",
    options: [
      { index: 0, text: "8" },
      { index: 1, text: "16" },
      { index: 2, text: "32" },
      { index: 3, text: "64" },
    ],
    correctOptions: [1],
  },
];

/**
 * Основна лінія (усі відповіді правильні): q1 → q2 → q3 → q4 → завершення (4 кроки).
 * При помилках: q1→q7, q2→q8, q3→q6, q4→q9→q5→q10 → завершення (до 10 кроків).
 */
export const defaultUkMathGrade7SequenceScheme = {
  __flow_start__: q(1),
  [q(1)]: `${q(7)}-W|R-${q(2)}`,
  [q(2)]: `${q(8)}-W|R-${q(3)}`,
  [q(3)]: `${q(6)}-W|R-${q(4)}`,
  [q(4)]: `${q(9)}-W|R-__flow_finish__`,
  [q(5)]: `${q(10)}-W|R-__flow_finish__`,
  [q(6)]: q(4),
  [q(7)]: q(2),
  [q(8)]: q(3),
  [q(9)]: `${q(5)}-W|R-__flow_finish__`,
  [q(10)]: "__flow_finish__",
} as const satisfies SequenceScheme;

export const defaultUkMathGrade7Test: Test = {
  id: "uk-math-7",
  title: "Математика, 7 клас (базовий тест)",
  description:
    "10 питань українською: арифметика, дроби, відсотки, пропорції, геометрія. Три типи завдань. Адаптивна послідовність: від 4 до 10 кроків.",
  type: "math",
  questionIds: defaultUkMathGrade7Questions.map((x) => x.id),
  sequenceScheme: defaultUkMathGrade7SequenceScheme,
};

export function getDefaultTestsAndQuestions(): {
  questions: Question[];
  tests: Test[];
} {
  return {
    questions: defaultUkMathGrade7Questions,
    tests: [defaultUkMathGrade7Test],
  };
}
