import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "./store";

const selectQuestionsState = (state: RootState) => state.questions.items;
const selectTestsState = (state: RootState) => state.tests.items;
const selectTestTracesState = (state: RootState) => state.testTraces.items;
const selectActiveTraceId = (state: RootState) => state.testTraces.activeTraceId;
const selectSessionStatisticsState = (state: RootState) =>
  state.sessionStatistics.items;
const selectSessionRuntimeState = (state: RootState) => state.sessionRuntime;

export const selectAllQuestions = selectQuestionsState;

export const selectQuestionById = (id: string) =>
  createSelector(selectQuestionsState, (questions) =>
    questions.find((q) => q.id === id),
  );

export const selectAllTests = selectTestsState;

export const selectTestById = (id: string) =>
  createSelector(selectTestsState, (tests) => tests.find((t) => t.id === id));

export const selectQuestionsForTest = (testId: string) =>
  createSelector(
    selectTestsState,
    selectQuestionsState,
    (tests, questions) => {
      const test = tests.find((t) => t.id === testId);
      if (!test) return [];
      return test.questionIds
        .map((id) => questions.find((q) => q.id === id))
        .filter((q): q is NonNullable<typeof q> => q !== undefined);
    },
  );

export const selectRandomQuestion = createSelector(
  selectQuestionsState,
  (questions) => {
    if (questions.length === 0) return undefined;
    return questions[Math.floor(Math.random() * questions.length)];
  },
);

export const selectAllTraces = selectTestTracesState;

export const selectTraceById = (id: string) =>
  createSelector(selectTestTracesState, (traces) =>
    traces.find((t) => t.id === id),
  );

export const selectTracesByTestId = (testId: string) =>
  createSelector(selectTestTracesState, (traces) =>
    traces.filter((t) => t.testId === testId),
  );

export const selectActiveTrace = createSelector(
  selectTestTracesState,
  selectActiveTraceId,
  (traces, activeTraceId) =>
    activeTraceId === null
      ? undefined
      : traces.find((t) => t.id === activeTraceId),
);

export const selectAllSessionStatistics = selectSessionStatisticsState;

export const selectSessionStatisticsBySessionId = (sessionId: string) =>
  createSelector(selectSessionStatisticsState, (statistics) =>
    statistics.filter((s) => s.sessionId === sessionId),
  );

export const selectSessionRuntime = selectSessionRuntimeState;

export const selectSessionRuntimeSnapshot = createSelector(
  selectSessionRuntimeState,
  (runtime) => runtime.testSnapshot,
);

export const selectIsSessionSnapshotReady = (sessionId: string, testId: string) =>
  createSelector(selectSessionRuntimeState, (runtime) =>
    runtime.sessionId === sessionId &&
    runtime.testSnapshot !== null &&
    runtime.testSnapshot.test.id === testId,
  );

export const selectTestForAttempt = (testId: string) =>
  createSelector(
    selectTestsState,
    selectSessionRuntimeSnapshot,
    (tests, snapshot) => {
      if (snapshot?.test.id === testId) {
        return snapshot.test;
      }
      return tests.find((t) => t.id === testId);
    },
  );

export const selectQuestionsForAttempt = (testId: string) =>
  createSelector(
    selectTestsState,
    selectQuestionsState,
    selectSessionRuntimeSnapshot,
    (tests, questions, snapshot) => {
      if (snapshot?.test.id === testId) {
        return snapshot.questions;
      }
      const test = tests.find((t) => t.id === testId);
      if (!test) return [];
      return test.questionIds
        .map((id) => questions.find((q) => q.id === id))
        .filter((q): q is NonNullable<typeof q> => q !== undefined);
    },
  );

export const selectQuestionForAttempt = (questionId: string) =>
  createSelector(
    selectQuestionsState,
    selectSessionRuntimeSnapshot,
    (questions, snapshot) => {
      if (!questionId) return undefined;
      const fromSnapshot = snapshot?.questions.find((q) => q.id === questionId);
      if (fromSnapshot) return fromSnapshot;
      return questions.find((q) => q.id === questionId);
    },
  );
