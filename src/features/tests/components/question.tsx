"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

function SortableOrderRow({
  optionIndex,
  text,
}: {
  optionIndex: number;
  text: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: optionIndex });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        optionRowClassName,
        isDragging && "z-10 opacity-90 shadow-md",
      )}
    >
      <button
        type="button"
        className={cn(
          "touch-none -m-1 shrink-0 rounded-sm p-1 text-muted-foreground",
          "cursor-grab active:cursor-grabbing",
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" aria-hidden />
      </button>
      <span className="min-w-0 flex-1">{text}</span>
    </li>
  );
}

export function OrderForm({ options, value, onChange }: OrderFormProps) {
  const order = value ?? options.map((o) => o.index);
  const optionByIndex = new Map(options.map((o) => [o.index, o]));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeOptionIndex = Number(active.id);
    const overOptionIndex = Number(over.id);
    const oldPosition = order.indexOf(activeOptionIndex);
    const newPosition = order.indexOf(overOptionIndex);
    if (oldPosition === -1 || newPosition === -1) return;

    onChange?.(arrayMove(order, oldPosition, newPosition));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-1">
          {order.map((index) => {
            const option = optionByIndex.get(index);
            if (!option) return null;

            return (
              <SortableOrderRow
                key={index}
                optionIndex={index}
                text={option.text}
              />
            );
          })}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
