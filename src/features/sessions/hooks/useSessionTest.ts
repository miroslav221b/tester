"use client";

import { useContext } from "react";

import {
  SessionTestContext,
  type SessionTestContextValue,
} from "@/features/sessions/context/sessionTestProvider";

export function useSessionTest(): SessionTestContextValue {
  const context = useContext(SessionTestContext);
  if (!context) {
    throw new Error("useSessionTest must be used within SessionTestProvider");
  }
  return context;
}
