import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { TestSnapshot } from "@/features/sessions/types/testSnapshot";

export type SessionRuntimeState = {
  sessionId: string | null;
  testSnapshot: TestSnapshot | null;
};

const initialState: SessionRuntimeState = {
  sessionId: null,
  testSnapshot: null,
};

const sessionRuntimeSlice = createSlice({
  name: "sessionRuntime",
  initialState,
  reducers: {
    setSessionRuntime: (
      state,
      action: PayloadAction<{
        sessionId: string;
        testSnapshot: TestSnapshot;
      }>,
    ) => {
      state.sessionId = action.payload.sessionId;
      state.testSnapshot = action.payload.testSnapshot;
    },
    clearSessionRuntime: (state) => {
      state.sessionId = null;
      state.testSnapshot = null;
    },
  },
});

export const { setSessionRuntime, clearSessionRuntime } =
  sessionRuntimeSlice.actions;

export const sessionRuntimeReducer = sessionRuntimeSlice.reducer;
