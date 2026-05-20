"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import { SessionTestProvider } from "@/features/sessions/context/sessionTestProvider";

export function JoinSessionLayout({ children }: { children: ReactNode }) {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <SessionTestProvider sessionId={sessionId}>{children}</SessionTestProvider>
  );
}
