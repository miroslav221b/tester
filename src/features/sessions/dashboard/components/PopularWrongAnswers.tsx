"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PopularWrongRow } from "@/features/sessions/dashboard/lib/aggregateSessionAnalytics";
import { cn } from "@/lib/utils";

import { truncateLabel } from "./truncateLabel";

type PopularWrongAnswersProps = {
  rows: PopularWrongRow[];
};

export function PopularWrongAnswers({ rows }: PopularWrongAnswersProps) {
  const maxWrong = rows.reduce(
    (max, row) => Math.max(max, row.wrongPickCount),
    0,
  );

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Popular wrong answers</CardTitle>
        <CardDescription>
          On frequently attempted questions, which incorrect options students
          picked most often.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No common wrong picks yet — needs more attempts on the same
            questions.
          </p>
        ) : (
          rows.map((row) => {
            const widthPercent =
              maxWrong > 0
                ? Math.max(10, (row.wrongPickCount / maxWrong) * 100)
                : 0;

            return (
              <div
                key={`${row.questionId}-${row.optionIndex}`}
                className="space-y-2 rounded-lg border border-border/70 p-4"
              >
                <p
                  className="text-sm font-medium leading-snug"
                  title={row.questionText}
                >
                  {truncateLabel(row.questionText, 100)}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p
                    className="text-base text-rose-700 dark:text-rose-300"
                    title={row.optionText}
                  >
                    {truncateLabel(row.optionText, 80)}
                  </p>
                  <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-700 tabular-nums dark:text-rose-300">
                    {row.wrongPickCount}× wrong
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full bg-rose-500")}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {row.totalAttempts} attempts on this question
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
