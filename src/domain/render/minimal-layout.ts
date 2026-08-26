import type { DeviceVariant, VisibleFields } from "@/domain/device/types";
import {
  resolveTargetComposition,
  type TargetCompositionFamily,
} from "@/domain/device/composition";
import type { ScheduleProject } from "@/domain/project";
import {
  expandOccurrences,
  type ScheduleOccurrence,
} from "@/domain/schedule/occurrences";
import type { ScheduleDay, Subject } from "@/domain/schedule/types";
import { fitText, type FittedText } from "./text-fit";
import type {
  Rect,
  RenderModel,
  RenderNode,
  ScheduleRenderResult,
  TextRenderNode,
} from "./types";
import {
  CLEAN_SLATE_RENDER_THEME,
  type CleanSlateRenderTheme,
} from "./themes/clean-slate";

const DAYS: readonly ScheduleDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES: Record<ScheduleDay, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

export const MINIMAL_DESKTOP_MAX_DAY_WIDTH = 350;
export const MINIMAL_DESKTOP_FIVE_DAY_WIDTH = 1600;
export const MINIMAL_TABLET_LANDSCAPE_MAX_DAY_WIDTH = 520;
export const MINIMAL_PHONE_OPTICAL_CONTENT_WIDTH = 235;

export type MinimalTypography = {
  title: number;
  day: number;
  code: number;
  time: number;
  support: number;
  professor: number;
};

export type MinimalDayLayout = {
  day: ScheduleDay;
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
  column: number;
  occurrenceCount: number;
};

export type MinimalClassLayout = {
  occurrenceId: string;
  day: ScheduleDay;
  bounds: Rect;
};

export type MinimalRenderResult = ScheduleRenderResult & {
  compositionFamily: TargetCompositionFamily;
  typography: MinimalTypography;
  dayLayout: readonly MinimalDayLayout[];
  classLayout: readonly MinimalClassLayout[];
  columns: number;
};

type MinimalMetrics = {
  margin: number;
  columnGap: number;
  rowGap: number;
  classGap: number;
  titleBlockHeight: number;
  titleTextHeight: number;
  dayHeaderHeight: number;
  primaryHeight: number;
  detailGap: number;
  timeHeight: number;
  supportHeight: number;
  professorHeight: number;
};

type MinimalClassPlan = {
  occurrence: ScheduleOccurrence;
  subject: Subject;
  primary: FittedText;
  time: string;
  support: string;
  professor: FittedText | null;
  height: number;
};

function mergedFields(
  project: ScheduleProject,
  variant: DeviceVariant,
): VisibleFields {
  const overrides = variant.visibleFieldsOverride;
  return Object.fromEntries(
    (Object.keys(project.design.visibleFields) as (keyof VisibleFields)[]).map(
      (field) => [
        field,
        overrides?.[field] ?? project.design.visibleFields[field],
      ],
    ),
  ) as VisibleFields;
}

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

function scaledTypography(
  family: TargetCompositionFamily,
  scale: number,
): MinimalTypography {
  const base: Record<TargetCompositionFamily, MinimalTypography> = {
    phonePortrait: {
      title: 64,
      day: 36,
      code: 34,
      time: 27,
      support: 24,
      professor: 24,
    },
    tabletPortrait: {
      title: 86,
      day: 41,
      code: 37,
      time: 30,
      support: 27,
      professor: 26,
    },
    tabletLandscape: {
      title: 68,
      day: 34,
      code: 31,
      time: 24,
      support: 21,
      professor: 20,
    },
    desktopLandscape: {
      title: 54,
      day: 28,
      code: 25,
      time: 19,
      support: 17,
      professor: 16,
    },
    square: {
      title: 54,
      day: 27,
      code: 23,
      time: 18,
      support: 16,
      professor: 15,
    },
  };
  return Object.fromEntries(
    Object.entries(base[family]).map(([key, value]) => [
      key,
      Math.round(value * scale),
    ]),
  ) as MinimalTypography;
}

function metricsFor(
  family: TargetCompositionFamily,
  titleVisible: boolean,
): MinimalMetrics {
  const base: Record<
    TargetCompositionFamily,
    Omit<MinimalMetrics, "titleBlockHeight">
  > = {
    phonePortrait: {
      margin: 64,
      columnGap: 42,
      rowGap: 57,
      classGap: 34,
      titleTextHeight: 92,
      dayHeaderHeight: 82,
      primaryHeight: 42,
      detailGap: 10,
      timeHeight: 34,
      supportHeight: 32,
      professorHeight: 30,
    },
    tabletPortrait: {
      margin: 82,
      columnGap: 52,
      rowGap: 70,
      classGap: 38,
      titleTextHeight: 103,
      dayHeaderHeight: 92,
      primaryHeight: 47,
      detailGap: 11,
      timeHeight: 38,
      supportHeight: 35,
      professorHeight: 33,
    },
    tabletLandscape: {
      margin: 86,
      columnGap: 34,
      rowGap: 54,
      classGap: 27,
      titleTextHeight: 82,
      dayHeaderHeight: 72,
      primaryHeight: 38,
      detailGap: 9,
      timeHeight: 31,
      supportHeight: 28,
      professorHeight: 27,
    },
    desktopLandscape: {
      margin: 72,
      columnGap: 32,
      rowGap: 44,
      classGap: 23,
      titleTextHeight: 64,
      dayHeaderHeight: 62,
      primaryHeight: 31,
      detailGap: 7,
      timeHeight: 26,
      supportHeight: 23,
      professorHeight: 22,
    },
    square: {
      margin: 62,
      columnGap: 34,
      rowGap: 48,
      classGap: 25,
      titleTextHeight: 65,
      dayHeaderHeight: 62,
      primaryHeight: 29,
      detailGap: 8,
      timeHeight: 24,
      supportHeight: 22,
      professorHeight: 21,
    },
  };
  const selected = base[family];
  return {
    ...selected,
    titleBlockHeight: titleVisible
      ? selected.titleTextHeight + (family === "phonePortrait" ? 42 : 30)
      : 0,
  };
}

export function resolveMinimalColumnCount(
  family: TargetCompositionFamily,
  dayCount: number,
  dimensions: { width: number; height: number },
  margin: number,
  gap: number,
): number {
  if (dayCount <= 1) return Math.max(1, dayCount);
  if (family === "phonePortrait") return 2;
  if (family === "square") {
    if (dayCount >= 5) return 3;
    if (dayCount === 3) return 3;
    return 2;
  }
  const available = dimensions.width - margin * 2;
  if (family === "tabletPortrait") {
    const candidate = (available - gap * 2) / 3;
    return dimensions.width / dimensions.height >= 0.7 && candidate >= 400
      ? 3
      : 2;
  }
  if (family === "tabletLandscape") {
    if (dayCount >= 5) return 3;
    if (dayCount === 4) return 2;
    if (dayCount === 3) return 3;
    return 2;
  }
  return dayCount;
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

function makeClassPlan(
  project: ScheduleProject,
  occurrence: ScheduleOccurrence,
  subject: Subject,
  fields: VisibleFields,
  width: number,
  typography: MinimalTypography,
  metrics: MinimalMetrics,
): MinimalClassPlan {
  const textWidth = Math.max(1, width);
  const code = subject.code.trim();
  const primary = fitText({
    text: code,
    width: textWidth,
    preferredFontSize: typography.code,
    minimumFontSize: Math.max(12, typography.code - 5),
    maximumLines: 1,
  });
  const time = fields.time
    ? timeRange(
        occurrence.startTime,
        occurrence.endTime,
        project.design.clockFormat,
      )
    : "";
  const support = [
    fields.room ? occurrence.room.trim() : "",
    fields.section && subject.section.trim()
      ? `Sec ${subject.section.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const professorText = fields.professor ? occurrence.professor.trim() : "";
  const professor = professorText
    ? fitText({
        text: professorText,
        width: textWidth,
        preferredFontSize: typography.professor,
        minimumFontSize: Math.max(11, typography.professor - 3),
        maximumLines: 1,
      })
    : null;
  let height = metrics.primaryHeight;
  if (time || support || professor) height += metrics.detailGap;
  if (time) height += metrics.timeHeight;
  if (support) height += metrics.supportHeight;
  if (professor) height += metrics.professorHeight;
  return {
    occurrence,
    subject,
    primary,
    time,
    support,
    professor,
    height: Math.ceil(height),
  };
}

function drawClass(
  nodes: RenderNode[],
  plan: MinimalClassPlan,
  day: ScheduleDay,
  x: number,
  y: number,
  width: number,
  typography: MinimalTypography,
  metrics: MinimalMetrics,
  theme: CleanSlateRenderTheme,
) {
  const id = `${day}-${plan.occurrence.id}`;
  const textX = x;
  const textWidth = width;
  let cursor = y;
  nodes.push(
    textNode(
      `code-${id}`,
      plan.primary.text,
      textX,
      cursor,
      textWidth,
      plan.primary.fontSize,
      theme.foreground,
      {
        fontWeight: 700,
        height: metrics.primaryHeight,
        wrap: "none",
      },
    ),
  );
  cursor += metrics.primaryHeight;
  if (plan.time || plan.support || plan.professor) cursor += metrics.detailGap;
  if (plan.time) {
    nodes.push(
      textNode(
        `time-${id}`,
        plan.time,
        textX,
        cursor,
        textWidth,
        typography.time,
        theme.foreground,
        { fontWeight: 600, height: metrics.timeHeight, wrap: "none" },
      ),
    );
    cursor += metrics.timeHeight;
  }
  if (plan.support) {
    const fit = fitText({
      text: plan.support,
      width: textWidth,
      preferredFontSize: typography.support,
      minimumFontSize: Math.max(11, typography.support - 3),
      maximumLines: 1,
    });
    nodes.push(
      textNode(
        `support-${id}`,
        fit.text,
        textX,
        cursor,
        textWidth,
        fit.fontSize,
        theme.minimalSupport,
        { fontWeight: 500, height: metrics.supportHeight, wrap: "none" },
      ),
    );
    cursor += metrics.supportHeight;
  }
  if (plan.professor) {
    nodes.push(
      textNode(
        `professor-${id}`,
        plan.professor.text,
        textX,
        cursor,
        textWidth,
        plan.professor.fontSize,
        theme.minimalSupport,
        { height: metrics.professorHeight, wrap: "none" },
      ),
    );
  }
}

export function buildMinimalRenderModel(
  project: ScheduleProject,
  variant: DeviceVariant,
  theme: CleanSlateRenderTheme = CLEAN_SLATE_RENDER_THEME,
): MinimalRenderResult {
  const { width, height } = variant.dimensions;
  const family = resolveTargetComposition(variant);
  const titleVisible =
    project.design.wallpaperTitle.visible &&
    project.design.wallpaperTitle.text.trim().length > 0;
  const typography = scaledTypography(family, project.design.typography.scale);
  const metrics = metricsFor(family, titleVisible);
  const fields = mergedFields(project, variant);
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
      occurrences.filter((occurrence) => occurrence.actualDays[0] === day),
    ]),
  );
  const activeDays = DAYS.filter((day) => (byDay.get(day)?.length ?? 0) > 0);
  const visibleDays =
    project.design.dayVisibility === "full-week" ? DAYS : activeDays;
  const horizontalMargin =
    family === "phonePortrait" && visibleDays.length <= 3 ? 44 : metrics.margin;
  const columns = resolveMinimalColumnCount(
    family,
    visibleDays.length,
    variant.dimensions,
    horizontalMargin,
    metrics.columnGap,
  );
  const availableWidth = width - horizontalMargin * 2;
  const isWide = family === "desktopLandscape" || family === "tabletLandscape";
  const maxDayWidth =
    family === "desktopLandscape"
      ? MINIMAL_DESKTOP_MAX_DAY_WIDTH
      : family === "tabletLandscape"
        ? MINIMAL_TABLET_LANDSCAPE_MAX_DAY_WIDTH
        : family === "square"
          ? 420
          : 520;
  const fullColumnWidth =
    ((family === "desktopLandscape" && visibleDays.length === 5
      ? Math.min(availableWidth, MINIMAL_DESKTOP_FIVE_DAY_WIDTH)
      : availableWidth) -
      metrics.columnGap * Math.max(0, columns - 1)) /
    Math.max(1, columns);
  const dayWidth = Math.min(maxDayWidth, fullColumnWidth);
  const regularRowWidth =
    columns * dayWidth + metrics.columnGap * Math.max(0, columns - 1);
  const groupWidth =
    visibleDays.length === 1
      ? Math.min(
          availableWidth,
          family === "phonePortrait"
            ? 700
            : family === "tabletPortrait"
              ? 700
              : maxDayWidth,
        )
      : Math.min(availableWidth, regularRowWidth);
  const plans = visibleDays.map((day, index) => {
    const row =
      isWide && columns === visibleDays.length
        ? 0
        : Math.floor(index / columns);
    const rowStart = row * columns;
    const rowCount = Math.min(columns, visibleDays.length - rowStart);
    const sectionWidth = visibleDays.length === 1 ? groupWidth : dayWidth;
    const contentInset =
      family === "phonePortrait"
        ? Math.max(0, (sectionWidth - MINIMAL_PHONE_OPTICAL_CONTENT_WIDTH) / 2)
        : 0;
    const contentWidth = sectionWidth - contentInset;
    const classes = (byDay.get(day) ?? []).map((occurrence) =>
      makeClassPlan(
        project,
        occurrence,
        subjects.get(occurrence.subjectId)!,
        fields,
        contentWidth,
        typography,
        metrics,
      ),
    );
    const height =
      metrics.dayHeaderHeight +
      classes.reduce((sum, item) => sum + item.height, 0) +
      Math.max(0, classes.length - 1) * metrics.classGap;
    return {
      day,
      row,
      column: index % columns,
      rowCount,
      width: sectionWidth,
      contentInset,
      contentWidth,
      height,
      classes,
    };
  });
  const rowCount = plans.reduce(
    (maximum, day) => Math.max(maximum, day.row + 1),
    0,
  );
  const rowHeights = Array.from({ length: rowCount }, (_, row) =>
    Math.max(
      ...plans.filter((plan) => plan.row === row).map((plan) => plan.height),
    ),
  );
  const rowTops = rowHeights.map(
    (_, row) =>
      metrics.titleBlockHeight +
      rowHeights.slice(0, row).reduce((sum, value) => sum + value, 0) +
      row * metrics.rowGap,
  );
  const groupHeight = Math.max(
    1,
    metrics.titleBlockHeight +
      rowHeights.reduce((sum, value) => sum + value, 0) +
      Math.max(0, rowCount - 1) * metrics.rowGap,
  );
  const movableX = Math.max(0, width - horizontalMargin * 2 - groupWidth);
  const movableY = Math.max(0, height - metrics.margin * 2 - groupHeight);
  const originX = horizontalMargin + movableX * variant.schedulePosition.x;
  const originY = metrics.margin + movableY * variant.schedulePosition.y;
  const nodes: RenderNode[] = [];
  if (titleVisible) {
    const titleInset =
      family === "phonePortrait"
        ? Math.max(0, (dayWidth - MINIMAL_PHONE_OPTICAL_CONTENT_WIDTH) / 2)
        : 0;
    const fit = fitText({
      text: project.design.wallpaperTitle.text,
      width: groupWidth - titleInset,
      preferredFontSize: typography.title,
      minimumFontSize: Math.max(28, typography.title - 10),
      maximumLines: 1,
      averageGlyphWidth: 0.58,
    });
    nodes.push(
      textNode(
        "wallpaper-title",
        fit.text,
        titleInset,
        0,
        groupWidth - titleInset,
        fit.fontSize,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 700,
          height: metrics.titleTextHeight,
          verticalAlign: "middle",
        },
      ),
    );
  }
  const dayLayout: MinimalDayLayout[] = [];
  const classLayout: MinimalClassLayout[] = [];
  for (const plan of plans) {
    const rowWidth =
      plan.rowCount * plan.width +
      metrics.columnGap * Math.max(0, plan.rowCount - 1);
    const x =
      (groupWidth - rowWidth) / 2 +
      plan.column * (plan.width + metrics.columnGap);
    const contentX = x + plan.contentInset;
    const y = rowTops[plan.row]!;
    dayLayout.push({
      day: plan.day,
      x: originX + x,
      y: originY + y,
      width: plan.width,
      height: plan.height,
      row: plan.row,
      column: plan.column,
      occurrenceCount: plan.classes.length,
    });
    const inlineHeading =
      family === "desktopLandscape" ||
      family === "tabletLandscape" ||
      (family === "square" && plan.width >= 350);
    const estimatedDayLabelWidth =
      DAY_NAMES[plan.day].length * typography.day * 0.58 + 10;
    const labelWidth = Math.min(
      plan.contentWidth * 0.62,
      Math.max(typography.day * 4.4, estimatedDayLabelWidth),
    );
    const inlineRuleStart = contentX + labelWidth + 10;
    const inlineRuleLength = Math.max(
      0,
      (plan.contentWidth - labelWidth - 10) *
        (family === "desktopLandscape" ? 0.6 : 1),
    );
    nodes.push(
      textNode(
        `day-${plan.day}`,
        DAY_NAMES[plan.day],
        contentX,
        y,
        inlineHeading ? labelWidth : plan.contentWidth,
        typography.day,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 700,
          height: inlineHeading
            ? metrics.dayHeaderHeight - 12
            : typography.day * 1.35,
          wrap: "none",
        },
      ),
      {
        id: `day-line-${plan.day}`,
        kind: "line",
        points: inlineHeading
          ? [
              { x: inlineRuleStart, y: y + typography.day * 0.65 },
              {
                x: inlineRuleStart + inlineRuleLength,
                y: y + typography.day * 0.65,
              },
            ]
          : [
              { x: contentX, y: y + typography.day * 1.5 },
              {
                x: contentX + plan.width * 0.3,
                y: y + typography.day * 1.5,
              },
            ],
        stroke: theme.minimalRule,
        strokeWidth: Math.max(2, Math.round(typography.day / 18)),
        lineCap: "round",
      },
    );
    let classY = y + metrics.dayHeaderHeight;
    for (const item of plan.classes) {
      drawClass(
        nodes,
        item,
        plan.day,
        contentX,
        classY,
        plan.contentWidth,
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
          width: plan.contentWidth,
          height: item.height,
        },
      });
      classY += item.height + metrics.classGap;
    }
  }
  const scheduleBounds: Rect = {
    x: originX,
    y: originY,
    width: groupWidth,
    height: groupHeight,
  };
  const scheduleNodes = nodes.map((node) =>
    translateNode(node, originX, originY),
  );
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
    { id: "schedule", nodes: scheduleNodes },
    { id: "foreground", nodes: [] },
  ];
  return {
    model: { width, height, layers },
    overlay: { safeAreas: [], selection: scheduleBounds, warningRegions: [] },
    scheduleBounds,
    positionRange: {
      minX: horizontalMargin,
      maxX: horizontalMargin + movableX,
      minY: metrics.margin,
      maxY: metrics.margin + movableY,
    },
    compositionFamily: family,
    typography,
    dayLayout,
    classLayout,
    columns,
  };
}
