import { describe, expect, it } from "vitest";

import type { DeviceVariant } from "@/domain/device/types";
import {
  buildPhotoHeroRenderModel,
  buildPhotoPolaroidRenderModel,
  buildPhotoSplitRenderModel,
  buildScheduleRenderModel,
} from "@/domain/render";
import { normalizeSubject } from "@/domain/schedule/normalization";
import type { ScheduleDay } from "@/domain/schedule/types";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

const DAYS: readonly ScheduleDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function polaroidProject(photoCount: number) {
  const project = visualScheduleProject();
  let id = 0;
  project.design.layoutId = "photo";
  project.design.photoComposition = "polaroid";
  project.assetReferences.photoAssetIds = Array.from(
    { length: photoCount },
    (_, index) => `photo-${index + 1}`,
  );
  project.design.photoCaptions = {
    ...Object.fromEntries(
      Array.from({ length: photoCount }, (_, index) => [
        `photo-${index + 1}`,
        `memory ${index + 1}`,
      ]),
    ),
  };
  project.schedule = DAYS.map((day, index) =>
    normalizeSubject(
      {
        code: `POLA${index + 1}`,
        section: "A",
        meetings: [
          {
            days: [day],
            startTime: "08:00",
            endTime: "09:20",
            room: "ADV LAB",
            professor: "Professor Rivera",
          },
        ],
      },
      (kind) => `polaroid-${kind}-${++id}`,
    ),
  );
  return project;
}

function densePolaroidProject() {
  const project = polaroidProject(4);
  let id = 0;
  const meetings = [
    ["Mon", "CS.412", "08:00", "09:20"],
    ["Mon", "CIT.017", "11:00", "12:20"],
    ["Mon", "CIT.016", "12:30", "13:50"],
    ["Tue", "CIT.015", "08:00", "09:20"],
    ["Tue", "CS.413", "11:00", "12:20"],
    ["Wed", "COGNATE3", "08:00", "10:50"],
    ["Thu", "CS.412", "08:00", "09:20"],
    ["Thu", "CIT.017", "11:00", "12:20"],
    ["Thu", "CIT.016", "12:30", "13:50"],
    ["Fri", "CIT.015", "08:00", "09:20"],
    ["Fri", "CS.413", "11:00", "12:20"],
  ] as const;
  project.schedule = meetings.map(([day, code, startTime, endTime]) =>
    normalizeSubject(
      {
        code,
        section: "A",
        meetings: [
          {
            days: [day],
            startTime,
            endTime,
            room: "ADV LAB",
            professor: "Professor Rivera",
          },
        ],
      },
      (kind) => `dense-polaroid-${kind}-${++id}`,
    ),
  );
  return project;
}

function target(
  project: ReturnType<typeof polaroidProject>,
  input: Pick<DeviceVariant, "category" | "dimensions" | "orientation">,
): DeviceVariant {
  return {
    ...project.deviceVariants[0]!,
    ...input,
    id: `polaroid-${input.category}-${input.dimensions.width}x${input.dimensions.height}`,
    dimensionSource: "custom",
    presetId: null,
    compositionId: "photo-polaroid",
  };
}

function rotatedCorners(
  rect: { x: number; y: number; width: number; height: number },
  rotation = 0,
) {
  const radians = (rotation * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return [
    { x: 0, y: 0 },
    { x: rect.width, y: 0 },
    { x: rect.width, y: rect.height },
    { x: 0, y: rect.height },
  ].map((point) => ({
    x: rect.x + point.x * cosine - point.y * sine,
    y: rect.y + point.x * sine + point.y * cosine,
  }));
}

function expectInsideTarget(
  result: ReturnType<typeof buildPhotoPolaroidRenderModel>,
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
      } else {
        const rect =
          node.kind === "text"
            ? {
                x: node.position.x,
                y: node.position.y,
                width: node.width,
                height: node.height ?? 0,
              }
            : node.geometry;
        expect(
          rotatedCorners(rect, node.rotation).every(
            (point) =>
              point.x >= 0 &&
              point.x <= width &&
              point.y >= 0 &&
              point.y <= height,
          ),
        ).toBe(true);
      }
    }
  }
}

function expectCaptionCentersClear(
  result: ReturnType<typeof buildPhotoPolaroidRenderModel>,
) {
  for (const photo of result.polaroids) {
    if (!photo.captionBounds) continue;
    const center = {
      x: photo.captionBounds.x + photo.captionBounds.width / 2,
      y: photo.captionBounds.y + photo.captionBounds.height / 2,
    };
    for (const other of result.polaroids.filter(
      (candidate) => candidate.assetId !== photo.assetId,
    )) {
      expect(
        center.x >= other.paper.x &&
          center.x <= other.paper.x + other.paper.width &&
          center.y >= other.paper.y &&
          center.y <= other.paper.y + other.paper.height,
      ).toBe(false);
    }
  }
}

function rectanglesOverlap(
  left: { x: number; y: number; width: number; height: number },
  right: { x: number; y: number; width: number; height: number },
) {
  return !(
    left.x + left.width <= right.x ||
    right.x + right.width <= left.x ||
    left.y + left.height <= right.y ||
    right.y + right.height <= left.y
  );
}

describe("Clean Slate Photo Polaroid", () => {
  it("resolves a deterministic restrained four-photo arrangement", () => {
    const project = polaroidProject(4);
    const desktop = target(project, {
      category: "desktop",
      dimensions: { width: 1920, height: 1080 },
      orientation: "landscape",
    });
    const first = buildPhotoPolaroidRenderModel(project, desktop);
    const second = buildPhotoPolaroidRenderModel(project, desktop);
    expect(first.polaroids).toHaveLength(4);
    expect(first.polaroids).toEqual(second.polaroids);
    expect(first.model).toEqual(second.model);
    expect(
      first.polaroids.every(
        (photo) => Math.abs(photo.rotation) <= 3 && photo.image.height > 0,
      ),
    ).toBe(true);
    expectInsideTarget(first);
  });

  it("registers Polaroid while Hero and Split keep using the primary photo", () => {
    const project = polaroidProject(4);
    expect(
      buildScheduleRenderModel(project, project.deviceVariants[0]!),
    ).toMatchObject({ composition: "polaroid" });
    expect(
      buildPhotoHeroRenderModel(project, project.deviceVariants[0]!)
        .photoAssetId,
    ).toBe("photo-1");
    expect(
      buildPhotoSplitRenderModel(project, project.deviceVariants[0]!)
        .photoAssetId,
    ).toBe("photo-1");
  });

  it("renders individual crops and the optional handwritten caption", () => {
    const project = polaroidProject(4);
    const variant = project.deviceVariants[0]!;
    variant.photoTransforms.polaroid["photo-1"] = {
      position: { x: 0.1, y: 0.2 },
      scale: 1.4,
      rotation: 0,
    };
    variant.photoTransforms.polaroid["photo-2"] = {
      position: { x: 0.8, y: 0.7 },
      scale: 2,
      rotation: 0,
    };
    const result = buildPhotoPolaroidRenderModel(project, variant);
    expect(result.model.layers[2].nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "polaroid-image-photo-1",
          focalPoint: { x: 0.1, y: 0.2 },
          zoom: 1.4,
        }),
        expect.objectContaining({
          id: "polaroid-image-photo-2",
          focalPoint: { x: 0.8, y: 0.7 },
          zoom: 2,
        }),
        expect.objectContaining({
          id: "polaroid-caption-photo-1",
          text: "memory 1",
          fontId: "caption-hand",
        }),
      ]),
    );
  });

  it("reclaims title geometry and keeps editor controls out of RenderModel", () => {
    const project = polaroidProject(4);
    const desktop = target(project, {
      category: "desktop",
      dimensions: { width: 1920, height: 1080 },
      orientation: "landscape",
    });
    const withTitle = buildPhotoPolaroidRenderModel(project, desktop);
    project.design.wallpaperTitle.visible = false;
    const withoutTitle = buildPhotoPolaroidRenderModel(project, desktop);
    expect(withoutTitle.dayLayout[0]!.bounds.y).toBeLessThan(
      withTitle.dayLayout[0]!.bounds.y,
    );
    expect(JSON.stringify(withoutTitle.model)).not.toMatch(
      /Adjust|Move photo|Reset crop|Maximum 4|selected-photo/,
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
      dimensions: { width: 1536, height: 2048 },
      orientation: "portrait" as const,
    },
    {
      category: "tablet" as const,
      dimensions: { width: 2048, height: 1536 },
      orientation: "landscape" as const,
    },
    {
      category: "desktop" as const,
      dimensions: { width: 1920, height: 1080 },
      orientation: "landscape" as const,
    },
    {
      category: "square" as const,
      dimensions: { width: 1080, height: 1080 },
      orientation: "square" as const,
    },
  ])(
    "keeps four-photo intended content and captions inside $category $orientation",
    (input) => {
      const project = polaroidProject(4);
      const result = buildPhotoPolaroidRenderModel(
        project,
        target(project, input),
      );
      expectInsideTarget(result);
      expect(result.polaroids.every((photo) => photo.captionBounds)).toBe(true);
      for (const photo of result.polaroids) {
        const caption = photo.captionBounds!;
        const center = {
          x: caption.x + caption.width / 2,
          y: caption.y + caption.height / 2,
        };
        for (const other of result.polaroids.filter(
          (candidate) => candidate.assetId !== photo.assetId,
        )) {
          expect(
            center.x >= other.paper.x &&
              center.x <= other.paper.x + other.paper.width &&
              center.y >= other.paper.y &&
              center.y <= other.paper.y + other.paper.height,
          ).toBe(false);
        }
      }
    },
  );

  it("uses target-specific four-photo structures and a substantial Desktop cluster", () => {
    const project = polaroidProject(4);
    const phone = buildPhotoPolaroidRenderModel(
      project,
      target(project, {
        category: "phone",
        dimensions: { width: 1080, height: 2400 },
        orientation: "portrait",
      }),
    );
    const desktop = buildPhotoPolaroidRenderModel(
      project,
      target(project, {
        category: "desktop",
        dimensions: { width: 1920, height: 1080 },
        orientation: "landscape",
      }),
    );
    expect(phone.polaroids.map((photo) => photo.paper)).not.toEqual(
      desktop.polaroids.map((photo) => photo.paper),
    );
    const left = Math.min(...desktop.polaroids.map((photo) => photo.paper.x));
    const right = Math.max(
      ...desktop.polaroids.map((photo) => photo.paper.x + photo.paper.width),
    );
    expect(right - left).toBeGreaterThan(500);
    const desktopCode = desktop.model.layers[3].nodes.find((node) =>
      node.id.startsWith("photo-code-"),
    );
    expect(
      desktopCode?.kind === "text" ? desktopCode.fontSize : 0,
    ).toBeGreaterThanOrEqual(25);
  });

  it("layers the raised Desktop second photo between the first and fourth without covering its caption", () => {
    const project = polaroidProject(4);
    const result = buildPhotoPolaroidRenderModel(
      project,
      target(project, {
        category: "desktop",
        dimensions: { width: 1920, height: 1080 },
        orientation: "landscape",
      }),
    );
    const [first, second, , fourth] = result.polaroids;
    expect(second!.rotation).toBeGreaterThan(0);
    expect(second!.paper.y).toBeLessThan(first!.paper.y);
    expect(second!.paper.x).toBeLessThan(first!.paper.x + first!.paper.width);
    expect(second!.paper.x + second!.paper.width).toBeGreaterThan(
      first!.paper.x + first!.paper.width,
    );
    expect(second!.captionBounds).not.toBeNull();
    expect(
      second!.captionBounds!.y + second!.captionBounds!.height,
    ).toBeLessThanOrEqual(fourth!.paper.y);
    const photoNodeIds = result.model.layers[2].nodes.map((node) => node.id);
    expect(photoNodeIds.indexOf("polaroid-paper-photo-2")).toBeLessThan(
      photoNodeIds.indexOf("polaroid-paper-photo-4"),
    );
    expect(
      fourth!.paper.y - (second!.paper.y + second!.paper.height),
    ).toBeLessThan(30);
    expectInsideTarget(result);
  });

  it.each([
    {
      category: "desktop" as const,
      dimensions: { width: 1920, height: 1080 },
      orientation: "landscape" as const,
    },
    {
      category: "tablet" as const,
      dimensions: { width: 2048, height: 1536 },
      orientation: "landscape" as const,
    },
  ])("keeps both two-photo captions clear on $category landscape", (input) => {
    const project = polaroidProject(2);
    const result = buildPhotoPolaroidRenderModel(
      project,
      target(project, input),
    );
    const [first, second] = result.polaroids;
    expect(rectanglesOverlap(first!.paper, second!.paper)).toBe(true);
    expect(rectanglesOverlap(first!.captionBounds!, second!.paper)).toBe(false);
    expect(rectanglesOverlap(second!.captionBounds!, first!.paper)).toBe(false);
    expectInsideTarget(result);
  });

  it("uses a substantial staggered four-photo row on Tablet Portrait", () => {
    const project = polaroidProject(4);
    const result = buildPhotoPolaroidRenderModel(
      project,
      target(project, {
        category: "tablet",
        dimensions: { width: 1536, height: 2048 },
        orientation: "portrait",
      }),
    );
    expect(
      Math.min(...result.polaroids.map((photo) => photo.paper.height)),
    ).toBeGreaterThan(180);
    expect(
      Math.max(...result.polaroids.map((photo) => photo.paper.y)) -
        Math.min(...result.polaroids.map((photo) => photo.paper.y)),
    ).toBeLessThan(
      Math.min(...result.polaroids.map((photo) => photo.paper.height)),
    );
    expectInsideTarget(result);
  });

  it("provides four editor-only slots only while the collection is empty", () => {
    const empty = polaroidProject(0);
    const phone = target(empty, {
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
      orientation: "portrait",
    });
    const emptyResult = buildPhotoPolaroidRenderModel(empty, phone);
    expect(emptyResult.photoPlaceholders).toHaveLength(4);
    expect(emptyResult.photoPlaceholders?.map((item) => item.slot)).toEqual([
      1, 2, 3, 4,
    ]);
    expect(JSON.stringify(emptyResult.model)).not.toMatch(
      /polaroid-empty|Photo 1|placeholder/,
    );

    const partial = polaroidProject(2);
    const partialResult = buildPhotoPolaroidRenderModel(partial, phone);
    expect(partialResult.photoPlaceholders).toEqual([]);
  });

  it.each([1, 2, 3, 4] as const)(
    "reflows %i photos into a complete count-aware composition",
    (photoCount) => {
      const project = polaroidProject(photoCount);
      const desktop = target(project, {
        category: "desktop",
        dimensions: { width: 1920, height: 1080 },
        orientation: "landscape",
      });
      const result = buildPhotoPolaroidRenderModel(project, desktop);
      expect(result.polaroids).toHaveLength(photoCount);
      expect(result.photoPlaceholders).toEqual([]);
      expectInsideTarget(result);
      expectCaptionCentersClear(result);
    },
  );

  it("makes sparse compositions larger and recomputes placement after removal", () => {
    const results = ([1, 2, 3, 4] as const).map((photoCount) => {
      const project = polaroidProject(photoCount);
      return buildPhotoPolaroidRenderModel(
        project,
        target(project, {
          category: "square",
          dimensions: { width: 1080, height: 1080 },
          orientation: "square",
        }),
      );
    });
    const firstPaperArea = results.map((result) => {
      const paper = result.polaroids[0]!.paper;
      return paper.width * paper.height;
    });
    expect(firstPaperArea[0]).toBeGreaterThan(firstPaperArea[1]!);
    expect(firstPaperArea[1]).toBeGreaterThan(firstPaperArea[3]!);
    expect(firstPaperArea[2]).toBeGreaterThan(firstPaperArea[3]!);
    expect(
      new Set(
        results.map((result) =>
          JSON.stringify(
            result.polaroids.map(({ paper, rotation }) => ({
              paper,
              rotation,
            })),
          ),
        ),
      ).size,
    ).toBe(4);
  });

  it.each([
    {
      category: "phone" as const,
      dimensions: { width: 1080, height: 2400 },
      orientation: "portrait" as const,
    },
    {
      category: "tablet" as const,
      dimensions: { width: 1536, height: 2048 },
      orientation: "portrait" as const,
    },
    {
      category: "tablet" as const,
      dimensions: { width: 2048, height: 1536 },
      orientation: "landscape" as const,
    },
    {
      category: "desktop" as const,
      dimensions: { width: 1920, height: 1080 },
      orientation: "landscape" as const,
    },
    {
      category: "square" as const,
      dimensions: { width: 1080, height: 1080 },
      orientation: "square" as const,
    },
  ])("keeps every count inside $category $orientation bounds", (input) => {
    for (const photoCount of [1, 2, 3, 4]) {
      const project = polaroidProject(photoCount);
      const result = buildPhotoPolaroidRenderModel(
        project,
        target(project, input),
      );
      expect(result.polaroids).toHaveLength(photoCount);
      expect(
        result.polaroids.every(
          (photo) =>
            Math.abs(photo.paper.width / photo.paper.height - 0.82) < 0.001,
        ),
      ).toBe(true);
      expectInsideTarget(result);
      expectCaptionCentersClear(result);
    }
  });

  it.each([
    {
      category: "phone" as const,
      dimensions: { width: 1080, height: 2400 },
      orientation: "portrait" as const,
    },
    {
      category: "tablet" as const,
      dimensions: { width: 1536, height: 2048 },
      orientation: "portrait" as const,
    },
    {
      category: "tablet" as const,
      dimensions: { width: 2048, height: 1536 },
      orientation: "landscape" as const,
    },
    {
      category: "desktop" as const,
      dimensions: { width: 1920, height: 1080 },
      orientation: "landscape" as const,
    },
    {
      category: "square" as const,
      dimensions: { width: 1080, height: 1080 },
      orientation: "square" as const,
    },
  ])(
    "fits the dense reference schedule without throwing on $category $orientation",
    (input) => {
      const project = densePolaroidProject();
      const result = buildPhotoPolaroidRenderModel(
        project,
        target(project, input),
      );
      expectInsideTarget(result);
      expect(result.dayLayout).toHaveLength(5);
    },
  );
});
