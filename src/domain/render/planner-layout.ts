import {
  resolveTargetComposition,
  type TargetCompositionFamily,
} from "@/domain/device/composition";
import type { DeviceVariant, VisibleFields } from "@/domain/device/types";
import type { ScheduleProject } from "@/domain/project";
import {
  expandOccurrences,
  type ScheduleOccurrence,
} from "@/domain/schedule/occurrences";
import type { ScheduleDay, Subject } from "@/domain/schedule/types";
import { resolveLayoutVisibleFields } from "./layout-capabilities";
import { fitText, type FittedText } from "./text-fit";
import {
  CLEAN_SLATE_RENDER_THEME,
  type CleanSlateRenderTheme,
} from "./themes/clean-slate";
import type {
  Rect,
  RenderModel,
  RenderNode,
  ScheduleRenderResult,
  TextRenderNode,
} from "./types";

const DAYS: readonly ScheduleDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES: Record<ScheduleDay, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

export const PLANNER_DESKTOP_MAX_PANEL_WIDTH = 480;

export type PlannerTypography = {
  title: number;
  day: number;
  code: number;
  time: number;
  support: number;
  professor: number;
};

export type PlannerDayLayout = {
  day: ScheduleDay;
  bounds: Rect;
  row: number;
  column: number;
  occurrenceCount: number;
};

export type PlannerClassLayout = {
  occurrenceId: string;
  day: ScheduleDay;
  bounds: Rect;
  headerMode: "inline" | "stacked";
  codeText: string;
  shownFields: VisibleFields;
};

export type PlannerRenderResult = ScheduleRenderResult & {
  compositionFamily: TargetCompositionFamily;
  typography: PlannerTypography;
  columns: number;
  dayLayout: readonly PlannerDayLayout[];
  classLayout: readonly PlannerClassLayout[];
};

type PlannerMetrics = {
  margin: number;
  columnGap: number;
  rowGap: number;
  panelPadding: number;
  panelRadius: number;
  titleTextHeight: number;
  titleGap: number;
  dayTextHeight: number;
  dayRuleGap: number;
  headerRuleGap: number;
  codeLineHeight: number;
  timeLineHeight: number;
  supportLineHeight: number;
  professorLineHeight: number;
  metadataGap: number;
  entryGap: number;
};

type CodeFit = FittedText & { truncated: false };
type ClassPlan = {
  occurrence: ScheduleOccurrence;
  subject: Subject;
  code: CodeFit;
  time: string;
  support: FittedText | null;
  professor: FittedText | null;
  headerMode: "inline" | "stacked";
  height: number;
};

function textNode(
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  fill: string,
  options: Partial<TextRenderNode> = {},
): TextRenderNode {
  return {
    id,
    kind: "text",
    position: { x, y },
    width,
    text,
    fontId: "body-sans",
    fontSize,
    fill,
    ...options,
  };
}

function translateNode(node: RenderNode, x: number, y: number): RenderNode {
  if (node.kind === "rect" || node.kind === "image")
    return {
      ...node,
      geometry: {
        ...node.geometry,
        x: node.geometry.x + x,
        y: node.geometry.y + y,
      },
    };
  if (node.kind === "text")
    return {
      ...node,
      position: { x: node.position.x + x, y: node.position.y + y },
    };
  return {
    ...node,
    points: node.points.map((point) => ({ x: point.x + x, y: point.y + y })),
  };
}

function typographyFor(
  family: TargetCompositionFamily,
  scale: number,
): PlannerTypography {
  const base: Record<TargetCompositionFamily, PlannerTypography> = {
    phonePortrait: {
      title: 64,
      day: 36,
      code: 32,
      time: 26,
      support: 24,
      professor: 22,
    },
    tabletPortrait: {
      title: 76,
      day: 40,
      code: 36,
      time: 29,
      support: 27,
      professor: 25,
    },
    tabletLandscape: {
      title: 62,
      day: 32,
      code: 29,
      time: 23,
      support: 21,
      professor: 19,
    },
    desktopLandscape: {
      title: 50,
      day: 25,
      code: 23,
      time: 18,
      support: 16,
      professor: 15,
    },
    square: {
      title: 52,
      day: 27,
      code: 24,
      time: 19,
      support: 17,
      professor: 16,
    },
  };
  return Object.fromEntries(
    Object.entries(base[family]).map(([key, value]) => [
      key,
      Math.round(value * scale),
    ]),
  ) as PlannerTypography;
}

function metricsFor(family: TargetCompositionFamily): PlannerMetrics {
  const metrics: Record<TargetCompositionFamily, PlannerMetrics> = {
    phonePortrait: {
      margin: 54,
      columnGap: 30,
      rowGap: 34,
      panelPadding: 26,
      panelRadius: 14,
      titleTextHeight: 82,
      titleGap: 34,
      dayTextHeight: 50,
      dayRuleGap: 12,
      headerRuleGap: 24,
      codeLineHeight: 40,
      timeLineHeight: 34,
      supportLineHeight: 31,
      professorLineHeight: 29,
      metadataGap: 8,
      entryGap: 22,
    },
    tabletPortrait: {
      margin: 72,
      columnGap: 42,
      rowGap: 46,
      panelPadding: 32,
      panelRadius: 14,
      titleTextHeight: 96,
      titleGap: 40,
      dayTextHeight: 56,
      dayRuleGap: 15,
      headerRuleGap: 28,
      codeLineHeight: 45,
      timeLineHeight: 38,
      supportLineHeight: 35,
      professorLineHeight: 33,
      metadataGap: 9,
      entryGap: 25,
    },
    tabletLandscape: {
      margin: 82,
      columnGap: 38,
      rowGap: 42,
      panelPadding: 27,
      panelRadius: 10,
      titleTextHeight: 76,
      titleGap: 30,
      dayTextHeight: 44,
      dayRuleGap: 12,
      headerRuleGap: 22,
      codeLineHeight: 37,
      timeLineHeight: 30,
      supportLineHeight: 28,
      professorLineHeight: 26,
      metadataGap: 7,
      entryGap: 20,
    },
    desktopLandscape: {
      margin: 68,
      columnGap: 34,
      rowGap: 36,
      panelPadding: 24,
      panelRadius: 9,
      titleTextHeight: 62,
      titleGap: 26,
      dayTextHeight: 35,
      dayRuleGap: 10,
      headerRuleGap: 19,
      codeLineHeight: 30,
      timeLineHeight: 24,
      supportLineHeight: 22,
      professorLineHeight: 21,
      metadataGap: 6,
      entryGap: 17,
    },
    square: {
      margin: 58,
      columnGap: 30,
      rowGap: 34,
      panelPadding: 22,
      panelRadius: 10,
      titleTextHeight: 64,
      titleGap: 26,
      dayTextHeight: 37,
      dayRuleGap: 10,
      headerRuleGap: 20,
      codeLineHeight: 31,
      timeLineHeight: 25,
      supportLineHeight: 23,
      professorLineHeight: 22,
      metadataGap: 6,
      entryGap: 18,
    },
  };
  return metrics[family];
}

export function resolvePlannerColumnCount(
  family: TargetCompositionFamily,
  dayCount: number,
): number {
  if (dayCount <= 1) return Math.max(1, dayCount);
  if (family === "phonePortrait" || family === "tabletPortrait") return 2;
  if (dayCount === 4 || dayCount === 2) return 2;
  return 3;
}

function timePart(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return {
    clock: `${hours! % 12 || 12}:${String(minutes).padStart(2, "0")}`,
    period: hours! < 12 ? "AM" : "PM",
  };
}

function timeRange(start: string, end: string, format: "12-hour" | "24-hour") {
  if (format === "24-hour") return `${start}–${end}`;
  const left = timePart(start);
  const right = timePart(end);
  return left.period === right.period
    ? `${left.clock}–${right.clock} ${right.period}`
    : `${left.clock} ${left.period}–${right.clock} ${right.period}`;
}

function fitCode(text: string, width: number, preferred: number): CodeFit {
  const value = text.trim();
  const minimum = Math.max(12, preferred - 5);
  for (let size = preferred; size >= minimum; size -= 1) {
    if (value.length * size * 0.62 <= width)
      return {
        text: value,
        fontSize: size,
        lineHeight: 1.16,
        lines: 1,
        truncated: false,
      };
  }
  const charactersPerLine = Math.max(1, Math.floor(width / (minimum * 0.62)));
  const lines = Array.from(
    { length: Math.ceil(value.length / charactersPerLine) },
    (_, index) =>
      value.slice(index * charactersPerLine, (index + 1) * charactersPerLine),
  );
  return {
    text: lines.join("\n"),
    fontSize: minimum,
    lineHeight: 1.16,
    lines: lines.length,
    truncated: false,
  };
}

function estimatedTextWidth(text: string, fontSize: number): number {
  const estimated = Array.from(text).reduce((width, character) => {
    if (character === " ") return width + fontSize * 0.34;
    if (character === ":" || character === ".") return width + fontSize * 0.32;
    if (character === "–" || character === "-") return width + fontSize * 0.58;
    if (/\d/.test(character)) return width + fontSize * 0.59;
    if (/[A-Z]/.test(character)) return width + fontSize * 0.7;
    return width + fontSize * 0.58;
  }, 0);
  return Math.ceil(estimated * 1.12);
}

function makeClassPlan(
  project: ScheduleProject,
  occurrence: ScheduleOccurrence,
  subject: Subject,
  fields: VisibleFields,
  family: TargetCompositionFamily,
  width: number,
  typography: PlannerTypography,
  metrics: PlannerMetrics,
): ClassPlan {
  const time = fields.time
    ? timeRange(
        occurrence.startTime,
        occurrence.endTime,
        project.design.clockFormat,
      )
    : "";
  const supportText = [
    fields.room ? occurrence.room.trim() : "",
    fields.section && subject.section.trim()
      ? `Sec ${subject.section.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const timeWidth = time ? estimatedTextWidth(time, typography.time) : 0;
  const preferredCodeWidth = estimatedTextWidth(
    subject.code.trim(),
    typography.code,
  );
  const headerGap = Math.max(18, typography.time);
  const inline =
    family !== "phonePortrait" &&
    Boolean(time) &&
    width >= preferredCodeWidth + timeWidth + headerGap;
  const codeWidth = inline ? Math.max(1, width - timeWidth - headerGap) : width;
  const code = fitCode(subject.code, codeWidth, typography.code);
  const headerMode = inline && code.lines === 1 ? "inline" : "stacked";
  const support = supportText
    ? fitText({
        text: supportText,
        width,
        preferredFontSize: typography.support,
        minimumFontSize: Math.max(11, typography.support - 3),
        maximumLines: 1,
      })
    : null;
  const professorText = fields.professor ? occurrence.professor.trim() : "";
  const professor = professorText
    ? fitText({
        text: professorText,
        width,
        preferredFontSize: typography.professor,
        minimumFontSize: typography.professor,
        maximumLines: 1,
      })
    : null;
  const codeHeight = metrics.codeLineHeight * code.lines;
  let height = codeHeight;
  if (time && headerMode === "stacked") height += metrics.timeLineHeight;
  if (support || professor) height += metrics.metadataGap;
  if (support) height += metrics.supportLineHeight;
  if (professor) height += metrics.professorLineHeight;
  return {
    occurrence,
    subject,
    code,
    time,
    support,
    professor,
    headerMode,
    height: Math.ceil(height),
  };
}

function drawClass(
  nodes: RenderNode[],
  plan: ClassPlan,
  day: ScheduleDay,
  x: number,
  y: number,
  width: number,
  typography: PlannerTypography,
  metrics: PlannerMetrics,
  theme: CleanSlateRenderTheme,
) {
  const id = `${day}-${plan.occurrence.id}`;
  const timeWidth = plan.time
    ? estimatedTextWidth(plan.time, typography.time)
    : 0;
  const codeWidth =
    plan.headerMode === "inline"
      ? width - timeWidth - Math.max(18, typography.time)
      : width;
  nodes.push(
    textNode(
      `planner-code-${id}`,
      plan.code.text,
      x,
      y,
      codeWidth,
      plan.code.fontSize,
      theme.foreground,
      {
        fontWeight: 700,
        height: metrics.codeLineHeight * plan.code.lines,
        lineHeight: plan.code.lineHeight,
        wrap: plan.code.lines > 1 ? "character" : "none",
      },
    ),
  );
  let cursor = y + metrics.codeLineHeight * plan.code.lines;
  if (plan.time) {
    const timeY =
      plan.headerMode === "inline"
        ? y + Math.max(0, (metrics.codeLineHeight - metrics.timeLineHeight) / 2)
        : cursor;
    nodes.push(
      textNode(
        `planner-time-${id}`,
        plan.time,
        x,
        timeY,
        width,
        typography.time,
        theme.secondary,
        {
          fontWeight: 500,
          height: metrics.timeLineHeight,
          align: plan.headerMode === "inline" ? "right" : "left",
          wrap: "none",
        },
      ),
    );
    if (plan.headerMode === "stacked") cursor += metrics.timeLineHeight;
  }
  if (plan.support || plan.professor) cursor += metrics.metadataGap;
  if (plan.support) {
    nodes.push(
      textNode(
        `planner-support-${id}`,
        plan.support.text,
        x,
        cursor,
        width,
        plan.support.fontSize,
        theme.plannerSupport,
        { fontWeight: 500, height: metrics.supportLineHeight, wrap: "none" },
      ),
    );
    cursor += metrics.supportLineHeight;
  }
  if (plan.professor)
    nodes.push(
      textNode(
        `planner-professor-${id}`,
        plan.professor.text,
        x,
        cursor,
        width,
        plan.professor.fontSize,
        theme.muted,
        { height: metrics.professorLineHeight, wrap: "none" },
      ),
    );
}

export function buildPlannerRenderModel(
  project: ScheduleProject,
  variant: DeviceVariant,
  theme: CleanSlateRenderTheme = CLEAN_SLATE_RENDER_THEME,
): PlannerRenderResult {
  const { width, height } = variant.dimensions;
  const family = resolveTargetComposition(variant);
  const typography = typographyFor(family, project.design.typography.scale);
  const metrics = metricsFor(family);
  const fields = resolveLayoutVisibleFields(
    "planner",
    project.design.visibleFields,
    variant,
  );
  const titleVisible =
    project.design.wallpaperTitle.visible &&
    project.design.wallpaperTitle.text.trim().length > 0;
  const titleBlockHeight = titleVisible
    ? metrics.titleTextHeight + metrics.titleGap
    : 0;
  const subjects = new Map(
    project.schedule.map((subject) => [subject.id, subject]),
  );
  const occurrences = expandOccurrences(project.schedule, "full").toSorted(
    (left, right) =>
      left.startMinutes - right.startMinutes ||
      left.subjectCode.localeCompare(right.subjectCode),
  );
  const byDay = new Map(
    DAYS.map((day) => [
      day,
      occurrences.filter((item) => item.actualDays[0] === day),
    ]),
  );
  const activeDays = DAYS.filter((day) => (byDay.get(day)?.length ?? 0) > 0);
  const visibleDays =
    project.design.dayVisibility === "full-week" ? DAYS : activeDays;
  const columns = resolvePlannerColumnCount(family, visibleDays.length);
  const availableWidth = width - metrics.margin * 2;
  const maxPanelWidth =
    family === "desktopLandscape"
      ? PLANNER_DESKTOP_MAX_PANEL_WIDTH
      : family === "tabletLandscape"
        ? 560
        : family === "square"
          ? 420
          : 720;
  const regularPanelWidth = Math.min(
    maxPanelWidth,
    (availableWidth - metrics.columnGap * Math.max(0, columns - 1)) /
      Math.max(1, columns),
  );
  const pairedWidth = Math.min(
    maxPanelWidth,
    (availableWidth - metrics.columnGap) / 2,
  );
  const singleWidth = Math.min(
    availableWidth * 0.72,
    Math.max(regularPanelWidth, pairedWidth * 1.35),
    family === "phonePortrait" ? 700 : maxPanelWidth,
  );
  const panelWidth = visibleDays.length === 1 ? singleWidth : regularPanelWidth;
  const groupWidth =
    visibleDays.length === 0
      ? 1
      : visibleDays.length === 1
        ? panelWidth
        : columns * panelWidth + metrics.columnGap * Math.max(0, columns - 1);
  const plans = visibleDays.map((day, index) => {
    const row = Math.floor(index / columns);
    const rowStart = row * columns;
    const rowCount = Math.min(columns, visibleDays.length - rowStart);
    const contentWidth = Math.max(1, panelWidth - metrics.panelPadding * 2);
    const classes = (byDay.get(day) ?? []).map((occurrence) =>
      makeClassPlan(
        project,
        occurrence,
        subjects.get(occurrence.subjectId)!,
        fields,
        family,
        contentWidth,
        typography,
        metrics,
      ),
    );
    const contentHeight =
      metrics.panelPadding +
      metrics.dayTextHeight +
      metrics.dayRuleGap +
      metrics.headerRuleGap +
      classes.reduce((sum, item) => sum + item.height, 0) +
      Math.max(0, classes.length - 1) * metrics.entryGap +
      metrics.panelPadding;
    return {
      day,
      row,
      column: index % columns,
      rowCount,
      classes,
      contentHeight,
    };
  });
  const rowCount = plans.reduce(
    (maximum, plan) => Math.max(maximum, plan.row + 1),
    0,
  );
  const rowHeights = Array.from({ length: rowCount }, (_, row) =>
    Math.max(
      ...plans
        .filter((plan) => plan.row === row)
        .map((plan) => plan.contentHeight),
    ),
  );
  const rowTops = rowHeights.map(
    (_, row) =>
      titleBlockHeight +
      rowHeights.slice(0, row).reduce((sum, value) => sum + value, 0) +
      row * metrics.rowGap,
  );
  const groupHeight = Math.max(
    1,
    titleBlockHeight +
      rowHeights.reduce((sum, value) => sum + value, 0) +
      Math.max(0, rowCount - 1) * metrics.rowGap,
  );
  const movableX = Math.max(0, width - metrics.margin * 2 - groupWidth);
  const movableY = Math.max(0, height - metrics.margin * 2 - groupHeight);
  const originX = metrics.margin + movableX * variant.schedulePosition.x;
  const originY = metrics.margin + movableY * variant.schedulePosition.y;
  const nodes: RenderNode[] = [];
  if (titleVisible) {
    const fit = fitText({
      text: project.design.wallpaperTitle.text,
      width: groupWidth,
      preferredFontSize: typography.title,
      minimumFontSize: Math.max(26, typography.title - 10),
      maximumLines: 1,
    });
    nodes.push(
      textNode(
        "planner-title",
        fit.text,
        0,
        0,
        groupWidth,
        fit.fontSize,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 700,
          height: metrics.titleTextHeight,
          verticalAlign: "middle",
          wrap: "none",
        },
      ),
    );
  }
  const dayLayout: PlannerDayLayout[] = [];
  const classLayout: PlannerClassLayout[] = [];
  for (const plan of plans) {
    const rowWidth =
      plan.rowCount * panelWidth +
      metrics.columnGap * Math.max(0, plan.rowCount - 1);
    const x =
      (groupWidth - rowWidth) / 2 +
      plan.column * (panelWidth + metrics.columnGap);
    const y = rowTops[plan.row]!;
    const panelHeight = rowHeights[plan.row]!;
    nodes.push({
      id: `planner-panel-${plan.day}`,
      kind: "rect",
      geometry: { x, y, width: panelWidth, height: panelHeight },
      fill: theme.plannerSurface,
      stroke: theme.plannerBorder,
      strokeWidth: 1,
      cornerRadius: metrics.panelRadius,
    });
    const contentX = x + metrics.panelPadding;
    const contentWidth = panelWidth - metrics.panelPadding * 2;
    const dayY = y + metrics.panelPadding;
    const dayFit = fitText({
      text: DAY_NAMES[plan.day],
      width: contentWidth,
      preferredFontSize: typography.day,
      minimumFontSize: Math.max(14, typography.day - 8),
      maximumLines: 1,
    });
    nodes.push(
      textNode(
        `planner-day-${plan.day}`,
        dayFit.text,
        contentX,
        dayY,
        contentWidth,
        dayFit.fontSize,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 600,
          height: metrics.dayTextHeight,
          wrap: "none",
        },
      ),
    );
    const ruleY = dayY + metrics.dayTextHeight + metrics.dayRuleGap;
    nodes.push({
      id: `planner-day-rule-${plan.day}`,
      kind: "line",
      points: [
        { x: contentX, y: ruleY },
        { x: contentX + contentWidth, y: ruleY },
      ],
      stroke: theme.plannerBorder,
      strokeWidth: 1,
    });
    let classY = ruleY + metrics.headerRuleGap;
    plan.classes.forEach((item, index) => {
      drawClass(
        nodes,
        item,
        plan.day,
        contentX,
        classY,
        contentWidth,
        typography,
        metrics,
        theme,
      );
      classLayout.push({
        occurrenceId: item.occurrence.id,
        day: plan.day,
        bounds: {
          x: originX + contentX,
          y: originY + classY,
          width: contentWidth,
          height: item.height,
        },
        headerMode: item.headerMode,
        codeText: item.code.text,
        shownFields: {
          time: Boolean(item.time),
          room: fields.room && Boolean(item.occurrence.room.trim()),
          section: fields.section && Boolean(item.subject.section.trim()),
          professor: Boolean(item.professor),
        },
      });
      classY += item.height;
      if (index < plan.classes.length - 1) {
        const dividerY = classY + metrics.entryGap / 2;
        nodes.push({
          id: `planner-entry-rule-${plan.day}-${item.occurrence.id}`,
          kind: "line",
          points: [
            { x: contentX, y: dividerY },
            { x: contentX + contentWidth, y: dividerY },
          ],
          stroke: theme.plannerRule,
          strokeWidth: 1,
        });
        classY += metrics.entryGap;
      }
    });
    dayLayout.push({
      day: plan.day,
      bounds: {
        x: originX + x,
        y: originY + y,
        width: panelWidth,
        height: panelHeight,
      },
      row: plan.row,
      column: plan.column,
      occurrenceCount: plan.classes.length,
    });
  }
  const scheduleBounds: Rect = {
    x: originX,
    y: originY,
    width: groupWidth,
    height: groupHeight,
  };
  const layers: RenderModel["layers"] = [
    {
      id: "background",
      nodes: [
        {
          id: "clean-slate-background",
          kind: "rect",
          geometry: { x: 0, y: 0, width, height },
          fill: theme.background,
        },
      ],
    },
    { id: "scenery", nodes: [] },
    { id: "photos", nodes: [] },
    {
      id: "schedule",
      nodes: nodes.map((node) => translateNode(node, originX, originY)),
    },
    { id: "foreground", nodes: [] },
  ];
  return {
    model: { width, height, layers },
    overlay: { safeAreas: [], selection: scheduleBounds, warningRegions: [] },
    scheduleBounds,
    positionRange: {
      minX: metrics.margin,
      maxX: metrics.margin + movableX,
      minY: metrics.margin,
      maxY: metrics.margin + movableY,
    },
    compositionFamily: family,
    typography,
    columns,
    dayLayout,
    classLayout,
  };
}
