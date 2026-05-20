"use client";

import { useState } from "react";

import {
  MultipleChoiceForm,
  OrderForm,
  SingleChoiceForm,
} from "../components/question";
import { ActionBar } from "../layout/actionBar";
import type { Question } from "../types/question";

export type QuestionPageProps = {
  question: Question;
  onSkip?: () => void;
  onSubmit?: (answer: number | number[]) => void;
};

function getInitialAnswer(question: Question): number | number[] | undefined {
  switch (question.type) {
    case "single":
      return undefined;
    case "multiple":
      return [];
    case "order":
      return question.options.map((o) => o.index);
  }
}

function isSubmitDisabled(
  question: Question,
  answer: number | number[] | undefined,
): boolean {
  if (answer === undefined) return true;
  if (question.type === "multiple")
    return Array.isArray(answer) && answer.length === 0;
  return false;
}

function isResetDisabled(
  question: Question,
  answer: number | number[] | undefined,
): boolean {
  if (question.type === "order") {
    const initial = getInitialAnswer(question) as number[];
    const current = (answer ?? initial) as number[];
    return current.every((index, i) => index === initial[i]);
  }
  return isSubmitDisabled(question, answer);
}

export function QuestionPage({
  question,
  onSkip,
  onSubmit,
}: QuestionPageProps) {
  const [answer, setAnswer] = useState<number | number[] | undefined>(() =>
    getInitialAnswer(question),
  );

  const reset = () => setAnswer(getInitialAnswer(question));

  const handleSubmit = () => {
    if (isSubmitDisabled(question, answer)) return;
    onSubmit?.(answer as number | number[]);
  };

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 pb-24 sm:p-6">
        <h1 className="text-lg font-medium leading-snug">{question.text}</h1>

        {question.type === "single" && (
          <SingleChoiceForm
            type="single"
            options={question.options}
            value={answer as number | undefined}
            onChange={setAnswer}
          />
        )}

        {question.type === "multiple" && (
          <MultipleChoiceForm
            type="multiple"
            options={question.options}
            value={(answer as number[]) ?? []}
            onChange={setAnswer}
          />
        )}

        {question.type === "order" && (
          <OrderForm
            type="order"
            options={question.options}
            value={answer as number[]}
            onChange={setAnswer}
          />
        )}
      </main>

      <ActionBar
        onReset={reset}
        onSkip={() => onSkip?.()}
        onSubmit={handleSubmit}
        resetDisabled={isResetDisabled(question, answer)}
        submitDisabled={isSubmitDisabled(question, answer)}
      />
    </div>
  );
}
