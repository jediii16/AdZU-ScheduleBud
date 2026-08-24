import { describe, expect, it } from "vitest";

import { deviceCategoryRegistry } from "@/data/devices/registry";
import { deviceVariantSchema, inferScreenMatch } from "@/domain/device/types";

describe("device category and screen matching", () => {
  it("keeps semantic category independent from custom dimensions", () => {
    expect(
      deviceVariantSchema.parse({
        id: "phone-custom",
        category: "phone",
        dimensions: { width: 1440, height: 3200 },
        dimensionSource: "custom",
        presetId: null,
        orientation: "portrait",
        compositionId: "default",
        schedulePosition: { x: 0.4, y: 0.6 },
        layoutOverride: null,
        densityOverride: null,
        visibleFieldsOverride: null,
        photoTransforms: {},
        preview: {
          mode: "clean",
          showSafeAreas: false,
          showWarnings: true,
          enableSnapping: true,
          guideAssetId: null,
        },
      }),
    ).toMatchObject({ category: "phone", dimensionSource: "custom" });
    expect(
      deviceVariantSchema.parse({
        id: "tablet-custom",
        category: "tablet",
        dimensions: { width: 2048, height: 2732 },
        dimensionSource: "custom",
        presetId: null,
        orientation: "portrait",
        compositionId: "default",
        schedulePosition: { x: 0.5, y: 0.5 },
        layoutOverride: null,
        densityOverride: null,
        visibleFieldsOverride: null,
        photoTransforms: {},
        preview: {
          mode: "clean",
          showSafeAreas: false,
          showWarnings: true,
          enableSnapping: true,
          guideAssetId: null,
        },
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

  it("rejects persisted variants whose orientation or preset provenance is inconsistent", () => {
    const base = {
      id: "variant",
      category: "phone" as const,
      dimensions: { width: 1206, height: 2622 },
      dimensionSource: "custom" as const,
      presetId: null,
      orientation: "landscape" as const,
      compositionId: "default",
      schedulePosition: { x: 0.5, y: 0.5 },
      layoutOverride: null,
      densityOverride: null,
      visibleFieldsOverride: null,
      photoTransforms: {},
      preview: {
        mode: "clean" as const,
        showSafeAreas: false,
        showWarnings: true,
        enableSnapping: true,
        guideAssetId: null,
      },
    };
    expect(deviceVariantSchema.safeParse(base).success).toBe(false);
    expect(
      deviceVariantSchema.safeParse({
        ...base,
        orientation: "portrait",
        presetId: "preset-with-custom-source",
      }).success,
    ).toBe(false);
  });
});
