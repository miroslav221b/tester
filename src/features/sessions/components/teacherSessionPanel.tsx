"use client";

import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { importSessionResult } from "@/features/sessions/lib/importSessionResult";
import { removeCachedTeacherSession } from "@/features/sessions/lib/teacherSessionCache";
import type { TestSession } from "@/features/sessions/types/testSession";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { selectSessionStatisticsBySessionId } from "@/features/store/selectors";
import type { TestResult } from "@/features/stats/type/testResult";
import type { SessionResultRow } from "@/lib/supabase/sessionResults";
import { endSession } from "@/lib/supabase/sessions";
import { cn } from "@/lib/utils";

type TeacherSessionPanelProps = {
  sessionId: string;
  session: TestSession;
  ownerName: string;
  active: boolean;
  results: SessionResultRow[];
  resultsLoading: boolean;
  resultsError: string | null;
  onEnded: () => void;
};

function scorePercent(result: TestResult) {
  const totalAnswers =
    result.incorrectAnswers + result.skippedAnswers + result.correctAnswers;
  if (totalAnswers === 0 || result.correctAnswers === 0) return 0;
  return Math.round((result.correctAnswers * 100) / totalAnswers);
}

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString();
}

export function TeacherSessionPanel({
  sessionId,
  session,
  ownerName,
  active,
  results,
  resultsLoading,
  resultsError,
  onEnded,
}: TeacherSessionPanelProps) {
  const dispatch = useAppDispatch();
  const importedStatistics = useAppSelector(
    selectSessionStatisticsBySessionId(sessionId),
  );
  const [importedIds, setImportedIds] = useState<Set<string>>(() => new Set());
  const [ending, setEnding] = useState(false);

  const importedIdSet = useMemo(() => {
    const ids = new Set(importedIds);
    for (const stat of importedStatistics) {
      ids.add(stat.id);
    }
    return ids;
  }, [importedIds, importedStatistics]);

  const isImported = useCallback(
    (row: SessionResultRow) => importedIdSet.has(row.id),
    [importedIdSet],
  );

  const handleImport = useCallback(
    (row: SessionResultRow) => {
      if (isImported(row)) {
        return;
      }

      importSessionResult(dispatch, session, row);
      setImportedIds((prev) => new Set(prev).add(row.id));
    },
    [dispatch, session, isImported],
  );

  const handleImportAll = useCallback(() => {
    const toImport = results.filter((row) => !isImported(row));
    if (toImport.length === 0) {
      return;
    }

    const nextIds = new Set(importedIds);
    for (const row of toImport) {
      importSessionResult(dispatch, session, row);
      nextIds.add(row.id);
    }
    setImportedIds(nextIds);
  }, [results, isImported, importedIds, dispatch, session]);

  const handleEndSession = useCallback(async () => {
    const confirmed = window.confirm(
      "End this session? Students will no longer be able to join or submit results.",
    );
    if (!confirmed) {
      return;
    }

    setEnding(true);
    try {
      await endSession(sessionId);
      removeCachedTeacherSession(sessionId);
      onEnded();
    } catch {
      window.alert("Could not end the session. Please try again.");
    } finally {
      setEnding(false);
    }
  }, [sessionId, onEnded]);

  const nonImportedCount = results.filter((row) => !isImported(row)).length;
  const testTitle = session.testSnapshot.test.title;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{testTitle}</h1>
          <p className="text-sm text-muted-foreground">Host: {ownerName}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            active
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {active ? "Active" : "Ended"}
        </span>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Student results</CardTitle>
            <CardDescription>
              Results appear here as students finish. Import to save them locally.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={nonImportedCount === 0}
              onClick={handleImportAll}
            >
              Import all
            </Button>
            {active ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={ending}
                onClick={handleEndSession}
              >
                {ending ? "Ending…" : "End testing"}
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {resultsLoading && results.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading results…</p>
          ) : null}

          {resultsError ? (
            <p className="text-sm text-destructive" role="alert">
              {resultsError}
            </p>
          ) : null}

          {!resultsLoading && results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No results yet. They will show up here when students complete the test.
            </p>
          ) : null}

          {results.map((row) => {
            const imported = isImported(row);
            const percent = scorePercent(row.result);

            return (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium">{percent}%</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(row.result.totalTime)} ·{" "}
                    {formatTimestamp(row.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {imported ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Imported
                    </span>
                  ) : null}
                  <Button
                    type="button"
                    variant={imported ? "outline" : "default"}
                    size="sm"
                    disabled={imported}
                    onClick={() => handleImport(row)}
                  >
                    {imported ? "Imported" : "Import"}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
