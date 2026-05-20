import type { TestSnapshot } from "./testSnapshot";

export type TestSession = {
  id: string;
  testId: string;
  ownerName: string;
  teacherKey: string;
  testSnapshot: TestSnapshot;
  active: boolean;
  createdAt: string;
};
