"use client";

import { Check, RotateCcw, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActionBarProps = {
  onReset: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  resetDisabled?: boolean;
  skipDisabled?: boolean;
  submitDisabled?: boolean;
  className?: string;
};

export function ActionBar({
  onReset,
  onSkip,
  onSubmit,
  resetDisabled,
  skipDisabled,
  submitDisabled,
  className,
}: ActionBarProps) {
  return (
    <footer
      className={cn(
        "sticky bottom-0 z-30 w-full border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl gap-2 p-3 sm:gap-3 sm:p-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={resetDisabled}
          onClick={onReset}
          className="min-w-0 flex-1 sm:flex-none"
        >
          <RotateCcw />
          <span>Reset</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={skipDisabled}
          onClick={onSkip}
          className="min-w-0 flex-1 sm:flex-none"
        >
          <SkipForward />
          <span>Skip</span>
        </Button>

        <Button
          type="button"
          size="lg"
          disabled={submitDisabled}
          onClick={onSubmit}
          className="min-w-0 flex-[1.25] sm:ml-auto sm:min-w-[9rem] sm:flex-none"
        >
          <Check />
          <span>Submit</span>
        </Button>
      </div>
    </footer>
  );
}
