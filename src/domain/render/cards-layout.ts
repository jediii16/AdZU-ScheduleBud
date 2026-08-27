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
import type {
  Rect,
  RenderLayer,
  RenderModel,
  RenderNode,
  ScheduleRenderResult,
  TextRenderNode,
} from "./types";
import { fitText } from "./text-fit";
import { CLEAN_SLATE_RENDER_THEME } from "./themes/clean-slate";
import type { WallpaperThemeTokens } from "./themes/types";

const DAYS: readonly ScheduleDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES: Record<ScheduleDay, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

export type CardsComposition = "phone" | "desktop";
export type CardsTypography = {
  title: number;
  day: number;
  code: number;
  time: number;
  support: number;
  professor: number;
};
export type CardsDayLayout = {
  day: ScheduleDay;
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
  column: number;
  occurrenceCount: number;
};
export type CardsRenderResult = ScheduleRenderResult & {
  composition: CardsComposition;
  compositionFamily: TargetCompositionFamily;
  typography: CardsTypography;
  dayLayout: readonly CardsDayLayout[];
};

type CardPlan = {
  occurrence: ScheduleOccurrence;
  subject: Subject;
  height: number;
  time: string;
  support: string;
  professor: string;
};

type CardsGeometry = {
  pad: number;
  codeHeight: number;
  sectionGap: number;
  timeHeight: number;
  supportHeight: number;
  professorHeight: number;
  codeMinimum: number;
  supportMinimum: number;
  cornerRadius: number;
  titleBlockHeight: number;
  titleTextHeight: number;
  titleMinimum: number;
  dayHeaderHeight: number;
  dayTextHeight: number;
  dayLineOffset: number;
  cardGap: number;
  rowGap: number;
};

function timeLabel(time: string, format: "12-hour" | "24-hour"): string {
  if (format === "24-hour") return time;
  const [hours, minutes] = time.split(":").map(Number);
  const hour = hours! % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${hours! < 12 ? "AM" : "PM"}`;
}

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

function colorForSubject(
  project: ScheduleProject,
  subjectId: string,
  index: number,
  theme: WallpaperThemeTokens,
): string {
  const colors = project.design.subjectColors;
  if (colors.mode === "single" && colors.singleColor) return colors.singleColor;
  if (colors.mode === "per-subject" && colors.bySubjectId[subjectId])
    return colors.bySubjectId[subjectId]!;
  return theme.subjectPalette[index % theme.subjectPalette.length]!;
}

function emptyLayers(
  backgroundNodes: readonly RenderNode[],
  scheduleNodes: readonly RenderNode[],
): RenderModel["layers"] {
  return [
    { id: "background", nodes: backgroundNodes },
    { id: "scenery", nodes: [] },
    { id: "photos", nodes: [] },
    { id: "schedule", nodes: scheduleNodes },
    { id: "foreground", nodes: [] },
  ];
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

function typographyFor(
  composition: CardsComposition,
  scale: number,
  family: TargetCompositionFamily,
  titleVisible: boolean,
): CardsTypography {
  const base: CardsTypography =
    family === "square"
      ? titleVisible
        ? {
            title: 50,
            day: 30,
            code: 28,
            time: 20,
            support: 18,
            professor: 17,
          }
        : {
            title: 52,
            day: 32,
            code: 30,
            time: 22,
            support: 20,
            professor: 18,
          }
      : composition === "phone"
        ? {
            title: 80,
            day: 40,
            code: 38,
            time: 28,
            support: 26,
            professor: 26,
          }
        : {
            title: 50,
            day: 27,
            code: 21,
            time: 16,
            support: 14,
            professor: 14,
          };
  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => [
      key,
      Math.round(value * scale),
    ]),
  ) as CardsTypography;
}

function geometryFor(
  composition: CardsComposition,
  family: TargetCompositionFamily,
  titleVisible: boolean,
): CardsGeometry {
  if (family === "square") {
    return titleVisible
      ? {
          pad: 10,
          codeHeight: 32,
          sectionGap: 6,
          timeHeight: 21,
          supportHeight: 19,
          professorHeight: 17,
          codeMinimum: 23,
          supportMinimum: 15,
          cornerRadius: 11,
          titleBlockHeight: 90,
          titleTextHeight: 66,
          titleMinimum: 42,
          dayHeaderHeight: 64,
          dayTextHeight: 42,
          dayLineOffset: 49,
          cardGap: 8,
          rowGap: 18,
        }
      : {
          pad: 12,
          codeHeight: 34,
          sectionGap: 7,
          timeHeight: 23,
          supportHeight: 21,
          professorHeight: 19,
          codeMinimum: 25,
          supportMinimum: 16,
          cornerRadius: 11,
          titleBlockHeight: 0,
          titleTextHeight: 0,
          titleMinimum: 42,
          dayHeaderHeight: 68,
          dayTextHeight: 45,
          dayLineOffset: 52,
          cardGap: 10,
          rowGap: 20,
        };
  }
  if (composition === "phone") {
    return {
      pad: 22,
      codeHeight: 46,
      sectionGap: 13,
      timeHeight: 35,
      supportHeight: 33,
      professorHeight: 32,
      codeMinimum: 33,
      supportMinimum: 23,
      cornerRadius: 15,
      titleBlockHeight: titleVisible ? 154 : 0,
      titleTextHeight: 112,
      titleMinimum: 68,
      dayHeaderHeight: 88,
      dayTextHeight: 55,
      dayLineOffset: 65,
      cardGap: 16,
      rowGap: 34,
    };
  }
  return {
    pad: 16,
    codeHeight: 27,
    sectionGap: 9,
    timeHeight: 22,
    supportHeight: 20,
    professorHeight: 20,
    codeMinimum: 17,
    supportMinimum: 12,
    cornerRadius: 11,
    titleBlockHeight: titleVisible ? 96 : 0,
    titleTextHeight: 70,
    titleMinimum: 38,
    dayHeaderHeight: 51,
    dayTextHeight: 34,
    dayLineOffset: 38,
    cardGap: 12,
    rowGap: 0,
  };
}

function createCardPlan(
  project: ScheduleProject,
  occurrence: ScheduleOccurrence,
  subject: Subject,
  fields: VisibleFields,
  geometry: CardsGeometry,
): CardPlan {
  const code = subject.code.trim();
  const time = fields.time
    ? `${timeLabel(occurrence.startTime, project.design.clockFormat)}–${timeLabel(occurrence.endTime, project.design.clockFormat)}`
    : "";
  const support = [
    fields.room ? occurrence.room.trim() : "",
    fields.section && subject.section.trim()
      ? `Sec ${subject.section.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const professor = fields.professor ? occurrence.professor.trim() : "";
  let cardHeight = geometry.pad * 2;
  if (code) cardHeight += geometry.codeHeight;
  if (time || support || professor) cardHeight += geometry.sectionGap;
  if (time) cardHeight += geometry.timeHeight;
  if (support) cardHeight += geometry.supportHeight;
  if (professor) cardHeight += geometry.professorHeight;
  return {
    occurrence,
    subject,
    height: Math.ceil(cardHeight),
    time,
    support,
    professor,
  };
}

function drawCard(
  nodes: RenderNode[],
  plan: CardPlan,
  x: number,
  y: number,
  width: number,
  fields: VisibleFields,
  geometry: CardsGeometry,
  typography: CardsTypography,
  theme: WallpaperThemeTokens,
  color: string,
  day: ScheduleDay,
) {
  const { occurrence, subject } = plan;
  const pad = geometry.pad;
  const textWidth = width - pad * 2;
  const code = subject.code.trim();
  const id = `${day}-${occurrence.id}`;
  nodes.push({
    id: `card-${id}`,
    kind: "rect",
    geometry: { x, y, width, height: plan.height },
    fill: color,
    stroke: theme.border,
    strokeWidth: 1,
    cornerRadius: geometry.cornerRadius,
  });
  let cursor = y + pad;
  if (code) {
    const fit = fitText({
      text: code,
      width: textWidth,
      preferredFontSize: typography.code,
      minimumFontSize: geometry.codeMinimum,
      maximumLines: 1,
    });
    nodes.push(
      textNode(
        `code-${id}`,
        fit.text,
        x + pad,
        cursor,
        textWidth,
        fit.fontSize,
        theme.foreground,
        { fontWeight: 800, height: geometry.codeHeight },
      ),
    );
    cursor += geometry.codeHeight;
  }
  if (plan.time || plan.support || plan.professor)
    cursor += geometry.sectionGap;
  if (plan.time) {
    nodes.push(
      textNode(
        `time-${id}`,
        plan.time,
        x + pad,
        cursor,
        textWidth,
        typography.time,
        theme.cardsTime,
        { height: geometry.timeHeight, fontWeight: 700 },
      ),
    );
    cursor += geometry.timeHeight;
  }
  if (plan.support) {
    const fit = fitText({
      text: plan.support,
      width: textWidth,
      preferredFontSize: typography.support,
      minimumFontSize: geometry.supportMinimum,
      maximumLines: 1,
    });
    nodes.push(
      textNode(
        `support-${id}`,
        fit.text,
        x + pad,
        cursor,
        textWidth,
        fit.fontSize,
        theme.cardsMetadata,
        { height: geometry.supportHeight, fontWeight: 600 },
      ),
    );
    cursor += geometry.supportHeight;
  }
  if (plan.professor) {
    const fit = fitText({
      text: plan.professor,
      width: textWidth,
      preferredFontSize: typography.professor,
      minimumFontSize: geometry.supportMinimum,
      maximumLines: 1,
    });
    nodes.push(
      textNode(
        `professor-${id}`,
        fit.text,
        x + pad,
        cursor,
        textWidth,
        fit.fontSize,
        theme.cardsMetadata,
        { height: geometry.professorHeight },
      ),
    );
  }
}

export function buildCardsRenderModel(
  project: ScheduleProject,
  variant: DeviceVariant,
  theme: WallpaperThemeTokens = CLEAN_SLATE_RENDER_THEME,
): CardsRenderResult {
  const { width, height } = variant.dimensions;
  const compositionFamily = resolveTargetComposition(variant);
  const composition: CardsComposition =
    compositionFamily === "phonePortrait" ||
    compositionFamily === "tabletPortrait" ||
    compositionFamily === "square"
      ? "phone"
      : "desktop";
  const titleVisible =
    project.design.wallpaperTitle.visible &&
    project.design.wallpaperTitle.text.trim().length > 0;
  const typography = typographyFor(
    composition,
    project.design.typography.scale,
    compositionFamily,
    titleVisible,
  );
  const geometry = geometryFor(composition, compositionFamily, titleVisible);
  const margin = composition === "phone" ? 56 : 64;
  const fields = mergedFields(project, variant);
  const subjects = new Map(
    project.schedule.map((subject) => [subject.id, subject]),
  );
  const subjectOrder = new Map(
    project.schedule.map((subject, index) => [subject.id, index]),
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
  const compactColumns =
    compositionFamily === "phonePortrait"
      ? 2
      : compositionFamily === "square"
        ? visibleDays.length >= 5
          ? 3
          : 2
        : variant.dimensions.width >= 1500
          ? 3
          : 2;
  const availableWidth = width - margin * 2;
  const columnGap = composition === "phone" ? 28 : 18;
  const groupWidth =
    composition === "phone"
      ? Math.min(
          compositionFamily === "phonePortrait"
            ? 920
            : compactColumns * 480 + (compactColumns - 1) * columnGap,
          availableWidth,
        )
      : visibleDays.length === 0
        ? Math.min(600, availableWidth)
        : Math.min(
            availableWidth,
            visibleDays.length * (visibleDays.length <= 2 ? 360 : 300) +
              Math.max(0, visibleDays.length - 1) * columnGap,
          );
  const compactDayWidth =
    (groupWidth - columnGap * (compactColumns - 1)) / compactColumns;
  const desktopWidth =
    visibleDays.length > 0
      ? (groupWidth - Math.max(0, visibleDays.length - 1) * columnGap) /
        visibleDays.length
      : groupWidth;
  const titleBlockHeight = geometry.titleBlockHeight;
  const dayHeaderHeight = geometry.dayHeaderHeight;
  const cardGap = geometry.cardGap;
  const rowGap = geometry.rowGap;
  const dayPlans = visibleDays.map((day, index) => {
    const row =
      composition === "phone" ? Math.floor(index / compactColumns) : 0;
    const rowStart = row * compactColumns;
    const rowItemCount = Math.min(
      compactColumns,
      visibleDays.length - rowStart,
    );
    const dayWidth =
      composition === "phone"
        ? visibleDays.length === 1
          ? Math.min(620, groupWidth)
          : compactDayWidth
        : desktopWidth;
    const items = (byDay.get(day) ?? []).map((occurrence) =>
      createCardPlan(
        project,
        occurrence,
        subjects.get(occurrence.subjectId)!,
        fields,
        geometry,
      ),
    );
    const dayHeight =
      dayHeaderHeight +
      items.reduce((sum, item) => sum + item.height, 0) +
      Math.max(0, items.length - 1) * cardGap;
    return {
      day,
      row,
      column: composition === "phone" ? index % compactColumns : index,
      width: dayWidth,
      height: dayHeight,
      items,
      rowItemCount,
    };
  });
  const rowCount = dayPlans.reduce((max, day) => Math.max(max, day.row + 1), 0);
  const rowHeights = Array.from({ length: rowCount }, (_, row) =>
    Math.max(
      ...dayPlans.filter((day) => day.row === row).map((day) => day.height),
    ),
  );
  const rowTops = rowHeights.map(
    (_, row) =>
      titleBlockHeight +
      rowHeights.slice(0, row).reduce((sum, value) => sum + value, 0) +
      row * rowGap,
  );
  const contentHeight =
    rowHeights.reduce((sum, value) => sum + value, 0) +
    Math.max(0, rowCount - 1) * rowGap;
  const groupHeight = Math.max(1, titleBlockHeight + contentHeight);
  const movableX = Math.max(0, width - margin * 2 - groupWidth);
  const movableY = Math.max(0, height - margin * 2 - groupHeight);
  const originX = margin + movableX * variant.schedulePosition.x;
  const originY = margin + movableY * variant.schedulePosition.y;
  const nodes: RenderNode[] = [];
  if (titleVisible) {
    const fit = fitText({
      text: project.design.wallpaperTitle.text,
      width: groupWidth,
      preferredFontSize: typography.title,
      minimumFontSize: geometry.titleMinimum,
      maximumLines: 1,
      averageGlyphWidth: 0.58,
    });
    nodes.push(
      textNode(
        "wallpaper-title",
        fit.text,
        0,
        0,
        groupWidth,
        fit.fontSize,
        theme.foreground,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 800,
          height: geometry.titleTextHeight,
          verticalAlign: "middle",
        },
      ),
    );
  }
  const dayLayout: CardsDayLayout[] = [];
  for (const plan of dayPlans) {
    const x =
      composition === "phone"
        ? (groupWidth -
            (plan.rowItemCount * plan.width +
              (plan.rowItemCount - 1) * columnGap)) /
            2 +
          plan.column * (plan.width + columnGap)
        : plan.column * (desktopWidth + columnGap);
    const y = rowTops[plan.row]!;
    dayLayout.push({
      day: plan.day,
      x: originX + x,
      y: originY + y,
      width: plan.width,
      height: plan.height,
      row: plan.row,
      column: plan.column,
      occurrenceCount: plan.items.length,
    });
    nodes.push(
      textNode(
        `day-${plan.day}`,
        DAY_NAMES[plan.day],
        x,
        y,
        plan.width,
        typography.day,
        theme.dayAccent,
        {
          fontId: project.design.typography.headingFontId,
          fontWeight: 800,
          height: geometry.dayTextHeight,
        },
      ),
      {
        id: `day-line-${plan.day}`,
        kind: "line",
        points: [
          { x, y: y + geometry.dayLineOffset },
          { x: x + plan.width, y: y + geometry.dayLineOffset },
        ],
        stroke: theme.border,
        strokeWidth: 2,
      },
    );
    let cardY = y + dayHeaderHeight;
    for (const item of plan.items) {
      drawCard(
        nodes,
        item,
        x,
        cardY,
        plan.width,
        fields,
        geometry,
        typography,
        theme,
        colorForSubject(
          project,
          item.subject.id,
          subjectOrder.get(item.subject.id) ?? 0,
          theme,
        ),
        plan.day,
      );
      cardY += item.height + cardGap;
    }
  }
  const scheduleBounds: Rect = {
    x: originX,
    y: originY,
    width: groupWidth,
    height: groupHeight,
  };
  const translated = nodes.map((node) => translateNode(node, originX, originY));
  const background: RenderLayer<"background"> = {
    id: "background",
    nodes: [
      {
        id: "wallpaper-background",
        kind: "rect",
        geometry: { x: 0, y: 0, width, height },
        fill: theme.background,
      },
    ],
  };
  return {
    model: { width, height, layers: emptyLayers(background.nodes, translated) },
    overlay: { safeAreas: [], selection: scheduleBounds, warningRegions: [] },
    scheduleBounds,
    positionRange: {
      minX: margin,
      maxX: margin + movableX,
      minY: margin,
      maxY: margin + movableY,
    },
    composition,
    compositionFamily,
    typography,
    dayLayout,
  };
}
