import { describe, expect, it } from "vitest";

import {
  resizeScheduleRect,
  scheduleResizeHandleAtPoint,
} from "@/renderer/konva/editor-overlay/schedule-overlay";

const bounds = { x: 100, y: 200, width: 400, height: 200 };

describe("schedule resize handles", () => {
  it("lets a side handle change one axis when proportions are unlocked", () => {
    expect(
      resizeScheduleRect(bounds, "east", { x: 600, y: 300 }, false),
    ).toEqual({ x: 100, y: 200, width: 500, height: 200 });
    expect(
      resizeScheduleRect(bounds, "north", { x: 300, y: 150 }, false),
    ).toEqual({ x: 100, y: 150, width: 400, height: 250 });
  });

  it("keeps the center of the other axis fixed for a locked side resize", () => {
    expect(
      resizeScheduleRect(bounds, "east", { x: 700, y: 300 }, true),
    ).toEqual({ x: 100, y: 150, width: 600, height: 300 });
  });

  it("keeps the opposite corner fixed for a locked corner resize", () => {
    expect(
      resizeScheduleRect(bounds, "north-west", { x: -100, y: 100 }, true),
    ).toEqual({ x: -100, y: 100, width: 600, height: 300 });
    expect(
      resizeScheduleRect(bounds, "north-east", { x: 700, y: 100 }, true),
    ).toEqual({ x: 100, y: 100, width: 600, height: 300 });
    expect(
      resizeScheduleRect(bounds, "south-west", { x: -100, y: 500 }, true),
    ).toEqual({ x: -100, y: 200, width: 600, height: 300 });
    expect(
      resizeScheduleRect(bounds, "south-east", { x: 700, y: 500 }, true),
    ).toEqual({ x: 100, y: 200, width: 600, height: 300 });
  });

  it("routes slightly inward edge grabs to corners instead of schedule movement", () => {
    const thinBounds = { x: 100, y: 200, width: 400, height: 36 };

    expect(scheduleResizeHandleAtPoint(thinBounds, { x: 112, y: 208 }, 1)).toBe(
      "north-west",
    );
    expect(scheduleResizeHandleAtPoint(thinBounds, { x: 488, y: 208 }, 1)).toBe(
      "north-east",
    );
    expect(scheduleResizeHandleAtPoint(thinBounds, { x: 112, y: 228 }, 1)).toBe(
      "south-west",
    );
    expect(scheduleResizeHandleAtPoint(thinBounds, { x: 488, y: 228 }, 1)).toBe(
      "south-east",
    );
    expect(scheduleResizeHandleAtPoint(thinBounds, { x: 112, y: 218 }, 1)).toBe(
      "west",
    );
    expect(
      scheduleResizeHandleAtPoint(thinBounds, { x: 300, y: 218 }, 1),
    ).toBeNull();
  });
});
