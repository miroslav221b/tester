"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import {
  createQuestion,
  updateQuestion,
} from "@/features/store/slices/questionsSlice";
import {
  addQuestionIdToTest,
  syncSequenceSchemeWithQuestionIds,
} from "@/features/store/slices/testsSlice";
import { selectQuestionById } from "@/features/store/selectors";
import {
  MultipleChoiceForm,
  OrderForm,
  SingleChoiceForm,
} from "@/features/tests/components/question";
import type { Question, QuestionType } from "@/features/tests/types/question";
import { cn } from "@/lib/utils";

const fieldClassName =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "single", label: "Single choice" },
  { value: "multiple", label: "Multiple choice" },
  { value: "order", label: "Order" },
];

function createEmptyQuestion(): Question {
  return {
    id: crypto.randomUUID(),
    text: "",
    type: "single",
    options: [],
    correctOptions: [],
  };
}

function nextOptionIndex(options: Question["options"]) {
  if (options.length === 0) return 0;
  return Math.max(...options.map((o) => o.index)) + 1;
}

function normalizeCorrectOptionsForType(
  type: QuestionType,
  options: Question["options"],
  correctOptions: number[],
): number[] {
  const validIndexes = new Set(options.map((o) => o.index));
  const filtered = correctOptions.filter((i) => validIndexes.has(i));

  switch (type) {
    case "single":
      return filtered.length > 0 ? [filtered[0]] : [];
    case "multiple":
      return filtered;
    case "order": {
      // Preserve the author's sequence from correctOptions (preview drag order),
      // then append any option indexes that were missing (e.g. newly added options).
      const seen = new Set(filtered);
      const missingInOrder = options
        .map((o) => o.index)
        .filter((i) => !seen.has(i));
      return [...filtered, ...missingInOrder];
    }
  }
}

function canSaveQuestion(question: Question): boolean {
  if (!question.text.trim() || question.options.length < 2) return false;

  const valid = new Set(question.options.map((o) => o.index));
  const correct = question.correctOptions.filter((i) => valid.has(i));

  if (correct.length === 0) return false;
  if (question.type === "single") return correct.length === 1;
  if (question.type === "multiple") return correct.length >= 1;
  return correct.length === question.options.length;
}

type QuestionPreviewProps = {
  type: QuestionType;
  options: Question["options"];
  previewValue: number | number[] | undefined;
  onChange: (answer: number | number[]) => void;
};

function QuestionPreview({
  type,
  options,
  previewValue,
  onChange,
}: QuestionPreviewProps) {
  if (type === "single") {
    return (
      <SingleChoiceForm
        type="single"
        options={options}
        value={previewValue as number | undefined}
        onChange={onChange}
      />
    );
  }

  if (type === "multiple") {
    return (
      <MultipleChoiceForm
        type="multiple"
        options={options}
        value={Array.isArray(previewValue) ? previewValue : []}
        onChange={onChange}
      />
    );
  }

  const orderValue = Array.isArray(previewValue)
    ? previewValue
    : options.map((o) => o.index);

  return (
    <OrderForm
      type="order"
      options={options}
      value={orderValue.length > 0 ? orderValue : options.map((o) => o.index)}
      onChange={onChange}
    />
  );
}

export type QuestionModalProps = {
  testId: string;
  questionId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QuestionModal({
  testId,
  questionId,
  open,
  onOpenChange,
}: QuestionModalProps) {
  const dispatch = useAppDispatch();
  const selectQuestion = useMemo(
    () => (questionId ? selectQuestionById(questionId) : () => undefined),
    [questionId],
  );
  const existingQuestion = useAppSelector(selectQuestion);
  const isEdit = Boolean(questionId);

  const [draft, setDraft] = useState<Question>(createEmptyQuestion);
  const [newOptionText, setNewOptionText] = useState("");

  useEffect(() => {
    if (!open) return;
    if (isEdit && existingQuestion) {
      setDraft({
        ...existingQuestion,
        options: existingQuestion.options.map((o) => ({ ...o })),
        correctOptions: [...existingQuestion.correctOptions],
      });
    } else if (!isEdit) {
      setDraft(createEmptyQuestion());
    }
    setNewOptionText("");
  }, [open, isEdit, existingQuestion]);

  const updateDraft = useCallback(
    (updater: (current: Question) => Question) => {
      setDraft((current) => updater(current));
    },
    [],
  );

  const handleTypeChange = (type: QuestionType) => {
    updateDraft((current) => ({
      ...current,
      type,
      correctOptions: normalizeCorrectOptionsForType(
        type,
        current.options,
        current.correctOptions,
      ),
    }));
  };

  const handleAddOption = () => {
    const text = newOptionText.trim();
    if (!text) return;

    updateDraft((current) => {
      const index = nextOptionIndex(current.options);
      const options = [...current.options, { index, text }];
      const correctOptions =
        current.type === "order"
          ? [...current.correctOptions, index]
          : current.correctOptions;

      return { ...current, options, correctOptions };
    });
    setNewOptionText("");
  };

  const handleRemoveOption = (optionIndex: number) => {
    updateDraft((current) => {
      const options = current.options.filter((o) => o.index !== optionIndex);
      const correctOptions = current.correctOptions.filter(
        (i) => i !== optionIndex,
      );
      return {
        ...current,
        options,
        correctOptions: normalizeCorrectOptionsForType(
          current.type,
          options,
          correctOptions,
        ),
      };
    });
  };

  const handleOptionTextChange = (optionIndex: number, text: string) => {
    updateDraft((current) => ({
      ...current,
      options: current.options.map((o) =>
        o.index === optionIndex ? { ...o, text } : o,
      ),
    }));
  };

  const toggleCorrectOption = (optionIndex: number) => {
    updateDraft((current) => {
      if (current.type === "single") {
        return { ...current, correctOptions: [optionIndex] };
      }
      if (current.type === "multiple") {
        const has = current.correctOptions.includes(optionIndex);
        const correctOptions = has
          ? current.correctOptions.filter((i) => i !== optionIndex)
          : [...current.correctOptions, optionIndex];
        return { ...current, correctOptions };
      }
      return current;
    });
  };

  const handlePreviewAnswerChange = (answer: number | number[]) => {
    updateDraft((current) => ({
      ...current,
      correctOptions: Array.isArray(answer) ? answer : [answer],
    }));
  };

  const handleSave = () => {
    if (!canSaveQuestion(draft)) return;

    const payload: Question = {
      ...draft,
      text: draft.text.trim(),
      correctOptions: normalizeCorrectOptionsForType(
        draft.type,
        draft.options,
        draft.correctOptions,
      ),
    };

    if (isEdit) {
      dispatch(updateQuestion({ id: payload.id, changes: payload }));
    } else {
      dispatch(createQuestion(payload));
      dispatch(addQuestionIdToTest({ testId, questionId: payload.id }));
      dispatch(syncSequenceSchemeWithQuestionIds(testId));
    }

    onOpenChange(false);
  };

  const previewValue = useMemo(() => {
    if (draft.type === "single") return draft.correctOptions[0];
    return draft.correctOptions;
  }, [draft.correctOptions, draft.type]);

  const saveDisabled = !canSaveQuestion(draft);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>{isEdit ? "Edit question" : "New question"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the question text, type, options, and correct answers."
              : "Add a question to this test with options and correct answers."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <label htmlFor="question-text" className="text-sm font-medium">
                Question text
              </label>
              <textarea
                id="question-text"
                rows={3}
                value={draft.text}
                onChange={(e) =>
                  updateDraft((current) => ({
                    ...current,
                    text: e.target.value,
                  }))
                }
                placeholder="Enter the question…"
                className={cn(fieldClassName, "min-h-18 resize-y")}
              />
            </div>

            <Tabs
              value={draft.type}
              onValueChange={(value) => handleTypeChange(value as QuestionType)}
            >
              <div className="space-y-2">
                <p className="text-sm font-medium">Question type</p>
                <TabsList className="w-full">
                  {QUESTION_TYPES.map(({ value, label }) => (
                    <TabsTrigger key={value} value={value} className="flex-1">
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Options</p>
                <p className="text-xs text-muted-foreground">
                  {draft.type === "order"
                    ? "Drag in preview to set order"
                    : "Mark correct answers"}
                </p>
              </div>

              <ul className="flex flex-col gap-2">
                {draft.options.map((option) => {
                  const isCorrect = draft.correctOptions.includes(option.index);
                  const orderPosition =
                    draft.type === "order"
                      ? draft.correctOptions.indexOf(option.index)
                      : -1;

                  return (
                    <li
                      key={option.index}
                      className="flex items-center gap-2 rounded-lg border border-border bg-background p-2"
                    >
                      {draft.type !== "order" && (
                        <Button
                          type="button"
                          variant={isCorrect ? "default" : "outline"}
                          size="icon-sm"
                          aria-label={
                            isCorrect
                              ? "Remove as correct answer"
                              : "Mark as correct answer"
                          }
                          aria-pressed={isCorrect}
                          onClick={() => toggleCorrectOption(option.index)}
                        >
                          <Check className="size-3.5" />
                        </Button>
                      )}
                      {draft.type === "order" && orderPosition >= 0 && (
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                          {orderPosition + 1}
                        </span>
                      )}
                      <input
                        value={option.text}
                        onChange={(e) =>
                          handleOptionTextChange(option.index, e.target.value)
                        }
                        className={cn(fieldClassName, "min-w-0 flex-1")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete option"
                        onClick={() => handleRemoveOption(option.index)}
                      >
                        <Trash2 className="size-3.5 text-muted-foreground" />
                      </Button>
                    </li>
                  );
                })}
              </ul>

              {draft.options.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Add at least two options.
                </p>
              )}

              <div className="flex gap-2">
                <input
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  placeholder="New option text…"
                  className={fieldClassName}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Add option"
                  onClick={handleAddOption}
                  disabled={!newOptionText.trim()}
                >
                  <Plus />
                </Button>
              </div>
            </section>

            <section className="space-y-2">
              <p className="text-sm font-medium">
                Preview ·{" "}
                {QUESTION_TYPES.find((t) => t.value === draft.type)?.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {draft.type === "single" &&
                  "Select one option as the correct answer."}
                {draft.type === "multiple" && "Select all correct options."}
                {draft.type === "order" &&
                  "Drag options into the correct order."}
              </p>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                {draft.options.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Add options to see a preview.
                  </p>
                ) : (
                  <QuestionPreview
                    key={draft.type}
                    type={draft.type}
                    options={draft.options}
                    previewValue={previewValue}
                    onChange={handlePreviewAnswerChange}
                  />
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
            {isEdit ? "Save changes" : "Add question"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
