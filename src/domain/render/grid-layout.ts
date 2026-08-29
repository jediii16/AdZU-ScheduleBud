import type { DeviceVariant, VisibleFields } from "@/domain/device/types";
import {
  resolveTargetComposition,
  type TargetCompositionFamily,
} from "@/domain/device/composition";
import type { ScheduleProject } from "@/domain/project";
import {
  calculateOverlapLayout,
  type PositionedOccurrence,
} from "@/domain/schedule/overlap-layout";
import {
  expandOccurrences,
  type ScheduleOccurrence,
} from "@/domain/schedule/occurrences";
import {
  SUPPORTED_SCHEDULE_END_MINUTES,
  SUPPORTED_SCHEDULE_START_MINUTES,
} from "@/domain/schedule/time-bounds";
import {
  calculateAutomaticTimeRange,
  type TimeRange,
} from "@/domain/schedule/time-range";
import { minutesToTime, timeToMinutes } from "@/domain/schedule/time";
import type { ScheduleDay, Subject } from "@/domain/schedule/types";
import { fitText, type FittedText } from "./text-fit";
import {
  applyLayoutDetailCapabilities,
  resolveLayoutDetailCapabilities,
  resolveLayoutVisibleFields,
  type LayoutDetailCapabilities,
} from "./layout-capabilities";
import { CLEAN_SLATE_RENDER_THEME } from "./themes/clean-slate";
import type { WallpaperThemeTokens } from "./themes/types";
import { resolveSubjectColor } from "./subject-colors";
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

export const GRID_MINIMUM_TIME_SPAN_MINUTES = 6 * 60;
export const GRID_DESKTOP_MAX_DAY_WIDTH = 320;
export const GRID_TABLET_LANDSCAPE_MIN_DAY_WIDTH = 250;
export const GRID_TABLET_PORTRAIT_MIN_DAY_WIDTH = 180;
export const GRID_PHONE_UNBROKEN_CODE_GLYPH_WIDTH = 0.72;

export type GridTypography = {
  title: number;
  day: number;
  timeAxis: number;
  code: number;
  time: number;
  support: number;
  professor: number;
};

export type GridInformationTier = "roomy" | "medium" | "compact" | "code-only";

export type GridBandLayout = {
  index: number;
  days: readonly ScheduleDay[];
  bounds: Rect;
  gridBounds: Rect;
  dayWidth: number;
  pixelsPerMinute: number;
};

export type GridDayLayout = {
  day: ScheduleDay;
  band: number;
  column: number;
  bounds: Rect;
  occurrenceCount: number;
};

export type GridBlockLayout = {
  occurrenceId: string;
  day: ScheduleDay;
  bounds: Rect;
  overlapColumn: number;
  overlapColumnCount: number;
  tier: GridInformationTier;
  shownFields: {
    time: boolean;
    room: boolean;
    section: boolean;
    professor: boolean;
  };
};

export type GridRenderResult = ScheduleRenderResult & {
  compositionFamily: TargetCompositionFamily;
  typography: GridTypography;
  timeRange: TimeRange;
  bandLayout: readonly GridBandLayout[];
  dayLayout: readonly GridDayLayout[];
  blockLayout: readonly GridBlockLayout[];
  hourLabelInterval: 1 | 2;
  detailCapabilities: LayoutDetailCapabilities;
};

type GridMetrics = {
  margin: number;
  timeAxisWidth: number;
  titleHeight: number;
  titleGap: number;
  dayHeaderHeight: number;
  bandGap: number;
  preferredPixelsPerHour: number;
  maxDayWidth: number;
  blockInset: number;
  overlapGap: number;
  radius: number;
};

type ShownFields = GridBlockLayout["shownFields"];

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
  if (node.kind === "rect" || node.kind === "image") {
    return {
      ...node,
      geometry: {
        ...node.geometry,
        x: node.geometry.x + x,
        y: node.geometry.y + y,
      },
    };
  }
  if (node.kind === "text") {
    return {
      ...node,
      position: { x: node.position.x + x, y: node.position.y + y },
    };
  }
  return {
    ...node,
    points: node.points.map((point) => ({ x: point.x + x, y: point.y + y })),
  };
}

function scaleTypography(
  family: TargetCompositionFamily,
  scale: number,
): GridTypography {
  const base: Record<TargetCompositionFamily, GridTypography> = {
    phonePortrait: {
      title: 62,
      day: 30,
      timeAxis: 24,
      code: 29,
      time: 23,
      support: 21,
      professor: 20,
    },
    tabletPortrait: {
      title: 72,
      day: 34,
      timeAxis: 26,
      code: 32,
      time: 25,
      support: 23,
      professor: 22,
    },
    tabletLandscape: {
      title: 62,
      day: 30,
      timeAxis: 22,
      code: 27,
      time: 21,
      support: 19,
      professor: 18,
    },
    desktopLandscape: {
      title: 50,
      day: 24,
      timeAxis: 16,
      code: 21,
      time: 16,
      support: 14,
      professor: 13,
    },
    square: {
      title: 54,
      day: 26,
      timeAxis: 19,
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
  ) as GridTypography;
}

function metricsFor(
  family: TargetCompositionFamily,
  titleVisible: boolean,
  dayCount: number,
): GridMetrics {
  const base: Record<
    TargetCompositionFamily,
    Omit<GridMetrics, "titleHeight">
  > = {
    phonePortrait: {
      margin: 36,
      timeAxisWidth: 72,
      titleGap: 24,
      dayHeaderHeight: 62,
      bandGap: 64,
      preferredPixelsPerHour: 115,
      maxDayWidth: dayCount <= 1 ? 650 : dayCount <= 2 ? 420 : 300,
      blockInset: 5,
      overlapGap: 7,
      radius: 12,
    },
    tabletPortrait: {
      margin: 78,
      timeAxisWidth: 86,
      titleGap: 28,
      dayHeaderHeight: 70,
      bandGap: 62,
      preferredPixelsPerHour: 105,
      maxDayWidth: dayCount <= 1 ? 760 : 410,
      blockInset: 6,
      overlapGap: 8,
      radius: 10,
    },
    tabletLandscape: {
      margin: 72,
      timeAxisWidth: 90,
      titleGap: 24,
      dayHeaderHeight: 58,
      bandGap: 50,
      preferredPixelsPerHour: 70,
      maxDayWidth: dayCount <= 2 ? 440 : 340,
      blockInset: 5,
      overlapGap: 7,
      radius: 9,
    },
    desktopLandscape: {
      margin: 64,
      timeAxisWidth: 82,
      titleGap: 20,
      dayHeaderHeight: 48,
      bandGap: 0,
      preferredPixelsPerHour: 66,
      maxDayWidth: GRID_DESKTOP_MAX_DAY_WIDTH,
      blockInset: 4,
      overlapGap: 6,
      radius: 8,
    },
    square: {
      margin: 32,
      timeAxisWidth: 80,
      titleGap: 12,
      dayHeaderHeight: 44,
      bandGap: 24,
      preferredPixelsPerHour: 52,
      maxDayWidth: dayCount <= 1 ? 600 : 290,
      blockInset: 4,
      overlapGap: 6,
      radius: 9,
    },
  };
  return {
    ...base[family],
    titleHeight: titleVisible
      ? family === "square"
        ? 66
        : family === "phonePortrait"
          ? 104
          : family === "tabletPortrait"
            ? 116
            : family === "desktopLandscape"
              ? 78
              : 92
      : 0,
  };
}

export function resolveGridTimeRange(
  subjects: readonly Subject[],
  minimumSpanMinutes = GRID_MINIMUM_TIME_SPAN_MINUTES,
): TimeRange {
  const automatic = calculateAutomaticTimeRange(subjects);
  if (automatic.source === "default") return automatic;
  let start = timeToMinutes(automatic.startTime)!;
  let end = timeToMinutes(automatic.endTime)!;
  const desiredSpan = Math.max(60, Math.round(minimumSpanMinutes / 60) * 60);
  const missing = Math.max(0, desiredSpan - (end - start));
  start -= Math.floor(missing / 120) * 60;
  end += missing - Math.floor(missing / 120) * 60;
  if (start < SUPPORTED_SCHEDULE_START_MINUTES) {
    end += SUPPORTED_SCHEDULE_START_MINUTES - start;
    start = SUPPORTED_SCHEDULE_START_MINUTES;
  }
  if (end > SUPPORTED_SCHEDULE_END_MINUTES) {
    start -= end - SUPPORTED_SCHEDULE_END_MINUTES;
    end = SUPPORTED_SCHEDULE_END_MINUTES;
  }
  start = Math.max(SUPPORTED_SCHEDULE_START_MINUTES, start);
  end = Math.min(SUPPORTED_SCHEDULE_END_MINUTES, end);
  return {
    startTime: minutesToTime(start),
    endTime: minutesToTime(end),
    source: "automatic",
  };
}

export function resolveGridBandCounts(
  family: TargetCompositionFamily,
  dayCount: number,
  dimensions: { width: number; height: number },
): readonly number[] {
  if (dayCount <= 0) return [];
  if (family === "phonePortrait") return [dayCount];
  if (family === "desktopLandscape") return [dayCount];
  if (family === "tabletPortrait") {
    const metrics = metricsFor(family, false, dayCount);
    const readableWidth =
      (dimensions.width - metrics.margin * 2 - metrics.timeAxisWidth) /
      dayCount;
    if (readableWidth >= GRID_TABLET_PORTRAIT_MIN_DAY_WIDTH) return [dayCount];
  }
  if (family === "tabletLandscape") {
    const metrics = metricsFor(family, false, dayCount);
    const readableWidth =
      (dimensions.width - metrics.margin * 2 - metrics.timeAxisWidth) /
      dayCount;
    if (readableWidth >= GRID_TABLET_LANDSCAPE_MIN_DAY_WIDTH) return [dayCount];
  }
  if (dayCount === 6) return [3, 3];
  if (dayCount === 5) return [3, 2];
  if (dayCount === 4) return [2, 2];
  return [dayCount];
}

function compactDayHeaders(family: TargetCompositionFamily): boolean {
  return family === "phonePortrait" || family === "square";
}

function axisLabel(
  minutes: number,
  compact: boolean,
  previousLabelMinutes?: number,
): string {
  const hours = Math.floor(minutes / 60);
  if (
    compact &&
    previousLabelMinutes !== undefined &&
    !(previousLabelMinutes < 12 * 60 && minutes >= 12 * 60)
  ) {
    return `${hours % 12 || 12}`;
  }
  return `${hours % 12 || 12} ${hours < 12 ? "AM" : "PM"}`;
}

function timeParts(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return {
    clock: `${hours! % 12 || 12}:${String(minutes).padStart(2, "0")}`,
    period: hours! < 12 ? "AM" : "PM",
  };
}

function blockTime(
  start: string,
  end: string,
  format: "12-hour" | "24-hour",
  compact: boolean,
): string {
  if (format === "24-hour") return `${start}–${end}`;
  const left = timeParts(start);
  const right = timeParts(end);
  if (compact) return `${left.clock}–${right.clock}`;
  return left.period === right.period
    ? `${left.clock}–${right.clock} ${right.period}`
    : `${left.clock} ${left.period}–${right.clock} ${right.period}`;
}

function darkenHex(color: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(color);
  if (!match) return color;
  const value = Number.parseInt(match[1]!, 16);
  const channels = [value >> 16, (value >> 8) & 255, value & 255].map((item) =>
    Math.max(0, Math.round(item * 0.78)),
  );
  return `#${channels.map((item) => item.toString(16).padStart(2, "0")).join("")}`;
}

function shownFieldsForBlock(
  width: number,
  height: number,
  padding: number,
  codeHeight: number,
  family: TargetCompositionFamily,
  typography: GridTypography,
  fields: VisibleFields,
  occurrence: ScheduleOccurrence,
  subject: Subject,
  clockFormat: ScheduleProject["design"]["clockFormat"],
): { tier: GridInformationTier; shown: ShownFields } {
  const available = Math.max(0, height - padding * 2);
  let used = codeHeight;
  const detailLineHeightFactor = family === "square" ? 1.1 : 1.2;
  const shown: ShownFields = {
    time: false,
    room: false,
    section: false,
    professor: false,
  };
  const canAdd = (lineHeight: number, minimumWidth: number) =>
    width - padding * 2 >= minimumWidth && used + lineHeight <= available;
  if (family === "phonePortrait") {
    const textWidth = width - padding * 2;
    const room = occurrence.room.trim();
    const professor = occurrence.professor.trim();
    const time = blockTime(
      occurrence.startTime,
      occurrence.endTime,
      clockFormat,
      true,
    );
    const fitsLine = (text: string, fontSize: number, glyphWidth = 0.56) =>
      text.length * fontSize * glyphWidth <= textWidth;
    if (
      fields.room &&
      room &&
      fitsLine(room, typography.support) &&
      canAdd(typography.support * 1.16, 1)
    ) {
      shown.room = true;
      used += typography.support * 1.16;
    }
    if (
      fields.time &&
      fitsLine(time, typography.time, 0.58) &&
      used + typography.time * 1.16 + 10 <= available
    ) {
      shown.time = true;
      used += typography.time * 1.16;
    }
    const fittedProfessor = fitText({
      text: professor,
      width: textWidth,
      preferredFontSize: typography.professor,
      minimumFontSize: Math.max(8, typography.professor - 3),
      maximumLines: 2,
    });
    if (
      fields.professor &&
      professor &&
      !fittedProfessor.truncated &&
      canAdd(
        fittedProfessor.fontSize *
          fittedProfessor.lineHeight *
          fittedProfessor.lines,
        typography.professor * 6.5,
      )
    ) {
      shown.professor = true;
    }
    return {
      tier: shown.professor
        ? "roomy"
        : shown.room
          ? "medium"
          : shown.time
            ? "compact"
            : "code-only",
      shown,
    };
  }
  if (
    fields.time &&
    canAdd(typography.time * detailLineHeightFactor, typography.time * 4.2)
  ) {
    shown.time = true;
    used += typography.time * detailLineHeightFactor;
  }
  if (
    fields.room &&
    occurrence.room.trim() &&
    canAdd(
      typography.support * detailLineHeightFactor,
      typography.support * 4.5,
    )
  ) {
    shown.room = true;
    used += typography.support * detailLineHeightFactor;
  }
  if (
    fields.section &&
    subject.section.trim() &&
    width - padding * 2 >= typography.support * 10.5 &&
    (shown.room ||
      canAdd(
        typography.support * detailLineHeightFactor,
        typography.support * 5,
      ))
  ) {
    shown.section = true;
    if (!shown.room) used += typography.support * detailLineHeightFactor;
  }
  if (
    fields.professor &&
    occurrence.professor.trim() &&
    canAdd(
      typography.professor * detailLineHeightFactor,
      typography.professor * 12,
    )
  ) {
    shown.professor = true;
  }
  const tier: GridInformationTier =
    shown.professor || shown.section
      ? "roomy"
      : shown.room
        ? "medium"
        : shown.time
          ? "compact"
          : "code-only";
  return { tier, shown };
}

function fitSubjectCode(
  code: string,
  width: number,
  availableHeight: number,
  typography: GridTypography,
  family: TargetCompositionFamily,
): FittedText {
  const phoneGlyphWidth = /\s/.test(code)
    ? 0.66
    : GRID_PHONE_UNBROKEN_CODE_GLYPH_WIDTH;
  const preferredFontSize = Math.max(
    8,
    Math.min(typography.code, availableHeight / 1.16),
  );
  const modestMinimum = Math.min(
    preferredFontSize,
    Math.max(8, typography.code - (family === "phonePortrait" ? 5 : 4)),
  );
  const singleLine = fitText({
    text: code,
    width,
    preferredFontSize,
    minimumFontSize: modestMinimum,
    maximumLines: 1,
    ...(family === "phonePortrait"
      ? { averageGlyphWidth: phoneGlyphWidth }
      : {}),
  });
  if (family !== "phonePortrait" || !singleLine.truncated) {
    return singleLine;
  }
  const tightMinimum = Math.min(
    modestMinimum,
    Math.max(8, typography.code - 10),
  );
  const tightSingleLine = fitText({
    text: code,
    width,
    preferredFontSize,
    minimumFontSize: tightMinimum,
    maximumLines: 1,
    averageGlyphWidth: phoneGlyphWidth,
  });
  if (!tightSingleLine.truncated || availableHeight < tightMinimum * 2.32) {
    if (!tightSingleLine.truncated) return tightSingleLine;
    const exactFontSize = Math.max(
      1,
      Math.min(
        tightMinimum,
        width / Math.max(1, code.length * phoneGlyphWidth),
        availableHeight / 1.16,
      ),
    );
    return {
      text: code,
      fontSize: exactFontSize,
      lineHeight: 1.16,
      lines: 1,
      truncated: false,
    };
  }
  const splitAt = Math.ceil(code.length / 2);
  const lines = [code.slice(0, splitAt), code.slice(splitAt)].filter(Boolean);
  const longestLine = Math.max(...lines.map((line) => line.length));
  const wrappedFontSize = Math.max(
    1,
    Math.min(
      tightMinimum,
      width / Math.max(1, longestLine * phoneGlyphWidth),
      availableHeight / (lines.length * 1.16),
    ),
  );
  return {
    text: lines.join("\n"),
    fontSize: wrappedFontSize,
    lineHeight: 1.16,
    lines: lines.length,
    truncated: false,
  };
}

function drawBlock(
  nodes: RenderNode[],
  blockLayout: GridBlockLayout[],
  input: {
    project: ScheduleProject;
    occurrence: PositionedOccurrence;
    subject: Subject;
    day: ScheduleDay;
    bounds: Rect;
    fields: VisibleFields;
    family: TargetCompositionFamily;
    typography: GridTypography;
    metrics: GridMetrics;
    theme: WallpaperThemeTokens;
    fill: string;
  },
) {
  const {
    project,
    occurrence,
    subject,
    day,
    bounds,
    fields,
    family,
    typography,
    metrics,
    theme,
    fill,
  } = input;
  const id = `${day}-${occurrence.id}`;
  nodes.push({
    id: `grid-block-${id}`,
    kind: "rect",
    geometry: bounds,
    fill,
    stroke: darkenHex(fill),
    strokeWidth: Math.max(1, Math.round(metrics.radius / 7)),
    cornerRadius: Math.min(metrics.radius, bounds.height / 3, bounds.width / 8),
  });
  const padding = Math.max(
    3,
    Math.min(
      family === "phonePortrait" ? 8 : 12,
      Math.round(Math.min(bounds.width, bounds.height) * 0.045),
    ),
  );
  const textX = bounds.x + padding;
  const textWidth = Math.max(1, bounds.width - padding * 2);
  const textBottom = bounds.y + bounds.height - padding;
  let cursor = bounds.y + padding;
  const code = fitSubjectCode(
    subject.code.trim(),
    textWidth,
    Math.max(1, textBottom - cursor),
    typography,
    family,
  );
  const codeHeight = Math.max(
    1,
    Math.min(code.fontSize * code.lineHeight * code.lines, textBottom - cursor),
  );
  const { tier, shown } = shownFieldsForBlock(
    bounds.width,
    bounds.height,
    padding,
    codeHeight,
    family,
    typography,
    fields,
    occurrence,
    subject,
    project.design.clockFormat,
  );
  nodes.push(
    textNode(
      `grid-code-${id}`,
      code.text,
      textX,
      cursor,
      textWidth,
      code.fontSize,
      theme.foreground,
      {
        height: codeHeight,
        fontWeight: 800,
        lineHeight: code.lineHeight,
        wrap: code.lines > 1 ? "character" : "none",
        verticalAlign: "middle",
      },
    ),
  );
  cursor += codeHeight;
  const addLine = (
    nodeId: string,
    text: string,
    fontSize: number,
    fillColor: string,
    fontWeight: 400 | 500 | 600 | 700,
    fit = true,
    maximumLines = 1,
    requireComplete = false,
  ) => {
    const lineHeightFactor = family === "square" ? 1.1 : 1.2;
    const fitted = fit
      ? fitText({
          text,
          width: textWidth,
          preferredFontSize: fontSize,
          minimumFontSize: Math.max(8, fontSize - 3),
          maximumLines,
        })
      : {
          text,
          fontSize,
          lineHeight: 1.16,
          lines: 1,
          truncated: false,
        };
    if (requireComplete && fitted.truncated) return;
    const fittedHeight =
      maximumLines > 1
        ? fitted.fontSize * fitted.lineHeight * fitted.lines
        : fontSize * lineHeightFactor;
    const height = Math.min(fittedHeight, Math.max(0, textBottom - cursor));
    if (!text || height <= 0) return;
    nodes.push(
      textNode(
        nodeId,
        fitted.text,
        textX,
        cursor,
        textWidth,
        fitted.fontSize,
        fillColor,
        {
          height,
          fontWeight,
          lineHeight: fitted.lineHeight,
          wrap: fitted.lines > 1 ? "word" : "none",
          verticalAlign: "middle",
        },
      ),
    );
    cursor += height;
  };
  const addTime = () => {
    if (!shown.time) return;
    addLine(
      `grid-time-${id}`,
      blockTime(
        occurrence.startTime,
        occurrence.endTime,
        project.design.clockFormat,
        family === "phonePortrait" || (tier !== "roomy" && tier !== "medium"),
      ),
      typography.time,
      theme.gridTime,
      600,
      family !== "phonePortrait",
    );
  };
  const addSupport = () => {
    if (!shown.room && !shown.section) return;
    addLine(
      `grid-support-${id}`,
      [
        shown.room ? occurrence.room.trim() : "",
        shown.section ? `Sec ${subject.section.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      typography.support,
      theme.gridSupport,
      500,
      family !== "phonePortrait",
    );
  };
  if (family === "phonePortrait") {
    addSupport();
    addTime();
  } else {
    addTime();
    addSupport();
  }
  if (shown.professor) {
    addLine(
      `grid-professor-${id}`,
      occurrence.professor.trim(),
      typography.professor,
      theme.gridSupport,
      400,
      true,
      family === "phonePortrait" ? 2 : 1,
      family === "phonePortrait",
    );
  }
  blockLayout.push({
    occurrenceId: occurrence.id,
    day,
    bounds,
    overlapColumn: occurrence.column,
    overlapColumnCount: occurrence.columnCount,
    tier,
    shownFields: shown,
  });
}

export function buildGridRenderModel(
  project: ScheduleProject,
  variant: DeviceVariant,
  theme: WallpaperThemeTokens = CLEAN_SLATE_RENDER_THEME,
): GridRenderResult {
  const { width, height } = variant.dimensions;
  const family = resolveTargetComposition(variant);
  const titleVisible =
    project.design.wallpaperTitle.visible &&
    project.design.wallpaperTitle.text.trim().length > 0;
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
  const typography = scaleTypography(family, 1);
  const metrics = metricsFor(family, titleVisible, visibleDays.length);
  const detailCapabilities = resolveLayoutDetailCapabilities("grid", variant);
  const fields = applyLayoutDetailCapabilities(
    resolveLayoutVisibleFields(
      "grid",
      project.design.visibleFields,
      variant,
      detailCapabilities,
    ),
    detailCapabilities,
  );
  const subjects = new Map(
    project.schedule.map((subject) => [subject.id, subject]),
  );
  const timeRange = resolveGridTimeRange(project.schedule);
  const startMinutes = timeToMinutes(timeRange.startTime)!;
  const endMinutes = timeToMinutes(timeRange.endTime)!;
  const spanMinutes = endMinutes - startMinutes;
  const bandCounts = resolveGridBandCounts(
    family,
    visibleDays.length,
    variant.dimensions,
  );
  const maximumColumns = Math.max(1, ...bandCounts);
  const availableWidth = width - metrics.margin * 2;
  const dayWidth = Math.min(
    metrics.maxDayWidth,
    Math.max(1, (availableWidth - metrics.timeAxisWidth) / maximumColumns),
  );
  const groupWidth = metrics.timeAxisWidth + maximumColumns * dayWidth;
  const titleBlockHeight = titleVisible
    ? metrics.titleHeight + metrics.titleGap
    : 0;
  const terminalAxisClearance =
    family === "square" ? Math.ceil(typography.timeAxis * 0.65) : 0;
  const maximumTimelineHeight = bandCounts.length
    ? Math.max(
        1,
        (height -
          metrics.margin * 2 -
          titleBlockHeight -
          terminalAxisClearance -
          metrics.bandGap * Math.max(0, bandCounts.length - 1) -
          metrics.dayHeaderHeight * bandCounts.length) /
          bandCounts.length,
      )
    : 1;
  const preferredTimelineHeight =
    (spanMinutes / 60) * metrics.preferredPixelsPerHour;
  const timelineHeight = Math.max(
    1,
    family === "square" && bandCounts.length > 1
      ? maximumTimelineHeight
      : Math.min(preferredTimelineHeight, maximumTimelineHeight),
  );
  const bandHeight = metrics.dayHeaderHeight + timelineHeight;
  const groupHeight = Math.max(
    1,
    titleBlockHeight +
      bandCounts.length * bandHeight +
      Math.max(0, bandCounts.length - 1) * metrics.bandGap +
      terminalAxisClearance,
  );
  const movableX = Math.max(0, width - metrics.margin * 2 - groupWidth);
  const movableY = Math.max(0, height - metrics.margin * 2 - groupHeight);
  const originX = metrics.margin + movableX * variant.schedulePosition.x;
  const originY = metrics.margin + movableY * variant.schedulePosition.y;
  const nodes: RenderNode[] = [];
  const bandLayout: GridBandLayout[] = [];
  const dayLayout: GridDayLayout[] = [];
  const blockLayout: GridBlockLayout[] = [];
  const hourLabelInterval: 1 | 2 =
    (family === "phonePortrait" ||
      family === "tabletPortrait" ||
      family === "square") &&
    spanMinutes > 8 * 60
      ? 2
      : 1;

  if (titleVisible) {
    const fit = fitText({
      text: project.design.wallpaperTitle.text,
      width: Math.max(1, groupWidth - metrics.timeAxisWidth),
      preferredFontSize: typography.title,
      minimumFontSize: Math.max(28, typography.title - 10),
      maximumLines: 1,
      averageGlyphWidth: 0.58,
    });
    nodes.push(
      textNode(
        "wallpaper-title",
        fit.text,
        metrics.timeAxisWidth,
        0,
        groupWidth - metrics.timeAxisWidth,
        fit.fontSize,
        theme.foreground,
        {
          fontId: "heading-sans",
          fontWeight: 700,
          height: metrics.titleHeight,
          verticalAlign: "middle",
        },
      ),
    );
  }

  let dayOffset = 0;
  for (const [bandIndex, count] of bandCounts.entries()) {
    const bandDays = visibleDays.slice(dayOffset, dayOffset + count);
    dayOffset += count;
    const bandWidth = metrics.timeAxisWidth + count * dayWidth;
    const bandX = (groupWidth - bandWidth) / 2;
    const bandY = titleBlockHeight + bandIndex * (bandHeight + metrics.bandGap);
    const gridX = bandX + metrics.timeAxisWidth;
    const gridY = bandY + metrics.dayHeaderHeight;
    bandLayout.push({
      index: bandIndex,
      days: bandDays,
      bounds: {
        x: originX + bandX,
        y: originY + bandY,
        width: bandWidth,
        height: bandHeight,
      },
      gridBounds: {
        x: originX + gridX,
        y: originY + gridY,
        width: count * dayWidth,
        height: timelineHeight,
      },
      dayWidth,
      pixelsPerMinute: timelineHeight / spanMinutes,
    });

    for (let hour = startMinutes; hour <= endMinutes; hour += 60) {
      const lineY =
        gridY + ((hour - startMinutes) / spanMinutes) * timelineHeight;
      nodes.push({
        id: `grid-hour-line-${bandIndex}-${hour}`,
        kind: "line",
        points: [
          { x: gridX, y: lineY },
          { x: gridX + count * dayWidth, y: lineY },
        ],
        stroke: theme.gridGuide,
        strokeWidth: family === "desktopLandscape" ? 1 : 1.5,
      });
      const hourIndex = (hour - startMinutes) / 60;
      if (hourIndex % hourLabelInterval === 0) {
        nodes.push(
          textNode(
            `grid-hour-label-${bandIndex}-${hour}`,
            axisLabel(
              hour,
              family === "phonePortrait",
              hourIndex === 0 ? undefined : hour - hourLabelInterval * 60,
            ),
            bandX,
            lineY - typography.timeAxis * 0.62,
            metrics.timeAxisWidth - 12,
            typography.timeAxis,
            theme.gridAxis,
            {
              align: "right",
              height: typography.timeAxis * 1.25,
              fontWeight: 500,
              wrap: "none",
            },
          ),
        );
      }
    }

    for (const [column, day] of bandDays.entries()) {
      const dayX = gridX + column * dayWidth;
      nodes.push(
        textNode(
          `grid-day-${bandIndex}-${day}`,
          compactDayHeaders(family) ||
            (family === "tabletPortrait" && dayWidth < typography.day * 5.8)
            ? day.toUpperCase()
            : DAY_NAMES[day],
          dayX,
          bandY,
          dayWidth,
          typography.day,
          theme.foreground,
          {
            fontId: "heading-sans",
            fontWeight: 700,
            align: "center",
            height: metrics.dayHeaderHeight - 8,
            verticalAlign: "middle",
            wrap: "none",
          },
        ),
      );
      if (column > 0) {
        nodes.push({
          id: `grid-day-divider-${bandIndex}-${day}`,
          kind: "line",
          points: [
            { x: dayX, y: gridY },
            { x: dayX, y: gridY + timelineHeight },
          ],
          stroke: theme.gridDivider,
          strokeWidth: 1,
        });
      }
      const dayOccurrences = byDay.get(day) ?? [];
      dayLayout.push({
        day,
        band: bandIndex,
        column,
        bounds: {
          x: originX + dayX,
          y: originY + gridY,
          width: dayWidth,
          height: timelineHeight,
        },
        occurrenceCount: dayOccurrences.length,
      });
      const positioned = calculateOverlapLayout(
        dayOccurrences,
        timeRange,
        timelineHeight,
        0,
      );
      for (const occurrence of positioned) {
        const usableWidth = dayWidth - metrics.blockInset * 2;
        const columnWidth = usableWidth / occurrence.columnCount;
        const gap = occurrence.columnCount > 1 ? metrics.overlapGap : 0;
        const bounds: Rect = {
          x:
            dayX +
            metrics.blockInset +
            occurrence.column * columnWidth +
            gap / 2,
          y: gridY + occurrence.top,
          width: Math.max(1, columnWidth - gap),
          height: occurrence.height,
        };
        const subject = subjects.get(occurrence.subjectId)!;
        drawBlock(nodes, blockLayout, {
          project,
          occurrence,
          subject,
          day,
          bounds,
          fields,
          family,
          typography,
          metrics,
          theme,
          fill: resolveSubjectColor({
            subjectId: subject.id,
            subjects: project.schedule,
            automaticPalette: theme.subjectPalette,
            configuration: project.design.subjectColors,
          }),
        });
      }
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
          id: "wallpaper-background",
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
      minX: metrics.margin,
      maxX: metrics.margin + movableX,
      minY: metrics.margin,
      maxY: metrics.margin + movableY,
    },
    compositionFamily: family,
    typography,
    timeRange,
    bandLayout,
    dayLayout,
    blockLayout: blockLayout.map((block) => ({
      ...block,
      bounds: {
        ...block.bounds,
        x: block.bounds.x + originX,
        y: block.bounds.y + originY,
      },
    })),
    hourLabelInterval,
    detailCapabilities,
  };
}
