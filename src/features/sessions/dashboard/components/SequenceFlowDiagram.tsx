"use client";

import { ArrowRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { SequenceStep } from "@/features/sessions/dashboard/lib/aggregateSessionAnalytics";
import { cn } from "@/lib/utils";

import { truncateLabel } from "./truncateLabel";

type SequenceFlowDiagramProps = {
  averageSequence: SequenceStep[];
  longestSequence: SequenceStep[];
  shortestSequence: SequenceStep[];
};

function SequencePath({
  steps,
  emptyLabel,
}: {
  steps: SequenceStep[];
  emptyLabel: string;
}) {
  if (steps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">{emptyLabel}</p>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <li key={`${step.attemptedIndex}-${step.questionId}-${index}`}>
          <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-muted/20 p-4 sm:flex-row sm:items-center">
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">
                {step.stepNumber}
              </span>
              {index < steps.length - 1 ? (
                <ArrowRight
                  className="hidden size-4 text-muted-foreground sm:block"
                  aria-hidden
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p
                className="text-base font-medium leading-snug"
                title={step.questionText}
              >
                {truncateLabel(step.questionText, 120)}
              </p>
              <p
                className={cn(
                  "text-sm",
                  step.isSkipped
                    ? "font-medium text-amber-700 dark:text-amber-300"
                    : "text-muted-foreground",
                )}
              >
                Chosen:{" "}
                <span className="text-foreground">{step.selectedOptionLabels}</span>
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SequenceFlowDiagram({
  averageSequence,
  longestSequence,
  shortestSequence,
}: SequenceFlowDiagramProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Answer sequences</CardTitle>
        <CardDescription>
          How students moved through the test — typical path, longest, and
          shortest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="average">
          <TabsList className="mb-4">
            <TabsTrigger value="average">Average path</TabsTrigger>
            <TabsTrigger value="longest">Longest</TabsTrigger>
            <TabsTrigger value="shortest">Shortest</TabsTrigger>
          </TabsList>
          <TabsContent value="average">
            <SequencePath
              steps={averageSequence}
              emptyLabel="Not enough data for an average path yet."
            />
          </TabsContent>
          <TabsContent value="longest">
            <SequencePath
              steps={longestSequence}
              emptyLabel="No longest sequence yet."
            />
          </TabsContent>
          <TabsContent value="shortest">
            <SequencePath
              steps={shortestSequence}
              emptyLabel="No completed shortest sequence yet."
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
