"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSessionAnalytics } from "@/features/sessions/dashboard/hooks/useSessionAnalytics";
import type { TestSession } from "@/features/sessions/types/testSession";
import type { SessionResultRow } from "@/lib/supabase/sessionResults";

import { DashboardOverview } from "./DashboardOverview";
import { HardestEasiestTable } from "./HardestEasiestTable";
import { PopularWrongAnswers } from "./PopularWrongAnswers";
import { QuestionCountChart } from "./QuestionCountChart";
import { SequenceFlowDiagram } from "./SequenceFlowDiagram";

type SessionDashboardProps = {
  session: TestSession;
  results: SessionResultRow[];
};

export function SessionDashboard({ session, results }: SessionDashboardProps) {
  const analytics = useSessionAnalytics(session, results);

  if (results.length === 0) {
    return (
      <section aria-label="Class statistics" className="w-full">
        <Card className="border-dashed bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
            <CardDescription>
              Class-wide insights appear here once students submit results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              Waiting for students…
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <section aria-label="Class statistics" className="flex w-full flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Statistics</h2>
        <p className="text-sm text-muted-foreground">
          Live overview from all submitted results ({analytics.studentCount}{" "}
          student{analytics.studentCount === 1 ? "" : "s"}).
        </p>
      </div>

      <DashboardOverview analytics={analytics} />

      <div className="grid gap-4 lg:grid-cols-3">
        <QuestionCountChart
          title="Most missed"
          description="Questions answered incorrectly most often."
          variant="failed"
          rows={analytics.mostFailed}
        />
        <QuestionCountChart
          title="Most correct"
          description="Questions students got right most often."
          variant="correct"
          rows={analytics.mostCorrect}
        />
        <QuestionCountChart
          title="Most skipped"
          description="Questions left without an answer."
          variant="skipped"
          rows={analytics.mostSkipped}
        />
      </div>

      <SequenceFlowDiagram
        averageSequence={analytics.averageSequence}
        longestSequence={analytics.longestSequence}
        shortestSequence={analytics.shortestSequence}
      />

      <HardestEasiestTable
        hardest={analytics.top10Hardest}
        easiest={analytics.top10Easiest}
      />

      <PopularWrongAnswers rows={analytics.popularWrongAnswers} />
    </section>
  );
}
