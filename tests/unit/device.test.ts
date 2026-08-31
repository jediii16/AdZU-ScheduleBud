import { describe, expect, it } from "vitest";

import {
  deviceCategoryRegistry,
  devicePresetRegistry,
} from "@/data/devices/registry";
import { resolveTargetComposition } from "@/domain/device/composition";
import {
  deviceDimensionsSchema,
  deviceVariantSchema,
  inferScreenMatch,
  supportsOrientationSwitch,
} from "@/domain/device/types";

describe("device category and screen matching", () => {
  it("allows orientation switching only for Phone and Tablet", () => {
    expect(supportsOrientationSwitch("phone")).toBe(true);
    expect(supportsOrientationSwitch("tablet")).toBe(true);
    expect(supportsOrientationSwitch("laptop")).toBe(false);
    expect(supportsOrientationSwitch("desktop")).toBe(false);
    expect(supportsOrientationSwitch("square")).toBe(false);
  });

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
        photoTransforms: { hero: {}, split: {}, polaroid: {} },
        preview: {
          mode: "clean",
          showSafeAreas: false,
          showWarnings: true,
          enableSnapping: true,
          guideAssetId: null,
        },
      }),
    ).toMatchObject({
      category: "phone",
      dimensionSource: "custom",
      scheduleSize: {
        widthRatio: null,
        heightRatio: null,
        lockAspectRatio: true,
      },
    });
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
        photoTransforms: { hero: {}, split: {}, polaroid: {} },
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

  it("provides a concise validated preset list for every target family", () => {
    expect(
      new Set(devicePresetRegistry.map((preset) => preset.category)),
    ).toEqual(new Set(["phone", "tablet", "laptop", "desktop", "square"]));
    expect(devicePresetRegistry.map((preset) => preset.displayName)).toEqual([
      "iPhone",
      "Android Phone",
      "iPad Portrait",
      "iPad Landscape",
      "Laptop 16:9",
      "MacBook 16:10",
      "Desktop Full HD",
      "Square 1080",
    ]);
  });

  it("enforces edge and sixteen-megapixel canvas safety", () => {
    expect(
      deviceDimensionsSchema.safeParse({ width: 320, height: 320 }).success,
    ).toBe(true);
    expect(
      deviceDimensionsSchema.safeParse({ width: 5120, height: 3125 }).success,
    ).toBe(true);
    expect(
      deviceDimensionsSchema.safeParse({ width: 319, height: 1080 }).success,
    ).toBe(false);
    expect(
      deviceDimensionsSchema.safeParse({ width: 5121, height: 1080 }).success,
    ).toBe(false);
    expect(
      deviceDimensionsSchema.safeParse({ width: 5000, height: 5000 }).success,
    ).toBe(false);
  });

  it("resolves target composition from target geometry, never browser width", () => {
    expect(
      resolveTargetComposition({
        category: "phone",
        dimensions: { width: 1080, height: 2400 },
      }),
    ).toBe("phonePortrait");
    expect(
      resolveTargetComposition({
        category: "tablet",
        dimensions: { width: 1536, height: 2048 },
      }),
    ).toBe("tabletPortrait");
    expect(
      resolveTargetComposition({
        category: "tablet",
        dimensions: { width: 2048, height: 1536 },
      }),
    ).toBe("tabletLandscape");
    expect(
      resolveTargetComposition({
        category: "laptop",
        dimensions: { width: 1920, height: 1080 },
      }),
    ).toBe("desktopLandscape");
    expect(
      resolveTargetComposition({
        category: "square",
        dimensions: { width: 1080, height: 1080 },
      }),
    ).toBe("square");
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
      photoTransforms: { hero: {}, split: {}, polaroid: {} },
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
