"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DifficultyRow } from "@/features/sessions/dashboard/lib/aggregateSessionAnalytics";
import { cn } from "@/lib/utils";

import { truncateLabel } from "./truncateLabel";

type DifficultyTableProps = {
  title: string;
  description: string;
  rows: DifficultyRow[];
  tone: "hard" | "easy";
  emptyMessage: string;
};

function DifficultyTable({
  title,
  description,
  rows,
  tone,
  emptyMessage,
}: DifficultyTableProps) {
  const rateClass =
    tone === "hard"
      ? "text-rose-600 dark:text-rose-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Question</th>
                  <th className="pb-2 pr-3 font-medium tabular-nums">Rate</th>
                  <th className="pb-2 font-medium tabular-nums">Attempts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.questionId} className="border-b border-border/60">
                    <td className="py-2.5 pr-3 align-top">
                      <p
                        className="font-medium leading-snug"
                        title={row.questionText}
                      >
                        {truncateLabel(row.questionText, 56)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {row.correct}✓ · {row.incorrect}✗ · {row.skipped} skip
                      </p>
                    </td>
                    <td
                      className={cn(
                        "py-2.5 pr-3 align-top text-lg font-bold tabular-nums",
                        rateClass,
                      )}
                    >
                      {row.correctRatePercent}%
                    </td>
                    <td className="py-2.5 align-top tabular-nums text-muted-foreground">
                      {row.attempts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type HardestEasiestTableProps = {
  hardest: DifficultyRow[];
  easiest: DifficultyRow[];
};

export function HardestEasiestTable({
  hardest,
  easiest,
}: HardestEasiestTableProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DifficultyTable
        title="Top 10 hardest"
        description="Lowest correct rate (answered at least once)."
        rows={hardest}
        tone="hard"
        emptyMessage="No graded attempts yet."
      />
      <DifficultyTable
        title="Top 10 easiest"
        description="Highest correct rate."
        rows={easiest}
        tone="easy"
        emptyMessage="No graded attempts yet."
      />
    </div>
  );
}
