"use client";

import { Clock, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SessionAnalytics } from "@/features/sessions/dashboard/lib/aggregateSessionAnalytics";

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

type DashboardOverviewProps = {
  analytics: SessionAnalytics;
};

export function DashboardOverview({ analytics }: DashboardOverviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription>Average score</CardDescription>
          <CardTitle className="text-4xl font-bold tabular-nums text-emerald-600">
            {analytics.averageScorePercent}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Across {analytics.studentCount} student
            {analytics.studentCount === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            Average time
          </CardDescription>
          <CardTitle className="text-4xl font-bold tabular-nums text-sky-600">
            {formatDuration(analytics.averageTimeMs)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            From first question to finish
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Users className="size-3.5" aria-hidden />
            Submissions
          </CardDescription>
          <CardTitle className="text-4xl font-bold tabular-nums text-violet-600">
            {analytics.studentCount}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Included in these statistics
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
