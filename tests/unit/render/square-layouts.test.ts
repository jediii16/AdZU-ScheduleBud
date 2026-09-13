import { describe, expect, it } from "vitest";

import { createBlankProject, scheduleProjectSchema } from "@/domain/project";
import { normalizeSubject } from "@/domain/schedule/normalization";
import type { ScheduleDay } from "@/domain/schedule/types";
import type { LayoutId, PhotoComposition } from "@/domain/design/types";
import { buildScheduleRenderModel, type RenderNode } from "@/domain/render";

const DAYS: readonly ScheduleDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function denseSquareProject() {
  let id = 0;
  const project = createBlankProject({
    id: "square-layouts",
    now: "2026-09-12T00:00:00.000Z",
  });
  const schedule = Array.from({ length: 5 }, (_, index) =>
    normalizeSubject(
      {
        code: `SUBJECT${index + 1}`,
        section: "A",
        meetings: [
          {
            days: DAYS,
            startTime: `${String(8 + index).padStart(2, "0")}:00`,
            endTime: `${String(9 + index).padStart(2, "0")}:00`,
            room: `ROOM ${index + 1}`,
            professor: `Professor ${index + 1}`,
          },
        ],
      },
      (kind) => `${kind}-${++id}`,
    ),
  );
  return scheduleProjectSchema.parse({
    ...project,
    schedule,
    deviceVariants: [
      {
        id: "square",
        category: "square",
        dimensions: { width: 1080, height: 1080 },
        dimensionSource: "preset",
        presetId: "square-1080",
        orientation: "square",
        compositionId: "square",
        schedulePosition: { x: 0.5, y: 0.5 },
        scheduleSize: {
          widthRatio: null,
          heightRatio: null,
          lockAspectRatio: true,
        },
        layoutOverride: null,
        densityOverride: null,
        visibleFieldsOverride: null,
        photoTransforms: { hero: {}, split: {}, polaroid: {} },
        backgroundImageTransform: {
          position: { x: 0.5, y: 0.5 },
          scale: 1,
        },
        stickers: [],
        preview: {
          mode: "clean",
          showSafeAreas: false,
          showWarnings: true,
          enableSnapping: true,
          guideAssetId: null,
        },
      },
    ],
    activeDeviceVariantId: "square",
    assetReferences: {
      photoAssetIds: ["photo-1", "photo-2", "photo-3", "photo-4"],
      screenGuideAssetIds: [],
    },
  });
}

function nodeEdges(node: RenderNode) {
  if (node.kind === "rect" || node.kind === "image")
    return {
      left: node.geometry.x,
      top: node.geometry.y,
      right: node.geometry.x + node.geometry.width,
      bottom: node.geometry.y + node.geometry.height,
    };
  if (node.kind === "text")
    return {
      left: node.position.x,
      top: node.position.y,
      right: node.position.x + node.width,
      bottom:
        node.position.y +
        (node.height ?? node.fontSize * (node.lineHeight ?? 1.2)),
    };
  return {
    left: Math.min(...node.points.map((point) => point.x)),
    top: Math.min(...node.points.map((point) => point.y)),
    right: Math.max(...node.points.map((point) => point.x)),
    bottom: Math.max(...node.points.map((point) => point.y)),
  };
}

describe("dense Square layouts", () => {
  it.each([
    ["cards", null],
    ["minimal", null],
    ["grid", null],
    ["planner", null],
    ["photo", "hero"],
    ["photo", "split"],
    ["photo", "polaroid"],
  ] as const)("keeps %s %s content inside 1080×1080", (layout, photoMode) => {
    const project = denseSquareProject();
    project.design.layoutId = layout as LayoutId;
    project.design.photoComposition = photoMode as PhotoComposition | null;
    const result = buildScheduleRenderModel(
      project,
      project.deviceVariants[0]!,
    );

    expect(result.scheduleBounds.x).toBeGreaterThanOrEqual(0);
    expect(result.scheduleBounds.y).toBeGreaterThanOrEqual(0);
    expect(
      result.scheduleBounds.x + result.scheduleBounds.width,
    ).toBeLessThanOrEqual(1080);
    expect(
      result.scheduleBounds.y + result.scheduleBounds.height,
    ).toBeLessThanOrEqual(1080);

    for (const layer of result.model.layers.slice(1, 4)) {
      for (const node of layer.nodes) {
        const edges = nodeEdges(node);
        expect(edges.left, node.id).toBeGreaterThanOrEqual(-0.01);
        expect(edges.top, node.id).toBeGreaterThanOrEqual(-0.01);
        expect(edges.right, node.id).toBeLessThanOrEqual(1080.01);
        expect(edges.bottom, node.id).toBeLessThanOrEqual(1080.01);
      }
    }
  });
});
