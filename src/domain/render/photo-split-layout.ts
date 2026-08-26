import {
  resolveTargetComposition,
  type TargetCompositionFamily,
} from "@/domain/device/composition";
import type { DeviceVariant } from "@/domain/device/types";
import type { ScheduleProject } from "@/domain/project";
import { expandOccurrences } from "@/domain/schedule/occurrences";
import type { ScheduleDay } from "@/domain/schedule/types";
import { resolveLayoutVisibleFields } from "./layout-capabilities";
import {
  PHOTO_DAYS,
  PHOTO_DAY_NAMES,
  compactPhotoVerticalMetrics,
  drawPhotoClass,
  makePhotoClassPlan,
  photoMetricsFor,
  photoTextNode,
  photoTypographyFor,
  scalePhotoTypography,
  translatePhotoNode,
  type PhotoClassPlan,
  type PhotoMetrics,
  type PhotoTypography,
} from "./photo-layout";
import { clampPhotoTransform, photoTransformFor } from "./photo-crop";
import { fitText } from "./text-fit";
import {
  CLEAN_SLATE_RENDER_THEME,
  type CleanSlateRenderTheme,
} from "./themes/clean-slate";
import type {
  Rect,
  RenderModel,
  RenderNode,
  ScheduleRenderResult,
} from "./types";

export type PhotoSplitDayLayout = {
  day: ScheduleDay;
  bounds: Rect;
  row: number;
  column: number;
  occurrenceCount: number;
};

export type PhotoSplitRenderResult = ScheduleRenderResult & {
  composition: "split";
  compositionFamily: TargetCompositionFamily;
  columns: number;
  dayLayout: readonly PhotoSplitDayLayout[];
  photoFrame: Rect;
  photoAssetId: string | null;
  scheduleRegion: Rect;
};

type DayPlan = {
  day: ScheduleDay;
  row: number;
  column: number;
  rowCount: number;
  classes: PhotoClassPlan[];
  contentHeight: number;
};

type ScheduleFit = {
  metrics: PhotoMetrics;
  typography: PhotoTypography;
  plans: DayPlan[];
  rowHeights: number[];
  scheduleHeight: number;
};

export function resolvePhotoSplitColumnCount(
  family: TargetCompositionFamily,
  dayCount: number,
): number {
  if (dayCount <= 1) return Math.max(1, dayCount);
  if (
    family === "phonePortrait" ||
    family === "tabletPortrait" ||
    family === "square"
  )
    return 2;
  if (dayCount >= 5 || dayCount === 3) return 3;
  return 2;
}

function resolveDayPlans(
  project: ScheduleProject,
  variant: DeviceVariant,
  visibleDays: readonly ScheduleDay[],
  byDay: ReadonlyMap<ScheduleDay, ReturnType<typeof expandOccurrences>>,
  columns: number,
  dayWidth: number,
  typography: PhotoTypography,
  metrics: PhotoMetrics,
): ScheduleFit {
  const fields = resolveLayoutVisibleFields(
    "photo",
    project.design.visibleFields,
    variant,
  );
  const subjects = new Map(
    project.schedule.map((subject) => [subject.id, subject]),
  );
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
  return {
    metrics,
    typography,
    plans,
    rowHeights,
    scheduleHeight:
      rowHeights.reduce((sum, value) => sum + value, 0) +
      Math.max(0, rowCount - 1) * metrics.rowGap,
  };
}

export function buildPhotoSplitRenderModel(
  project: ScheduleProject,
  variant: DeviceVariant,
  theme: CleanSlateRenderTheme = CLEAN_SLATE_RENDER_THEME,
): PhotoSplitRenderResult {
  const { width, height } = variant.dimensions;
  const family = resolveTargetComposition(variant);
  const portrait = family === "phonePortrait" || family === "tabletPortrait";
  const baseMetrics = photoMetricsFor(family);
  const baseTypography = photoTypographyFor(
    family,
    project.design.typography.scale,
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
  const availableHeight = height - baseMetrics.margin * 2;
  const gutter = portrait
    ? 0
    : family === "desktopLandscape"
      ? 52
      : family === "tabletLandscape"
        ? 60
        : 48;
  let photoWidth = portrait
    ? availableWidth
    : Math.round(availableWidth * 0.42);
  let scheduleWidth = portrait
    ? availableWidth
    : availableWidth - photoWidth - gutter;
  const columns = resolvePhotoSplitColumnCount(family, visibleDays.length);
  if (!portrait) {
    const minimumScheduleWidth =
      columns * (family === "square" ? 250 : 190) +
      Math.max(0, columns - 1) * baseMetrics.columnGap;
    if (scheduleWidth < minimumScheduleWidth) {
      photoWidth = Math.max(
        Math.round(availableWidth * 0.36),
        availableWidth - gutter - minimumScheduleWidth,
      );
      scheduleWidth = availableWidth - photoWidth - gutter;
    }
  }
  const dayWidth = Math.min(
    baseMetrics.maxDayWidth,
    (scheduleWidth - baseMetrics.columnGap * Math.max(0, columns - 1)) /
      Math.max(1, columns),
  );
  const fitCandidates = [
    { spacing: portrait ? 0.9 : 0.94, type: 1 },
    { spacing: portrait ? 0.8 : 0.84, type: 0.97 },
    { spacing: 0.72, type: 0.92 },
  ];
  let fit: ScheduleFit | null = null;
  let photoHeight = 1;
  let groupHeight = 1;
  for (const candidate of fitCandidates) {
    const metrics = compactPhotoVerticalMetrics(baseMetrics, candidate.spacing);
    const typography = scalePhotoTypography(baseTypography, candidate.type);
    const candidateFit = resolveDayPlans(
      project,
      variant,
      visibleDays,
      byDay,
      columns,
      dayWidth,
      typography,
      metrics,
    );
    const titleBlock = titleVisible
      ? metrics.titleHeight + metrics.titleGap
      : 0;
    if (portrait) {
      const desiredPhotoHeight = Math.round(
        Math.min(
          availableWidth / (family === "phonePortrait" ? 1.18 : 1.38),
          availableHeight * (family === "phonePortrait" ? 0.44 : 0.42),
        ),
      );
      const maximumPhotoHeight =
        availableHeight -
        metrics.photoGap -
        titleBlock -
        candidateFit.scheduleHeight;
      photoHeight = Math.min(desiredPhotoHeight, maximumPhotoHeight);
      groupHeight =
        photoHeight +
        metrics.photoGap +
        titleBlock +
        candidateFit.scheduleHeight;
      fit = candidateFit;
      if (photoHeight >= availableHeight * 0.18) break;
    } else {
      const scheduleSideHeight = titleBlock + candidateFit.scheduleHeight;
      groupHeight = Math.max(
        Math.round(availableHeight * 0.76),
        scheduleSideHeight,
      );
      photoHeight = groupHeight;
      fit = candidateFit;
      if (groupHeight <= availableHeight) break;
    }
  }
  if (!fit) throw new Error("Photo Split geometry did not resolve.");
  if (photoHeight <= 0 || groupHeight > availableHeight) {
    throw new RangeError(
      "Resolved Photo Split composition exceeds its target.",
    );
  }
  const movableX = Math.max(0, width - baseMetrics.margin * 2 - availableWidth);
  const movableY = Math.max(0, height - baseMetrics.margin * 2 - groupHeight);
  const originX = baseMetrics.margin + movableX * variant.schedulePosition.x;
  const originY = baseMetrics.margin + movableY * variant.schedulePosition.y;
  const scheduleX = portrait ? 0 : photoWidth + gutter;
  const scheduleTop = portrait
    ? photoHeight +
      fit.metrics.photoGap +
      (titleVisible ? fit.metrics.titleHeight + fit.metrics.titleGap : 0)
    : titleVisible
      ? fit.metrics.titleHeight + fit.metrics.titleGap
      : 0;
  const localPhotoFrame: Rect = {
    x: 0,
    y: 0,
    width: photoWidth,
    height: photoHeight,
  };
  const photoNodes: RenderNode[] = [];
  if (photoAssetId) {
    const transform = clampPhotoTransform(
      photoTransformFor(variant, "split", photoAssetId),
    );
    photoNodes.push({
      id: "photo-split-image",
      kind: "image",
      geometry: localPhotoFrame,
      assetId: photoAssetId,
      fit: "cover",
      focalPoint: transform.position,
      zoom: transform.scale,
      cornerRadius: fit.metrics.radius,
    });
  }
  const nodes: RenderNode[] = [];
  if (titleVisible) {
    const titleX = portrait ? 0 : scheduleX;
    const titleY = portrait ? photoHeight + fit.metrics.photoGap : 0;
    const titleFit = fitText({
      text: project.design.wallpaperTitle.text,
      width: scheduleWidth,
      preferredFontSize: fit.typography.title,
      minimumFontSize: Math.max(24, fit.typography.title - 8),
      maximumLines: 1,
    });
    nodes.push(
      photoTextNode(
        "photo-split-title",
        titleFit.text,
        titleX,
        titleY,
        scheduleWidth,
        titleFit.fontSize,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 700,
          height: fit.metrics.titleHeight,
          verticalAlign: "middle",
          wrap: "none",
        },
      ),
    );
  }
  const rowTops = fit.rowHeights.map(
    (_, row) =>
      scheduleTop +
      fit.rowHeights.slice(0, row).reduce((sum, value) => sum + value, 0) +
      row * fit.metrics.rowGap,
  );
  const dayLayout: PhotoSplitDayLayout[] = [];
  for (const plan of fit.plans) {
    const rowWidth =
      plan.rowCount * dayWidth +
      fit.metrics.columnGap * Math.max(0, plan.rowCount - 1);
    const x =
      scheduleX +
      (scheduleWidth - rowWidth) / 2 +
      plan.column * (dayWidth + fit.metrics.columnGap);
    const y = rowTops[plan.row]!;
    const dayFit = fitText({
      text: PHOTO_DAY_NAMES[plan.day],
      width: dayWidth,
      preferredFontSize: fit.typography.day,
      minimumFontSize: Math.max(13, fit.typography.day - 6),
      maximumLines: 1,
    });
    nodes.push(
      photoTextNode(
        `photo-split-day-${plan.day}`,
        dayFit.text,
        x,
        y,
        dayWidth,
        dayFit.fontSize,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 600,
          height: fit.metrics.dayHeaderHeight,
          wrap: "none",
        },
      ),
    );
    const ruleY = y + fit.metrics.dayHeaderHeight;
    nodes.push({
      id: `photo-split-day-rule-${plan.day}`,
      kind: "line",
      points: [
        { x, y: ruleY },
        { x: x + dayWidth, y: ruleY },
      ],
      stroke: theme.photoRule,
      strokeWidth: 1,
    });
    let classY = ruleY + fit.metrics.dayRuleGap;
    for (const item of plan.classes) {
      drawPhotoClass(
        nodes,
        item,
        plan.day,
        x,
        classY,
        dayWidth,
        fit.typography,
        fit.metrics,
        theme,
      );
      classY += item.height + fit.metrics.entryGap;
    }
    dayLayout.push({
      day: plan.day,
      bounds: {
        x: originX + x,
        y: originY + y,
        width: dayWidth,
        height: fit.rowHeights[plan.row]!,
      },
      row: plan.row,
      column: plan.column,
      occurrenceCount: plan.classes.length,
    });
  }
  const scheduleBounds: Rect = {
    x: originX,
    y: originY,
    width: availableWidth,
    height: groupHeight,
  };
  const photoFrame: Rect = {
    x: originX,
    y: originY,
    width: photoWidth,
    height: photoHeight,
  };
  const scheduleRegion: Rect = {
    x: originX + scheduleX,
    y: originY,
    width: scheduleWidth,
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
      minX: baseMetrics.margin,
      maxX: baseMetrics.margin + movableX,
      minY: baseMetrics.margin,
      maxY: baseMetrics.margin + movableY,
    },
    photoFrame,
    photoAssetId,
    scheduleRegion,
    composition: "split",
    compositionFamily: family,
    columns,
    dayLayout,
  };
}
