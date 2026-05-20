"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Copy, KeyRound, LayoutDashboard } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { TestPreview } from "@/features/components/testPreview";
import { QrCodeDisplay } from "@/features/sessions/components/qrCodeDisplay";
import { buildTestSnapshotFromStore } from "@/features/sessions/lib/buildTestSnapshot";
import { generateTeacherKey } from "@/features/sessions/lib/generateTeacherKey";
import { cacheTeacherSession } from "@/features/sessions/lib/teacherSessionCache";
import { useAppSelector } from "@/features/store/hooks";
import { selectAllTests } from "@/features/store/selectors";
import { isTestStartable } from "@/features/tests/lib/isTestStartable";
import { testTypeConfig } from "@/features/tests/lib/testTypeConfig";
import { createSession } from "@/lib/supabase/sessions";
import { cn } from "@/lib/utils";

const fieldClassName =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

type PagePhase = "idle" | "creating" | "success";

type CreatedSession = {
  sessionId: string;
  teacherKey: string;
  testId: string;
  ownerName: string;
};

function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function ShareTestPage() {
  const router = useRouter();
  const tests = useAppSelector(selectAllTests);
  const questions = useAppSelector((state) => state.questions.items);

  const [phase, setPhase] = useState<PagePhase>("idle");
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdSession, setCreatedSession] = useState<CreatedSession | null>(
    null,
  );
  const [copiedField, setCopiedField] = useState<"join" | "key" | null>(null);
  const [showTeacherKey, setShowTeacherKey] = useState(false);

  const joinUrl = useMemo(() => {
    if (!createdSession) {
      return "";
    }

    return `${getAppUrl()}/join/${createdSession.sessionId}`;
  }, [createdSession]);

  const dashboardHref = useMemo(() => {
    if (!createdSession) {
      return "";
    }

    return `/share/${createdSession.sessionId}?key=${encodeURIComponent(createdSession.teacherKey)}`;
  }, [createdSession]);

  const canCreate =
    phase !== "creating" &&
    selectedTestId !== null &&
    ownerName.trim().length > 0;

  const handleCopy = useCallback(async (field: "join" | "key", value: string) => {
    try {
      await copyToClipboard(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setErrorMessage("Could not copy to clipboard.");
    }
  }, []);

  const handleCreateSession = async () => {
    if (!selectedTestId || !ownerName.trim()) {
      return;
    }

    const snapshot = buildTestSnapshotFromStore(
      tests,
      questions,
      selectedTestId,
    );

    if (!snapshot) {
      setErrorMessage("Selected test could not be loaded.");
      return;
    }

    const teacherKey = generateTeacherKey();
    setPhase("creating");
    setErrorMessage(null);

    try {
      const { sessionId } = await createSession({
        testId: selectedTestId,
        ownerName: ownerName.trim(),
        teacherKey,
        testSnapshot: snapshot,
      });

      cacheTeacherSession({
        sessionId,
        teacherKey,
        ownerName: ownerName.trim(),
        testId: selectedTestId,
        createdAt: new Date().toISOString(),
      });

      setCreatedSession({
        sessionId,
        teacherKey,
        testId: selectedTestId,
        ownerName: ownerName.trim(),
      });
      setPhase("success");
    } catch {
      setPhase("idle");
      setErrorMessage(
        "Could not create the session. Check your connection and try again.",
      );
    }
  };

  if (phase === "success" && createdSession) {
    const test = tests.find((item) => item.id === createdSession.testId);
    const typeVisual = test ? testTypeConfig[test.type] : null;
    const TypeIcon = typeVisual?.icon;

    return (
      <main className="flex min-h-[calc(100dvh-4rem)] flex-1 items-center justify-center bg-gradient-to-br from-violet-100 via-indigo-50 to-sky-100 p-4 sm:p-8 dark:from-violet-950/50 dark:via-indigo-950/40 dark:to-sky-950/30">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-card shadow-2xl ring-1 ring-foreground/5">
          <div
            className={cn(
              "relative bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 px-6 pb-12 pt-10 text-center text-white",
              typeVisual?.accent,
              typeVisual?.image,
            )}
          >
            {TypeIcon ? (
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/20 shadow-lg ring-1 ring-white/30 backdrop-blur-sm">
                <TypeIcon className="size-7" strokeWidth={1.75} />
              </div>
            ) : null}
            {typeVisual ? (
              <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-white/25">
                {typeVisual.label}
              </span>
            ) : null}
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {test?.title ?? "Live test"}
            </h1>
            <p className="mt-2 text-lg font-medium text-white/90">
              Hosted by {createdSession.ownerName}
            </p>
          </div>

          <div className="-mt-6 flex flex-col items-center gap-6 px-5 pb-8 pt-2 sm:px-8">
            <p className="text-center text-lg font-semibold tracking-tight text-foreground">
              Scan to join
            </p>

            <QrCodeDisplay
              url={joinUrl}
              size={300}
              className="mx-auto w-[min(100%,20rem)] min-w-[15rem] sm:min-w-[18.75rem]"
            />

            <div className="w-full space-y-3 text-center">
              <p className="break-all px-1 text-xs leading-relaxed text-muted-foreground">
                {joinUrl}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:from-violet-700 hover:to-indigo-700"
                  onClick={() => handleCopy("join", joinUrl)}
                >
                  <Copy className="size-4" />
                  {copiedField === "join" ? "Link copied" : "Copy link"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => router.push(dashboardHref)}
                >
                  <LayoutDashboard className="size-4" />
                  Open dashboard
                </Button>
              </div>
            </div>

            <div className="w-full border-t pt-4">
              <button
                type="button"
                className="mx-auto flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowTeacherKey((visible) => !visible)}
                aria-expanded={showTeacherKey}
              >
                <KeyRound className="size-4" />
                {showTeacherKey ? "Hide teacher key" : "Show teacher key"}
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    showTeacherKey && "rotate-180",
                  )}
                />
              </button>

              {showTeacherKey ? (
                <div className="mt-4 space-y-3 rounded-xl border border-amber-200/80 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/40">
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                    Teacher key — keep this private
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <code className="rounded-lg border border-amber-200/80 bg-white px-3 py-2 font-mono text-base font-semibold tracking-widest text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100">
                      {createdSession.teacherKey}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-amber-300/80"
                      onClick={() =>
                        handleCopy("key", createdSession.teacherKey)
                      }
                    >
                      <Copy className="size-3.5" />
                      {copiedField === "key" ? "Copied" : "Copy key"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Share test</h1>
          <p className="text-sm text-muted-foreground">
            Select a test and create a live session for students to join.
          </p>
        </div>
        <Link href="/tests">
          <Button variant="outline">Back to tests</Button>
        </Link>
      </div>

      <div className="max-w-md space-y-2">
        <label htmlFor="owner-name" className="text-sm font-medium">
          Your name
        </label>
        <input
          id="owner-name"
          value={ownerName}
          onChange={(event) => setOwnerName(event.target.value)}
          placeholder="Teacher or host display name"
          className={fieldClassName}
          disabled={phase === "creating"}
        />
      </div>

      {tests.length === 0 ? (
        <p className="text-muted-foreground">No tests available yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-6">
          {tests.map((test) => {
            const canSelect = isTestStartable(test);
            const isSelected = selectedTestId === test.id;

            return (
              <TestPreview
                key={test.id}
                title={test.title}
                type={test.type}
                className={cn(
                  "w-full",
                  isSelected && "ring-2 ring-primary ring-offset-2",
                )}
                disabled={!canSelect || phase === "creating"}
                showStartButton={false}
                onStart={
                  canSelect && phase !== "creating"
                    ? () => setSelectedTestId(test.id)
                    : undefined
                }
              />
            );
          })}
        </div>
      )}

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div>
        <Button
          type="button"
          disabled={!canCreate}
          onClick={handleCreateSession}
        >
          {phase === "creating" ? "Creating session…" : "Create session"}
        </Button>
      </div>
    </main>
  );
}
