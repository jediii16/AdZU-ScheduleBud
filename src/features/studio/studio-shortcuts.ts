export type StudioShortcutAction =
  | "undo"
  | "redo"
  | "save"
  | "duplicate-selection"
  | "delete-selection"
  | "clear-selection"
  | "zoom-in"
  | "zoom-out"
  | "zoom-fit"
  | "nudge-left"
  | "nudge-right"
  | "nudge-up"
  | "nudge-down";

type ShortcutEvent = Pick<
  KeyboardEvent,
  "altKey" | "ctrlKey" | "key" | "metaKey" | "shiftKey" | "target"
>;

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function studioShortcutAction(
  event: ShortcutEvent,
): StudioShortcutAction | null {
  if (isEditableShortcutTarget(event.target)) return null;

  const key = event.key.toLowerCase();
  const modifier = event.ctrlKey || event.metaKey;
  if (modifier && !event.altKey) {
    if (key === "z") return event.shiftKey ? "redo" : "undo";
    if (key === "y") return "redo";
    if (key === "s") return "save";
    if (key === "d") return "duplicate-selection";
    if (key === "+" || key === "=") return "zoom-in";
    if (key === "-") return "zoom-out";
  }

  if (!modifier && !event.altKey) {
    if (key === "delete" || key === "backspace") return "delete-selection";
    if (key === "escape") return "clear-selection";
    if (key === "+" || key === "=") return "zoom-in";
    if (key === "-") return "zoom-out";
    if (key === "1" && event.shiftKey) return "zoom-fit";
    if (key === "arrowleft") return "nudge-left";
    if (key === "arrowright") return "nudge-right";
    if (key === "arrowup") return "nudge-up";
    if (key === "arrowdown") return "nudge-down";
  }

  return null;
}
