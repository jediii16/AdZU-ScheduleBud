import { describe, expect, it } from "vitest";

import { visualScheduleProject } from "../../fixtures/visual/schedules";
import {
  buildCardsRenderModel,
  buildPhotoHeroRenderModel,
  buildScheduleRenderModel,
  phoneScheduleFrame,
} from "@/domain/render";
import type { LayoutId } from "@/domain/design/types";

const SCHEDULE_FIRST_LAYOUTS: readonly LayoutId[] = [
  "cards",
  "minimal",
  "grid",
  "planner",
];

describe("phone schedule frame", () => {
  it.each(SCHEDULE_FIRST_LAYOUTS)(
    "keeps the %s layout below the clock inside the compact phone frame",
    (layoutId) => {
      const project = visualScheduleProject();
      project.design.layoutId = layoutId;
      const variant = project.deviceVariants[0]!;
      const frame = phoneScheduleFrame({
        width: variant.dimensions.width,
        height: variant.dimensions.height,
      });
      const result = buildScheduleRenderModel(project, variant);
      const bounds = result.scheduleBounds;

      expect(bounds.x).toBeGreaterThanOrEqual(frame.x - 0.001);
      expect(bounds.y).toBeGreaterThanOrEqual(frame.y - 0.001);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(
        frame.x + frame.width + 0.001,
      );
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(
        frame.y + frame.height + 0.001,
      );
    },
  );

  it("scales Cards uniformly when the natural phone layout is too wide", () => {
    const project = visualScheduleProject();
    project.design.layoutId = "cards";
    const variant = project.deviceVariants[0]!;
    const natural = buildCardsRenderModel(project, variant);
    const framed = buildScheduleRenderModel(project, variant);

    expect(framed.scheduleBounds.width).toBeLessThan(
      natural.scheduleBounds.width,
    );
    expect(framed.scheduleResize).toMatchObject({
      constrained: true,
      readabilityWarning: false,
    });
    expect(framed.scheduleResize?.scaleX).toBeCloseTo(
      framed.scheduleResize?.scaleY ?? 0,
    );
  });

  it("leaves Photo free to extend behind phone clock chrome", () => {
    const project = visualScheduleProject();
    project.design.layoutId = "photo";
    const variant = project.deviceVariants[0]!;
    const natural = buildPhotoHeroRenderModel(project, variant);
    const resolved = buildScheduleRenderModel(project, variant);

    expect(resolved.scheduleBounds).toEqual(natural.scheduleBounds);
    expect(resolved.positionRange).toEqual(natural.positionRange);
  });

  it("does not change desktop schedule geometry", () => {
    const project = visualScheduleProject();
    project.design.layoutId = "cards";
    const variant = project.deviceVariants[1]!;
    const natural = buildCardsRenderModel(project, variant);
    const resolved = buildScheduleRenderModel(project, variant);

    expect(resolved.scheduleBounds).toEqual(natural.scheduleBounds);
    expect(resolved.positionRange).toEqual(natural.positionRange);
  });
});
