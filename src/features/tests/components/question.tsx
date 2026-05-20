"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question } from "../types/question";

type OptionsProps = Pick<Question, "options">;

const optionButtonClassName =
  "h-auto w-full justify-start px-3 py-2 text-left text-sm font-normal";

const optionRowClassName =
  "flex h-auto w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal";

export type SingleChoiceFormProps = OptionsProps & {
  type: "single";
  value?: number;
  onChange?: (index: number) => void;
};

export function SingleChoiceForm({
  options,
  value,
  onChange,
}: SingleChoiceFormProps) {
  return (
    <ul className="flex flex-col gap-1">
      {options.map((option) => (
        <li key={option.index}>
          <Button
            type="button"
            variant={value === option.index ? "default" : "outline"}
            className={optionButtonClassName}
            onClick={() => onChange?.(option.index)}
          >
            {option.text}
          </Button>
        </li>
      ))}
    </ul>
  );
}

export type MultipleChoiceFormProps = OptionsProps & {
  type: "multiple";
  value?: number[];
  onChange?: (indexes: number[]) => void;
};

export function MultipleChoiceForm({
  options,
  value = [],
  onChange,
}: MultipleChoiceFormProps) {
  const toggle = (index: number) => {
    const next = value.includes(index)
      ? value.filter((i) => i !== index)
      : [...value, index];
    onChange?.(next);
  };

  return (
    <ul className="flex flex-col gap-1">
      {options.map((option) => (
        <li key={option.index}>
          <Button
            type="button"
            variant={value.includes(option.index) ? "default" : "outline"}
            className={optionButtonClassName}
            onClick={() => toggle(option.index)}
          >
            {option.text}
          </Button>
        </li>
      ))}
    </ul>
  );
}

export type OrderFormProps = OptionsProps & {
  type: "order";
  value?: number[];
  onChange?: (indexes: number[]) => void;
};

export function OrderForm({ options, value, onChange }: OrderFormProps) {
  const order = value ?? options.map((o) => o.index);
  const optionByIndex = new Map(options.map((o) => [o.index, o]));
  const [draggedPosition, setDraggedPosition] = useState<number | null>(null);
  const [overPosition, setOverPosition] = useState<number | null>(null);

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange?.(next);
  };

  const resetDragState = () => {
    setDraggedPosition(null);
    setOverPosition(null);
  };

  return (
    <ul className="flex flex-col gap-1">
      {order.map((index, position) => {
        const option = optionByIndex.get(index);
        if (!option) return null;

        const isDragging = draggedPosition === position;
        const isOver = overPosition === position && draggedPosition !== position;

        return (
          <li
            key={index}
            draggable
            onDragStart={() => setDraggedPosition(position)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverPosition(position);
            }}
            onDragLeave={() => {
              setOverPosition((current) =>
                current === position ? null : current,
              );
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedPosition !== null) {
                reorder(draggedPosition, position);
              }
              resetDragState();
            }}
            onDragEnd={resetDragState}
            className={cn(
              optionRowClassName,
              "cursor-grab transition-colors select-none active:cursor-grabbing",
              isDragging && "opacity-50",
              isOver && "border-primary bg-muted/50",
            )}
          >
            <GripVertical
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="min-w-0 flex-1">{option.text}</span>
          </li>
        );
      })}
    </ul>
  );
}
