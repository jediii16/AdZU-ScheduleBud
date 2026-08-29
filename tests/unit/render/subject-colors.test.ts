import { describe, expect, it } from "vitest";

import {
  buildCardsRenderModel,
  buildGridRenderModel,
  resolveSubjectColor,
  resolveWallpaperTheme,
  seedCustomSubjectColors,
} from "@/domain/render";
import { createCustomPalette } from "@/domain/render/themes/registry";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

describe("subject color resolution", () => {
  it("assigns exact automatic palette colors deterministically and cycles", () => {
    const project = visualScheduleProject();
    const subjects = Array.from({ length: 8 }, (_, index) => ({
      ...structuredClone(project.schedule[0]!),
      id: `subject-${index}`,
      code: `SUB${index}`,
    }));
    const palette = ["#111111", "#222222", "#333333"];
    const resolve = (subjectId: string) =>
      resolveSubjectColor({
        subjectId,
        subjects,
        automaticPalette: palette,
        configuration: project.design.subjectColors,
      });
    expect(subjects.map((subject) => resolve(subject.id))).toEqual([
      "#111111",
      "#222222",
      "#333333",
      "#111111",
      "#222222",
      "#333333",
      "#111111",
      "#222222",
    ]);
    expect(resolve("subject-1")).toBe(resolve("subject-1"));
  });

  it("uses the built-in base subject palette for a Custom Color Palette", () => {
    const custom = createCustomPalette("matcha-study");
    custom.canvas = "#123456";
    custom.primary = "#654321";
    const customTheme = resolveWallpaperTheme("custom", "cards", custom);
    const baseTheme = resolveWallpaperTheme("matcha-study", "cards");
    expect(customTheme.subjectPalette).toEqual(baseTheme.subjectPalette);
  });

  it("keeps stored custom values and seeds only missing subjects", () => {
    const project = visualScheduleProject();
    const first = project.schedule[0]!;
    const seeded = seedCustomSubjectColors({
      subjects: project.schedule,
      automaticPalette: ["#111111", "#222222"],
      existing: { [first.id]: "#ABCDEF" },
    });
    expect(seeded[first.id]).toBe("#ABCDEF");
    expect(seeded[project.schedule[1]!.id]).toBe("#222222");
  });

  it("feeds the same per-subject color to Cards and Grid occurrences", () => {
    const project = visualScheduleProject();
    const subject = project.schedule[0]!;
    project.design.subjectColors = {
      mode: "custom",
      singleColor: null,
      bySubjectId: { [subject.id]: "#A1B2C3" },
    };
    const meetingId = subject.meetings[0]!.id;
    const cards = buildCardsRenderModel(project, project.deviceVariants[0]!);
    const grid = buildGridRenderModel(project, project.deviceVariants[0]!);
    const cardFills = cards.model.layers
      .flatMap((layer) => layer.nodes)
      .filter((node) => node.kind === "rect" && node.id.includes(meetingId))
      .map((node) => (node.kind === "rect" ? node.fill : undefined));
    const gridFills = grid.model.layers
      .flatMap((layer) => layer.nodes)
      .filter((node) => node.kind === "rect" && node.id.includes(meetingId))
      .map((node) => (node.kind === "rect" ? node.fill : undefined));
    expect(cardFills).toEqual(["#A1B2C3", "#A1B2C3"]);
    expect(gridFills).toEqual(["#A1B2C3", "#A1B2C3"]);
  });
});
