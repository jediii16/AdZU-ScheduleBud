import { describe, expect, it } from "vitest";

import { buildCardsRenderModel, fitText } from "@/domain/render";
import type { ScheduleDay, Subject } from "@/domain/schedule/types";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

function projectWithDays(
  days: readonly ScheduleDay[],
  meetingsPerDay: Partial<Record<ScheduleDay, number>> = {},
) {
  const project = visualScheduleProject();
  const template = structuredClone(project.schedule[0]!);
  const schedule: Subject[] = days.flatMap((day, dayIndex) =>
    Array.from({ length: meetingsPerDay[day] ?? 1 }, (_, meetingIndex) => ({
      ...structuredClone(template),
      id: `subject-${day}-${meetingIndex}`,
      code: `SUB ${dayIndex + 1}${meetingIndex + 1}`,
      meetings: [
        {
          ...structuredClone(template.meetings[0]!),
          id: `meeting-${day}-${meetingIndex}`,
          days: [day],
          startTime: `${String(8 + meetingIndex).padStart(2, "0")}:00`,
          endTime: `${String(8 + meetingIndex).padStart(2, "0")}:50`,
        },
      ],
    })),
  );
  return { ...project, schedule };
}

function render(project = visualScheduleProject(), variantIndex = 0) {
  return buildCardsRenderModel(project, project.deviceVariants[variantIndex]!);
}

describe("Clean Slate Cards RenderModel", () => {
  it("uses exact Phone and Desktop target dimensions and distinct typography", () => {
    const project = visualScheduleProject();
    const phone = render(project, 0);
    const desktop = render(project, 1);
    expect(phone.model).toMatchObject({ width: 1080, height: 2400 });
    expect(desktop.model).toMatchObject({ width: 1920, height: 1080 });
    expect(phone.typography).toMatchObject({
      title: 80,
      day: 40,
      code: 38,
      time: 28,
    });
    expect(desktop.typography).toMatchObject({
      title: 50,
      day: 27,
      code: 21,
      time: 16,
    });
    expect(phone.typography.code).toBeGreaterThan(desktop.typography.code);
  });

  it("adapts Cards to Tablet and Square target families", () => {
    const project = projectWithDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const base = project.deviceVariants[0]!;
    const tablet = {
      ...base,
      id: "tablet",
      category: "tablet" as const,
      dimensions: { width: 1536, height: 2048 },
      orientation: "portrait" as const,
      dimensionSource: "preset" as const,
      presetId: "tablet-4-3-portrait",
    };
    const square = {
      ...base,
      id: "square",
      category: "square" as const,
      dimensions: { width: 1080, height: 1080 },
      orientation: "square" as const,
      dimensionSource: "preset" as const,
      presetId: "square-1080",
    };
    const tabletResult = buildCardsRenderModel(project, tablet);
    const squareResult = buildCardsRenderModel(project, square);
    expect(tabletResult.compositionFamily).toBe("tabletPortrait");
    expect(new Set(tabletResult.dayLayout.map((day) => day.column))).toEqual(
      new Set([0, 1, 2]),
    );
    expect(squareResult.compositionFamily).toBe("square");
    expect(new Set(squareResult.dayLayout.map((day) => day.column))).toEqual(
      new Set([0, 1, 2]),
    );
  });

  it("hides an empty Saturday by default and creates five balanced desktop columns", () => {
    const project = projectWithDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const result = render(project, 1);
    expect(result.dayLayout.map((day) => day.day)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
    ]);
    expect(result.dayLayout).toHaveLength(5);
    expect(new Set(result.dayLayout.map((day) => day.width)).size).toBe(1);
    expect(
      result.model.layers[3].nodes.some((node) => node.id === "day-Sat"),
    ).toBe(false);
  });

  it("restores all supplied weekdays without drawing an empty card in full-week mode", () => {
    const base = projectWithDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const project = {
      ...base,
      design: { ...base.design, dayVisibility: "full-week" as const },
    };
    const result = render(project, 1);
    expect(result.dayLayout.map((day) => day.day)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
    expect(
      result.dayLayout.find((day) => day.day === "Sat")?.occurrenceCount,
    ).toBe(0);
    expect(
      result.model.layers[3].nodes.some((node) =>
        node.id.startsWith("card-Sat"),
      ),
    ).toBe(false);
  });

  it("does not let disabled or incomplete subjects keep a day visible", () => {
    const project = visualScheduleProject();
    const disabled = structuredClone(project.schedule[0]!);
    disabled.id = "disabled-sat";
    disabled.enabled = false;
    disabled.meetings[0]!.id = "disabled-sat-meeting";
    disabled.meetings[0]!.days = ["Sat"];
    const incomplete = structuredClone(project.schedule[0]!);
    incomplete.id = "incomplete-wed";
    incomplete.meetings[0]!.id = "incomplete-wed-meeting";
    incomplete.meetings[0]!.days = ["Wed"];
    incomplete.meetings[0]!.endTime = "";
    const result = render({ ...project, schedule: [disabled, incomplete] });
    expect(result.dayLayout).toEqual([]);
  });

  it.each([
    { days: ["Mon", "Tue", "Wed", "Thu", "Fri"] as const, rows: [2, 2, 1] },
    { days: ["Mon", "Tue", "Wed", "Thu"] as const, rows: [2, 2] },
    { days: ["Mon", "Tue", "Wed"] as const, rows: [2, 1] },
  ])("packs $days.length phone days as $rows", ({ days, rows }) => {
    const result = render(projectWithDays(days));
    const counts = Array.from(
      new Set(result.dayLayout.map((day) => day.row)),
    ).map((row) => result.dayLayout.filter((day) => day.row === row).length);
    expect(counts).toEqual(rows);
    const last = result.dayLayout.at(-1)!;
    if (days.length % 2 === 1)
      expect(last.x + last.width / 2).toBeCloseTo(
        result.scheduleBounds.x + result.scheduleBounds.width / 2,
      );
  });

  it("centers a single phone day and lets it use a wider section", () => {
    const result = render(projectWithDays(["Wed"]));
    expect(result.dayLayout).toHaveLength(1);
    expect(result.dayLayout[0]!.width).toBeGreaterThan(500);
    expect(result.dayLayout[0]!.x + result.dayLayout[0]!.width / 2).toBeCloseTo(
      result.scheduleBounds.x + result.scheduleBounds.width / 2,
    );
  });

  it("uses the taller day to place the next content-driven phone row", () => {
    const result = render(
      projectWithDays(["Mon", "Tue", "Wed"], { Mon: 3, Tue: 1, Wed: 1 }),
    );
    const monday = result.dayLayout.find((day) => day.day === "Mon")!;
    const tuesday = result.dayLayout.find((day) => day.day === "Tue")!;
    const wednesday = result.dayLayout.find((day) => day.day === "Wed")!;
    expect(monday.height).toBeGreaterThan(tuesday.height);
    expect(wednesday.y).toBeGreaterThan(monday.y + monday.height);
  });

  it("reclaims all title-specific geometry when the title is hidden", () => {
    const titled = projectWithDays(["Mon", "Tue", "Wed"]);
    const withTitle = render(titled);
    const untitled = {
      ...titled,
      design: {
        ...titled.design,
        wallpaperTitle: { ...titled.design.wallpaperTitle, visible: false },
      },
    };
    const withoutTitle = render(untitled);
    expect(
      withTitle.model.layers[3].nodes.some(
        (node) => node.id === "wallpaper-title",
      ),
    ).toBe(true);
    expect(
      withoutTitle.model.layers[3].nodes.some(
        (node) => node.id === "wallpaper-title",
      ),
    ).toBe(false);
    expect(withTitle.dayLayout[0]!.y - withTitle.scheduleBounds.y).toBe(154);
    expect(withoutTitle.dayLayout[0]!.y - withoutTitle.scheduleBounds.y).toBe(
      0,
    );
    expect(
      withTitle.scheduleBounds.height - withoutTitle.scheduleBounds.height,
    ).toBe(154);
  });

  it("renders the subject code as the sole class identifier", () => {
    const result = render();
    const codeNodes = result.model.layers[3].nodes.filter(
      (node) =>
        node.id.startsWith("code-") &&
        node.kind === "text" &&
        node.text === "CS.412",
    );
    expect(codeNodes).toHaveLength(2);
  });

  it.each(["CS.412", "COMPINTRO", "PATHFIT1n"])(
    "renders realistic subject code %s without a secondary identifier",
    (code) => {
      const project = projectWithDays(["Mon"]);
      project.schedule[0]!.code = code;
      const result = render(project);
      const codeNode = result.model.layers[3].nodes.find(
        (node) => node.kind === "text" && node.id.startsWith("code-"),
      );
      expect(codeNode?.kind === "text" ? codeNode.text : null).toBe(code);
    },
  );

  it("fits an unusually long subject code without hiding the identifier", () => {
    const project = projectWithDays(["Mon"]);
    project.schedule[0]!.code = "VERY-LONG-SUBJECT-CODE-WITH-PUNCTUATION.401A";
    const result = render(project);
    const codeNode = result.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("code-"),
    );
    expect(codeNode?.kind).toBe("text");
    expect(
      codeNode?.kind === "text" ? codeNode.text.length : 0,
    ).toBeGreaterThan(0);
  });

  it("honors visible detail settings and preserves chronological order", () => {
    const project = projectWithDays(["Mon"], { Mon: 2 });
    project.design.visibleFields = {
      ...project.design.visibleFields,
      room: false,
      professor: false,
    };
    const result = render(project);
    const cards = result.model.layers[3].nodes.filter(
      (node) => node.kind === "rect" && node.id.startsWith("card-Mon"),
    );
    expect(cards).toHaveLength(2);
    expect(
      cards[0]!.kind === "rect" && cards[1]!.kind === "rect"
        ? cards[0]!.geometry.y
        : 0,
    ).toBeLessThan(cards[1]!.kind === "rect" ? cards[1]!.geometry.y : 0);
    const text = result.model.layers[3].nodes
      .filter((node) => node.kind === "text")
      .map((node) => node.text)
      .join(" ");
    expect(text).not.toContain("ICT 301");
    expect(text).not.toContain("Prof. Rivera");
  });

  it("fits and truncates long text deterministically", () => {
    const fitted = fitText({
      text: "A deliberately very long subject title that cannot fit naturally",
      width: 130,
      preferredFontSize: 20,
      minimumFontSize: 12,
      maximumLines: 2,
    });
    expect(fitted).toMatchObject({ truncated: true, lines: 2 });
    expect(fitted.text.endsWith("…")).toBe(true);
  });

  it("keeps normalized position in range and editor overlays outside export layers", () => {
    const project = visualScheduleProject();
    const variant = {
      ...project.deviceVariants[0]!,
      schedulePosition: { x: 1, y: 0 },
    };
    const result = buildCardsRenderModel(project, variant);
    expect(result.scheduleBounds.x).toBe(result.positionRange.maxX);
    expect(result.scheduleBounds.y).toBe(result.positionRange.minY);
    expect(result.overlay.selection).toEqual(result.scheduleBounds);
    expect(
      result.model.layers
        .flatMap((layer) => layer.nodes)
        .some(
          (node) => node.id.includes("guide") || node.id.includes("overlay"),
        ),
    ).toBe(false);
  });

  it("never adds OS previews, safe areas, or screen guides to export layers", () => {
    const project = visualScheduleProject();
    const variant = {
      ...project.deviceVariants[1]!,
      preview: {
        ...project.deviceVariants[1]!.preview,
        mode: "windows-desktop" as const,
        showSafeAreas: true,
        guideAssetId: "private-guide",
      },
    };
    const model = buildCardsRenderModel(project, variant).model;
    const serialized = JSON.stringify(model);
    expect(serialized).not.toMatch(
      /private-guide|safe-area|windows|macos|lock-screen/,
    );
  });
});
