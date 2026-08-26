import { describe, expect, it } from "vitest";

import { availableLayouts } from "@/data/layouts/registry";
import { balancedPositionFor } from "@/data/devices/studio-targets";
import {
  detectSafeAreaCollision,
  resolveSafeAreaModel,
} from "@/domain/device/safe-areas";
import type { DeviceVariant } from "@/domain/device/types";
import {
  MINIMAL_DESKTOP_FIVE_DAY_WIDTH,
  MINIMAL_DESKTOP_MAX_DAY_WIDTH,
  MINIMAL_PHONE_OPTICAL_CONTENT_WIDTH,
  MINIMAL_TABLET_LANDSCAPE_MAX_DAY_WIDTH,
  CLEAN_SLATE_RENDER_THEME,
  buildMinimalRenderModel,
  buildScheduleRenderModel,
  resolveAlignmentSnap,
} from "@/domain/render";
import type { ScheduleDay, Subject } from "@/domain/schedule/types";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

function projectWithDays(
  days: readonly ScheduleDay[],
  meetingsPerDay: Partial<Record<ScheduleDay, number>> = {},
) {
  const source = visualScheduleProject();
  const template = structuredClone(source.schedule[0]!);
  const schedule: Subject[] = days.flatMap((day, dayIndex) =>
    Array.from({ length: meetingsPerDay[day] ?? 1 }, (_, meetingIndex) => ({
      ...structuredClone(template),
      id: `minimal-subject-${day}-${meetingIndex}`,
      code: `MIN ${dayIndex + 1}${meetingIndex + 1}`,
      meetings: [
        {
          ...structuredClone(template.meetings[0]!),
          id: `minimal-meeting-${day}-${meetingIndex}`,
          days: [day],
          startTime: `${String(8 + meetingIndex).padStart(2, "0")}:00`,
          endTime: `${String(8 + meetingIndex).padStart(2, "0")}:50`,
        },
      ],
    })),
  );
  return {
    ...source,
    design: { ...source.design, layoutId: "minimal" as const },
    schedule,
  };
}

function variant(
  project: ReturnType<typeof projectWithDays>,
  input: Partial<DeviceVariant> &
    Pick<DeviceVariant, "category" | "dimensions" | "orientation">,
): DeviceVariant {
  return {
    ...project.deviceVariants[0]!,
    id: `minimal-${input.category}-${input.dimensions.width}x${input.dimensions.height}`,
    dimensionSource: "custom",
    presetId: null,
    compositionId: `minimal-${input.category}`,
    ...input,
  };
}

function phoneProject(days: readonly ScheduleDay[]) {
  const project = projectWithDays(days);
  return buildMinimalRenderModel(project, project.deviceVariants[0]!);
}

describe("Clean Slate Minimal RenderModel", () => {
  it("keeps Minimal available alongside Cards and Grid", () => {
    expect(availableLayouts.map((layout) => layout.id)).toEqual([
      "cards",
      "minimal",
      "grid",
      "planner",
      "photo",
    ]);
  });

  it("uses the central resolver to select monochrome Minimal without card surfaces", () => {
    const project = projectWithDays(["Mon"]);
    const result = buildScheduleRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    const nodes = result.model.layers.flatMap((layer) => layer.nodes);
    expect(nodes.some((node) => node.id.startsWith("marker-"))).toBe(false);
    expect(nodes.some((node) => node.id.startsWith("card-"))).toBe(false);
  });

  it.each([
    { days: ["Mon", "Tue", "Wed", "Thu", "Fri"] as const, rows: [2, 2, 1] },
    { days: ["Mon", "Tue", "Wed"] as const, rows: [2, 1] },
  ])(
    "packs $days.length Phone days as $rows and centers the final row",
    ({ days, rows }) => {
      const result = phoneProject(days);
      const counts = Array.from(
        new Set(result.dayLayout.map((day) => day.row)),
      ).map((row) => result.dayLayout.filter((day) => day.row === row).length);
      expect(counts).toEqual(rows);
      const last = result.dayLayout.at(-1)!;
      expect(last.x + last.width / 2).toBeCloseTo(
        result.scheduleBounds.x + result.scheduleBounds.width / 2,
      );
    },
  );

  it("packs five Square days as 3 + 2 with the last row centered", () => {
    const project = projectWithDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const square = variant(project, {
      category: "square",
      dimensions: { width: 1080, height: 1080 },
      orientation: "square",
    });
    const result = buildMinimalRenderModel(project, square);
    expect(result.columns).toBe(3);
    expect(result.dayLayout.filter((day) => day.row === 0)).toHaveLength(3);
    expect(result.dayLayout.filter((day) => day.row === 1)).toHaveLength(2);
    const final = result.dayLayout.filter((day) => day.row === 1);
    expect((final[0]!.x + final[1]!.x + final[1]!.width) / 2).toBeCloseTo(
      result.scheduleBounds.x + result.scheduleBounds.width / 2,
    );
  });

  it("uses content-driven row heights instead of equal wallpaper bands", () => {
    const result = buildMinimalRenderModel(
      projectWithDays(["Mon", "Tue", "Wed"], { Mon: 3, Tue: 1, Wed: 1 }),
      projectWithDays(["Mon", "Tue", "Wed"], { Mon: 3, Tue: 1, Wed: 1 })
        .deviceVariants[0]!,
    );
    const monday = result.dayLayout.find((day) => day.day === "Mon")!;
    const tuesday = result.dayLayout.find((day) => day.day === "Tue")!;
    const wednesday = result.dayLayout.find((day) => day.day === "Wed")!;
    expect(monday.height).toBeGreaterThan(tuesday.height);
    expect(wednesday.y - (monday.y + monday.height)).toBe(57);
  });

  it("keeps a centered Phone bound while optically centering column content", () => {
    const result = phoneProject(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const monday = result.dayLayout.find((day) => day.day === "Mon")!;
    const heading = result.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id === "day-Mon",
    );
    expect(
      result.scheduleBounds.x + result.scheduleBounds.width / 2,
    ).toBeCloseTo(540);
    expect(heading?.kind === "text" ? heading.position.x - monday.x : 0).toBe(
      (monday.width - MINIMAL_PHONE_OPTICAL_CONTENT_WIDTH) / 2,
    );
    const rule = result.model.layers[3].nodes.find(
      (node) => node.kind === "line" && node.id === "day-line-Mon",
    );
    expect(
      rule?.kind === "line" ? rule.points[1]!.x - rule.points[0]!.x : 0,
    ).toBeCloseTo(monday.width * 0.3);
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
      dimensions: { width: 1080, height: 1080 },
      orientation: "square" as const,
    },
  ])("aligns $category Minimal class text with its weekday axis", (target) => {
    const project = projectWithDays(["Mon"]);
    const result = buildMinimalRenderModel(project, variant(project, target));
    const nodes = result.model.layers.flatMap((layer) => layer.nodes);
    const heading = nodes.find(
      (node) => node.kind === "text" && node.id === "day-Mon",
    );
    const code = nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("code-Mon-"),
    );
    const time = nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("time-Mon-"),
    );
    expect(heading?.kind).toBe("text");
    expect(code?.kind).toBe("text");
    expect(time?.kind).toBe("text");
    if (
      heading?.kind !== "text" ||
      code?.kind !== "text" ||
      time?.kind !== "text"
    )
      return;
    expect(code.position.x).toBe(heading.position.x);
    expect(time.position.x).toBe(heading.position.x);
  });

  it("caps and centers sparse Desktop columns", () => {
    const project = projectWithDays(["Mon", "Wed", "Fri"]);
    const result = buildMinimalRenderModel(project, project.deviceVariants[1]!);
    expect(result.dayLayout).toHaveLength(3);
    expect(
      result.dayLayout.every(
        (day) => day.width <= MINIMAL_DESKTOP_MAX_DAY_WIDTH,
      ),
    ).toBe(true);
    expect(MINIMAL_DESKTOP_MAX_DAY_WIDTH).toBe(350);
    expect(result.scheduleBounds.width).toBeGreaterThan(1100);
    expect(
      result.scheduleBounds.x + result.scheduleBounds.width / 2,
    ).toBeCloseTo(960);
  });

  it("centers a tighter five-day Desktop composition with shorter rules", () => {
    const project = projectWithDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    const result = buildMinimalRenderModel(project, project.deviceVariants[1]!);
    expect(result.scheduleBounds.width).toBe(MINIMAL_DESKTOP_FIVE_DAY_WIDTH);
    expect(
      result.scheduleBounds.x + result.scheduleBounds.width / 2,
    ).toBeCloseTo(960);
    const monday = result.dayLayout.find((day) => day.day === "Mon")!;
    const rule = result.model.layers[3].nodes.find(
      (node) => node.kind === "line" && node.id === "day-line-Mon",
    );
    expect(rule?.kind).toBe("line");
    if (rule?.kind !== "line") return;
    const visibleLength = rule.points[1]!.x - rule.points[0]!.x;
    const availableLength = monday.x + monday.width - rule.points[0]!.x;
    expect(visibleLength / availableLength).toBeCloseTo(0.6);
  });

  it("reserves enough inline heading width for Wednesday in a six-day Desktop row", () => {
    const project = projectWithDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    const result = buildMinimalRenderModel(project, project.deviceVariants[1]!);
    const heading = result.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id === "day-Wed",
    );
    expect(heading?.kind === "text" ? heading.width : 0).toBeGreaterThan(130);
  });

  it("uses a readable Tablet portrait and a 3 + 2 landscape composition", () => {
    const project = projectWithDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
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
    const portraitResult = buildMinimalRenderModel(project, portrait);
    const landscapeResult = buildMinimalRenderModel(project, landscape);
    expect(portraitResult.columns).toBe(3);
    expect(landscapeResult.columns).toBe(3);
    expect(
      [0, 1].map(
        (row) =>
          landscapeResult.dayLayout.filter((day) => day.row === row).length,
      ),
    ).toEqual([3, 2]);
    const secondRow = landscapeResult.dayLayout.filter((day) => day.row === 1);
    expect(
      (secondRow[0]!.x + secondRow[1]!.x + secondRow[1]!.width) / 2,
    ).toBeCloseTo(
      landscapeResult.scheduleBounds.x +
        landscapeResult.scheduleBounds.width / 2,
    );
    expect(landscapeResult.dayLayout[0]!.width).toBe(
      MINIMAL_TABLET_LANDSCAPE_MAX_DAY_WIDTH,
    );
  });

  it("packs six Tablet landscape days as 3 + 3", () => {
    const project = projectWithDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    const landscape = variant(project, {
      category: "tablet",
      dimensions: { width: 2048, height: 1536 },
      orientation: "landscape",
    });
    const result = buildMinimalRenderModel(project, landscape);
    expect(result.columns).toBe(3);
    expect(
      [0, 1].map(
        (row) => result.dayLayout.filter((day) => day.row === row).length,
      ),
    ).toEqual([3, 3]);
  });

  it("gives sparse Phone schedules more useful width without changing packing", () => {
    const sparse = phoneProject(["Mon", "Tue", "Wed"]);
    const packed = phoneProject(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    expect(sparse.dayLayout[0]!.width).toBeGreaterThan(
      packed.dayLayout[0]!.width,
    );
    expect(sparse.dayLayout.filter((day) => day.row === 1)).toHaveLength(1);
  });

  it("reflows scheduled-only days and intentionally restores empty full-week headings", () => {
    const base = projectWithDays(["Mon", "Wed", "Fri"]);
    const scheduled = buildMinimalRenderModel(base, base.deviceVariants[1]!);
    const full = {
      ...base,
      design: { ...base.design, dayVisibility: "full-week" as const },
    };
    const fullResult = buildMinimalRenderModel(full, full.deviceVariants[1]!);
    expect(scheduled.dayLayout.map((day) => day.day)).toEqual([
      "Mon",
      "Wed",
      "Fri",
    ]);
    expect(fullResult.dayLayout).toHaveLength(6);
    expect(
      fullResult.dayLayout.find((day) => day.day === "Sat")?.occurrenceCount,
    ).toBe(0);
    expect(fullResult.classLayout.some((item) => item.day === "Sat")).toBe(
      false,
    );
  });

  it("does not render or reveal days from disabled and incomplete subjects", () => {
    const project = projectWithDays(["Mon", "Tue"]);
    project.schedule[0]!.enabled = false;
    project.schedule[1]!.meetings[0]!.endTime = "";
    const result = buildMinimalRenderModel(project, project.deviceVariants[0]!);
    expect(result.dayLayout).toEqual([]);
    expect(result.classLayout).toEqual([]);
  });

  it("reclaims title geometry completely when the title is hidden", () => {
    const project = projectWithDays(["Mon", "Tue", "Wed"]);
    const titled = buildMinimalRenderModel(project, project.deviceVariants[0]!);
    const hidden = {
      ...project,
      design: {
        ...project.design,
        wallpaperTitle: { ...project.design.wallpaperTitle, visible: false },
      },
    };
    const untitled = buildMinimalRenderModel(hidden, hidden.deviceVariants[0]!);
    expect(
      titled.model.layers[3].nodes.some(
        (node) => node.id === "wallpaper-title",
      ),
    ).toBe(true);
    expect(
      untitled.model.layers[3].nodes.some(
        (node) => node.id === "wallpaper-title",
      ),
    ).toBe(false);
    expect(untitled.dayLayout[0]!.y - untitled.scheduleBounds.y).toBe(0);
    expect(untitled.scheduleBounds.height).toBeLessThan(
      titled.scheduleBounds.height,
    );
  });

  it("renders the subject code as the sole class identifier", () => {
    const source = visualScheduleProject();
    const project = {
      ...source,
      design: { ...source.design, layoutId: "minimal" as const },
      schedule: [source.schedule[0]!],
    };
    const result = buildMinimalRenderModel(project, project.deviceVariants[0]!);
    expect(
      result.model.layers[3].nodes.filter(
        (node) => node.kind === "text" && node.text === "CS.412",
      ),
    ).toHaveLength(2);
  });

  it.each(["CS.412", "COMPINTRO", "PATHFIT1n"])(
    "renders realistic subject code %s without a secondary identifier",
    (code) => {
      const project = projectWithDays(["Mon"]);
      project.schedule[0]!.code = code;
      const result = buildMinimalRenderModel(
        project,
        project.deviceVariants[0]!,
      );
      const codeNode = result.model.layers[3].nodes.find(
        (node) => node.kind === "text" && node.id.startsWith("code-"),
      );
      expect(codeNode?.kind === "text" ? codeNode.text : null).toBe(code);
    },
  );

  it("fits a long subject code and long room/section values independently", () => {
    const project = projectWithDays(["Mon"]);
    project.schedule[0]!.code = "VERY-LONG-SUBJECT-CODE-WITH-PUNCTUATION.401A";
    project.schedule[0]!.section =
      "Research and Development Section With A Long Identifier";
    project.schedule[0]!.meetings[0]!.room =
      "Advanced Computing Laboratory With A Long Room Identifier";
    const result = buildMinimalRenderModel(project, project.deviceVariants[0]!);
    const codeNode = result.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("code-"),
    );
    const supportNode = result.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("support-"),
    );
    expect(codeNode?.kind).toBe("text");
    expect(
      codeNode?.kind === "text" ? codeNode.text.length : 0,
    ).toBeGreaterThan(0);
    expect(
      supportNode?.kind === "text" ? supportNode.text.endsWith("…") : false,
    ).toBe(true);
  });

  it("always renders the subject code while honoring optional detail visibility", () => {
    const project = projectWithDays(["Mon"]);
    project.design.visibleFields = {
      time: false,
      room: false,
      professor: false,
      section: false,
    };
    const result = buildMinimalRenderModel(project, project.deviceVariants[0]!);
    const texts = result.model.layers[3].nodes
      .filter((node) => node.kind === "text")
      .map((node) => node.text);
    expect(texts).toContain("MIN 11");
    expect(texts.join(" ")).not.toMatch(/8:00|ICT 301|Prof\./);
  });

  it("ellipsizes long professor text without shrinking the target scale", () => {
    const project = projectWithDays(["Wed"]);
    project.schedule[0]!.meetings[0]!.professor =
      "Professor With An Extremely Long Professional Display Name That Must Fit";
    const result = buildMinimalRenderModel(project, project.deviceVariants[0]!);
    const professor = result.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("professor-"),
    );
    expect(
      professor?.kind === "text" ? professor.text.endsWith("…") : false,
    ).toBe(true);
  });

  it("ignores subject colors and emits no per-class color markers", () => {
    const project = projectWithDays(["Mon"]);
    const subjectId = project.schedule[0]!.id;
    project.design.subjectColors = {
      mode: "per-subject",
      singleColor: null,
      bySubjectId: { [subjectId]: "#123456" },
    };
    const result = buildMinimalRenderModel(project, project.deviceVariants[0]!);
    const nodes = result.model.layers[3].nodes;
    expect(nodes.some((node) => node.id.startsWith("marker-"))).toBe(false);
    expect(
      nodes.some(
        (node) =>
          (node.kind === "rect" && node.fill === "#123456") ||
          (node.kind === "line" && node.stroke === "#123456") ||
          (node.kind === "text" && node.fill === "#123456"),
      ),
    ).toBe(false);
  });

  it("uses Minimal-only support contrast and neutral weekday rules", () => {
    const project = projectWithDays(["Mon"]);
    const result = buildMinimalRenderModel(project, project.deviceVariants[0]!);
    const support = result.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("support-"),
    );
    const professor = result.model.layers[3].nodes.find(
      (node) => node.kind === "text" && node.id.startsWith("professor-"),
    );
    expect(support?.kind === "text" ? support.fill : null).toBe(
      CLEAN_SLATE_RENDER_THEME.minimalSupport,
    );
    expect(professor?.kind === "text" ? professor.fill : null).toBe(
      CLEAN_SLATE_RENDER_THEME.minimalSupport,
    );
    const dayRule = result.model.layers[3].nodes.find(
      (node) => node.kind === "line" && node.id.startsWith("day-line-"),
    );
    expect(dayRule?.kind === "line" ? dayRule.stroke : null).toBe(
      CLEAN_SLATE_RENDER_THEME.minimalRule,
    );
    expect(dayRule?.kind === "line" ? dayRule.stroke : null).not.toBe(
      CLEAN_SLATE_RENDER_THEME.dayAccent,
    );
  });

  it("uses independent Phone and Desktop typography scales", () => {
    const project = projectWithDays(["Mon"]);
    const phone = buildMinimalRenderModel(project, project.deviceVariants[0]!);
    const desktop = buildMinimalRenderModel(
      project,
      project.deviceVariants[1]!,
    );
    expect(phone.typography).toMatchObject({
      title: 64,
      day: 36,
      code: 34,
      time: 27,
    });
    expect(desktop.typography).toMatchObject({
      title: 54,
      day: 28,
      code: 25,
      time: 19,
    });
  });

  it("uses revised optical defaults only when Minimal is reset or newly placed", () => {
    expect(balancedPositionFor("phone", "minimal", "portrait")).toEqual({
      x: 0.5,
      y: 0.38,
    });
    expect(balancedPositionFor("tablet", "minimal", "landscape")).toEqual({
      x: 0.5,
      y: 0.37,
    });
    expect(balancedPositionFor("desktop", "minimal", "landscape")).toEqual({
      x: 0.5,
      y: 0.42,
    });
    expect(balancedPositionFor("desktop", "cards", "landscape")).toEqual({
      x: 0.5,
      y: 0.45,
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
      const project = projectWithDays(["Mon", "Tue", "Wed"]);
      const target = variant(project, {
        category,
        dimensions: { width, height },
        orientation,
      });
      expect(buildMinimalRenderModel(project, target).model).toMatchObject({
        width,
        height,
      });
    },
  );

  it("keeps overlays and screen guides out of the Minimal export model", () => {
    const project = projectWithDays(["Mon"]);
    const target = {
      ...project.deviceVariants[0]!,
      preview: {
        ...project.deviceVariants[0]!.preview,
        mode: "lock-screen" as const,
        showSafeAreas: true,
        guideAssetId: "private-screen-guide",
      },
    };
    const result = buildMinimalRenderModel(project, target);
    expect(JSON.stringify(result.model)).not.toMatch(
      /private-screen-guide|safe-area|overlay|lock-screen/,
    );
  });

  it("uses Minimal bounds for safe-area collision and shared snapping", () => {
    const project = projectWithDays(["Mon", "Tue", "Wed"]);
    const target = {
      ...project.deviceVariants[0]!,
      schedulePosition: { x: 0.5, y: 0 },
      preview: {
        ...project.deviceVariants[0]!.preview,
        mode: "lock-screen" as const,
      },
    };
    const result = buildMinimalRenderModel(project, target);
    expect(
      detectSafeAreaCollision(
        result.scheduleBounds,
        resolveSafeAreaModel(target),
      ).status,
    ).not.toBe("clear");
    const centered = {
      x: result.model.width / 2 - result.scheduleBounds.width / 2 + 1,
      y: result.model.height / 2 - result.scheduleBounds.height / 2 + 1,
    };
    const snap = resolveAlignmentSnap({
      proposedOrigin: centered,
      scheduleSize: result.scheduleBounds,
      canvasSize: result.model,
      positionRange: result.positionRange,
      previewScale: 1,
      enabled: true,
    });
    expect(snap.guides).toMatchObject({
      verticalCenter: true,
      horizontalCenter: true,
    });
  });
});
