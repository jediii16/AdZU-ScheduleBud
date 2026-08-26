import { describe, expect, it } from "vitest";

import { availableLayouts } from "@/data/layouts/registry";
import { balancedPositionFor } from "@/data/devices/studio-targets";
import type { DeviceVariant } from "@/domain/device/types";
import {
  GRID_DESKTOP_MAX_DAY_WIDTH,
  GRID_MINIMUM_TIME_SPAN_MINUTES,
  GRID_PHONE_UNBROKEN_CODE_GLYPH_WIDTH,
  GRID_TABLET_PORTRAIT_MIN_DAY_WIDTH,
  buildGridRenderModel,
  buildScheduleRenderModel,
  resolveGridBandCounts,
  resolveGridTimeRange,
} from "@/domain/render";
import { normalizeSubject } from "@/domain/schedule/normalization";
import type { ScheduleDay } from "@/domain/schedule/types";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

type MeetingInput = {
  day: ScheduleDay;
  start: string;
  end: string;
  code: string;
  room?: string;
  professor?: string;
  section?: string;
  enabled?: boolean;
  complete?: boolean;
};

function gridProject(meetings: readonly MeetingInput[]) {
  const project = visualScheduleProject();
  let id = 0;
  project.design.layoutId = "grid";
  project.schedule = meetings.map((input) =>
    normalizeSubject(
      {
        code: input.code,
        enabled: input.enabled ?? true,
        section: input.section ?? "A",
        meetings: [
          {
            days: [input.day],
            startTime: input.start,
            endTime: input.complete === false ? "" : input.end,
            room: input.room ?? "ADV LAB",
            professor: input.professor ?? "Professor Rivera",
          },
        ],
      },
      (kind) => `grid-${kind}-${++id}`,
    ),
  );
  return project;
}

function daysProject(days: readonly ScheduleDay[]) {
  return gridProject(
    days.map((day, index) => ({
      day,
      code: `GRID${index + 1}`,
      start: "09:00",
      end: "10:30",
    })),
  );
}

function variant(
  project: ReturnType<typeof gridProject>,
  input: Partial<DeviceVariant> &
    Pick<DeviceVariant, "category" | "dimensions" | "orientation">,
): DeviceVariant {
  return {
    ...project.deviceVariants[0]!,
    id: `grid-${input.category}-${input.dimensions.width}x${input.dimensions.height}`,
    dimensionSource: "custom",
    presetId: null,
    compositionId: `grid-${input.category}`,
    ...input,
  };
}

function phoneResult(days: readonly ScheduleDay[]) {
  const project = daysProject(days);
  return buildGridRenderModel(project, project.deviceVariants[0]!);
}

describe("Clean Slate Grid RenderModel", () => {
  it("registers Cards, Minimal, and Grid as the available layouts", () => {
    expect(availableLayouts.map((layout) => layout.id)).toEqual([
      "cards",
      "minimal",
      "grid",
      "planner",
    ]);
  });

  it("uses the central resolver to select temporal Grid nodes", () => {
    const project = daysProject(["Mon"]);
    const result = buildScheduleRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    const ids = result.model.layers.flatMap((layer) =>
      layer.nodes.map((node) => node.id),
    );
    expect(ids.some((id) => id.startsWith("grid-hour-line-"))).toBe(true);
    expect(ids.some((id) => id.startsWith("grid-block-"))).toBe(true);
    expect(ids.some((id) => id.startsWith("card-"))).toBe(false);
  });

  it("positions later meetings lower and preserves duration ratios", () => {
    const project = gridProject([
      { day: "Mon", code: "EARLY", start: "08:00", end: "09:00" },
      { day: "Tue", code: "LATER", start: "09:00", end: "10:00" },
      { day: "Wed", code: "LONG", start: "08:00", end: "10:00" },
    ]);
    const result = buildGridRenderModel(project, project.deviceVariants[1]!);
    const early = result.blockLayout.find((block) => block.day === "Mon")!;
    const later = result.blockLayout.find((block) => block.day === "Tue")!;
    const long = result.blockLayout.find((block) => block.day === "Wed")!;
    expect(later.bounds.y).toBeGreaterThan(early.bounds.y);
    expect(later.bounds.height).toBeCloseTo(early.bounds.height);
    expect(long.bounds.height).toBeCloseTo(early.bounds.height * 2);
  });

  it("places 09:30 exactly halfway between the 09:00 and 10:00 guides", () => {
    const project = gridProject([
      { day: "Mon", code: "HALF", start: "09:30", end: "10:30" },
    ]);
    const result = buildGridRenderModel(project, project.deviceVariants[0]!);
    const band = result.bandLayout[0]!;
    const block = result.blockLayout[0]!;
    const start = Number(result.timeRange.startTime.slice(0, 2)) * 60;
    const nine = band.gridBounds.y + (9 * 60 - start) * band.pixelsPerMinute;
    const ten = band.gridBounds.y + (10 * 60 - start) * band.pixelsPerMinute;
    expect(block.bounds.y).toBeCloseTo((nine + ten) / 2);
  });

  it("rounds outward, clamps to supported bounds, and expands sparse ranges", () => {
    const outward = gridProject([
      { day: "Mon", code: "RANGE", start: "09:30", end: "18:20" },
    ]);
    expect(resolveGridTimeRange(outward.schedule)).toMatchObject({
      startTime: "09:00",
      endTime: "19:00",
    });
    const sparse = gridProject([
      { day: "Mon", code: "SPARSE", start: "13:00", end: "15:00" },
    ]);
    expect(resolveGridTimeRange(sparse.schedule)).toMatchObject({
      startTime: "11:00",
      endTime: "17:00",
    });
    expect(GRID_MINIMUM_TIME_SPAN_MINUTES).toBe(360);
    const bounded = gridProject([
      { day: "Mon", code: "BOUNDS", start: "07:10", end: "20:50" },
    ]);
    expect(resolveGridTimeRange(bounded.schedule)).toMatchObject({
      startTime: "07:00",
      endTime: "21:00",
    });
  });

  it("reflows scheduled days and restores an intentional full week", () => {
    const project = daysProject(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const scheduled = buildGridRenderModel(project, project.deviceVariants[1]!);
    expect(scheduled.dayLayout).toHaveLength(5);
    expect(
      new Set(scheduled.dayLayout.map((day) => day.bounds.width)),
    ).toHaveLength(1);
    project.design.dayVisibility = "full-week";
    const full = buildGridRenderModel(project, project.deviceVariants[1]!);
    expect(full.dayLayout).toHaveLength(6);
    expect(
      full.dayLayout.find((day) => day.day === "Sat")?.occurrenceCount,
    ).toBe(0);
    expect(full.blockLayout.some((block) => block.day === "Sat")).toBe(false);
  });

  it("does not reveal days from disabled or incomplete meetings", () => {
    const project = gridProject([
      {
        day: "Mon",
        code: "DISABLED",
        start: "08:00",
        end: "09:00",
        enabled: false,
      },
      {
        day: "Tue",
        code: "INCOMPLETE",
        start: "08:00",
        end: "09:00",
        complete: false,
      },
    ]);
    const result = buildGridRenderModel(project, project.deviceVariants[0]!);
    expect(result.dayLayout).toEqual([]);
    expect(result.blockLayout).toEqual([]);
  });

  it.each([6, 5, 4, 3, 2, 1])(
    "renders %s Phone days in one temporal week",
    (count) => {
      const days = (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const).slice(
        0,
        count,
      );
      const result = phoneResult(days);
      expect(result.bandLayout.map((band) => band.days.length)).toEqual([
        count,
      ]);
      const week = result.bandLayout[0]!;
      expect(week.bounds.x + week.bounds.width / 2).toBeCloseTo(
        result.scheduleBounds.x + result.scheduleBounds.width / 2,
      );
    },
  );

  it("uses full-week bands for normal Tablet portrait and landscape targets", () => {
    const project = daysProject(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const portrait = variant(project, {
      category: "tablet",
      dimensions: { width: 1536, height: 2048 },
      orientation: "portrait",
    });
    const landscape = variant(project, {
      category: "tablet",
      dimensions: { width: 2048, height: 1536 },
      orientation: "landscape",
    });
    expect(
      buildGridRenderModel(project, portrait).bandLayout.map(
        (band) => band.days.length,
      ),
    ).toEqual([5]);
    expect(
      buildGridRenderModel(project, landscape).bandLayout.map(
        (band) => band.days.length,
      ),
    ).toEqual([5]);
    expect(
      resolveGridBandCounts("tabletLandscape", 5, {
        width: 1200,
        height: 900,
      }),
    ).toEqual([3, 2]);
  });

  it("keeps six normal Tablet portrait days together and splits only a narrow custom target", () => {
    const project = daysProject(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    const normal = variant(project, {
      category: "tablet",
      dimensions: { width: 1536, height: 2048 },
      orientation: "portrait",
    });
    expect(
      buildGridRenderModel(project, normal).bandLayout.map(
        (band) => band.days.length,
      ),
    ).toEqual([6]);
    expect(
      resolveGridBandCounts("tabletPortrait", 5, {
        width: 800,
        height: 1280,
      }),
    ).toEqual([3, 2]);
    expect(GRID_TABLET_PORTRAIT_MIN_DAY_WIDTH).toBe(180);
  });

  it("caps and centers sparse Desktop day columns", () => {
    const project = daysProject(["Mon", "Wed", "Fri"]);
    const result = buildGridRenderModel(project, project.deviceVariants[1]!);
    expect(
      result.dayLayout.every(
        (day) => day.bounds.width <= GRID_DESKTOP_MAX_DAY_WIDTH,
      ),
    ).toBe(true);
    expect(
      result.scheduleBounds.x + result.scheduleBounds.width / 2,
    ).toBeCloseTo(960);
  });

  it("splits two- and three-way overlaps without treating back-to-back meetings as overlaps", () => {
    const project = gridProject([
      { day: "Mon", code: "LEFT", start: "08:00", end: "10:00" },
      { day: "Mon", code: "RIGHT", start: "08:30", end: "09:30" },
      { day: "Mon", code: "THIRD", start: "09:00", end: "09:45" },
      { day: "Tue", code: "FIRST", start: "08:00", end: "09:00" },
      { day: "Tue", code: "NEXT", start: "09:00", end: "10:00" },
    ]);
    const result = buildGridRenderModel(project, project.deviceVariants[1]!);
    const monday = result.blockLayout.filter((block) => block.day === "Mon");
    const tuesday = result.blockLayout.filter((block) => block.day === "Tue");
    expect(monday.map((block) => block.overlapColumnCount)).toEqual([3, 3, 3]);
    expect(new Set(monday.map((block) => block.bounds.width)).size).toBe(1);
    expect(tuesday.map((block) => block.overlapColumnCount)).toEqual([1, 1]);
  });

  it("defaults Phone Grid to Room on and Time off", () => {
    const project = gridProject([
      { day: "Mon", code: "ROOMY", start: "08:00", end: "12:00" },
      {
        day: "Tue",
        code: "MEDIUM",
        start: "12:30",
        end: "14:00",
        section: "",
      },
      {
        day: "Wed",
        code: "COMPACT",
        start: "14:00",
        end: "15:15",
        room: "",
        professor: "",
        section: "",
      },
      {
        day: "Thu",
        code: "SHORT",
        start: "15:20",
        end: "15:40",
      },
    ]);
    const result = buildGridRenderModel(project, project.deviceVariants[0]!);
    const byDay = new Map(
      result.blockLayout.map((block) => [block.day, block]),
    );
    expect(byDay.get("Mon")?.shownFields).toEqual({
      time: false,
      room: true,
      section: false,
      professor: false,
    });
    expect(byDay.get("Tue")?.shownFields).toMatchObject({
      time: false,
      room: true,
      section: false,
      professor: false,
    });
    expect(byDay.get("Wed")?.shownFields.time).toBe(false);
    expect(byDay.get("Thu")?.shownFields).toEqual({
      time: false,
      room: false,
      section: false,
      professor: false,
    });
    const codes = result.model.layers[3].nodes
      .filter(
        (node) => node.kind === "text" && node.id.startsWith("grid-code-"),
      )
      .map((node) => (node.kind === "text" ? node.text : ""));
    expect(codes).toEqual(
      expect.arrayContaining(["ROOMY", "MEDIUM", "COMPACT", "SHORT"]),
    );
  });

  it("shows a complete user-enabled Time value when Phone geometry permits it", () => {
    const project = gridProject([
      { day: "Mon", code: "ROOMY", start: "08:00", end: "12:00" },
    ]);
    project.deviceVariants[0]!.layoutVisibleFieldsOverride = {
      grid: { time: true },
    };
    const result = buildGridRenderModel(project, project.deviceVariants[0]!);
    expect(result.blockLayout[0]?.shownFields).toMatchObject({
      room: true,
      time: true,
    });
    const time = result.model.layers[3].nodes.find((node) =>
      node.id.startsWith("grid-time-"),
    );
    expect(time).toMatchObject({ kind: "text", text: "8:00–12:00" });
  });

  it("removes enabled Time instead of ellipsizing it in narrow overlap blocks", () => {
    const project = gridProject([
      { day: "Mon", code: "CS.412", start: "08:00", end: "10:00" },
      { day: "Mon", code: "COMPINTRO", start: "08:00", end: "10:00" },
      { day: "Mon", code: "PATHFIT1n", start: "08:00", end: "10:00" },
      { day: "Tue", code: "TUESDAY", start: "08:00", end: "10:00" },
      { day: "Wed", code: "WEDNESDAY", start: "08:00", end: "10:00" },
      { day: "Thu", code: "THURSDAY", start: "08:00", end: "10:00" },
      { day: "Fri", code: "FRIDAY", start: "08:00", end: "10:00" },
      { day: "Sat", code: "SATURDAY", start: "08:00", end: "10:00" },
    ]);
    project.deviceVariants[0]!.layoutVisibleFieldsOverride = {
      grid: { time: true },
    };
    const result = buildGridRenderModel(project, project.deviceVariants[0]!);
    const monday = result.blockLayout.filter((block) => block.day === "Mon");
    expect(monday).toHaveLength(3);
    for (const block of monday) {
      expect(block.shownFields.time).toBe(false);
      expect(block.shownFields.room).toBe(false);
      expect(block.shownFields.section).toBe(false);
      expect(block.shownFields.professor).toBe(false);
      const day = result.dayLayout.find((item) => item.day === block.day)!;
      expect(block.bounds.x).toBeGreaterThanOrEqual(day.bounds.x);
      expect(block.bounds.x + block.bounds.width).toBeLessThanOrEqual(
        day.bounds.x + day.bounds.width,
      );
    }
    expect(
      result.model.layers[3].nodes.some(
        (node) =>
          node.id.startsWith("grid-time-Mon-") &&
          monday.some((block) => node.id.includes(block.occurrenceId)),
      ),
    ).toBe(false);
  });

  it("never restores a user-hidden field", () => {
    const project = gridProject([
      { day: "Mon", code: "VISIBLE", start: "08:00", end: "12:00" },
    ]);
    project.design.visibleFields = {
      time: false,
      room: false,
      professor: false,
      section: false,
    };
    project.deviceVariants[0]!.layoutVisibleFieldsOverride = {
      grid: { room: false, time: false },
    };
    const result = buildGridRenderModel(project, project.deviceVariants[0]!);
    expect(result.blockLayout[0]?.shownFields).toEqual({
      time: false,
      room: false,
      section: false,
      professor: false,
    });
  });

  it("resolves Phone Grid detail capabilities without changing larger targets", () => {
    const project = daysProject(["Mon"]);
    const phone = buildGridRenderModel(project, project.deviceVariants[0]!);
    const desktop = buildGridRenderModel(project, project.deviceVariants[1]!);
    expect(phone.detailCapabilities.fieldOrder).toEqual([
      "room",
      "time",
      "professor",
      "section",
    ]);
    expect(phone.detailCapabilities.fields).toEqual({
      time: "available",
      room: "available",
      professor: "larger-grid-targets",
      section: "larger-grid-targets",
    });
    expect(phone.detailCapabilities.defaultFields).toEqual({
      room: true,
      time: false,
    });
    expect(phone.detailCapabilities.preferenceScope).toBe("variant-layout");
    expect(desktop.detailCapabilities.preferenceScope).toBe("project");
    expect(desktop.detailCapabilities.fields.professor).toBe("available");
    expect(desktop.detailCapabilities.fields.section).toBe("available");
  });

  it("keeps realistic Phone full-week subject codes identifiable", () => {
    const project = gridProject([
      { day: "Mon", code: "COMPINTRO", start: "08:00", end: "10:00" },
      { day: "Tue", code: "COMPROG1", start: "08:00", end: "10:00" },
      { day: "Wed", code: "PATHFIT1n", start: "08:00", end: "10:00" },
      { day: "Thu", code: "WEBPROG", start: "08:00", end: "10:00" },
      { day: "Fri", code: "CS.412", start: "08:00", end: "10:00" },
    ]);
    const result = buildGridRenderModel(project, project.deviceVariants[0]!);
    const renderedCodes = result.model.layers[3].nodes
      .filter(
        (node) => node.kind === "text" && node.id.startsWith("grid-code-"),
      )
      .map((node) => (node.kind === "text" ? node.text : ""));
    expect(renderedCodes).toEqual([
      "COMPINTRO",
      "COMPROG1",
      "PATHFIT1n",
      "WEBPROG",
      "CS.412",
    ]);
    expect(renderedCodes.every((code) => !code.includes("…"))).toBe(true);
    expect(renderedCodes.every((code) => !code.includes("\n"))).toBe(true);
  });

  it("fits complete subject codes inside narrow six-day Phone columns", () => {
    const codes = [
      "COGNATE3",
      "COMPINTRO",
      "COMPROG1",
      "PATHFIT1n",
      "CS.412",
      "WEBPROG",
    ] as const;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
    const project = gridProject(
      codes.map((code, index) => ({
        day: days[index]!,
        code,
        start: "08:00",
        end: "10:00",
      })),
    );
    const result = buildGridRenderModel(project, project.deviceVariants[0]!);
    const renderedCodes = result.model.layers[3].nodes.filter(
      (node) => node.kind === "text" && node.id.startsWith("grid-code-"),
    );
    expect(renderedCodes).toHaveLength(codes.length);
    renderedCodes.forEach((node, index) => {
      if (node.kind !== "text") return;
      expect(node.text.replaceAll("\n", "")).toBe(codes[index]);
      expect(node.text).not.toContain("…");
      for (const line of node.text.split("\n")) {
        expect(
          line.length * node.fontSize * GRID_PHONE_UNBROKEN_CODE_GLYPH_WIDTH,
        ).toBeLessThanOrEqual(node.width + 0.001);
      }
    });
  });

  it("never ellipsizes a Phone subject code even at extreme overlap width", () => {
    const project = gridProject(
      ["ONE", "TWO", "THREE", "FOUR"].map((suffix) => ({
        day: "Mon" as const,
        code: `VERY-LONG-SUBJECT-CODE-${suffix}`,
        start: "08:00",
        end: "10:00",
      })),
    );
    const result = buildGridRenderModel(project, project.deviceVariants[0]!);
    const codes = result.model.layers[3].nodes.filter(
      (node) => node.kind === "text" && node.id.startsWith("grid-code-"),
    );
    expect(codes).toHaveLength(4);
    for (const node of codes) {
      if (node.kind !== "text") continue;
      expect(node.text).not.toContain("…");
      expect(node.text.replaceAll("\n", "")).toMatch(
        /^VERY-LONG-SUBJECT-CODE-/,
      );
    }
  });

  it("fits long codes and metadata without letting text escape its block", () => {
    const project = gridProject([
      {
        day: "Mon",
        code: "VERY-LONG-SUBJECT-CODE.WITH-PUNCTUATION-401A",
        start: "08:00",
        end: "12:00",
        room: "Advanced Computing Laboratory With A Long Room Identifier",
        section: "Research and Development Section With A Long Identifier",
        professor: "Professor With An Extremely Long Professional Display Name",
      },
    ]);
    const result = buildGridRenderModel(project, project.deviceVariants[1]!);
    const block = result.blockLayout[0]!;
    const textNodes = result.model.layers[3].nodes.filter(
      (node) => node.kind === "text" && node.id.includes(block.occurrenceId),
    );
    expect(
      textNodes.some((node) => node.kind === "text" && node.text.endsWith("…")),
    ).toBe(true);
    for (const node of textNodes) {
      if (node.kind !== "text") continue;
      expect(node.position.x).toBeGreaterThanOrEqual(block.bounds.x);
      expect(node.position.x + node.width).toBeLessThanOrEqual(
        block.bounds.x + block.bounds.width,
      );
      expect(node.position.y).toBeGreaterThanOrEqual(block.bounds.y);
      expect(node.position.y + (node.height ?? 0)).toBeLessThanOrEqual(
        block.bounds.y + block.bounds.height,
      );
    }
  });

  it("uses deterministic compact-axis density without drawing half-hour guides", () => {
    const project = gridProject([
      { day: "Mon", code: "EARLY", start: "07:30", end: "09:00" },
      { day: "Tue", code: "LATE", start: "19:15", end: "20:45" },
    ]);
    const phone = buildGridRenderModel(project, project.deviceVariants[0]!);
    const desktop = buildGridRenderModel(project, project.deviceVariants[1]!);
    expect(phone.hourLabelInterval).toBe(2);
    expect(desktop.hourLabelInterval).toBe(1);
    expect(
      phone.model.layers[3].nodes.some(
        (node) =>
          node.id.startsWith("grid-hour-line-") && node.id.endsWith("-450"),
      ),
    ).toBe(false);
    const phoneLabels = phone.model.layers[3].nodes
      .filter(
        (node) =>
          node.kind === "text" && node.id.startsWith("grid-hour-label-0-"),
      )
      .map((node) => (node.kind === "text" ? node.text : ""));
    expect(phoneLabels).toEqual([
      "7 AM",
      "9",
      "11",
      "1 PM",
      "3",
      "5",
      "7",
      "9",
    ]);
  });

  it("reclaims all title geometry when hidden", () => {
    const project = daysProject(["Mon", "Tue", "Wed"]);
    const titled = buildGridRenderModel(project, project.deviceVariants[0]!);
    project.design.wallpaperTitle.visible = false;
    const hidden = buildGridRenderModel(project, project.deviceVariants[0]!);
    expect(
      hidden.model.layers[3].nodes.some(
        (node) => node.id === "wallpaper-title",
      ),
    ).toBe(false);
    expect(hidden.bandLayout[0]!.bounds.y - hidden.scheduleBounds.y).toBe(0);
    expect(hidden.scheduleBounds.height).toBeLessThan(
      titled.scheduleBounds.height,
    );
  });

  it("uses Grid-specific optical defaults", () => {
    expect(balancedPositionFor("phone", "grid", "portrait")).toEqual({
      x: 0.5,
      y: 0.4,
    });
    expect(balancedPositionFor("desktop", "grid", "landscape")).toEqual({
      x: 0.5,
      y: 0.46,
    });
  });

  it.each([
    ["phone", 1080, 2400, "portrait"],
    ["tablet", 1536, 2048, "portrait"],
    ["tablet", 2048, 1536, "landscape"],
    ["desktop", 1920, 1080, "landscape"],
    ["square", 1080, 1080, "square"],
    ["phone", 1170, 2532, "portrait"],
  ] as const)(
    "preserves exact %s %s × %s export geometry",
    (category, width, height, orientation) => {
      const project = daysProject(["Mon", "Tue", "Wed"]);
      const target = variant(project, {
        category,
        dimensions: { width, height },
        orientation,
      });
      expect(buildGridRenderModel(project, target).model).toMatchObject({
        width,
        height,
      });
    },
  );

  it("keeps every preview-only overlay out of the Grid export model", () => {
    const project = daysProject(["Mon"]);
    const target = {
      ...project.deviceVariants[0]!,
      preview: {
        ...project.deviceVariants[0]!.preview,
        mode: "lock-screen" as const,
        showSafeAreas: true,
        guideAssetId: "private-screen-guide",
      },
    };
    const result = buildGridRenderModel(project, target);
    expect(JSON.stringify(result.model)).not.toMatch(
      /private-screen-guide|safe-area|overlay|lock-screen|alignment-guide/,
    );
  });
});
