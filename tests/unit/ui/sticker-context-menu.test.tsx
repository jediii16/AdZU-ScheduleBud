import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { StickerContextMenu } from "@/features/studio/sticker-context-menu";

function renderMenu(
  overrides: Partial<ComponentProps<typeof StickerContextMenu>> = {},
) {
  const callbacks = {
    onClose: vi.fn(),
    onDelete: vi.fn(),
    onDuplicate: vi.fn(),
    onReset: vi.fn(),
    onLayer: vi.fn(),
    onStack: vi.fn(),
  };
  render(
    <StickerContextMenu
      instanceId="sticker-one"
      layer="in-front"
      point={{ x: 40, y: 60 }}
      {...callbacks}
      {...overrides}
    />,
  );
  return callbacks;
}

describe("sticker context menu", () => {
  it("routes actions for the sticker and closes after a choice", () => {
    const callbacks = renderMenu();

    fireEvent.click(screen.getByRole("menuitem", { name: /Duplicate/ }));

    expect(callbacks.onDuplicate).toHaveBeenCalledWith("sticker-one");
    expect(callbacks.onClose).toHaveBeenCalledWith(true);
  });

  it("supports menu-key navigation and Escape dismissal", () => {
    const callbacks = renderMenu();
    const menu = screen.getByRole("menu", { name: "Sticker actions" });
    const items = screen.getAllByRole("menuitem");

    expect(items[0]).toHaveFocus();
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(items[1]).toHaveFocus();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(callbacks.onClose).toHaveBeenCalledWith(true);
  });

  it("shows the active layer and routes destructive actions", () => {
    const callbacks = renderMenu();

    expect(
      screen.getByRole("menuitem", { name: "In front of schedule" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("menuitem", { name: /Delete sticker/ }));

    expect(callbacks.onDelete).toHaveBeenCalledWith("sticker-one");
  });
});
