import { describe, expect, it } from "vitest";

import { studioShortcutAction } from "@/features/studio/studio-shortcuts";

function shortcut(
  key: string,
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent {
  return new KeyboardEvent("keydown", {
    key,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  });
}

describe("Studio keyboard shortcuts", () => {
  it.each([
    [shortcut("z", { ctrlKey: true }), "undo"],
    [shortcut("z", { metaKey: true }), "undo"],
    [shortcut("z", { ctrlKey: true, shiftKey: true }), "redo"],
    [shortcut("y", { ctrlKey: true }), "redo"],
    [shortcut("s", { ctrlKey: true }), "save"],
    [shortcut("d", { metaKey: true }), "duplicate-selection"],
    [shortcut("Delete"), "delete-selection"],
    [shortcut("Backspace"), "delete-selection"],
    [shortcut("Escape"), "clear-selection"],
    [shortcut("+"), "zoom-in"],
    [shortcut("-", { ctrlKey: true }), "zoom-out"],
    [shortcut("1", { shiftKey: true }), "zoom-fit"],
    [shortcut("ArrowLeft"), "nudge-left"],
    [shortcut("ArrowRight", { shiftKey: true }), "nudge-right"],
    [shortcut("ArrowUp"), "nudge-up"],
    [shortcut("ArrowDown", { shiftKey: true }), "nudge-down"],
  ])("maps a familiar editor command", (event, expected) => {
    expect(studioShortcutAction(event)).toBe(expected);
  });

  it("does not intercept typing or modified browser/system commands", () => {
    const input = document.createElement("input");
    const typingUndo = shortcut("z", { ctrlKey: true });
    Object.defineProperty(typingUndo, "target", { value: input });
    expect(studioShortcutAction(typingUndo)).toBeNull();
    expect(
      studioShortcutAction(shortcut("d", { ctrlKey: true, altKey: true })),
    ).toBeNull();
    expect(studioShortcutAction(shortcut("a", { ctrlKey: true }))).toBeNull();
  });
});
