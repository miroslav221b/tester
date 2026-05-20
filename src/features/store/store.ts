import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import { questionsReducer } from "./slices/questionsSlice";
import { sessionRuntimeReducer } from "./slices/sessionRuntimeSlice";
import { sessionStatisticsReducer } from "./slices/sessionStatisticsSlice";
import { testTracesReducer } from "./slices/testTracesSlice";
import { testsReducer } from "./slices/testsSlice";

function createPersistStorage() {
  const isServer = typeof window === "undefined";

  if (isServer) {
    return {
      getItem() {
        return Promise.resolve(null);
      },
      setItem(_key: string, value: string) {
        return Promise.resolve(value);
      },
      removeItem() {
        return Promise.resolve();
      },
    };
  }

  return createWebStorage("local");
}

const persistConfig = {
  key: "tester",
  version: 1,
  storage: createPersistStorage(),
  whitelist: ["questions", "tests", "testTraces", "sessionStatistics"],
};

const rootReducer = combineReducers({
  questions: questionsReducer,
  tests: testsReducer,
  testTraces: testTracesReducer,
  sessionStatistics: sessionStatisticsReducer,
  sessionRuntime: sessionRuntimeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
