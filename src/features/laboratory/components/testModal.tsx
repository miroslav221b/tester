"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { createTest, setTestMeta } from "@/features/store/slices/testsSlice";
import { selectTestById } from "@/features/store/selectors";
import {
  TEST_TYPE_OPTIONS,
  testTypeConfig,
} from "@/features/tests/lib/testTypeConfig";
import type { Test } from "@/features/tests/types/test";
import { cn } from "@/lib/utils";

const fieldClassName =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

type TestDraft = Pick<Test, "title" | "description" | "type">;

function createEmptyTestDraft(): TestDraft {
  return {
    title: "",
    description: "",
    type: "math",
  };
}

function canSaveTest(draft: TestDraft): boolean {
  return draft.title.trim().length > 0;
}

export type TestModalProps = {
  testId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TestModal({ testId, open, onOpenChange }: TestModalProps) {
  const dispatch = useAppDispatch();
  const selectTest = useMemo(
    () => (testId ? selectTestById(testId) : () => undefined),
    [testId],
  );
  const existingTest = useAppSelector(selectTest);
  const isEdit = Boolean(testId);

  const [draft, setDraft] = useState<TestDraft>(createEmptyTestDraft);

  useEffect(() => {
    if (!open) return;
    if (isEdit && existingTest) {
      setDraft({
        title: existingTest.title,
        description: existingTest.description,
        type: existingTest.type,
      });
    } else if (!isEdit) {
      setDraft(createEmptyTestDraft());
    }
  }, [open, isEdit, existingTest]);

  const updateDraft = useCallback((updater: (current: TestDraft) => TestDraft) => {
    setDraft((current) => updater(current));
  }, []);

  const handleSave = () => {
    if (!canSaveTest(draft)) return;

    const title = draft.title.trim();
    const description = draft.description.trim();
    const { type } = draft;

    if (isEdit && testId) {
      dispatch(setTestMeta({ id: testId, title, description, type }));
    } else {
      dispatch(
        createTest({
          id: crypto.randomUUID(),
          title,
          description,
          type,
          questionIds: [],
          sequenceScheme: { __flow_start__: null },
        }),
      );
    }

    onOpenChange(false);
  };

  const saveDisabled = !canSaveTest(draft);
  const selectedType = testTypeConfig[draft.type];
  const SelectedIcon = selectedType.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>{isEdit ? "Edit test" : "New test"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the test title, description, and subject."
              : "Create a test with a title, description, and subject."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <label htmlFor="test-title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="test-title"
                value={draft.title}
                onChange={(e) =>
                  updateDraft((current) => ({ ...current, title: e.target.value }))
                }
                placeholder="Enter the test title…"
                className={fieldClassName}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="test-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="test-description"
                rows={3}
                value={draft.description}
                onChange={(e) =>
                  updateDraft((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter a short description…"
                className={cn(fieldClassName, "min-h-18 resize-y")}
              />
            </div>

            <section className="space-y-3">
              <p className="text-sm font-medium">Subject</p>

              <div
                className={cn(
                  "relative flex items-center gap-4 overflow-hidden rounded-xl border border-border p-4",
                  "bg-gradient-to-br",
                  selectedType.accent,
                  selectedType.image,
                )}
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-background/80 shadow-sm ring-1 ring-foreground/10 backdrop-blur-sm">
                  <SelectedIcon
                    className="size-7 text-foreground/80"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{selectedType.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Selected subject for this test
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {TEST_TYPE_OPTIONS.map(
                  ({ value, label, icon: Icon, accent, image }) => {
                    const isSelected = draft.type === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() =>
                          updateDraft((current) => ({ ...current, type: value }))
                        }
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border bg-background hover:border-muted-foreground/40 hover:bg-muted/30",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-12 w-full items-center justify-center rounded-lg bg-gradient-to-br",
                            accent,
                            image,
                          )}
                        >
                          <div className="flex size-9 items-center justify-center rounded-lg bg-background/80 shadow-sm ring-1 ring-foreground/10 backdrop-blur-sm">
                            <Icon
                              className="size-5 text-foreground/80"
                              strokeWidth={1.5}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    );
                  },
                )}
              </div>
            </section>
          </div>
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saveDisabled}>
            {isEdit ? "Save changes" : "Create test"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
