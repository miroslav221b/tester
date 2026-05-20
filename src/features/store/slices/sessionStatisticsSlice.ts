import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { SessionStatistic } from "@/features/sessions/types/sessionStatistic";

export type SessionStatisticsState = {
  items: SessionStatistic[];
};

const initialState: SessionStatisticsState = {
  items: [],
};

const sessionStatisticsSlice = createSlice({
  name: "sessionStatistics",
  initialState,
  reducers: {
    importSessionStatistic: (state, action: PayloadAction<SessionStatistic>) => {
      if (state.items.some((s) => s.id === action.payload.id)) return;
      state.items.push(action.payload);
    },
    removeSessionStatisticsBySessionId: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.items = state.items.filter((s) => s.sessionId !== action.payload);
    },
    replaceAllSessionStatistics: (
      state,
      action: PayloadAction<SessionStatistic[]>,
    ) => {
      state.items = action.payload;
    },
  },
});

export const {
  importSessionStatistic,
  removeSessionStatisticsBySessionId,
  replaceAllSessionStatistics,
} = sessionStatisticsSlice.actions;

export const sessionStatisticsReducer = sessionStatisticsSlice.reducer;
