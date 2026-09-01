"use client";

import { forwardRef } from "react";
import { Trash2 } from "lucide-react";

export type ClientPoint = { x: number; y: number };

export function pointIsInsideRect(
  point: ClientPoint,
  rect: Pick<DOMRect, "left" | "right" | "top" | "bottom">,
) {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function pointIsNearRect(
  point: ClientPoint,
  rect: Pick<DOMRect, "left" | "right" | "top" | "bottom">,
  distance = 72,
) {
  return (
    point.x >= rect.left - distance &&
    point.x <= rect.right + distance &&
    point.y >= rect.top - distance &&
    point.y <= rect.bottom + distance
  );
}

export const StickerTrashDropZone = forwardRef<
  HTMLDivElement,
  { visible: boolean; nearby: boolean; active: boolean }
>(function StickerTrashDropZone({ visible, nearby, active }, ref) {
  const approaching = nearby && !active;
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      data-testid="sticker-trash-drop-zone"
      data-visible={visible ? "true" : "false"}
      data-nearby={nearby ? "true" : "false"}
      data-active={active ? "true" : "false"}
      className={`pointer-events-none absolute bottom-[7.25rem] left-1/2 z-30 flex h-24 w-[17rem] -translate-x-1/2 items-center justify-center transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none lg:bottom-14 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-xl border border-dashed transition-[opacity,transform,border-color] duration-200 motion-reduce:transition-none ${
          active
            ? "scale-100 border-white/55 opacity-100"
            : approaching
              ? "scale-100 border-destructive/45 opacity-100"
              : "scale-90 border-border opacity-0"
        }`}
      />
      <div
        className={`relative flex min-h-16 w-[13.5rem] items-center gap-3 rounded-lg border px-3.5 py-2.5 shadow-lg backdrop-blur-md transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out motion-reduce:transition-none ${
          active
            ? "scale-[1.04] border-destructive bg-destructive text-white shadow-[0_14px_34px_rgba(190,45,55,0.28)]"
            : approaching
              ? "scale-[1.02] border-destructive/50 bg-destructive/8 text-destructive shadow-[0_12px_28px_rgba(23,32,51,0.14)]"
              : "border-border bg-surface-elevated/96 text-text-secondary"
        }`}
      >
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-200 motion-reduce:transition-none ${
            active
              ? "-rotate-6 scale-110 bg-white/16 text-white"
              : approaching
                ? "scale-110 bg-destructive/10 text-destructive"
                : "bg-muted text-text-secondary"
          }`}
        >
          <Trash2 aria-hidden="true" className="size-5" />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-sm font-bold leading-5">
            {active ? "Release to remove" : "Remove sticker"}
          </span>
          <span
            className={`block text-[11px] leading-4 ${active ? "text-white/80" : approaching ? "text-destructive/75" : "text-text-muted"}`}
          >
            {active
              ? "You can undo this action"
              : approaching
                ? "Drop inside the target"
                : "Drag here to remove"}
          </span>
        </span>
      </div>
    </div>
  );
});
