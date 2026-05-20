import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { sampleTests } from "@/features/tests/data/sampleTests";
import {
  branchTargetsFromEntry,
  formatSequenceEntry,
  isFlowStartNode,
  pruneSequenceScheme,
  setConnection,
  setFlowStartConnection as setFlowStartOnScheme,
  type BranchSide,
} from "@/features/tests/lib/sequenceSchemeGraph";
import type {
  SequenceScheme,
  SequenceSchemeEntry,
} from "@/features/tests/types/sequenceScheme";
import type { Test, TestType } from "@/features/tests/types/test";

export type TestsState = {
  items: Test[];
};

const initialState: TestsState = {
  items: sampleTests,
};

type SequenceEntry = SequenceScheme[string];

function findTestIndex(state: TestsState, id: string) {
  return state.items.findIndex((t) => t.id === id);
}

const testsSlice = createSlice({
  name: "tests",
  initialState,
  reducers: {
    createTest: (state, action: PayloadAction<Test>) => {
      if (state.items.some((t) => t.id === action.payload.id)) return;
      state.items.push(action.payload);
    },
    updateTest: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<Test> }>,
    ) => {
      const index = findTestIndex(state, action.payload.id);
      if (index === -1) return;
      state.items[index] = { ...state.items[index], ...action.payload.changes };
    },
    deleteTest: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    setTestMeta: (
      state,
      action: PayloadAction<{
        id: string;
        title?: string;
        description?: string;
        type?: TestType;
      }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.id);
      if (!test) return;
      if (action.payload.title !== undefined) test.title = action.payload.title;
      if (action.payload.description !== undefined) {
        test.description = action.payload.description;
      }
      if (action.payload.type !== undefined) test.type = action.payload.type;
    },
    setTestQuestionIds: (
      state,
      action: PayloadAction<{ id: string; questionIds: string[] }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.id);
      if (!test) return;
      test.questionIds = action.payload.questionIds;
    },
    addQuestionIdToTest: (
      state,
      action: PayloadAction<{ testId: string; questionId: string }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.testId);
      if (!test || test.questionIds.includes(action.payload.questionId)) return;
      test.questionIds.push(action.payload.questionId);
    },
    removeQuestionIdFromTest: (
      state,
      action: PayloadAction<{ testId: string; questionId: string }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.testId);
      if (!test) return;
      test.questionIds = test.questionIds.filter(
        (id) => id !== action.payload.questionId,
      );
      delete test.sequenceScheme[action.payload.questionId];
    },
    moveQuestionIdInTest: (
      state,
      action: PayloadAction<{
        testId: string;
        questionId: string;
        toIndex: number;
      }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.testId);
      if (!test) return;
      const fromIndex = test.questionIds.indexOf(action.payload.questionId);
      if (fromIndex === -1) return;
      const [id] = test.questionIds.splice(fromIndex, 1);
      test.questionIds.splice(action.payload.toIndex, 0, id);
    },
    setSequenceScheme: (
      state,
      action: PayloadAction<{ testId: string; sequenceScheme: SequenceScheme }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.testId);
      if (!test) return;
      test.sequenceScheme = action.payload.sequenceScheme;
    },
    setSequenceEntry: (
      state,
      action: PayloadAction<{
        testId: string;
        questionId: string;
        entry: SequenceEntry;
      }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.testId);
      if (!test) return;
      test.sequenceScheme[action.payload.questionId] = action.payload.entry;
    },
    updateSequenceBranch: (
      state,
      action: PayloadAction<{
        testId: string;
        questionId: string;
        wrong?: string;
        correct?: string;
      }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.testId);
      if (!test) return;
      const current = test.sequenceScheme[action.payload.questionId];
      const { wrong, correct } = branchTargetsFromEntry(
        current,
        action.payload.questionId,
      );
      test.sequenceScheme[action.payload.questionId] = formatSequenceEntry(
        action.payload.wrong ?? wrong,
        action.payload.correct ?? correct,
      ) as SequenceEntry;
    },
    removeSequenceEntry: (
      state,
      action: PayloadAction<{ testId: string; questionId: string }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.testId);
      if (!test) return;
      delete test.sequenceScheme[action.payload.questionId];
    },
    setSequenceConnection: (
      state,
      action: PayloadAction<{
        testId: string;
        fromNode: string;
        side: BranchSide;
        target: SequenceSchemeEntry | null;
      }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.testId);
      if (!test) return;
      if (isFlowStartNode(action.payload.fromNode)) return;

      const updated = setConnection(
        test.sequenceScheme,
        action.payload.fromNode,
        action.payload.side,
        action.payload.target,
      );
      test.sequenceScheme = pruneSequenceScheme(updated, test.questionIds);
    },
    setFlowStartConnection: (
      state,
      action: PayloadAction<{
        testId: string;
        target: SequenceSchemeEntry | null;
      }>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload.testId);
      if (!test) return;

      const updated = setFlowStartOnScheme(
        test.sequenceScheme,
        action.payload.target,
      );
      test.sequenceScheme = pruneSequenceScheme(updated, test.questionIds);
    },
    syncSequenceSchemeWithQuestionIds: (
      state,
      action: PayloadAction<string>,
    ) => {
      const test = state.items.find((t) => t.id === action.payload);
      if (!test) return;

      test.sequenceScheme = pruneSequenceScheme(
        test.sequenceScheme,
        test.questionIds,
      );
    },
    replaceAllTests: (state, action: PayloadAction<Test[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  createTest,
  updateTest,
  deleteTest,
  setTestMeta,
  setTestQuestionIds,
  addQuestionIdToTest,
  removeQuestionIdFromTest,
  moveQuestionIdInTest,
  setSequenceScheme,
  setSequenceEntry,
  updateSequenceBranch,
  removeSequenceEntry,
  setSequenceConnection,
  setFlowStartConnection,
  syncSequenceSchemeWithQuestionIds,
  replaceAllTests,
} = testsSlice.actions;

export const testsReducer = testsSlice.reducer;
