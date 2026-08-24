import { describe, expect, it } from "vitest";

import { resolveAlignmentSnap } from "@/domain/render";

const base = {
  scheduleSize: { width: 400, height: 300 },
  canvasSize: { width: 1080, height: 2400 },
  positionRange: { minX: 50, maxX: 630, minY: 50, maxY: 2050 },
  previewScale: 0.25,
  enabled: true,
};

describe("smart alignment guides", () => {
  it("snaps both axes and exposes an intersection state", () => {
    const result = resolveAlignmentSnap({
      ...base,
      proposedOrigin: { x: 342, y: 1048 },
    });
    expect(result.origin).toEqual({ x: 340, y: 1050 });
    expect(result.guides).toMatchObject({
      verticalCenter: true,
      horizontalCenter: true,
    });
  });

  it("prioritizes canvas center over nearby safe-area anchors", () => {
    const result = resolveAlignmentSnap({
      ...base,
      proposedOrigin: { x: 342, y: 800 },
      anchors: { x: [345], y: [] },
    });
    expect(result.origin.x).toBe(340);
    expect(result.guides.source).toBe("canvas-center");
  });

  it("snaps to a safe-area anchor when center is outside threshold", () => {
    const result = resolveAlignmentSnap({
      ...base,
      proposedOrigin: { x: 205, y: 800 },
      anchors: { x: [200], y: [] },
    });
    expect(result.origin.x).toBe(200);
    expect(result.guides.source).toBe("safe-area");
  });

  it("supports vertical-line/X-only and horizontal-line/Y-only snapping", () => {
    expect(
      resolveAlignmentSnap({ ...base, proposedOrigin: { x: 343, y: 800 } }),
    ).toMatchObject({
      origin: { x: 340, y: 800 },
      guides: { verticalCenter: true, horizontalCenter: false },
    });
    expect(
      resolveAlignmentSnap({ ...base, proposedOrigin: { x: 200, y: 1046 } }),
    ).toMatchObject({
      origin: { x: 200, y: 1050 },
      guides: { verticalCenter: false, horizontalCenter: true },
    });
  });

  it("does not snap when the preference is disabled", () => {
    const result = resolveAlignmentSnap({
      ...base,
      enabled: false,
      proposedOrigin: { x: 342, y: 1048 },
    });
    expect(result).toEqual({
      origin: { x: 342, y: 1048 },
      guides: { verticalCenter: false, horizontalCenter: false },
    });
  });

  it("uses display-space thresholds consistently across preview zoom", () => {
    const quarter = resolveAlignmentSnap({
      ...base,
      previewScale: 0.25,
      proposedOrigin: { x: 340 + 7 / 0.25, y: 800 },
    });
    const half = resolveAlignmentSnap({
      ...base,
      previewScale: 0.5,
      proposedOrigin: { x: 340 + 7 / 0.5, y: 800 },
    });
    expect(quarter.origin.x).toBe(340);
    expect(half.origin.x).toBe(340);
  });

  it("uses a wider release threshold without becoming sticky", () => {
    const held = resolveAlignmentSnap({
      ...base,
      proposedOrigin: { x: 340 + 12 / 0.25, y: 800 },
      previous: { verticalCenter: true, horizontalCenter: false },
    });
    const released = resolveAlignmentSnap({
      ...base,
      proposedOrigin: { x: 340 + 15 / 0.25, y: 800 },
      previous: { verticalCenter: true, horizontalCenter: false },
    });
    expect(held.guides.verticalCenter).toBe(true);
    expect(released.guides.verticalCenter).toBe(false);
  });
});
