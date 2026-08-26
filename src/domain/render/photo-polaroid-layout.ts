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
  Point,
  Rect,
  RenderModel,
  RenderNode,
  ScheduleRenderResult,
} from "./types";

export const POLAROID_CAPTION_MAX_LENGTH = 40;

export type PolaroidFrameLayout = {
  assetId: string;
  paper: Rect;
  image: Rect;
  captionBounds: Rect | null;
  rotation: number;
  caption: string;
};

export type PhotoPolaroidRenderResult = ScheduleRenderResult & {
  composition: "polaroid";
  compositionFamily: TargetCompositionFamily;
  photoFrames: readonly {
    assetId: string;
    frame: Rect;
    rotation: number;
  }[];
  polaroids: readonly PolaroidFrameLayout[];
  dayLayout: readonly {
    day: ScheduleDay;
    bounds: Rect;
    row: number;
    column: number;
  }[];
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
  height: number;
};

type PolaroidTemplate = {
  x: number;
  y: number;
  height: number;
  rotation: number;
};

const POLAROID_FOUR_PHOTO_TEMPLATES: Record<
  TargetCompositionFamily,
  readonly PolaroidTemplate[]
> = {
  phonePortrait: [
    { x: 0.1, y: 0.02, height: 0.45, rotation: -1.4 },
    { x: 0.62, y: 0.07, height: 0.44, rotation: 1.2 },
    { x: 0.06, y: 0.53, height: 0.44, rotation: 1 },
    { x: 0.58, y: 0.5, height: 0.46, rotation: -1.1 },
  ],
  tabletPortrait: [
    { x: 0.02, y: 0.08, height: 0.76, rotation: -1.3 },
    { x: 0.245, y: 0.02, height: 0.78, rotation: 1.1 },
    { x: 0.475, y: 0.1, height: 0.76, rotation: -0.8 },
    { x: 0.7, y: 0.04, height: 0.78, rotation: 1.2 },
  ],
  tabletLandscape: [
    { x: 0.02, y: 0.04, height: 0.37, rotation: -1.4 },
    { x: 0.48, y: 0.1, height: 0.36, rotation: 1.2 },
    { x: 0.08, y: 0.57, height: 0.36, rotation: 0.9 },
    { x: 0.5, y: 0.52, height: 0.38, rotation: -1.2 },
  ],
  desktopLandscape: [
    { x: 0.02, y: 0.03, height: 0.44, rotation: -1.4 },
    { x: 0.48, y: 0.1, height: 0.42, rotation: 1.2 },
    { x: 0.08, y: 0.54, height: 0.42, rotation: 0.9 },
    { x: 0.52, y: 0.49, height: 0.44, rotation: -1.2 },
  ],
  square: [
    { x: 0.02, y: 0.01, height: 0.27, rotation: -1.4 },
    { x: 0.4, y: 0.25, height: 0.27, rotation: 1.2 },
    { x: 0.06, y: 0.49, height: 0.27, rotation: 0.9 },
    { x: 0.44, y: 0.73, height: 0.27, rotation: -1.1 },
  ],
};

function rotatePoint(origin: Point, point: Point, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const x = point.x - origin.x;
  const y = point.y - origin.y;
  return {
    x: origin.x + x * cosine - y * sine,
    y: origin.y + x * sine + y * cosine,
  };
}

function splitColumns(family: TargetCompositionFamily, dayCount: number) {
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

function resolveScheduleFit(
  project: ScheduleProject,
  variant: DeviceVariant,
  visibleDays: readonly ScheduleDay[],
  byDay: ReadonlyMap<ScheduleDay, ReturnType<typeof expandOccurrences>>,
  columns: number,
  dayWidth: number,
  maximumHeight: number,
  titleVisible: boolean,
  family: TargetCompositionFamily,
): ScheduleFit {
  const fields = resolveLayoutVisibleFields(
    "photo",
    project.design.visibleFields,
    variant,
  );
  const subjects = new Map(
    project.schedule.map((subject) => [subject.id, subject]),
  );
  const baseMetrics = photoMetricsFor(family);
  const baseTypography = photoTypographyFor(
    family,
    project.design.typography.scale,
  );
  const candidates =
    family === "desktopLandscape"
      ? [
          { spacing: 1.08, type: 1.15 },
          { spacing: 0.96, type: 1.08 },
          { spacing: 0.84, type: 1 },
        ]
      : family === "tabletLandscape"
        ? [
            { spacing: 1.05, type: 1.1 },
            { spacing: 0.94, type: 1.05 },
            { spacing: 0.82, type: 0.98 },
          ]
        : [
            { spacing: 0.88, type: 1 },
            { spacing: 0.78, type: 0.96 },
            { spacing: 0.7, type: 0.92 },
          ];
  let result: ScheduleFit | null = null;
  for (const candidate of candidates) {
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
    const height =
      rowHeights.reduce((sum, value) => sum + value, 0) +
      Math.max(0, rowCount - 1) * metrics.rowGap +
      (titleVisible ? metrics.titleHeight + metrics.titleGap : 0);
    result = { metrics, typography, plans, rowHeights, height };
    if (height <= maximumHeight) break;
  }
  if (!result || result.height > maximumHeight)
    throw new RangeError("Resolved Polaroid schedule exceeds its target.");
  return result;
}

function buildPolaroidNodes(
  project: ScheduleProject,
  variant: DeviceVariant,
  family: TargetCompositionFamily,
  area: Rect,
  theme: CleanSlateRenderTheme,
) {
  const assetIds = project.assetReferences.photoAssetIds.slice(0, 4);
  const template = POLAROID_FOUR_PHOTO_TEMPLATES[family];
  const nodes: RenderNode[] = [];
  const layouts: PolaroidFrameLayout[] = [];
  const photoFrames: Array<{
    assetId: string;
    frame: Rect;
    rotation: number;
  }> = [];
  assetIds.forEach((assetId, index) => {
    const item = template[index]!;
    const paperHeight = area.height * item.height;
    const paperWidth = Math.min(paperHeight * 0.82, area.width * 0.68);
    const paper: Rect = {
      x: area.x + Math.min(area.width - paperWidth, area.width * item.x),
      y: area.y + area.height * item.y,
      width: paperWidth,
      height: paperHeight,
    };
    const side = paperWidth * 0.065;
    const top = side;
    const bottom = paperHeight * 0.16;
    const rawImage: Rect = {
      x: paper.x + side,
      y: paper.y + top,
      width: paperWidth - side * 2,
      height: paperHeight - top - bottom,
    };
    const imagePoint = rotatePoint(
      paper,
      { x: rawImage.x, y: rawImage.y },
      item.rotation,
    );
    const image: Rect = { ...rawImage, ...imagePoint };
    const caption = project.design.photoCaptions[assetId] ?? "";
    nodes.push({
      id: `polaroid-paper-${assetId}`,
      kind: "rect",
      geometry: paper,
      rotation: item.rotation,
      fill: theme.polaroidPaper,
      cornerRadius: Math.max(3, paperWidth * 0.015),
      shadowColor: theme.polaroidShadow,
      shadowBlur: Math.max(3, paperWidth * 0.018),
      shadowOffset: { x: 0, y: Math.max(2, paperHeight * 0.012) },
      shadowOpacity: 0.12,
    });
    const transform = clampPhotoTransform(
      photoTransformFor(variant, "polaroid", assetId),
    );
    nodes.push({
      id: `polaroid-image-${assetId}`,
      kind: "image",
      geometry: image,
      rotation: item.rotation,
      assetId,
      fit: "cover",
      focalPoint: transform.position,
      zoom: transform.scale,
      cornerRadius: Math.max(2, paperWidth * 0.008),
    });
    let captionBounds: Rect | null = null;
    if (caption) {
      const rawCaption = {
        x: paper.x + side,
        y: rawImage.y + rawImage.height + paperHeight * 0.025,
      };
      const captionPoint = rotatePoint(paper, rawCaption, item.rotation);
      captionBounds = {
        x: captionPoint.x,
        y: captionPoint.y,
        width: paperWidth - side * 2,
        height: bottom * 0.62,
      };
      nodes.push(
        photoTextNode(
          `polaroid-caption-${assetId}`,
          caption,
          captionPoint.x,
          captionPoint.y,
          paperWidth - side * 2,
          Math.max(15, Math.min(28, paperWidth * 0.09)),
          theme.polaroidCaption,
          {
            fontId: "caption-hand",
            height: captionBounds.height,
            align: "center",
            verticalAlign: "middle",
            wrap: "none",
            rotation: item.rotation,
          },
        ),
      );
    }
    layouts.push({
      assetId,
      paper,
      image,
      captionBounds,
      rotation: item.rotation,
      caption,
    });
    photoFrames.push({ assetId, frame: image, rotation: item.rotation });
  });
  return { nodes, layouts, photoFrames };
}

export function buildPhotoPolaroidRenderModel(
  project: ScheduleProject,
  variant: DeviceVariant,
  theme: CleanSlateRenderTheme = CLEAN_SLATE_RENDER_THEME,
): PhotoPolaroidRenderResult {
  const { width, height } = variant.dimensions;
  const family = resolveTargetComposition(variant);
  const portrait = family === "phonePortrait" || family === "tabletPortrait";
  const baseMetrics = photoMetricsFor(family);
  const availableWidth = width - baseMetrics.margin * 2;
  const availableHeight = height - baseMetrics.margin * 2;
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
  const columns = splitColumns(family, visibleDays.length);
  const gutter = portrait
    ? 0
    : family === "desktopLandscape"
      ? 44
      : family === "tabletLandscape"
        ? 46
        : 42;
  const photoAreaWidth = portrait
    ? availableWidth
    : Math.round(availableWidth * (family === "square" ? 0.38 : 0.36));
  const scheduleWidth = portrait
    ? availableWidth
    : availableWidth - photoAreaWidth - gutter;
  const dayWidth = Math.min(
    baseMetrics.maxDayWidth,
    (scheduleWidth - baseMetrics.columnGap * Math.max(0, columns - 1)) /
      Math.max(1, columns),
  );
  let photoAreaHeight: number;
  let groupHeight: number;
  let scheduleFit: ScheduleFit;
  if (portrait) {
    scheduleFit = resolveScheduleFit(
      project,
      variant,
      visibleDays,
      byDay,
      columns,
      dayWidth,
      availableHeight * 0.7,
      titleVisible,
      family,
    );
    const gap = scheduleFit.metrics.photoGap;
    photoAreaHeight = Math.min(
      availableHeight * 0.36,
      availableHeight - gap - scheduleFit.height,
    );
    if (photoAreaHeight < availableHeight * 0.18)
      throw new RangeError("Resolved Polaroid photo group is too small.");
    groupHeight = photoAreaHeight + gap + scheduleFit.height;
  } else {
    scheduleFit = resolveScheduleFit(
      project,
      variant,
      visibleDays,
      byDay,
      columns,
      dayWidth,
      availableHeight,
      titleVisible,
      family,
    );
    const minimumGroupRatio = family === "square" ? 0.84 : 0.82;
    groupHeight = Math.max(
      availableHeight * minimumGroupRatio,
      scheduleFit.height,
    );
    photoAreaHeight = groupHeight;
  }
  if (groupHeight > availableHeight)
    throw new RangeError("Resolved Polaroid composition exceeds its target.");
  const movableY = Math.max(0, availableHeight - groupHeight);
  const originX = baseMetrics.margin;
  const originY = baseMetrics.margin + movableY * variant.schedulePosition.y;
  const scheduleX = portrait ? 0 : photoAreaWidth + gutter;
  const scheduleTop = portrait
    ? photoAreaHeight + scheduleFit.metrics.photoGap
    : 0;
  const titleBlock = titleVisible
    ? scheduleFit.metrics.titleHeight + scheduleFit.metrics.titleGap
    : 0;
  const dayTop = scheduleTop + titleBlock;
  const photoArea: Rect = {
    x: portrait ? availableWidth * 0.04 : 0,
    y: 0,
    width: portrait ? availableWidth * 0.92 : photoAreaWidth,
    height: photoAreaHeight,
  };
  const polaroid = buildPolaroidNodes(
    project,
    variant,
    family,
    photoArea,
    theme,
  );
  const scheduleNodes: RenderNode[] = [];
  if (titleVisible) {
    const titleFit = fitText({
      text: project.design.wallpaperTitle.text,
      width: scheduleWidth,
      preferredFontSize: scheduleFit.typography.title,
      minimumFontSize: Math.max(24, scheduleFit.typography.title - 8),
      maximumLines: 1,
    });
    scheduleNodes.push(
      photoTextNode(
        "photo-polaroid-title",
        titleFit.text,
        scheduleX,
        scheduleTop,
        scheduleWidth,
        titleFit.fontSize,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 700,
          height: scheduleFit.metrics.titleHeight,
          verticalAlign: "middle",
          wrap: "none",
        },
      ),
    );
  }
  const rowTops = scheduleFit.rowHeights.map(
    (_, row) =>
      dayTop +
      scheduleFit.rowHeights
        .slice(0, row)
        .reduce((sum, value) => sum + value, 0) +
      row * scheduleFit.metrics.rowGap,
  );
  const dayLayout: Array<{
    day: ScheduleDay;
    bounds: Rect;
    row: number;
    column: number;
  }> = [];
  for (const plan of scheduleFit.plans) {
    const rowWidth =
      plan.rowCount * dayWidth +
      scheduleFit.metrics.columnGap * Math.max(0, plan.rowCount - 1);
    const x =
      scheduleX +
      (scheduleWidth - rowWidth) / 2 +
      plan.column * (dayWidth + scheduleFit.metrics.columnGap);
    const y = rowTops[plan.row]!;
    const dayFit = fitText({
      text: PHOTO_DAY_NAMES[plan.day],
      width: dayWidth,
      preferredFontSize: scheduleFit.typography.day,
      minimumFontSize: Math.max(13, scheduleFit.typography.day - 6),
      maximumLines: 1,
    });
    scheduleNodes.push(
      photoTextNode(
        `photo-polaroid-day-${plan.day}`,
        dayFit.text,
        x,
        y,
        dayWidth,
        dayFit.fontSize,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 600,
          height: scheduleFit.metrics.dayHeaderHeight,
          wrap: "none",
        },
      ),
    );
    const ruleY = y + scheduleFit.metrics.dayHeaderHeight;
    scheduleNodes.push({
      id: `photo-polaroid-day-rule-${plan.day}`,
      kind: "line",
      points: [
        { x, y: ruleY },
        { x: x + dayWidth, y: ruleY },
      ],
      stroke: theme.photoRule,
      strokeWidth: 1,
    });
    let classY = ruleY + scheduleFit.metrics.dayRuleGap;
    for (const item of plan.classes) {
      drawPhotoClass(
        scheduleNodes,
        item,
        plan.day,
        x,
        classY,
        dayWidth,
        scheduleFit.typography,
        scheduleFit.metrics,
        theme,
      );
      classY += item.height + scheduleFit.metrics.entryGap;
    }
    dayLayout.push({
      day: plan.day,
      bounds: {
        x: originX + x,
        y: originY + y,
        width: dayWidth,
        height: scheduleFit.rowHeights[plan.row]!,
      },
      row: plan.row,
      column: plan.column,
    });
  }
  const translatedPhotoFrames = polaroid.photoFrames.map((item) => ({
    ...item,
    frame: {
      ...item.frame,
      x: item.frame.x + originX,
      y: item.frame.y + originY,
    },
  }));
  const translatedPolaroids = polaroid.layouts.map((item) => ({
    ...item,
    paper: {
      ...item.paper,
      x: item.paper.x + originX,
      y: item.paper.y + originY,
    },
    image: {
      ...item.image,
      x: item.image.x + originX,
      y: item.image.y + originY,
    },
    captionBounds: item.captionBounds
      ? {
          ...item.captionBounds,
          x: item.captionBounds.x + originX,
          y: item.captionBounds.y + originY,
        }
      : null,
  }));
  const scheduleBounds: Rect = {
    x: originX,
    y: originY,
    width: availableWidth,
    height: groupHeight,
  };
  const scheduleRegion: Rect = {
    x: originX + scheduleX,
    y: originY + scheduleTop,
    width: scheduleWidth,
    height: scheduleFit.height,
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
      nodes: polaroid.nodes.map((node) =>
        translatePhotoNode(node, originX, originY),
      ),
    },
    {
      id: "schedule",
      nodes: scheduleNodes.map((node) =>
        translatePhotoNode(node, originX, originY),
      ),
    },
    { id: "foreground", nodes: [] },
  ];
  return {
    model: { width, height, layers },
    overlay: { safeAreas: [], selection: scheduleBounds, warningRegions: [] },
    scheduleBounds,
    positionRange: {
      minX: baseMetrics.margin,
      maxX: baseMetrics.margin,
      minY: baseMetrics.margin,
      maxY: baseMetrics.margin + movableY,
    },
    photoAssetId: project.assetReferences.photoAssetIds[0] ?? null,
    photoFrames: translatedPhotoFrames,
    polaroids: translatedPolaroids,
    dayLayout,
    scheduleRegion,
    composition: "polaroid",
    compositionFamily: family,
  };
}
