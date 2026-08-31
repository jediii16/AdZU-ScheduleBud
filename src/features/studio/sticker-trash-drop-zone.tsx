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

export const StickerTrashDropZone = forwardRef<
  HTMLDivElement,
  { visible: boolean; active: boolean }
>(function StickerTrashDropZone({ visible, active }, ref) {
  return (
    <div
      ref={ref}
      role="status"
      aria-hidden={!visible}
      data-testid="sticker-trash-drop-zone"
      data-visible={visible ? "true" : "false"}
      data-active={active ? "true" : "false"}
      className={`pointer-events-none absolute bottom-[7.75rem] left-1/2 z-30 flex min-h-16 min-w-48 -translate-x-1/2 items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-bold shadow-xl backdrop-blur-md transition-[opacity,transform,background-color,border-color,color] duration-150 motion-reduce:transition-none lg:bottom-16 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      } ${
        active
          ? "scale-105 border-destructive bg-destructive text-white"
          : "border-border bg-surface-elevated/95 text-text-secondary"
      }`}
    >
      <Trash2 aria-hidden="true" className="size-5 shrink-0" />
      <span>{active ? "Release to remove" : "Drag here to remove"}</span>
    </div>
  );
});
