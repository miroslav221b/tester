"use client";

import { QRCodeSVG } from "qrcode.react";

import { cn } from "@/lib/utils";

type QrCodeDisplayProps = {
  url: string;
  size?: number;
  className?: string;
};

export function QrCodeDisplay({ url, size = 280, className }: QrCodeDisplayProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-2xl bg-white p-5 shadow-xl ring-4 ring-white/80 sm:p-6",
        className,
      )}
      role="img"
      aria-label="QR code for join link"
      style={{ maxWidth: size + 48 }}
    >
      <QRCodeSVG
        value={url}
        size={size}
        className="h-auto w-full"
        style={{ width: "100%", height: "auto", maxWidth: size }}
      />
    </div>
  );
}
