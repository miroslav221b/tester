export type TestResult = {
  testId: string;
  totalTime: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  totalQuestions: number;
  totalAnswers: number;
  problematicQuestions: string[];
};
