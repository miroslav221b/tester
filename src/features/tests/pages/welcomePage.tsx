"use client";

import { ArrowRight, BookOpen, Clock, ListChecks, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { testTypeConfig } from "@/features/tests/lib/testTypeConfig";
import { cn } from "@/lib/utils";
import type { Test } from "@/features/tests/types/test";

export type WelcomePageProps = {
  test: Test;
  questionCount: number;
  canStart?: boolean;
  onStart: () => void;
  isStarting?: boolean;
};

export function WelcomePage({
  test,
  questionCount,
  canStart = true,
  onStart,
  isStarting = false,
}: WelcomePageProps) {
  const { icon: Icon, label, accent, image } = testTypeConfig[test.type];

  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-lg gap-0 overflow-hidden py-0 shadow-lg ring-foreground/10">
        <div
          className={cn(
            "relative flex h-40 items-center justify-center bg-gradient-to-br sm:h-44",
            accent,
            image,
          )}
          aria-hidden
        >
          <div className="flex size-20 items-center justify-center rounded-3xl bg-background/85 shadow-md ring-1 ring-foreground/10 backdrop-blur-sm">
            <Icon className="size-10 text-foreground/85" strokeWidth={1.5} />
          </div>
          <span className="absolute right-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-foreground/10 backdrop-blur-sm">
            {label}
          </span>
        </div>

        <CardHeader className="gap-2 px-6 pt-6 pb-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {test.title}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            {test.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-2">
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              icon={ListChecks}
              label="Questions"
              value={String(questionCount)}
            />
            <StatTile icon={Clock} label="Pace" value="Your own" />
          </div>

          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium">
              <BookOpen className="size-4 text-muted-foreground" />
              Before you begin
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-foreground/40">•</span>
                Answer each question or skip to move on.
              </li>
              <li className="flex gap-2">
                <span className="text-foreground/40">•</span>
                Your progress is saved for this attempt.
              </li>
              <li className="flex gap-2">
                <span className="text-foreground/40">•</span>
                You can reset your answer before submitting.
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3 border-t bg-muted/30 px-6 py-6 sm:flex-row">
          <Button
            size="lg"
            className="h-11 w-full gap-2 text-base sm:flex-1"
            onClick={onStart}
            disabled={isStarting || questionCount === 0 || !canStart}
          >
            {isStarting ? "Starting…" : "Start test"}
            {!isStarting && <ArrowRight className="size-4" />}
          </Button>
          {!canStart && (
            <p className="text-center text-sm text-destructive">
              {questionCount === 0
                ? "This test has no questions yet."
                : "This test has no valid question sequence yet."}
            </p>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-background/60 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <span className="text-lg font-medium tabular-nums">{value}</span>
    </div>
  );
}
