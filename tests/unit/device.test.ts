import { describe, expect, it } from "vitest";

import { deviceCategoryRegistry } from "@/data/devices/registry";
import { deviceVariantSchema, inferScreenMatch } from "@/domain/device/types";

describe("device category and screen matching", () => {
  it("keeps semantic category independent from custom dimensions", () => {
    expect(
      deviceVariantSchema.parse({
        category: "phone",
        width: 1440,
        height: 3200,
        dimensionSource: "custom",
        schedulePosition: { x: 0.4, y: 0.6 },
      }),
    ).toMatchObject({ category: "phone", dimensionSource: "custom" });
    expect(
      deviceVariantSchema.parse({
        category: "tablet",
        width: 2048,
        height: 2732,
        dimensionSource: "custom",
        schedulePosition: { x: 0.5, y: 0.5 },
      }),
    ).toMatchObject({ category: "tablet", dimensionSource: "custom" });
    expect(
      deviceCategoryRegistry.every(
        (category) => category.supportsCustomDimensions,
      ),
    ).toBe(true);
  });

  it("does not guess between a high-resolution portrait phone and tablet", () => {
    expect(inferScreenMatch(2048, 2732)).toEqual({
      width: 2048,
      height: 2732,
      orientation: "portrait",
      confidence: "ambiguous",
      candidates: ["phone", "tablet"],
      requiresConfirmation: true,
    });
  });

  it("keeps landscape device classification ambiguous", () => {
    expect(inferScreenMatch(2560, 1600)).toMatchObject({
      orientation: "landscape",
      confidence: "ambiguous",
      candidates: ["laptop", "desktop", "tablet"],
      requiresConfirmation: true,
    });
  });

  it("recognizes exact square dimensions without a model database", () => {
    expect(inferScreenMatch(1080, 1080)).toMatchObject({
      orientation: "square",
      confidence: "high",
      candidates: ["square"],
      recommendedCategory: "square",
      requiresConfirmation: false,
    });
  });

  it("rejects invalid dimensions", () => {
    expect(() => inferScreenMatch(0, 1080)).toThrow(RangeError);
    expect(() => inferScreenMatch(1080.5, 1920)).toThrow(RangeError);
  });
});
