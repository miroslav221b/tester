"use client";

import { cn } from "@/lib/utils";

/** Gradient / color utility classes for three blob layers */
type AttemptQuestionTheme = {
  blobs: [string, string, string];
};

type AttemptBlobBackdropProps = {
  attempt: AttemptQuestionTheme;
  className?: string;
};

/**
 * Softer blurred blob layers behind attempt UI (keyboard / scroll safe: pointer-events none).
 */
export function AttemptBlobBackdrop({
  attempt,
  className,
}: AttemptBlobBackdropProps) {
  const [b1, b2, b3] = attempt.blobs;
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background",
        className,
      )}
    >
      {/* subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_0%,var(--background)_75%)] opacity-70" />

      <div
        className={cn(
          "absolute -left-[18%] -top-[12%] h-[58vmin] w-[58vmin] rounded-full blur-3xl",
          b1,
        )}
      />
      <div
        className={cn(
          "absolute -right-[12%] top-[22%] h-[48vmin] w-[48vmin] rounded-[55%_45%_50%_50%] blur-3xl",
          b2,
        )}
      />
      <div
        className={cn(
          "absolute bottom-[-14%] left-[14%] h-[52vmin] w-[52vmin] rounded-[45%_55%_50%_50%] blur-3xl",
          b3,
        )}
      />
    </div>
  );
}
