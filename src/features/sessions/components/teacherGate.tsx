"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TestSession } from "@/features/sessions/types/testSession";

const fieldClassName =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

type TeacherGateProps = {
  session: TestSession;
  teacherKey: string;
  onTeacherKeyChange: (key: string) => void;
  verified: boolean;
  onVerify: () => void;
  children: ReactNode;
};

export function TeacherGate({
  session,
  teacherKey,
  onTeacherKeyChange,
  verified,
  onVerify,
  children,
}: TeacherGateProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const keyFromUrl = searchParams.get("key");
    if (keyFromUrl && keyFromUrl === session.teacherKey) {
      onTeacherKeyChange(keyFromUrl);
      onVerify();
    }
  }, [searchParams, session.teacherKey, onTeacherKeyChange, onVerify]);

  if (verified) {
    return <>{children}</>;
  }

  const handleUnlock = () => {
    if (teacherKey === session.teacherKey) {
      onVerify();
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Teacher access</CardTitle>
        <CardDescription>
          Enter the teacher key to view results and manage this session.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="teacher-key" className="text-sm font-medium">
            Teacher key
          </label>
          <input
            id="teacher-key"
            type="password"
            value={teacherKey}
            onChange={(event) => onTeacherKeyChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleUnlock();
              }
            }}
            placeholder="Enter teacher key"
            className={fieldClassName}
            autoComplete="off"
          />
        </div>
        <Button type="button" onClick={handleUnlock} className="w-full">
          Unlock
        </Button>
      </CardContent>
    </Card>
  );
}
