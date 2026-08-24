import { describe, expect, it } from "vitest";
import {
  detectSafeAreaCollision,
  resolveSafeAreaModel,
  safeAreaSnapAnchors,
} from "@/domain/device/safe-areas";
import { visualScheduleProject } from "../fixtures/visual/schedules";

function phone(mode: "lock-screen" | "clean" = "lock-screen") {
  const variant = structuredClone(visualScheduleProject().deviceVariants[0]!);
  variant.preview.mode = mode;
  return variant;
}

describe("preview safe areas", () => {
  it("resolves conservative generic geometry and no zones for wallpaper-only", () => {
    expect(
      resolveSafeAreaModel(phone()).zones.map((zone) => zone.kind),
    ).toEqual(["blocked", "caution", "clear", "caution"]);
    expect(resolveSafeAreaModel(phone("clean")).zones).toEqual([]);
  });

  it("derives clear, caution, and blocked collision without persistence", () => {
    const model = resolveSafeAreaModel(phone());
    expect(
      detectSafeAreaCollision(
        { x: 100, y: 900, width: 400, height: 300 },
        model,
      ).status,
    ).toBe("clear");
    expect(
      detectSafeAreaCollision(
        { x: 100, y: 300, width: 400, height: 300 },
        model,
      ).status,
    ).toBe("caution");
    expect(
      detectSafeAreaCollision({ x: 0, y: 0, width: 400, height: 100 }, model)
        .status,
    ).toBe("blocked");
    expect("collision" in phone()).toBe(false);
  });

  it("provides deterministic clear-area boundary anchors", () => {
    const anchors = safeAreaSnapAnchors(resolveSafeAreaModel(phone()), {
      width: 400,
      height: 300,
    });
    expect(anchors.x).toHaveLength(2);
    expect(anchors.y).toHaveLength(2);
    expect(anchors.x[0]).toBeLessThan(anchors.x[1]!);
  });
});
