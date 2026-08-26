import { describe, expect, it } from "vitest";

import { availableLayouts } from "@/data/layouts/registry";
import type { DeviceVariant } from "@/domain/device/types";
import {
  DEFAULT_PHOTO_TRANSFORM,
  buildPhotoHeroRenderModel,
  clampPhotoTransform,
  panPhotoTransform,
  resolvePhotoCoverCrop,
  type TextRenderNode,
} from "@/domain/render";
import { normalizeSubject } from "@/domain/schedule/normalization";
import type { ScheduleDay } from "@/domain/schedule/types";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

function photoProject(
  days: readonly ScheduleDay[],
  withPhoto = true,
  classesPerDay = 1,
) {
  const project = visualScheduleProject();
  let id = 0;
  project.design.layoutId = "photo";
  project.design.photoComposition = "hero";
  project.assetReferences.photoAssetIds = withPhoto ? ["photo-hero"] : [];
  project.schedule = days.flatMap((day, dayIndex) =>
    Array.from({ length: classesPerDay }, (_, classIndex) =>
      normalizeSubject(
        {
          code: `PHOTO${dayIndex + 1}${classIndex + 1}`,
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
        (kind) => `photo-${kind}-${++id}`,
      ),
    ),
  );
  return project;
}

function variant(
  project: ReturnType<typeof photoProject>,
  input: Partial<DeviceVariant> &
    Pick<DeviceVariant, "category" | "dimensions" | "orientation">,
): DeviceVariant {
  return {
    ...project.deviceVariants[0]!,
    id: `photo-${input.category}-${input.dimensions.width}x${input.dimensions.height}`,
    dimensionSource: "custom",
    presetId: null,
    compositionId: "photo-hero",
    ...input,
  };
}

function rowCounts(result: ReturnType<typeof buildPhotoHeroRenderModel>) {
  return Array.from(new Set(result.dayLayout.map((day) => day.row))).map(
    (row) => result.dayLayout.filter((day) => day.row === row).length,
  );
}

function expectHeroContentInsideTarget(
  result: ReturnType<typeof buildPhotoHeroRenderModel>,
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
          node.points.every((point) => point.x >= 0 && point.x <= width),
        ).toBe(true);
        expect(
          node.points.every((point) => point.y >= 0 && point.y <= height),
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

describe("Clean Slate Photo Hero RenderModel", () => {
  it("registers Photo and emits a typed Hero image node when referenced", () => {
    expect(availableLayouts.map((layout) => layout.id)).toEqual([
      "cards",
      "minimal",
      "grid",
      "planner",
      "photo",
    ]);
    const project = photoProject(["Mon"]);
    const result = buildPhotoHeroRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    expect(result.composition).toBe("hero");
    expect(result.model.layers[2].nodes).toEqual([
      expect.objectContaining({
        kind: "image",
        assetId: "photo-hero",
        fit: "cover",
      }),
    ]);
  });

  it("keeps the no-photo placeholder and adjust controls out of RenderModel", () => {
    const project = photoProject(["Mon"], false);
    const result = buildPhotoHeroRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    expect(result.photoAssetId).toBeNull();
    expect(result.model.layers[2].nodes).toEqual([]);
    expect(JSON.stringify(result.model)).not.toMatch(
      /placeholder|adjust|handle|guide|Add a photo/,
    );
  });

  it("packs five Phone days as 2 + 2 + 1 with a centered final day", () => {
    const project = photoProject(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const result = buildPhotoHeroRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    expect(rowCounts(result)).toEqual([2, 2, 1]);
    const final = result.dayLayout.at(-1)!;
    expect(final.bounds.x + final.bounds.width / 2).toBeCloseTo(
      result.scheduleBounds.x + result.scheduleBounds.width / 2,
    );
  });

  it("uses one centered five-day Desktop Hero schedule row", () => {
    const project = photoProject(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const result = buildPhotoHeroRenderModel(
      project,
      project.deviceVariants[1]!,
    );
    expect(result.columns).toBe(5);
    expect(rowCounts(result)).toEqual([5]);
    expect(result.dayLayout.every((day) => day.bounds.width <= 290)).toBe(true);
  });

  it("always renders the complete mandatory subject code", () => {
    const project = photoProject(["Mon"]);
    const code = "VERY-LONG-SUBJECT-CODE.401A";
    project.schedule[0]!.code = code;
    const result = buildPhotoHeroRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    expect(result.classLayout[0]!.codeText.replaceAll("\n", "")).toBe(code);
    expect(result.classLayout[0]!.codeText).not.toContain("…");
  });

  it("preserves exact target dimensions", () => {
    const project = photoProject(["Mon"]);
    const target = variant(project, {
      category: "square",
      dimensions: { width: 2048, height: 2048 },
      orientation: "square",
    });
    expect(buildPhotoHeroRenderModel(project, target).model).toMatchObject({
      width: 2048,
      height: 2048,
    });
  });

  it.each([
    {
      family: "Tablet Portrait",
      category: "tablet" as const,
      dimensions: { width: 1600, height: 2560 },
      orientation: "portrait" as const,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"] as ScheduleDay[],
    },
    {
      family: "Tablet Portrait",
      category: "tablet" as const,
      dimensions: { width: 1600, height: 2560 },
      orientation: "portrait" as const,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as ScheduleDay[],
    },
    {
      family: "Square",
      category: "square" as const,
      dimensions: { width: 2048, height: 2048 },
      orientation: "square" as const,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"] as ScheduleDay[],
    },
    {
      family: "Square",
      category: "square" as const,
      dimensions: { width: 2048, height: 2048 },
      orientation: "square" as const,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as ScheduleDay[],
    },
  ])(
    "keeps a dense $days.length-day $family Hero inside the target",
    (target) => {
      const project = photoProject(target.days, true, 3);
      const result = buildPhotoHeroRenderModel(
        project,
        variant(project, target),
      );
      expectHeroContentInsideTarget(result);
    },
  );

  it("includes the title in fitting and reclaims its geometry when hidden", () => {
    const project = photoProject(
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      true,
      3,
    );
    const target = variant(project, {
      category: "tablet",
      dimensions: { width: 1600, height: 2560 },
      orientation: "portrait",
    });
    project.design.wallpaperTitle.visible = true;
    const withTitle = buildPhotoHeroRenderModel(project, target);
    project.design.wallpaperTitle.visible = false;
    const withoutTitle = buildPhotoHeroRenderModel(project, target);
    expectHeroContentInsideTarget(withTitle);
    expectHeroContentInsideTarget(withoutTitle);
    const titledPhotoBottom =
      withTitle.photoFrame.y + withTitle.photoFrame.height;
    const untitledPhotoBottom =
      withoutTitle.photoFrame.y + withoutTitle.photoFrame.height;
    expect(
      withTitle.dayLayout[0]!.bounds.y - titledPhotoBottom,
    ).toBeGreaterThan(
      withoutTitle.dayLayout[0]!.bounds.y - untitledPhotoBottom,
    );
    expect(
      withTitle.model.layers[3].nodes.some((node) => node.id === "photo-title"),
    ).toBe(true);
    expect(
      withoutTitle.model.layers[3].nodes.some(
        (node) => node.id === "photo-title",
      ),
    ).toBe(false);
  });

  it("reduces derived photo height for denser schedules without persisting it", () => {
    const sparse = photoProject(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const dense = photoProject(["Mon", "Tue", "Wed", "Thu", "Fri"], true, 5);
    const sparseTarget = variant(sparse, {
      category: "square",
      dimensions: { width: 2048, height: 2048 },
      orientation: "square",
    });
    const denseTarget = variant(dense, {
      category: "square",
      dimensions: { width: 2048, height: 2048 },
      orientation: "square",
    });
    const before = JSON.stringify(dense);
    const sparseResult = buildPhotoHeroRenderModel(sparse, sparseTarget);
    const denseResult = buildPhotoHeroRenderModel(dense, denseTarget);
    expect(denseResult.photoFrame.height).toBeLessThan(
      sparseResult.photoFrame.height,
    );
    expect(JSON.stringify(dense)).toBe(before);
    expectHeroContentInsideTarget(denseResult);
  });

  it("renders time separately and combines Room with Section", () => {
    const project = photoProject(["Mon"]);
    const result = buildPhotoHeroRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    const details = result.model.layers[3].nodes
      .filter(
        (node): node is TextRenderNode =>
          node.kind === "text" && node.id.startsWith("photo-detail"),
      )
      .map((node) => node.text);
    expect(details).toEqual(["8:00–9:20 AM", "ADV LAB · Sec A"]);
  });
});

describe("Photo Hero crop geometry", () => {
  it.each([
    { width: 800, height: 1200 },
    { width: 1600, height: 900 },
    { width: 1000, height: 1000 },
  ])("keeps a $width × $height source covering the frame", (source) => {
    const crop = resolvePhotoCoverCrop(
      source,
      { width: 1000, height: 400 },
      { position: { x: 1, y: 0 }, scale: 2.5, rotation: 42 },
    );
    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
    expect(crop.x + crop.width).toBeLessThanOrEqual(source.width);
    expect(crop.y + crop.height).toBeLessThanOrEqual(source.height);
    expect(crop.width / crop.height).toBeCloseTo(2.5);
  });

  it("clamps normalized pan and bounded zoom", () => {
    expect(
      clampPhotoTransform({
        position: { x: -4, y: 8 },
        scale: 20,
        rotation: 90,
      }),
    ).toEqual({ position: { x: 0, y: 1 }, scale: 3, rotation: 0 });
    const panned = panPhotoTransform(
      DEFAULT_PHOTO_TRANSFORM,
      { width: 1600, height: 900 },
      { width: 600, height: 800 },
      { x: -100000, y: 100000 },
    );
    expect(panned.position.x).toBeGreaterThanOrEqual(0);
    expect(panned.position.x).toBeLessThanOrEqual(1);
    expect(panned.position.y).toBeGreaterThanOrEqual(0);
    expect(panned.position.y).toBeLessThanOrEqual(1);
  });
});
