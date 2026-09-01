"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { Check, Copy, Layers, RotateCcw, Trash2 } from "lucide-react";

import type { StickerLayer } from "@/domain/stickers/types";

export type StickerMenuPoint = { x: number; y: number };

type StickerContextMenuProps = {
  instanceId: string;
  layer: StickerLayer;
  point: StickerMenuPoint;
  onClose(restoreFocus?: boolean): void;
  onDelete(instanceId: string): void;
  onDuplicate(instanceId: string): void;
  onReset(instanceId: string): void;
  onLayer(instanceId: string, layer: StickerLayer): void;
  onStack(instanceId: string, direction: "forward" | "backward"): void;
};

function MenuItem({
  children,
  icon,
  destructive = false,
  shortcut,
  onSelect,
}: {
  children: ReactNode;
  icon: ReactNode;
  destructive?: boolean;
  shortcut?: string;
  onSelect(): void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`flex min-h-9 w-full items-center gap-2 rounded-sm px-2.5 text-left text-sm transition-colors focus:bg-muted focus:outline-none ${
        destructive
          ? "text-destructive hover:bg-destructive/8"
          : "text-foreground hover:bg-muted"
      }`}
      onClick={onSelect}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {shortcut ? (
        <span className="font-mono text-[10px] text-text-muted">
          {shortcut}
        </span>
      ) : null}
    </button>
  );
}

export function StickerContextMenu({
  instanceId,
  layer,
  point,
  onClose,
  onDelete,
  onDuplicate,
  onReset,
  onLayer,
  onStack,
}: StickerContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const left = `clamp(8px, ${point.x}px, calc(100vw - 228px))`;
  const top = `clamp(8px, ${point.y}px, calc(100dvh - 330px))`;
  const choose = (action: () => void) => {
    action();
    onClose(true);
  };

  useEffect(() => {
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus();
    const closeFromOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose(false);
    };
    const closeFromEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose(true);
    };
    window.addEventListener("pointerdown", closeFromOutside);
    window.addEventListener("keydown", closeFromEscape);
    return () => {
      window.removeEventListener("pointerdown", closeFromOutside);
      window.removeEventListener("keydown", closeFromEscape);
    };
  }, [instanceId, onClose, point.x, point.y]);

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ) ?? [],
    );
    if (!items.length) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? (current + 1 + items.length) % items.length
            : (current - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Sticker actions"
      className="fixed z-50 w-[13.5rem] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-md border border-border bg-surface-elevated p-1.5 shadow-xl"
      style={{ left, top }}
      onKeyDown={moveFocus}
      onContextMenu={(event) => event.preventDefault()}
    >
      <MenuItem
        icon={<Layers aria-hidden="true" className="size-4" />}
        onSelect={() => choose(() => onStack(instanceId, "forward"))}
      >
        Bring forward
      </MenuItem>
      <MenuItem
        icon={<Layers aria-hidden="true" className="size-4" />}
        onSelect={() => choose(() => onStack(instanceId, "backward"))}
      >
        Send backward
      </MenuItem>
      <div role="separator" className="my-1 border-t border-border" />
      <MenuItem
        icon={
          layer === "in-front" ? (
            <Check aria-hidden="true" className="size-4" />
          ) : null
        }
        onSelect={() => choose(() => onLayer(instanceId, "in-front"))}
      >
        In front of schedule
      </MenuItem>
      <MenuItem
        icon={
          layer === "behind-schedule" ? (
            <Check aria-hidden="true" className="size-4" />
          ) : null
        }
        onSelect={() => choose(() => onLayer(instanceId, "behind-schedule"))}
      >
        Behind schedule
      </MenuItem>
      <div role="separator" className="my-1 border-t border-border" />
      <MenuItem
        icon={<Copy aria-hidden="true" className="size-4" />}
        shortcut="Ctrl+D"
        onSelect={() => choose(() => onDuplicate(instanceId))}
      >
        Duplicate
      </MenuItem>
      <MenuItem
        icon={<RotateCcw aria-hidden="true" className="size-4" />}
        onSelect={() => choose(() => onReset(instanceId))}
      >
        Reset transform
      </MenuItem>
      <div role="separator" className="my-1 border-t border-border" />
      <MenuItem
        destructive
        icon={<Trash2 aria-hidden="true" className="size-4" />}
        shortcut="Delete"
        onSelect={() => choose(() => onDelete(instanceId))}
      >
        Delete sticker
      </MenuItem>
    </div>
  );
}
