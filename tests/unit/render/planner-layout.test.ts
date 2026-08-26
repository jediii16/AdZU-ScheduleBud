import { describe, expect, it } from "vitest";

import { balancedPositionFor } from "@/data/devices/studio-targets";
import { availableLayouts } from "@/data/layouts/registry";
import type { DeviceVariant } from "@/domain/device/types";
import {
  PLANNER_DESKTOP_MAX_PANEL_WIDTH,
  buildPlannerRenderModel,
  buildScheduleRenderModel,
} from "@/domain/render";
import { normalizeSubject } from "@/domain/schedule/normalization";
import type { ScheduleDay } from "@/domain/schedule/types";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

function plannerProject(
  days: readonly ScheduleDay[],
  meetingsPerDay: Partial<Record<ScheduleDay, number>> = {},
) {
  const project = visualScheduleProject();
  let id = 0;
  project.design.layoutId = "planner";
  project.schedule = days.flatMap((day, dayIndex) =>
    Array.from({ length: meetingsPerDay[day] ?? 1 }, (_, meetingIndex) =>
      normalizeSubject(
        {
          code: `PLAN${dayIndex + 1}${meetingIndex + 1}`,
          section: "A",
          meetings: [
            {
              days: [day],
              startTime: `${String(8 + meetingIndex).padStart(2, "0")}:00`,
              endTime: `${String(9 + meetingIndex).padStart(2, "0")}:20`,
              room: "ADV LAB",
              professor: "Jausan, Aleekhaizer J.",
            },
          ],
        },
        (kind) => `planner-${kind}-${++id}`,
      ),
    ),
  );
  return project;
}

function variant(
  project: ReturnType<typeof plannerProject>,
  input: Partial<DeviceVariant> &
    Pick<DeviceVariant, "category" | "dimensions" | "orientation">,
): DeviceVariant {
  return {
    ...project.deviceVariants[0]!,
    id: `planner-${input.category}-${input.dimensions.width}x${input.dimensions.height}`,
    dimensionSource: "custom",
    presetId: null,
    compositionId: `planner-${input.category}`,
    ...input,
  };
}

function rowCounts(result: ReturnType<typeof buildPlannerRenderModel>) {
  return Array.from(new Set(result.dayLayout.map((day) => day.row))).map(
    (row) => result.dayLayout.filter((day) => day.row === row).length,
  );
}

describe("Clean Slate Planner RenderModel", () => {
  it("registers Planner and routes it through the shared layout resolver", () => {
    expect(availableLayouts.map((layout) => layout.id)).toEqual([
      "cards",
      "minimal",
      "grid",
      "planner",
    ]);
    const project = plannerProject(["Mon"]);
    const result = buildScheduleRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    const ids = result.model.layers.flatMap((layer) =>
      layer.nodes.map((node) => node.id),
    );
    expect(ids).toContain("planner-panel-Mon");
    expect(ids.some((id) => id.startsWith("card-"))).toBe(false);
  });

  it("packs five Phone days as 2 + 2 + 1 and centers the final panel", () => {
    const project = plannerProject(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const result = buildPlannerRenderModel(project, project.deviceVariants[0]!);
    expect(rowCounts(result)).toEqual([2, 2, 1]);
    const final = result.dayLayout.at(-1)!;
    expect(final.bounds.x + final.bounds.width / 2).toBeCloseTo(
      result.scheduleBounds.x + result.scheduleBounds.width / 2,
    );
  });

  it("stacks complete canonical times on Phone and narrow Planner panels", () => {
    const project = plannerProject(["Mon"]);
    project.schedule[0]!.code = "CS.412";
    project.schedule[0]!.meetings[0]!.startTime = "11:00";
    project.schedule[0]!.meetings[0]!.endTime = "12:20";

    const phone = buildPlannerRenderModel(project, project.deviceVariants[0]!);
    const phoneTime = phone.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("planner-time-"),
    );
    expect(phone.classLayout[0]!.headerMode).toBe("stacked");
    expect(phoneTime).toMatchObject({
      kind: "text",
      text: "11:00 AM–12:20 PM",
      width: phone.classLayout[0]!.bounds.width,
      wrap: "none",
      align: "left",
    });

    const narrowTablet = variant(project, {
      category: "tablet",
      dimensions: { width: 800, height: 1200 },
      orientation: "portrait",
    });
    const tablet = buildPlannerRenderModel(project, narrowTablet);
    const tabletTime = tablet.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("planner-time-"),
    );
    expect(tablet.classLayout[0]!.headerMode).toBe("stacked");
    expect(tabletTime).toMatchObject({
      kind: "text",
      text: "11:00 AM–12:20 PM",
      width: tablet.classLayout[0]!.bounds.width,
      wrap: "none",
      align: "left",
    });

    const tabletPortraitProject = plannerProject([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
    ]);
    tabletPortraitProject.schedule[0]!.code = "CS.412";
    tabletPortraitProject.schedule[0]!.meetings[0]!.startTime = "08:00";
    tabletPortraitProject.schedule[0]!.meetings[0]!.endTime = "09:20";
    const tabletPortraitTarget = variant(tabletPortraitProject, {
      category: "tablet",
      dimensions: { width: 1536, height: 2048 },
      orientation: "portrait",
    });
    const tabletPortrait = buildPlannerRenderModel(
      tabletPortraitProject,
      tabletPortraitTarget,
    );
    const inlineTime = tabletPortrait.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("planner-time-"),
    );
    expect(inlineTime).toMatchObject({
      kind: "text",
      text: "8:00–9:20 AM",
      width: tabletPortrait.classLayout[0]!.bounds.width,
      wrap: "none",
      align: "right",
    });
  });

  it.each([
    { days: ["Mon", "Tue", "Wed", "Thu", "Fri"] as const, rows: [3, 2] },
    {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const,
      rows: [3, 3],
    },
  ])("packs $days.length Desktop days as $rows", ({ days, rows }) => {
    const project = plannerProject(days);
    const result = buildPlannerRenderModel(project, project.deviceVariants[1]!);
    expect(rowCounts(result)).toEqual(rows);
    expect(
      result.dayLayout.every(
        (day) => day.bounds.width <= PLANNER_DESKTOP_MAX_PANEL_WIDTH,
      ),
    ).toBe(true);
  });

  it("reflows scheduled-only days and preserves blank full-week panels", () => {
    const scheduledProject = plannerProject(["Mon", "Wed", "Fri"]);
    const scheduled = buildPlannerRenderModel(
      scheduledProject,
      scheduledProject.deviceVariants[1]!,
    );
    const fullProject = {
      ...scheduledProject,
      design: {
        ...scheduledProject.design,
        dayVisibility: "full-week" as const,
      },
    };
    const full = buildPlannerRenderModel(
      fullProject,
      fullProject.deviceVariants[1]!,
    );
    expect(scheduled.dayLayout.map((day) => day.day)).toEqual([
      "Mon",
      "Wed",
      "Fri",
    ]);
    expect(full.dayLayout).toHaveLength(6);
    expect(
      full.dayLayout.find((day) => day.day === "Tue")?.occurrenceCount,
    ).toBe(0);
    expect(
      full.model.layers[3].nodes.some(
        (node) => node.kind === "text" && node.text === "No classes",
      ),
    ).toBe(false);
  });

  it("gives every panel in a row the tallest content-driven panel height", () => {
    const project = plannerProject(["Mon", "Tue", "Wed"], { Mon: 3 });
    const result = buildPlannerRenderModel(project, project.deviceVariants[0]!);
    const monday = result.dayLayout.find((day) => day.day === "Mon")!;
    const tuesday = result.dayLayout.find((day) => day.day === "Tue")!;
    const wednesday = result.dayLayout.find((day) => day.day === "Wed")!;
    expect(monday.bounds.height).toBe(tuesday.bounds.height);
    expect(monday.bounds.height).toBeGreaterThan(wednesday.bounds.height);
  });

  it("always renders the complete subject code and never ellipsizes it", () => {
    const project = plannerProject(["Mon"]);
    const code = "VERY-LONG-SUBJECT-CODE-WITH-PUNCTUATION.401A";
    project.schedule[0]!.code = code;
    project.design.visibleFields = {
      time: false,
      room: false,
      professor: false,
      section: false,
    };
    const result = buildPlannerRenderModel(project, project.deviceVariants[0]!);
    const codeNode = result.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("planner-code-"),
    );
    expect(
      codeNode?.kind === "text" ? codeNode.text.replaceAll("\n", "") : "",
    ).toBe(code);
    expect(codeNode?.kind === "text" ? codeNode.text.includes("…") : true).toBe(
      false,
    );
  });

  it("reserves no class-entry space for hidden optional fields", () => {
    const project = plannerProject(["Mon"]);
    const detailed = buildPlannerRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    project.design.visibleFields = {
      time: false,
      room: false,
      professor: false,
      section: false,
    };
    const codeOnly = buildPlannerRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    expect(codeOnly.classLayout[0]!.shownFields).toEqual({
      time: false,
      room: false,
      professor: false,
      section: false,
    });
    expect(codeOnly.classLayout[0]!.bounds.height).toBeLessThan(
      detailed.classLayout[0]!.bounds.height,
    );
    expect(codeOnly.dayLayout[0]!.bounds.height).toBeLessThan(
      detailed.dayLayout[0]!.bounds.height,
    );
  });

  it("reclaims the complete title block when title is hidden", () => {
    const project = plannerProject(["Mon", "Tue"]);
    const titled = buildPlannerRenderModel(project, project.deviceVariants[0]!);
    project.design.wallpaperTitle.visible = false;
    const hidden = buildPlannerRenderModel(project, project.deviceVariants[0]!);
    expect(
      titled.dayLayout[0]!.bounds.y - titled.scheduleBounds.y,
    ).toBeGreaterThan(0);
    expect(hidden.dayLayout[0]!.bounds.y - hidden.scheduleBounds.y).toBe(0);
    expect(
      hidden.model.layers[3].nodes.some((node) => node.id === "planner-title"),
    ).toBe(false);
  });

  it("uses Planner balanced positions without changing exact target dimensions", () => {
    expect(balancedPositionFor("phone", "planner", "portrait")).toEqual({
      x: 0.5,
      y: 0.44,
    });
    expect(balancedPositionFor("tablet", "planner", "portrait")).toEqual({
      x: 0.5,
      y: 0.45,
    });
    expect(balancedPositionFor("desktop", "planner", "landscape")).toEqual({
      x: 0.5,
      y: 0.47,
    });
    expect(balancedPositionFor("square", "planner", "square")).toEqual({
      x: 0.5,
      y: 0.5,
    });
    const project = plannerProject(["Mon"]);
    for (const target of [
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
    ]) {
      const result = buildPlannerRenderModel(project, variant(project, target));
      expect(result.model.width).toBe(target.dimensions.width);
      expect(result.model.height).toBe(target.dimensions.height);
    }
  });
});
