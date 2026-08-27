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
import { clampPhotoTransform, photoTransformFor } from "./photo-crop";
import { fitText, type FittedText } from "./text-fit";
import { CLEAN_SLATE_RENDER_THEME } from "./themes/clean-slate";
import type { WallpaperThemeTokens } from "./themes/types";
import type {
  Rect,
  RenderModel,
  RenderNode,
  ScheduleRenderResult,
  TextRenderNode,
} from "./types";

export const PHOTO_DAYS: readonly ScheduleDay[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];
export const PHOTO_DAY_NAMES: Record<ScheduleDay, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

export type PhotoHeroDayLayout = {
  day: ScheduleDay;
  bounds: Rect;
  row: number;
  column: number;
  occurrenceCount: number;
};

export type PhotoHeroClassLayout = {
  occurrenceId: string;
  day: ScheduleDay;
  bounds: Rect;
  codeText: string;
};

export type PhotoHeroRenderResult = ScheduleRenderResult & {
  composition: "hero";
  compositionFamily: TargetCompositionFamily;
  columns: number;
  dayLayout: readonly PhotoHeroDayLayout[];
  classLayout: readonly PhotoHeroClassLayout[];
  photoFrame: Rect;
  photoAssetId: string | null;
};

export type PhotoTypography = {
  title: number;
  day: number;
  code: number;
  detail: number;
  professor: number;
};

export type PhotoMetrics = {
  margin: number;
  columnGap: number;
  rowGap: number;
  photoGap: number;
  titleHeight: number;
  titleGap: number;
  dayHeaderHeight: number;
  dayRuleGap: number;
  entryGap: number;
  codeLineHeight: number;
  detailLineHeight: number;
  professorLineHeight: number;
  metadataGap: number;
  radius: number;
  maxDayWidth: number;
};

type CodeFit = FittedText & { truncated: false };
export type PhotoClassPlan = {
  occurrence: ScheduleOccurrence;
  code: CodeFit;
  detailLines: FittedText[];
  professor: FittedText | null;
  height: number;
};

type VerticalFit = {
  metrics: PhotoMetrics;
  typography: PhotoTypography;
  plans: Array<{
    day: ScheduleDay;
    row: number;
    column: number;
    rowCount: number;
    classes: PhotoClassPlan[];
    contentHeight: number;
  }>;
  rowHeights: number[];
  photoHeight: number;
};

export function photoTextNode(
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

export function translatePhotoNode(
  node: RenderNode,
  x: number,
  y: number,
): RenderNode {
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

export function photoTypographyFor(
  family: TargetCompositionFamily,
  scale: number,
): PhotoTypography {
  const base: Record<TargetCompositionFamily, PhotoTypography> = {
    phonePortrait: { title: 54, day: 31, code: 31, detail: 23, professor: 21 },
    tabletPortrait: { title: 66, day: 36, code: 35, detail: 27, professor: 24 },
    tabletLandscape: {
      title: 54,
      day: 27,
      code: 26,
      detail: 20,
      professor: 18,
    },
    desktopLandscape: {
      title: 46,
      day: 23,
      code: 22,
      detail: 17,
      professor: 15,
    },
    square: { title: 48, day: 25, code: 24, detail: 18, professor: 16 },
  };
  return Object.fromEntries(
    Object.entries(base[family]).map(([key, value]) => [
      key,
      Math.round(value * scale),
    ]),
  ) as PhotoTypography;
}

export function photoMetricsFor(family: TargetCompositionFamily): PhotoMetrics {
  const all: Record<TargetCompositionFamily, PhotoMetrics> = {
    phonePortrait: {
      margin: 54,
      columnGap: 40,
      rowGap: 45,
      photoGap: 34,
      titleHeight: 70,
      titleGap: 32,
      dayHeaderHeight: 48,
      dayRuleGap: 16,
      entryGap: 24,
      codeLineHeight: 40,
      detailLineHeight: 31,
      professorLineHeight: 28,
      metadataGap: 7,
      radius: 22,
      maxDayWidth: 470,
    },
    tabletPortrait: {
      margin: 72,
      columnGap: 52,
      rowGap: 54,
      photoGap: 40,
      titleHeight: 82,
      titleGap: 38,
      dayHeaderHeight: 55,
      dayRuleGap: 18,
      entryGap: 28,
      codeLineHeight: 45,
      detailLineHeight: 35,
      professorLineHeight: 32,
      metadataGap: 8,
      radius: 24,
      maxDayWidth: 680,
    },
    tabletLandscape: {
      margin: 82,
      columnGap: 34,
      rowGap: 40,
      photoGap: 28,
      titleHeight: 68,
      titleGap: 26,
      dayHeaderHeight: 42,
      dayRuleGap: 13,
      entryGap: 20,
      codeLineHeight: 34,
      detailLineHeight: 27,
      professorLineHeight: 24,
      metadataGap: 6,
      radius: 18,
      maxDayWidth: 330,
    },
    desktopLandscape: {
      margin: 68,
      columnGap: 28,
      rowGap: 34,
      photoGap: 24,
      titleHeight: 58,
      titleGap: 22,
      dayHeaderHeight: 36,
      dayRuleGap: 11,
      entryGap: 17,
      codeLineHeight: 29,
      detailLineHeight: 23,
      professorLineHeight: 21,
      metadataGap: 5,
      radius: 16,
      maxDayWidth: 290,
    },
    square: {
      margin: 58,
      columnGap: 32,
      rowGap: 38,
      photoGap: 26,
      titleHeight: 60,
      titleGap: 24,
      dayHeaderHeight: 39,
      dayRuleGap: 12,
      entryGap: 18,
      codeLineHeight: 31,
      detailLineHeight: 24,
      professorLineHeight: 22,
      metadataGap: 5,
      radius: 18,
      maxDayWidth: 420,
    },
  };
  return all[family];
}

export function compactPhotoVerticalMetrics(
  metrics: PhotoMetrics,
  factor: number,
): PhotoMetrics {
  const scaled = (value: number) => Math.max(1, Math.round(value * factor));
  return {
    ...metrics,
    rowGap: scaled(metrics.rowGap),
    photoGap: scaled(metrics.photoGap),
    titleGap: scaled(metrics.titleGap),
    dayHeaderHeight: scaled(metrics.dayHeaderHeight),
    dayRuleGap: scaled(metrics.dayRuleGap),
    entryGap: scaled(metrics.entryGap),
    codeLineHeight: scaled(metrics.codeLineHeight),
    detailLineHeight: scaled(metrics.detailLineHeight),
    professorLineHeight: scaled(metrics.professorLineHeight),
    metadataGap: scaled(metrics.metadataGap),
  };
}

export function scalePhotoTypography(
  typography: PhotoTypography,
  factor: number,
): PhotoTypography {
  return Object.fromEntries(
    Object.entries(typography).map(([key, value]) => [
      key,
      Math.max(12, Math.round(value * factor)),
    ]),
  ) as PhotoTypography;
}

function minimumPhotoHeight(
  family: TargetCompositionFamily,
  availableHeight: number,
): number {
  const ratio: Record<TargetCompositionFamily, number> = {
    phonePortrait: 0.18,
    tabletPortrait: 0.18,
    tabletLandscape: 0.22,
    desktopLandscape: 0.22,
    square: 0.24,
  };
  return Math.round(availableHeight * ratio[family]);
}

export function resolvePhotoHeroColumnCount(
  family: TargetCompositionFamily,
  dayCount: number,
  availableWidth: number,
  gap: number,
): number {
  if (dayCount <= 1) return Math.max(1, dayCount);
  if (family === "phonePortrait" || family === "tabletPortrait") return 2;
  if (family === "square") {
    if (dayCount >= 5 || dayCount === 3) return 3;
    return 2;
  }
  if (family === "desktopLandscape") return dayCount;
  if (dayCount <= 4) return dayCount;
  const dayWidth = (availableWidth - gap * (dayCount - 1)) / dayCount;
  return dayWidth >= 230 ? dayCount : 3;
}

function photoHeightFor(
  family: TargetCompositionFamily,
  dimensions: { width: number; height: number },
  contentWidth: number,
): number {
  if (family === "phonePortrait")
    return Math.round(Math.min(contentWidth / 1.55, dimensions.height * 0.29));
  if (family === "tabletPortrait")
    return Math.round(Math.min(contentWidth / 2.05, dimensions.height * 0.3));
  if (family === "tabletLandscape")
    return Math.round(Math.min(contentWidth / 4, dimensions.height * 0.31));
  if (family === "desktopLandscape")
    return Math.round(Math.min(contentWidth / 4.8, dimensions.height * 0.34));
  return Math.round(Math.min(contentWidth / 2.9, dimensions.height * 0.28));
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

function estimateWidth(text: string, fontSize: number): number {
  return Array.from(text).reduce(
    (sum, character) =>
      sum +
      fontSize *
        (character === " " ? 0.34 : /[A-Z0-9]/.test(character) ? 0.62 : 0.5),
    0,
  );
}

function fitCode(text: string, width: number, preferred: number): CodeFit {
  const value = text.trim();
  const minimum = Math.max(12, preferred - 5);
  for (let size = preferred; size >= minimum; size -= 1) {
    if (estimateWidth(value, size) <= width)
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

export function makePhotoClassPlan(
  project: ScheduleProject,
  occurrence: ScheduleOccurrence,
  subject: Subject,
  fields: VisibleFields,
  width: number,
  typography: PhotoTypography,
  metrics: PhotoMetrics,
): PhotoClassPlan {
  const code = fitCode(subject.code, width, typography.code);
  const time = fields.time
    ? timeRange(
        occurrence.startTime,
        occurrence.endTime,
        project.design.clockFormat,
      )
    : "";
  const room = fields.room ? occurrence.room.trim() : "";
  const section =
    fields.section && subject.section.trim()
      ? `Sec ${subject.section.trim()}`
      : "";
  const roomAndSection = [room, section].filter(Boolean).join(" · ");
  const detailTexts = [time, roomAndSection].filter(Boolean);
  const detailLines = detailTexts.map((text) =>
    fitText({
      text,
      width,
      preferredFontSize: typography.detail,
      minimumFontSize: Math.max(11, typography.detail - 3),
      maximumLines: 1,
    }),
  );
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
  const metadataHeight =
    detailLines.length * metrics.detailLineHeight +
    (professor ? metrics.professorLineHeight : 0);
  return {
    occurrence,
    code,
    detailLines,
    professor,
    height: Math.ceil(
      codeHeight +
        (metadataHeight > 0 ? metrics.metadataGap : 0) +
        metadataHeight,
    ),
  };
}

export function drawPhotoClass(
  nodes: RenderNode[],
  item: PhotoClassPlan,
  day: ScheduleDay,
  x: number,
  y: number,
  width: number,
  typography: PhotoTypography,
  metrics: PhotoMetrics,
  theme: WallpaperThemeTokens,
) {
  const id = `${day}-${item.occurrence.id}`;
  nodes.push(
    photoTextNode(
      `photo-code-${id}`,
      item.code.text,
      x,
      y,
      width,
      item.code.fontSize,
      theme.foreground,
      {
        fontWeight: 700,
        height: metrics.codeLineHeight * item.code.lines,
        lineHeight: item.code.lineHeight,
        wrap: item.code.lines > 1 ? "character" : "none",
      },
    ),
  );
  let cursor = y + metrics.codeLineHeight * item.code.lines;
  if (item.detailLines.length || item.professor) cursor += metrics.metadataGap;
  item.detailLines.forEach((detail, index) => {
    nodes.push(
      photoTextNode(
        `photo-detail-${id}-${index}`,
        detail.text,
        x,
        cursor,
        width,
        detail.fontSize,
        theme.photoSupport,
        { fontWeight: 500, height: metrics.detailLineHeight, wrap: "none" },
      ),
    );
    cursor += metrics.detailLineHeight;
  });
  if (item.professor)
    nodes.push(
      photoTextNode(
        `photo-professor-${id}`,
        item.professor.text,
        x,
        cursor,
        width,
        item.professor.fontSize,
        theme.photoMuted,
        { height: metrics.professorLineHeight, wrap: "none" },
      ),
    );
}

export function buildPhotoHeroRenderModel(
  project: ScheduleProject,
  variant: DeviceVariant,
  theme: WallpaperThemeTokens = CLEAN_SLATE_RENDER_THEME,
): PhotoHeroRenderResult {
  const { width, height } = variant.dimensions;
  const family = resolveTargetComposition(variant);
  const baseTypography = photoTypographyFor(
    family,
    project.design.typography.scale,
  );
  const baseMetrics = photoMetricsFor(family);
  const fields = resolveLayoutVisibleFields(
    "photo",
    project.design.visibleFields,
    variant,
  );
  const photoAssetId = project.assetReferences.photoAssetIds[0] ?? null;
  const titleVisible =
    project.design.wallpaperTitle.visible &&
    project.design.wallpaperTitle.text.trim().length > 0;
  const occurrences = expandOccurrences(project.schedule, "full").toSorted(
    (left, right) =>
      left.startMinutes - right.startMinutes ||
      left.subjectCode.localeCompare(right.subjectCode),
  );
  const subjects = new Map(
    project.schedule.map((subject) => [subject.id, subject]),
  );
  const byDay = new Map(
    PHOTO_DAYS.map((day) => [
      day,
      occurrences.filter((item) => item.actualDays[0] === day),
    ]),
  );
  const activeDays = PHOTO_DAYS.filter(
    (day) => (byDay.get(day)?.length ?? 0) > 0,
  );
  const visibleDays =
    project.design.dayVisibility === "full-week" ? PHOTO_DAYS : activeDays;
  const availableWidth = width - baseMetrics.margin * 2;
  const groupWidth = Math.min(
    availableWidth,
    family === "desktopLandscape"
      ? 1784
      : family === "tabletLandscape"
        ? 1900
        : availableWidth,
  );
  const columns = resolvePhotoHeroColumnCount(
    family,
    visibleDays.length,
    groupWidth,
    baseMetrics.columnGap,
  );
  const regularDayWidth = Math.min(
    baseMetrics.maxDayWidth,
    (groupWidth - baseMetrics.columnGap * Math.max(0, columns - 1)) /
      Math.max(1, columns),
  );
  const singleDayWidth = Math.min(
    groupWidth * 0.7,
    Math.max(regularDayWidth, 420),
  );
  const dayWidth = visibleDays.length === 1 ? singleDayWidth : regularDayWidth;
  const normalPhotoHeight = photoHeightFor(
    family,
    variant.dimensions,
    groupWidth,
  );
  const availableHeight = height - baseMetrics.margin * 2;
  const minPhotoHeight = minimumPhotoHeight(family, availableHeight);
  const fitCandidates = [
    { spacing: 1, type: 1 },
    { spacing: 0.9, type: 1 },
    { spacing: 0.82, type: 0.96 },
    { spacing: 0.74, type: 0.92 },
  ];
  let verticalFit: VerticalFit | null = null;
  for (const candidate of fitCandidates) {
    const metrics = compactPhotoVerticalMetrics(baseMetrics, candidate.spacing);
    const typography = scalePhotoTypography(baseTypography, candidate.type);
    const plans = visibleDays.map((day, index) => {
      const row = Math.floor(index / columns);
      const rowStart = row * columns;
      const rowCount = Math.min(columns, visibleDays.length - rowStart);
      const classes = (byDay.get(day) ?? []).map((occurrence) =>
        makePhotoClassPlan(
          project,
          occurrence,
          subjects.get(occurrence.subjectId)!,
          fields,
          dayWidth,
          typography,
          metrics,
        ),
      );
      return {
        day,
        row,
        column: index % columns,
        rowCount,
        classes,
        contentHeight:
          metrics.dayHeaderHeight +
          metrics.dayRuleGap +
          classes.reduce((sum, item) => sum + item.height, 0) +
          Math.max(0, classes.length - 1) * metrics.entryGap,
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
    const scheduleHeight =
      rowHeights.reduce((sum, value) => sum + value, 0) +
      Math.max(0, rowCount - 1) * metrics.rowGap;
    const titleBlockHeight = titleVisible
      ? metrics.titleHeight + metrics.titleGap
      : 0;
    const maximumPhotoHeight =
      availableHeight - metrics.photoGap - titleBlockHeight - scheduleHeight;
    const resolvedPhotoHeight = Math.min(normalPhotoHeight, maximumPhotoHeight);
    verticalFit = {
      metrics,
      typography,
      plans,
      rowHeights,
      photoHeight: Math.max(1, resolvedPhotoHeight),
    };
    if (resolvedPhotoHeight >= minPhotoHeight) break;
  }
  if (!verticalFit) throw new Error("Photo Hero vertical fit did not resolve.");
  const { metrics, typography, plans, rowHeights, photoHeight } = verticalFit;
  const rowCount = rowHeights.length;
  const titleBlockHeight = titleVisible
    ? metrics.titleHeight + metrics.titleGap
    : 0;
  const scheduleTop = photoHeight + metrics.photoGap + titleBlockHeight;
  const rowTops = rowHeights.map(
    (_, row) =>
      scheduleTop +
      rowHeights.slice(0, row).reduce((sum, value) => sum + value, 0) +
      row * metrics.rowGap,
  );
  const contentHeight =
    scheduleTop +
    rowHeights.reduce((sum, value) => sum + value, 0) +
    Math.max(0, rowCount - 1) * metrics.rowGap;
  const groupHeight = Math.max(1, contentHeight);
  const movableX = Math.max(0, width - metrics.margin * 2 - groupWidth);
  const movableY = Math.max(0, height - metrics.margin * 2 - groupHeight);
  const originX = metrics.margin + movableX * variant.schedulePosition.x;
  const originY = metrics.margin + movableY * variant.schedulePosition.y;
  if (
    originX < 0 ||
    originY < 0 ||
    originX + groupWidth > width ||
    originY + groupHeight > height
  ) {
    throw new RangeError("Resolved Photo Hero composition exceeds its target.");
  }
  const localPhotoFrame: Rect = {
    x: 0,
    y: 0,
    width: groupWidth,
    height: photoHeight,
  };
  const photoNodes: RenderNode[] = [];
  if (photoAssetId) {
    const transform = clampPhotoTransform(
      photoTransformFor(variant, "hero", photoAssetId),
    );
    photoNodes.push({
      id: "photo-hero-image",
      kind: "image",
      geometry: localPhotoFrame,
      assetId: photoAssetId,
      fit: "cover",
      focalPoint: transform.position,
      zoom: transform.scale,
      cornerRadius: metrics.radius,
    });
  }
  const nodes: RenderNode[] = [];
  if (titleVisible) {
    const titleY = photoHeight + metrics.photoGap;
    const fit = fitText({
      text: project.design.wallpaperTitle.text,
      width: groupWidth,
      preferredFontSize: typography.title,
      minimumFontSize: Math.max(24, typography.title - 8),
      maximumLines: 1,
    });
    nodes.push(
      photoTextNode(
        "photo-title",
        fit.text,
        0,
        titleY,
        groupWidth,
        fit.fontSize,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 700,
          height: metrics.titleHeight,
          verticalAlign: "middle",
          wrap: "none",
        },
      ),
    );
  }
  const dayLayout: PhotoHeroDayLayout[] = [];
  const classLayout: PhotoHeroClassLayout[] = [];
  for (const plan of plans) {
    const rowWidth =
      plan.rowCount * dayWidth +
      metrics.columnGap * Math.max(0, plan.rowCount - 1);
    const x =
      (groupWidth - rowWidth) / 2 +
      plan.column * (dayWidth + metrics.columnGap);
    const y = rowTops[plan.row]!;
    const dayFit = fitText({
      text: PHOTO_DAY_NAMES[plan.day],
      width: dayWidth,
      preferredFontSize: typography.day,
      minimumFontSize: Math.max(13, typography.day - 6),
      maximumLines: 1,
    });
    nodes.push(
      photoTextNode(
        `photo-day-${plan.day}`,
        dayFit.text,
        x,
        y,
        dayWidth,
        dayFit.fontSize,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 600,
          height: metrics.dayHeaderHeight,
          wrap: "none",
        },
      ),
    );
    const ruleY = y + metrics.dayHeaderHeight;
    nodes.push({
      id: `photo-day-rule-${plan.day}`,
      kind: "line",
      points: [
        { x, y: ruleY },
        { x: x + dayWidth, y: ruleY },
      ],
      stroke: theme.photoRule,
      strokeWidth: 1,
    });
    let classY = ruleY + metrics.dayRuleGap;
    for (const item of plan.classes) {
      drawPhotoClass(
        nodes,
        item,
        plan.day,
        x,
        classY,
        dayWidth,
        typography,
        metrics,
        theme,
      );
      classLayout.push({
        occurrenceId: item.occurrence.id,
        day: plan.day,
        bounds: {
          x: originX + x,
          y: originY + classY,
          width: dayWidth,
          height: item.height,
        },
        codeText: item.code.text,
      });
      classY += item.height + metrics.entryGap;
    }
    dayLayout.push({
      day: plan.day,
      bounds: {
        x: originX + x,
        y: originY + y,
        width: dayWidth,
        height: rowHeights[plan.row]!,
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
  const photoFrame: Rect = {
    x: originX,
    y: originY,
    width: groupWidth,
    height: photoHeight,
  };
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
    {
      id: "photos",
      nodes: photoNodes.map((node) =>
        translatePhotoNode(node, originX, originY),
      ),
    },
    {
      id: "schedule",
      nodes: nodes.map((node) => translatePhotoNode(node, originX, originY)),
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
    photoFrame,
    photoAssetId,
    composition: "hero",
    compositionFamily: family,
    columns,
    dayLayout,
    classLayout,
  };
}
