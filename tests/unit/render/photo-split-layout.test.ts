import { describe, expect, it } from "vitest";

import type { DeviceVariant } from "@/domain/device/types";
import {
  AVAILABLE_PHOTO_COMPOSITIONS,
  buildPhotoHeroRenderModel,
  buildPhotoSplitRenderModel,
  buildScheduleRenderModel,
} from "@/domain/render";
import { normalizeSubject } from "@/domain/schedule/normalization";
import type { ScheduleDay } from "@/domain/schedule/types";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

function splitProject(days: readonly ScheduleDay[], classesPerDay = 1) {
  const project = visualScheduleProject();
  let id = 0;
  project.design.layoutId = "photo";
  project.design.photoComposition = "split";
  project.assetReferences.photoAssetIds = ["shared-photo"];
  project.schedule = days.flatMap((day, dayIndex) =>
    Array.from({ length: classesPerDay }, (_, classIndex) =>
      normalizeSubject(
        {
          code: `SPLIT${dayIndex + 1}${classIndex + 1}`,
          section: "A",
          meetings: [
            {
              days: [day],
              startTime: `${String(8 + classIndex * 2).padStart(2, "0")}:00`,
              endTime: `${String(9 + classIndex * 2).padStart(2, "0")}:20`,
              room: "ADV LAB",
              professor: "Professor Rivera",
            },
          ],
        },
        (kind) => `split-${kind}-${++id}`,
      ),
    ),
  );
  return project;
}

function target(
  project: ReturnType<typeof splitProject>,
  input: Pick<DeviceVariant, "category" | "dimensions" | "orientation">,
): DeviceVariant {
  return {
    ...project.deviceVariants[0]!,
    ...input,
    id: `split-${input.category}-${input.dimensions.width}x${input.dimensions.height}`,
    dimensionSource: "custom",
    presetId: null,
    compositionId: "photo-split",
  };
}

function rowCounts(result: ReturnType<typeof buildPhotoSplitRenderModel>) {
  return Array.from(new Set(result.dayLayout.map((day) => day.row))).map(
    (row) => result.dayLayout.filter((day) => day.row === row).length,
  );
}

function expectContentInsideTarget(
  result: ReturnType<typeof buildPhotoSplitRenderModel>,
) {
  const { width, height } = result.model;
  expect(result.scheduleBounds.x).toBeGreaterThanOrEqual(0);
  expect(result.scheduleBounds.y).toBeGreaterThanOrEqual(0);
  expect(
    result.scheduleBounds.x + result.scheduleBounds.width,
  ).toBeLessThanOrEqual(width);
  expect(
    result.scheduleBounds.y + result.scheduleBounds.height,
  ).toBeLessThanOrEqual(height);
  for (const layer of result.model.layers.slice(2)) {
    for (const node of layer.nodes) {
      if (node.kind === "line") {
        expect(
          node.points.every(
            (point) =>
              point.x >= 0 &&
              point.x <= width &&
              point.y >= 0 &&
              point.y <= height,
          ),
        ).toBe(true);
      } else if (node.kind === "text") {
        expect(node.position.x).toBeGreaterThanOrEqual(0);
        expect(node.position.y).toBeGreaterThanOrEqual(0);
        expect(node.position.x + node.width).toBeLessThanOrEqual(width);
        expect(node.position.y + (node.height ?? 0)).toBeLessThanOrEqual(
          height,
        );
      } else {
        expect(node.geometry.x).toBeGreaterThanOrEqual(0);
        expect(node.geometry.y).toBeGreaterThanOrEqual(0);
        expect(node.geometry.x + node.geometry.width).toBeLessThanOrEqual(
          width,
        );
        expect(node.geometry.y + node.geometry.height).toBeLessThanOrEqual(
          height,
        );
      }
    }
  }
}

describe("Clean Slate Photo Split", () => {
  it("registers Hero and Split while keeping Hero as the default", () => {
    expect(AVAILABLE_PHOTO_COMPOSITIONS).toEqual(["hero", "split", "polaroid"]);
    const project = splitProject(["Mon"]);
    project.design.photoComposition = null;
    expect(
      buildScheduleRenderModel(project, project.deviceVariants[0]!),
    ).toMatchObject({ composition: "hero" });
    project.design.photoComposition = "split";
    expect(
      buildScheduleRenderModel(project, project.deviceVariants[0]!),
    ).toMatchObject({ composition: "split" });
  });

  it("reuses the Hero asset but reads an independent Split crop", () => {
    const project = splitProject(["Mon"]);
    const variant = project.deviceVariants[0]!;
    variant.photoTransforms.hero["shared-photo"] = {
      position: { x: 0.1, y: 0.2 },
      scale: 1.2,
      rotation: 0,
    };
    variant.photoTransforms.split["shared-photo"] = {
      position: { x: 0.8, y: 0.7 },
      scale: 2,
      rotation: 0,
    };
    const hero = buildPhotoHeroRenderModel(project, variant);
    const split = buildPhotoSplitRenderModel(project, variant);
    expect(hero.photoAssetId).toBe("shared-photo");
    expect(split.photoAssetId).toBe("shared-photo");
    expect(hero.model.layers[2].nodes[0]).toMatchObject({
      focalPoint: { x: 0.1, y: 0.2 },
      zoom: 1.2,
    });
    expect(split.model.layers[2].nodes[0]).toMatchObject({
      focalPoint: { x: 0.8, y: 0.7 },
      zoom: 2,
    });
  });

  it.each([
    {
      label: "Phone",
      input: {
        category: "phone" as const,
        dimensions: { width: 1080, height: 2400 },
        orientation: "portrait" as const,
      },
      rows: [2, 2, 1],
    },
    {
      label: "Desktop",
      input: {
        category: "desktop" as const,
        dimensions: { width: 1920, height: 1080 },
        orientation: "landscape" as const,
      },
      rows: [3, 2],
    },
    {
      label: "Square",
      input: {
        category: "square" as const,
        dimensions: { width: 2048, height: 2048 },
        orientation: "square" as const,
      },
      rows: [2, 2, 1],
    },
  ])(
    "packs five $label days and keeps all content in bounds",
    ({ input, rows }) => {
      const project = splitProject(["Mon", "Tue", "Wed", "Thu", "Fri"], 2);
      const result = buildPhotoSplitRenderModel(
        project,
        target(project, input),
      );
      expect(rowCounts(result)).toEqual(rows);
      expectContentInsideTarget(result);
    },
  );

  it("places landscape and Square titles inside the schedule side", () => {
    for (const input of [
      {
        category: "desktop" as const,
        dimensions: { width: 1920, height: 1080 },
        orientation: "landscape" as const,
      },
      {
        category: "square" as const,
        dimensions: { width: 2048, height: 2048 },
        orientation: "square" as const,
      },
    ]) {
      const project = splitProject(["Mon", "Tue", "Wed", "Thu", "Fri"]);
      const result = buildPhotoSplitRenderModel(
        project,
        target(project, input),
      );
      const title = result.model.layers[3].nodes.find(
        (node) => node.id === "photo-split-title" && node.kind === "text",
      );
      expect(title?.kind).toBe("text");
      if (title?.kind === "text") {
        expect(title.position.x).toBeGreaterThanOrEqual(
          result.scheduleRegion.x,
        );
        expect(title.position.x).toBeGreaterThan(
          result.photoFrame.x + result.photoFrame.width,
        );
      }
    }
  });

  it("reclaims title geometry when the title is hidden", () => {
    const project = splitProject(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const desktop = target(project, {
      category: "desktop",
      dimensions: { width: 1920, height: 1080 },
      orientation: "landscape",
    });
    const withTitle = buildPhotoSplitRenderModel(project, desktop);
    project.design.wallpaperTitle.visible = false;
    const withoutTitle = buildPhotoSplitRenderModel(project, desktop);
    expect(withoutTitle.dayLayout[0]!.bounds.y).toBeLessThan(
      withTitle.dayLayout[0]!.bounds.y,
    );
    expect(
      withoutTitle.model.layers[3].nodes.some(
        (node) => node.id === "photo-split-title",
      ),
    ).toBe(false);
  });
});
