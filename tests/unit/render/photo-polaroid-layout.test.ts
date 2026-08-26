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
});
