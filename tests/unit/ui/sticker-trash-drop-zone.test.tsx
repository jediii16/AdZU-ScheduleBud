import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  pointIsInsideRect,
  StickerTrashDropZone,
} from "@/features/studio/sticker-trash-drop-zone";

describe("sticker trash drop zone", () => {
  it("treats the drop-zone edges as valid and rejects outside points", () => {
    const rect = { left: 100, right: 300, top: 500, bottom: 570 };

    expect(pointIsInsideRect({ x: 100, y: 500 }, rect)).toBe(true);
    expect(pointIsInsideRect({ x: 240, y: 550 }, rect)).toBe(true);
    expect(pointIsInsideRect({ x: 301, y: 550 }, rect)).toBe(false);
    expect(pointIsInsideRect({ x: 240, y: 499 }, rect)).toBe(false);
  });

  it("announces the remove action only while a sticker is moving", () => {
    const { rerender } = render(
      <StickerTrashDropZone visible={false} active={false} />,
    );
    const zone = screen.getByTestId("sticker-trash-drop-zone");
    expect(zone).toHaveAttribute("aria-hidden", "true");
    expect(zone).toHaveAttribute("data-visible", "false");

    rerender(<StickerTrashDropZone visible active={false} />);
    expect(zone).toHaveAttribute("aria-hidden", "false");
    expect(zone).toHaveTextContent("Drag here to remove");

    rerender(<StickerTrashDropZone visible active />);
    expect(zone).toHaveAttribute("data-active", "true");
    expect(zone).toHaveTextContent("Release to remove");
  });
});
