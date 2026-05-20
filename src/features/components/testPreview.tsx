"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { testTypeConfig } from "@/features/tests/lib/testTypeConfig";
import { cn } from "@/lib/utils";
import { TestType } from "../tests/types/test";

export type TestPreviewProps = {
  title: string;
  type: TestType;
  onStart?: () => void;
  showStartButton?: boolean;
  onEdit?: () => void;
  showEditButton?: boolean;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  disabled?: boolean;
  className?: string;
};

export function TestPreview({
  title,
  type,
  onStart,
  showStartButton = true,
  onEdit,
  showEditButton = false,
  onDelete,
  showDeleteButton = false,
  disabled = false,
  className,
}: TestPreviewProps) {
  const { icon: Icon, accent, image } = testTypeConfig[type];
  const canStart = Boolean(onStart) && !disabled;
  const isInteractive = canStart;
  const showStart = showStartButton && canStart;
  const showDelete = showDeleteButton && Boolean(onDelete);
  const showFooter =
    showStart || (showEditButton && onEdit) || showDelete;

  return (
    <Card
      aria-disabled={disabled || undefined}
      className={cn(
        "w-56 gap-0 overflow-hidden py-0",
        isInteractive && "cursor-pointer transition-shadow hover:shadow-md",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      onClick={canStart ? onStart : undefined}
    >
      <div
        className={cn(
          "relative flex h-28 items-center justify-center bg-gradient-to-br",
          accent,
          image,
        )}
        aria-hidden
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-background/80 shadow-sm ring-1 ring-foreground/10 backdrop-blur-sm">
          <Icon className="size-8 text-foreground/80" strokeWidth={1.5} />
        </div>
      </div>

      <CardHeader className="px-4 pt-3 pb-0">
        <CardTitle className="line-clamp-2 text-sm leading-snug">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pt-1 pb-3">
        <p className="text-xs capitalize text-muted-foreground">{type}</p>
      </CardContent>

      {showFooter ? (
        <CardFooter className="justify-start gap-2 border-t-0 bg-transparent px-4 pt-0 pb-4">
          {showEditButton && onEdit ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </Button>
          ) : null}
          {showDelete ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={(event) => {
                event.stopPropagation();
                onDelete?.();
              }}
            >
              Delete
            </Button>
          ) : null}
          {showStart ? (
            <Button
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onStart?.();
              }}
            >
              Start
            </Button>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}
