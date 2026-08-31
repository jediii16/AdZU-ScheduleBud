import { describe, expect, it } from "vitest";

import {
  buildScheduleRenderModel,
  SCHEDULEBUD_WATERMARK_ASSET_ID,
  SCHEDULEBUD_WATERMARK_OPACITY,
} from "@/domain/render";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

describe("ScheduleBud watermark", () => {
  it.each(["cards", "minimal", "grid", "planner"] as const)(
    "adds the faded logo above the lower-right of the %s device canvas",
    (layoutId) => {
      const base = visualScheduleProject();
      const project = {
        ...base,
        design: { ...base.design, layoutId },
      };
      const result = buildScheduleRenderModel(
        project,
        project.deviceVariants[0]!,
      );
      const watermark = result.model.layers[4].nodes.find(
        (node) => node.id === "schedulebud-watermark",
      );

      expect(watermark).toMatchObject({
        kind: "image",
        assetId: SCHEDULEBUD_WATERMARK_ASSET_ID,
        source: "/brand/schedulebud-logo-on-light.svg",
        fit: "contain",
        opacity: SCHEDULEBUD_WATERMARK_OPACITY,
      });
      expect(watermark).toMatchObject({
        geometry: {
          x: expect.any(Number),
          y: expect.any(Number),
          width: expect.any(Number),
          height: expect.any(Number),
        },
      });
      if (watermark?.kind !== "image") throw new Error("Missing watermark");
      const inset = Math.min(result.model.width, result.model.height) * 0.035;
      expect(
        watermark.geometry.x + watermark.geometry.width + inset,
      ).toBeCloseTo(result.model.width);
      expect(
        watermark.geometry.y + watermark.geometry.height + inset,
      ).toBeCloseTo(result.model.height);
    },
  );

  it("uses the dark-surface logo for dark themes", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: { ...base.design, themeId: "midnight" as const },
    };
    const result = buildScheduleRenderModel(
      project,
      project.deviceVariants[0]!,
    );

    expect(
      result.model.layers[4].nodes.find(
        (node) => node.id === "schedulebud-watermark",
      ),
    ).toMatchObject({ source: "/brand/schedulebud-logo-on-dark.svg" });
  });

  it("keeps the Windows watermark above the taskbar artwork", () => {
    const project = visualScheduleProject();
    const desktop = {
      ...project.deviceVariants[1]!,
      preview: {
        ...project.deviceVariants[1]!.preview,
        mode: "windows-desktop" as const,
      },
    };
    const result = buildScheduleRenderModel(project, desktop);
    const watermark = result.model.layers[4].nodes.find(
      (node) => node.id === "schedulebud-watermark",
    );
    if (watermark?.kind !== "image") throw new Error("Missing watermark");
    const taskbarHeight = Math.min(
      result.model.height * 0.08,
      (result.model.width * 49) / 1500,
    );
    const shortestEdge = Math.min(result.model.width, result.model.height);
    const verticalInset = shortestEdge * 0.012;

    expect(
      watermark.geometry.y + watermark.geometry.height + verticalInset,
    ).toBeCloseTo(result.model.height - taskbarHeight);
    expect(watermark.geometry.width).toBeCloseTo(shortestEdge * 0.055);
  });
});
