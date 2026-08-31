import { describe, expect, it } from "vitest";

import { deviceVariantSchema } from "@/domain/device/types";
import { applyScheduleSize, type ScheduleRenderResult } from "@/domain/render";

function variant(scheduleSize: {
  widthRatio: number | null;
  heightRatio: number | null;
  lockAspectRatio: boolean;
}) {
  return deviceVariantSchema.parse({
    id: "variant",
    category: "phone",
    dimensions: { width: 1000, height: 1000 },
    dimensionSource: "custom",
    presetId: null,
    orientation: "square",
    compositionId: "default",
    schedulePosition: { x: 0.5, y: 0.5 },
    scheduleSize,
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
  });
}

function result(): ScheduleRenderResult {
  return {
    model: {
      width: 1000,
      height: 1000,
      layers: [
        {
          id: "background",
          nodes: [
            {
              id: "background",
              kind: "rect",
              geometry: { x: 0, y: 0, width: 1000, height: 1000 },
              fill: "#fff",
            },
          ],
        },
        { id: "scenery", nodes: [] },
        {
          id: "photos",
          nodes: [
            {
              id: "photo",
              kind: "image",
              geometry: { x: 100, y: 200, width: 300, height: 500 },
              assetId: "photo",
              fit: "cover",
              crop: { x: 2, y: 3, width: 30, height: 50 },
            },
          ],
        },
        {
          id: "schedule",
          nodes: [
            {
              id: "surface",
              kind: "rect",
              geometry: { x: 100, y: 200, width: 800, height: 500 },
              fill: "#eee",
              cornerRadius: 20,
            },
            {
              id: "title",
              kind: "text",
              position: { x: 150, y: 250 },
              width: 200,
              height: 50,
              text: "Weekly Schedule",
              fontId: "heading-sans",
              fontSize: 40,
              fill: "#111",
            },
          ],
        },
        { id: "foreground", nodes: [] },
      ],
    },
    overlay: {
      safeAreas: [],
      selection: { x: 100, y: 200, width: 800, height: 500 },
      warningRegions: [],
    },
    scheduleBounds: { x: 100, y: 200, width: 800, height: 500 },
    positionRange: { minX: 100, maxX: 100, minY: 100, maxY: 400 },
    photoFrame: { x: 100, y: 200, width: 300, height: 500 },
  };
}

function cardsResult(): ScheduleRenderResult {
  const base = result();
  const [background, scenery, photos, , foreground] = base.model.layers;
  return {
    ...base,
    model: {
      ...base.model,
      layers: [
        background,
        scenery,
        photos,
        {
          id: "schedule",
          nodes: [
            {
              id: "card-monday-occurrence",
              kind: "rect",
              geometry: { x: 120, y: 220, width: 300, height: 200 },
              fill: "#eee",
            },
            {
              id: "code-monday-occurrence",
              kind: "text",
              position: { x: 140, y: 240 },
              width: 260,
              height: 40,
              text: "WEBPROG",
              fontId: "body-sans",
              fontSize: 32,
              fill: "#111",
            },
            {
              id: "time-monday-occurrence",
              kind: "text",
              position: { x: 140, y: 290 },
              width: 260,
              height: 30,
              text: "2:00 PM–3:20 PM",
              fontId: "body-sans",
              fontSize: 20,
              fill: "#111",
            },
            {
              id: "support-monday-occurrence",
              kind: "text",
              position: { x: 140, y: 320 },
              width: 260,
              height: 25,
              text: "ADV LAB · Sec A",
              fontId: "body-sans",
              fontSize: 18,
              fill: "#111",
            },
            {
              id: "professor-monday-occurrence",
              kind: "text",
              position: { x: 140, y: 345 },
              width: 260,
              height: 25,
              text: "Tan, Cristel Jade DS.",
              fontId: "body-sans",
              fontSize: 18,
              fill: "#111",
            },
          ],
        },
        foreground,
      ],
    },
  };
}

describe("schedule resizing", () => {
  it("keeps the automatic composition unchanged until the user resizes it", () => {
    const natural = result();
    expect(
      applyScheduleSize(
        natural,
        variant({
          widthRatio: null,
          heightRatio: null,
          lockAspectRatio: true,
        }),
      ),
    ).toBe(natural);
  });

  it("reshapes geometry while scaling type uniformly and recropping photos", () => {
    const resized = applyScheduleSize(
      result(),
      variant({
        widthRatio: 0.6,
        heightRatio: 0.4,
        lockAspectRatio: false,
      }),
    );

    expect(resized.scheduleBounds).toEqual({
      x: 200,
      y: 300,
      width: 600,
      height: 400,
    });
    expect(resized.positionRange).toEqual({
      minX: 100,
      maxX: 300,
      minY: 100,
      maxY: 500,
    });
    expect(resized.scheduleResize).toMatchObject({
      scaleX: 0.75,
      scaleY: 0.8,
      fontScale: 0.75,
      constrained: false,
      readabilityWarning: false,
    });
    expect(resized.model.layers[3].nodes[1]).toMatchObject({
      kind: "text",
      position: { x: 237.5, y: 340 },
      width: 150,
      height: 40,
      fontSize: 30,
    });
    expect(resized.model.layers[2].nodes[0]).toMatchObject({
      kind: "image",
      geometry: { x: 200, y: 300, width: 225, height: 400 },
    });
    expect(resized.model.layers[2].nodes[0]).not.toHaveProperty("crop");
    expect(resized.photoFrame).toEqual({
      x: 200,
      y: 300,
      width: 225,
      height: 400,
    });
    expect(resized.model.layers[0].nodes[0]).toMatchObject({
      geometry: { x: 0, y: 0, width: 1000, height: 1000 },
    });
  });

  it("constrains requested dimensions to the layout's usable canvas", () => {
    const resized = applyScheduleSize(
      result(),
      variant({
        widthRatio: 1,
        heightRatio: 0.12,
        lockAspectRatio: false,
      }),
    );

    expect(resized.scheduleBounds).toMatchObject({
      width: 800,
      height: 120,
    });
    expect(resized.scheduleResize).toMatchObject({
      constrained: true,
      readabilityWarning: true,
    });
  });

  it("allows a naturally short schedule to shrink instead of forcing it taller", () => {
    const sparse = result();
    sparse.scheduleBounds = { x: 100, y: 200, width: 800, height: 50 };
    sparse.positionRange = { minX: 100, maxX: 100, minY: 100, maxY: 850 };
    sparse.overlay.selection = sparse.scheduleBounds;
    const resized = applyScheduleSize(
      sparse,
      variant({
        widthRatio: 0.7,
        heightRatio: 0.04,
        lockAspectRatio: false,
      }),
    );

    expect(resized.scheduleBounds).toMatchObject({
      width: 700,
      height: 40,
    });
  });

  it("progressively removes card details during vertical compression", () => {
    const compact = applyScheduleSize(
      cardsResult(),
      variant({
        widthRatio: null,
        heightRatio: 0.2,
        lockAspectRatio: false,
      }),
    );
    const compactNodes = new Map(
      compact.model.layers[3].nodes.map((node) => [node.id, node]),
    );

    expect(compactNodes.get("code-monday-occurrence")).toMatchObject({
      kind: "text",
      fontSize: 32,
    });
    expect(compactNodes.get("time-monday-occurrence")?.visible).not.toBe(false);
    expect(compactNodes.get("support-monday-occurrence")?.visible).toBe(false);
    expect(compactNodes.get("professor-monday-occurrence")?.visible).toBe(
      false,
    );

    const codeOnly = applyScheduleSize(
      cardsResult(),
      variant({
        widthRatio: null,
        heightRatio: 0.12,
        lockAspectRatio: false,
      }),
    );
    const codeOnlyNodes = new Map(
      codeOnly.model.layers[3].nodes.map((node) => [node.id, node]),
    );

    expect(codeOnlyNodes.get("code-monday-occurrence")).toMatchObject({
      kind: "text",
      fontSize: 32,
    });
    expect(codeOnlyNodes.get("time-monday-occurrence")?.visible).toBe(false);
    expect(codeOnlyNodes.get("support-monday-occurrence")?.visible).toBe(false);
    expect(codeOnlyNodes.get("professor-monday-occurrence")?.visible).toBe(
      false,
    );
  });
});
