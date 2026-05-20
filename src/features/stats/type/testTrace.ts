export type TestTrace = {
  id: string;
  testId: string;
  answers: {
    questionId: string;
    selectedOptions: number[] | undefined;
    attemptedIndex: number;
  }[];
  /** ISO 8601 timestamp */
  endTime?: string;
  /** ISO 8601 timestamp */
  startTime: string;
  sessionId?: string;
  sharedWithOwner?: boolean;
};
