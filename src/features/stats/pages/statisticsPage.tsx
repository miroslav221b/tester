"use client";

import {
  CheckCircle2,
  CircleX,
  Clock,
  LayoutGrid,
  MinusCircle,
  Share2,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TestResult } from "@/features/stats/type/testResult";

export type ShareStatus = "idle" | "sending" | "sent" | "error";

export type StatisticsPageProps = {
  testTitle: string;
  result: TestResult;
  onReturnToTests: () => void;
  onShareWithOwner?: () => void | Promise<void>;
  shareStatus?: ShareStatus;
  shareLabel?: string;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function scorePercent(result: TestResult) {
  const totalAnswers =
    result.incorrectAnswers + result.skippedAnswers + result.correctAnswers;
  if (result.totalQuestions === 0 || result.correctAnswers === 0) return 0;
  return Math.round((result.correctAnswers * 100) / totalAnswers);
}

export function StatisticsPage({
  testTitle,
  result,
  onReturnToTests,
  onShareWithOwner,
  shareStatus = "idle",
  shareLabel = "Share with owner",
}: StatisticsPageProps) {
  const percent = scorePercent(result);
  const shareSending = shareStatus === "sending";
  const shareSent = shareStatus === "sent";
  const shareError = shareStatus === "error";
  const answered =
    result.correctAnswers + result.incorrectAnswers + result.skippedAnswers;

  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-lg gap-0 overflow-hidden py-0 shadow-lg ring-foreground/10">
        <div className="flex flex-col items-center gap-4 border-b bg-muted/30 px-6 py-8">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="size-7 text-primary" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Test complete
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {testTitle}
            </h1>
          </div>

          <div
            className="relative flex size-36 items-center justify-center"
            role="img"
            aria-label={`Score ${percent} percent`}
          >
            <svg className="size-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(percent / 100) * 326.73} 326.73`}
                className={cn(
                  "text-primary transition-all",
                  percent >= 70 && "text-emerald-500",
                  percent < 50 && "text-amber-500",
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold tabular-nums">
                {percent}%
              </span>
              <span className="text-xs text-muted-foreground">score</span>
            </div>
          </div>
        </div>

        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-base">Your results</CardTitle>
          <CardDescription>
            {answered} of {result.totalQuestions} questions answered
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-3 px-6 pb-2">
          <ResultStat
            icon={CheckCircle2}
            label="Correct"
            value={result.correctAnswers}
            tone="success"
          />
          <ResultStat
            icon={CircleX}
            label="Incorrect"
            value={result.incorrectAnswers}
            tone="destructive"
          />
          <ResultStat
            icon={MinusCircle}
            label="Skipped"
            value={result.skippedAnswers}
            tone="muted"
          />
          <ResultStat
            icon={Clock}
            label="Time"
            value={formatDuration(result.totalTime)}
            tone="muted"
            isText
          />
        </CardContent>

        {result.problematicQuestions.length > 0 && (
          <CardContent className="px-6 pt-0 pb-2">
            <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm">
              <p className="font-medium">Review recommended</p>
              <p className="mt-1 text-muted-foreground">
                {result.problematicQuestions.length} question
                {result.problematicQuestions.length === 1 ? "" : "s"} to
                revisit.
              </p>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-col gap-3 border-t bg-muted/30 px-6 py-6">
          {onShareWithOwner ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 w-full gap-2 text-base"
                disabled={shareSending || shareSent}
                onClick={() => void onShareWithOwner()}
              >
                <Share2 className="size-4" />
                {shareSending
                  ? "Sharing…"
                  : shareSent
                    ? "Sent!"
                    : shareLabel}
              </Button>
              {shareError ? (
                <p className="text-center text-sm text-destructive" role="alert">
                  Could not share results. Please try again.
                </p>
              ) : null}
            </>
          ) : shareSent ? (
            <p className="text-center text-sm text-muted-foreground">
              Already shared
            </p>
          ) : null}
          <Button
            size="lg"
            className="h-11 w-full gap-2 text-base"
            onClick={onReturnToTests}
          >
            <LayoutGrid className="size-4" />
            Return to tests
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

function ResultStat({
  icon: Icon,
  label,
  value,
  tone,
  isText = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number | string;
  tone: "success" | "destructive" | "muted";
  isText?: boolean;
}) {
  const toneClass = {
    success: "text-emerald-600 dark:text-emerald-400",
    destructive: "text-destructive",
    muted: "text-foreground",
  }[tone];

  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-background/60 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={cn("size-3.5", toneClass)} strokeWidth={2} />
        {label}
      </div>
      <span
        className={cn(
          "font-medium tabular-nums",
          isText ? "text-lg" : "text-2xl",
          toneClass,
        )}
      >
        {value}
      </span>
    </div>
  );
}
