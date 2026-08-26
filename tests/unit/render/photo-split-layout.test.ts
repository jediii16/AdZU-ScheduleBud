import { describe, expect, it } from "vitest";

import type { DeviceVariant } from "@/domain/device/types";
import {
  AVAILABLE_PHOTO_COMPOSITIONS,
  buildPhotoHeroRenderModel,
  buildPhotoSplitRenderModel,
  buildScheduleRenderModel,
  resolvePhotoCoverCrop,
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

function expectCoverCrop(
  source: { width: number; height: number },
  frame: { width: number; height: number },
  transform: {
    position: { x: number; y: number };
    scale: number;
    rotation: number;
  },
) {
  const crop = resolvePhotoCoverCrop(source, frame, transform);
  expect(crop.width).toBeGreaterThan(0);
  expect(crop.height).toBeGreaterThan(0);
  expect(crop.x).toBeGreaterThanOrEqual(0);
  expect(crop.y).toBeGreaterThanOrEqual(0);
  expect(crop.x + crop.width).toBeLessThanOrEqual(source.width);
  expect(crop.y + crop.height).toBeLessThanOrEqual(source.height);
  expect(crop.width / crop.height).toBeCloseTo(frame.width / frame.height, 10);
  expect(frame.width / crop.width).toBeCloseTo(frame.height / crop.height, 10);
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

  it.each([1, 2, 3, 4])(
    "reflows %i ordered photos without ghost cells",
    (count) => {
      const project = splitProject(["Mon", "Tue"]);
      project.assetReferences.photoAssetIds = Array.from(
        { length: count },
        (_, index) => `photo-${index + 1}`,
      );
      const result = buildPhotoSplitRenderModel(
        project,
        target(project, {
          category: "desktop",
          dimensions: { width: 1920, height: 1080 },
          orientation: "landscape",
        }),
      );
      expect(result.photoCells.map((cell) => cell.assetId)).toEqual(
        project.assetReferences.photoAssetIds,
      );
      expect(result.photoFrames).toHaveLength(count);
      expect(result.model.layers[2].nodes).toHaveLength(count);
      for (const cell of result.photoCells) {
        expect(cell.bounds.x).toBeGreaterThanOrEqual(result.photoFrame.x);
        expect(cell.bounds.y).toBeGreaterThanOrEqual(result.photoFrame.y);
        expect(cell.bounds.x + cell.bounds.width).toBeLessThanOrEqual(
          result.photoFrame.x + result.photoFrame.width,
        );
        expect(cell.bounds.y + cell.bounds.height).toBeLessThanOrEqual(
          result.photoFrame.y + result.photoFrame.height,
        );
      }
    },
  );

  it("uses vertical two-photo packing on wide targets and horizontal packing on portrait targets", () => {
    const project = splitProject(["Mon"]);
    project.assetReferences.photoAssetIds = ["one", "two"];
    const landscape = buildPhotoSplitRenderModel(
      project,
      target(project, {
        category: "desktop",
        dimensions: { width: 1920, height: 1080 },
        orientation: "landscape",
      }),
    );
    const portrait = buildPhotoSplitRenderModel(
      project,
      target(project, {
        category: "phone",
        dimensions: { width: 1080, height: 2400 },
        orientation: "portrait",
      }),
    );
    expect(landscape.photoCells[1]!.bounds.y).toBeGreaterThan(
      landscape.photoCells[0]!.bounds.y,
    );
    expect(landscape.photoCells[1]!.bounds.x).toBe(
      landscape.photoCells[0]!.bounds.x,
    );
    expect(portrait.photoCells[1]!.bounds.x).toBeGreaterThan(
      portrait.photoCells[0]!.bounds.x,
    );
    expect(portrait.photoCells[1]!.bounds.y).toBe(
      portrait.photoCells[0]!.bounds.y,
    );
    expect(landscape.scheduleRegion.x).toBeGreaterThan(
      landscape.photoFrame.x + landscape.photoFrame.width,
    );
    expect(portrait.scheduleRegion.y).toBeGreaterThan(
      portrait.photoFrame.y + portrait.photoFrame.height,
    );
  });

  it("uses one featured cell plus a lower pair for three photos and a 2x2 grid for four", () => {
    const project = splitProject(["Mon"]);
    const variant = target(project, {
      category: "desktop",
      dimensions: { width: 1920, height: 1080 },
      orientation: "landscape",
    });
    project.assetReferences.photoAssetIds = ["one", "two", "three"];
    const three = buildPhotoSplitRenderModel(project, variant).photoCells;
    expect(three[0]!.bounds.width).toBeGreaterThan(three[1]!.bounds.width);
    expect(three[0]!.bounds.height).toBeGreaterThan(three[1]!.bounds.height);
    expect(three[1]!.bounds.y).toBe(three[2]!.bounds.y);
    expect(three[1]!.bounds.x).toBeLessThan(three[2]!.bounds.x);

    project.assetReferences.photoAssetIds.push("four");
    const fourResult = buildPhotoSplitRenderModel(project, variant);
    const four = fourResult.photoCells;
    expect(four[0]!.bounds).not.toEqual(three[0]!.bounds);
    expect(four[0]!.bounds.y).toBe(four[1]!.bounds.y);
    expect(four[2]!.bounds.y).toBe(four[3]!.bounds.y);
    expect(four[0]!.bounds.x).toBe(four[2]!.bounds.x);
    expect(four[1]!.bounds.x).toBe(four[3]!.bounds.x);
    expect(fourResult.model.layers[2].nodes).toMatchObject([
      { cornerRadius: [expect.any(Number), 0, 0, 0] },
      { cornerRadius: [0, expect.any(Number), 0, 0] },
      { cornerRadius: [0, 0, 0, expect.any(Number)] },
      { cornerRadius: [0, 0, expect.any(Number), 0] },
    ]);
  });

  it("reads an independent Split crop for every cell and never renders captions or editor controls", () => {
    const project = splitProject(["Mon"]);
    const variant = project.deviceVariants[0]!;
    project.assetReferences.photoAssetIds = ["one", "two"];
    project.design.photoCaptions = { one: "Polaroid only" };
    variant.photoTransforms.split.one = {
      position: { x: 0.15, y: 0.25 },
      scale: 1.3,
      rotation: 0,
    };
    variant.photoTransforms.split.two = {
      position: { x: 0.85, y: 0.75 },
      scale: 2.2,
      rotation: 0,
    };
    variant.photoTransforms.polaroid.one = {
      position: { x: 0.5, y: 0.5 },
      scale: 3,
      rotation: 0,
    };
    const result = buildPhotoSplitRenderModel(project, variant);
    expect(result.model.layers[2].nodes).toMatchObject([
      { assetId: "one", focalPoint: { x: 0.15, y: 0.25 }, zoom: 1.3 },
      { assetId: "two", focalPoint: { x: 0.85, y: 0.75 }, zoom: 2.2 },
    ]);
    expect(JSON.stringify(result.model)).not.toMatch(
      /Polaroid only|Adjust|Reset crop|selected-photo|smart guide/i,
    );
  });

  it.each([
    {
      category: "phone" as const,
      dimensions: { width: 1080, height: 2400 },
      orientation: "portrait" as const,
    },
    {
      category: "tablet" as const,
      dimensions: { width: 1600, height: 2560 },
      orientation: "portrait" as const,
    },
    {
      category: "tablet" as const,
      dimensions: { width: 2560, height: 1600 },
      orientation: "landscape" as const,
    },
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
  ])(
    "resolves every 1–4 photo cell as a bounded cover crop on $category $orientation targets",
    (input) => {
      const sources = [
        { width: 4032, height: 3024 },
        { width: 2400, height: 3600 },
        { width: 3000, height: 3000 },
        { width: 5120, height: 1440 },
      ];
      for (let count = 1; count <= 4; count += 1) {
        const project = splitProject(["Mon"]);
        project.assetReferences.photoAssetIds = sources
          .slice(0, count)
          .map((_, index) => `photo-${index + 1}`);
        const variant = target(project, input);
        for (const assetId of project.assetReferences.photoAssetIds) {
          variant.photoTransforms.split[assetId] = {
            position: { x: 1.8, y: -0.6 },
            scale: 0.2,
            rotation: 90,
          };
        }
        const result = buildPhotoSplitRenderModel(project, variant);
        expect(result.model.layers[2].nodes).toHaveLength(count);
        result.photoCells.forEach((cell, index) => {
          const node = result.model.layers[2].nodes[index]!;
          expect(node).toMatchObject({
            kind: "image",
            assetId: cell.assetId,
            fit: "cover",
          });
          if (node.kind !== "image") throw new Error("Expected Split image");
          expectCoverCrop(sources[index]!, cell.bounds, {
            position: node.focalPoint!,
            scale: node.zoom!,
            rotation: 0,
          });
        });
      }
    },
  );

  it("keeps Square four-photo crops covering after the same photos change cell aspect ratio", () => {
    const project = splitProject(["Mon"]);
    const sources = [
      { width: 900, height: 1600 },
      { width: 1600, height: 900 },
      { width: 4096, height: 1024 },
      { width: 1024, height: 4096 },
    ];
    project.assetReferences.photoAssetIds = ["one"];
    const variant = target(project, {
      category: "square",
      dimensions: { width: 2048, height: 2048 },
      orientation: "square",
    });
    variant.photoTransforms.split.one = {
      position: { x: 0.97, y: 0.03 },
      scale: 2.65,
      rotation: 0,
    };
    const single = buildPhotoSplitRenderModel(project, variant);
    const savedTransform = variant.photoTransforms.split.one;

    project.assetReferences.photoAssetIds = ["one", "two", "three", "four"];
    const four = buildPhotoSplitRenderModel(project, variant);
    expect(variant.photoTransforms.split.one).toEqual(savedTransform);
    four.photoCells.forEach((cell, index) => {
      const node = four.model.layers[2].nodes[index]!;
      if (node.kind !== "image") throw new Error("Expected Split image");
      expectCoverCrop(sources[index]!, cell.bounds, {
        position: node.focalPoint!,
        scale: node.zoom!,
        rotation: 0,
      });
    });
    expect(four.photoCells[0]!.bounds).not.toEqual(
      single.photoCells[0]!.bounds,
    );
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
