"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TestPreview } from "@/features/components/testPreview";
import { useAppSelector } from "@/features/store/hooks";
import { selectAllTests } from "@/features/store/selectors";
import { isTestStartable } from "@/features/tests/lib/isTestStartable";

export default function TestsPage() {
  const router = useRouter();
  const tests = useAppSelector(selectAllTests);

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
          <Link href="/share">
            <Button variant="outline">Share test</Button>
          </Link>
          <Link href="/laboratory">
            <Button variant="outline">Laboratory</Button>
          </Link>
        </div>
      </div>

      {tests.length === 0 ? (
        <p className="text-muted-foreground">No tests available yet.</p>
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
