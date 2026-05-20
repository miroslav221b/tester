import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";

import { toIsoTimestamp } from "@/features/stats/lib/traceTimestamps";
import type { TestTrace } from "@/features/stats/type/testTrace";

export type TestTracesState = {
  items: TestTrace[];
  activeTraceId: string | null;
};

const initialState: TestTracesState = {
  items: [],
  activeTraceId: null,
};

type TraceAnswer = TestTrace["answers"][number];
type TraceAnswerInput = Omit<TraceAnswer, "attemptedIndex"> & {
  attemptedIndex?: number;
};

export function normalizeTraceAnswers(
  answers: TraceAnswerInput[],
): TraceAnswer[] {
  return answers.map((a, index) => ({
    questionId: a.questionId,
    selectedOptions: a.selectedOptions,
    attemptedIndex: a.attemptedIndex ?? index,
  }));
}

function findTraceIndex(state: TestTracesState, id: string) {
  return state.items.findIndex((t) => t.id === id);
}

function findAnswerIndex(
  trace: TestTrace,
  questionId: string,
  attemptedIndex?: number,
) {
  if (attemptedIndex !== undefined) {
    return trace.answers.findIndex(
      (a) =>
        a.questionId === questionId && a.attemptedIndex === attemptedIndex,
    );
  }

  for (let i = trace.answers.length - 1; i >= 0; i -= 1) {
    if (trace.answers[i].questionId === questionId) {
      return i;
    }
  }
  return -1;
}

const testTracesSlice = createSlice({
  name: "testTraces",
  initialState,
  reducers: {
    createTrace: (state, action: PayloadAction<TestTrace>) => {
      if (state.items.some((t) => t.id === action.payload.id)) return;
      state.items.push({
        ...action.payload,
        answers: normalizeTraceAnswers(action.payload.answers),
        startTime: toIsoTimestamp(action.payload.startTime),
        endTime:
          action.payload.endTime === undefined
            ? undefined
            : toIsoTimestamp(action.payload.endTime),
      });
    },
    updateTrace: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<TestTrace> }>,
    ) => {
      const index = findTraceIndex(state, action.payload.id);
      if (index === -1) return;
      const { startTime, endTime, answers, ...rest } = action.payload.changes;
      state.items[index] = {
        ...state.items[index],
        ...rest,
        ...(answers !== undefined && {
          answers: normalizeTraceAnswers(answers),
        }),
        ...(startTime !== undefined && {
          startTime: toIsoTimestamp(startTime),
        }),
        ...(endTime !== undefined && { endTime: toIsoTimestamp(endTime) }),
      };
    },
    deleteTrace: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
      if (state.activeTraceId === action.payload) {
        state.activeTraceId = null;
      }
    },
    startTrace: (
      state,
      action: PayloadAction<{
        id: string;
        testId: string;
        sessionId?: string;
        startTime?: Date | string;
        setActive?: boolean;
      }>,
    ) => {
      if (state.items.some((t) => t.id === action.payload.id)) return;
      const trace: TestTrace = {
        id: action.payload.id,
        testId: action.payload.testId,
        ...(action.payload.sessionId !== undefined && {
          sessionId: action.payload.sessionId,
        }),
        answers: [],
        startTime: toIsoTimestamp(action.payload.startTime),
      };
      state.items.push(trace);
      if (action.payload.setActive !== false) {
        state.activeTraceId = trace.id;
      }
    },
    endTrace: (
      state,
      action: PayloadAction<{ id: string; endTime?: Date | string }>,
    ) => {
      const trace = state.items.find((t) => t.id === action.payload.id);
      if (!trace) return;
      trace.endTime = toIsoTimestamp(action.payload.endTime);
      if (state.activeTraceId === action.payload.id) {
        state.activeTraceId = null;
      }
    },
    setActiveTrace: (state, action: PayloadAction<string | null>) => {
      if (
        action.payload !== null &&
        !state.items.some((t) => t.id === action.payload)
      ) {
        return;
      }
      state.activeTraceId = action.payload;
    },
    recordAnswer: (
      state,
      action: PayloadAction<{
        traceId: string;
        questionId: string;
        selectedOptions: number[] | undefined;
        attemptedIndex?: number;
      }>,
    ) => {
      const trace = state.items.find((t) => t.id === action.payload.traceId);
      if (!trace) return;

      trace.answers.push({
        questionId: action.payload.questionId,
        selectedOptions: action.payload.selectedOptions,
        attemptedIndex:
          action.payload.attemptedIndex ?? trace.answers.length,
      });
    },
    setAnswerSelectedOptions: (
      state,
      action: PayloadAction<{
        traceId: string;
        questionId: string;
        selectedOptions: number[] | undefined;
        attemptedIndex?: number;
      }>,
    ) => {
      const trace = state.items.find((t) => t.id === action.payload.traceId);
      if (!trace) return;

      const answerIndex = findAnswerIndex(
        trace,
        action.payload.questionId,
        action.payload.attemptedIndex,
      );
      if (answerIndex === -1) return;

      trace.answers[answerIndex].selectedOptions =
        action.payload.selectedOptions;
    },
    removeAnswer: (
      state,
      action: PayloadAction<{
        traceId: string;
        questionId: string;
        attemptedIndex?: number;
      }>,
    ) => {
      const trace = state.items.find((t) => t.id === action.payload.traceId);
      if (!trace) return;

      const answerIndex = findAnswerIndex(
        trace,
        action.payload.questionId,
        action.payload.attemptedIndex,
      );
      if (answerIndex === -1) return;

      trace.answers.splice(answerIndex, 1);
    },
    setTraceAnswers: (
      state,
      action: PayloadAction<{ traceId: string; answers: TraceAnswerInput[] }>,
    ) => {
      const trace = state.items.find((t) => t.id === action.payload.traceId);
      if (!trace) return;
      trace.answers = normalizeTraceAnswers(action.payload.answers);
    },
    setTraceStartTime: (
      state,
      action: PayloadAction<{ id: string; startTime: Date | string }>,
    ) => {
      const trace = state.items.find((t) => t.id === action.payload.id);
      if (!trace) return;
      trace.startTime = toIsoTimestamp(action.payload.startTime);
    },
    setTraceEndTime: (
      state,
      action: PayloadAction<{ id: string; endTime?: Date | string }>,
    ) => {
      const trace = state.items.find((t) => t.id === action.payload.id);
      if (!trace) return;
      trace.endTime =
        action.payload.endTime === undefined
          ? undefined
          : toIsoTimestamp(action.payload.endTime);
    },
    replaceAllTraces: (state, action: PayloadAction<TestTrace[]>) => {
      state.items = action.payload.map((trace) => ({
        ...trace,
        answers: normalizeTraceAnswers(trace.answers),
        startTime: toIsoTimestamp(trace.startTime),
        endTime:
          trace.endTime === undefined
            ? undefined
            : toIsoTimestamp(trace.endTime),
      }));
      if (
        state.activeTraceId !== null &&
        !action.payload.some((t) => t.id === state.activeTraceId)
      ) {
        state.activeTraceId = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      const incoming = (
        action as { payload?: { testTraces?: TestTracesState } }
      ).payload?.testTraces;
      if (!incoming) return;

      state.items = incoming.items.map((trace) => ({
        ...trace,
        answers: normalizeTraceAnswers(trace.answers),
        startTime: toIsoTimestamp(trace.startTime),
        endTime:
          trace.endTime === undefined
            ? undefined
            : toIsoTimestamp(trace.endTime),
      }));
      state.activeTraceId = incoming.activeTraceId;
    });
  },
});

export const {
  createTrace,
  updateTrace,
  deleteTrace,
  startTrace,
  endTrace,
  setActiveTrace,
  recordAnswer,
  setAnswerSelectedOptions,
  removeAnswer,
  setTraceAnswers,
  setTraceStartTime,
  setTraceEndTime,
  replaceAllTraces,
} = testTracesSlice.actions;

export const testTracesReducer = testTracesSlice.reducer;
