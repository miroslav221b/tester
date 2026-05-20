"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { QuestionCountRow } from "@/features/sessions/dashboard/lib/aggregateSessionAnalytics";
import { cn } from "@/lib/utils";

import { truncateLabel } from "./truncateLabel";

export type QuestionCountVariant = "failed" | "correct" | "skipped";

const variantStyles: Record<
  QuestionCountVariant,
  { bar: string; badge: string; label: string }
> = {
  failed: {
    bar: "bg-rose-500",
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    label: "Wrong answers",
  },
  correct: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    label: "Correct answers",
  },
  skipped: {
    bar: "bg-amber-400",
    badge: "bg-amber-400/20 text-amber-800 dark:text-amber-200",
    label: "Skipped",
  },
};

type QuestionCountChartProps = {
  title: string;
  description?: string;
  variant: QuestionCountVariant;
  rows: QuestionCountRow[];
  limit?: number;
  emptyMessage?: string;
};

export function QuestionCountChart({
  title,
  description,
  variant,
  rows,
  limit = 8,
  emptyMessage = "No data yet.",
}: QuestionCountChartProps) {
  const styles = variantStyles[variant];
  const visible = rows.slice(0, limit);
  const maxCount = visible.reduce((max, row) => Math.max(max, row.count), 0);

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          visible.map((row) => {
            const widthPercent =
              maxCount > 0 ? Math.max(8, (row.count / maxCount) * 100) : 0;

            return (
              <div key={row.questionId} className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="min-w-0 flex-1 text-sm font-medium leading-snug"
                    title={row.questionText}
                  >
                    {truncateLabel(row.questionText)}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      styles.badge,
                    )}
                  >
                    {row.count}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", styles.bar)}
                    style={{ width: `${widthPercent}%` }}
                    title={`${styles.label}: ${row.count}`}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
