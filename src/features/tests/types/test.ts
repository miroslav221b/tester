import { SequenceScheme } from "./sequenceScheme";
export type TestType =
  | "math"
  | "physics"
  | "history"
  | "language"
  | "psychology"
  | "business"
  | "entertainment"
  | "poll";
export type Test = {
  id: string;
  title: string;
  description: string;
  type: TestType;
  questionIds: string[];
  sequenceScheme: SequenceScheme;
};
