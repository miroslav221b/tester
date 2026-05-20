import type { Test } from "../types/test";
import { sampleQuestions } from "./sampleQuestions";

function questionsByIds(ids: string[]) {
  return ids.map((id) => sampleQuestions.find((q) => q.id === id)!);
}

export const sampleMathTest: Test = {
  id: "math-basics",
  title: "Algebra Basics",
  description: "Arithmetic, primes, and ordering fractions.",
  type: "math",
  questionIds: ["4", "15", "2"],
  sequenceScheme: {
    __flow_start__: "4",
    "4": "2-W|R-15",
    "15": "4-W|R-2",
    "2": "4-W|R-4",
  },
};

export const samplePhysicsTest: Test = {
  id: "physics-newton",
  title: "Newton's Laws",
  description: "Planets, photosynthesis, and the water cycle.",
  type: "physics",
  questionIds: ["3", "7", "9"],
  sequenceScheme: {
    __flow_start__: "3",
    "3": "7-W|R-9",
    "7": "3-W|R-9",
    "9": "7-W|R-7",
  },
};

export const sampleHistoryTest: Test = {
  id: "history-ww2",
  title: "World War II",
  description: "Timelines, geography, and modern Europe.",
  type: "history",
  questionIds: ["6", "16", "11"],
  sequenceScheme: {
    __flow_start__: "6",
    "6": "11-W|R-16",
    "16": "6-W|R-11",
    "11": "6-W|R-6",
  },
};

export const sampleLanguageTest: Test = {
  id: "language-french",
  title: "French Vocabulary",
  description: "Capitals, literature, and punctuation.",
  type: "language",
  questionIds: ["1", "10", "20"],
  sequenceScheme: {
    __flow_start__: "1",
    "1": "20-W|R-10",
    "10": "1-W|R-20",
    "20": "1-W|R-1",
  },
};

export const sampleTests: Test[] = [
  sampleMathTest,
  samplePhysicsTest,
  sampleHistoryTest,
  sampleLanguageTest,
];

export function getTestById(id: string): Test | undefined {
  return sampleTests.find((test) => test.id === id);
}
