"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TestPreview } from "@/features/components/testPreview";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import {
  replaceAllQuestions,
} from "@/features/store/slices/questionsSlice";
import { replaceAllTests } from "@/features/store/slices/testsSlice";
import { selectAllTests } from "@/features/store/selectors";
import { getDefaultTestsAndQuestions } from "@/features/tests/data/defaultUkMathGrade7";
import { isTestStartable } from "@/features/tests/lib/isTestStartable";

export default function TestsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tests = useAppSelector(selectAllTests);

  const restoreDefaultSettings = () => {
    const { questions, tests: defaultTests } = getDefaultTestsAndQuestions();
    dispatch(replaceAllQuestions(structuredClone(questions)));
    dispatch(replaceAllTests(structuredClone(defaultTests)));
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Tests</h1>
          <p className="text-sm text-muted-foreground">
            Choose a test to view details and start your attempt.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={restoreDefaultSettings}>
            To default settings
          </Button>
          <Link href="/share">
            <Button variant="outline">Share test</Button>
          </Link>
          <Link href="/laboratory">
            <Button variant="outline">Laboratory</Button>
          </Link>
        </div>
      </div>

      {tests.length === 0 ? (
        <p className="text-muted-foreground">
          No tests available yet. Use &quot;To default settings&quot; above to load the built‑in Ukrainian grade‑7 math example.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-6">
          {tests.map((test) => {
            const canStart = isTestStartable(test);

            return (
              <TestPreview
                key={test.id}
                title={test.title}
                type={test.type}
                className="w-full"
                disabled={!canStart}
                showStartButton={canStart}
                onStart={canStart ? () => router.push(`/${test.id}`) : undefined}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
