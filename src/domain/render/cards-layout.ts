import type { DeviceVariant, VisibleFields } from "@/domain/device/types";
import type { ScheduleProject } from "@/domain/project";
import {
  expandOccurrences,
  type ScheduleOccurrence,
} from "@/domain/schedule/occurrences";
import type { ScheduleDay, Subject } from "@/domain/schedule/types";
import type {
  EditorOverlayModel,
  Rect,
  RenderLayer,
  RenderModel,
  RenderNode,
  TextRenderNode,
} from "./types";
import { fitText } from "./text-fit";
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

export type CardsComposition = "phone" | "desktop";
export type CardsTypography = {
  title: number;
  day: number;
  code: number;
  name: number;
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
export type CardsRenderResult = {
  model: RenderModel;
  overlay: EditorOverlayModel;
  scheduleBounds: Rect;
  positionRange: { minX: number; maxX: number; minY: number; maxY: number };
  composition: CardsComposition;
  typography: CardsTypography;
  dayLayout: readonly CardsDayLayout[];
};

type CardPlan = {
  occurrence: ScheduleOccurrence;
  subject: Subject;
  height: number;
  nameFit: ReturnType<typeof fitText> | null;
  time: string;
  support: string;
  professor: string;
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
  theme: CleanSlateRenderTheme,
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
): CardsTypography {
  const base: CardsTypography =
    composition === "phone"
      ? {
          title: 80,
          day: 40,
          code: 38,
          name: 30,
          time: 28,
          support: 26,
          professor: 26,
        }
      : {
          title: 50,
          day: 27,
          code: 21,
          name: 17,
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

function createCardPlan(
  project: ScheduleProject,
  occurrence: ScheduleOccurrence,
  subject: Subject,
  fields: VisibleFields,
  width: number,
  composition: CardsComposition,
  typography: CardsTypography,
): CardPlan {
  const pad = composition === "phone" ? 22 : 16;
  const textWidth = width - pad * 2;
  const code = fields.subjectCode ? subject.code.trim() : "";
  const name = fields.subjectName ? subject.name.trim() : "";
  const secondaryName = code && name ? name : "";
  const nameFit = secondaryName
    ? fitText({
        text: secondaryName,
        width: textWidth,
        preferredFontSize: typography.name,
        minimumFontSize: composition === "phone" ? 26 : 14,
        maximumLines: 2,
      })
    : null;
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
  const primary = code || name;
  const vertical =
    composition === "phone"
      ? {
          pad: 22,
          code: 46,
          nameGap: 4,
          sectionGap: 13,
          time: 35,
          support: 33,
          professor: 32,
        }
      : {
          pad: 16,
          code: 27,
          nameGap: 2,
          sectionGap: 9,
          time: 22,
          support: 20,
          professor: 20,
        };
  let cardHeight = vertical.pad * 2;
  if (primary) cardHeight += vertical.code;
  if (nameFit)
    cardHeight +=
      vertical.nameGap + nameFit.lines * nameFit.fontSize * nameFit.lineHeight;
  if (time || support || professor) cardHeight += vertical.sectionGap;
  if (time) cardHeight += vertical.time;
  if (support) cardHeight += vertical.support;
  if (professor) cardHeight += vertical.professor;
  return {
    occurrence,
    subject,
    height: Math.ceil(cardHeight),
    nameFit,
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
  composition: CardsComposition,
  typography: CardsTypography,
  theme: CleanSlateRenderTheme,
  color: string,
  day: ScheduleDay,
) {
  const { occurrence, subject } = plan;
  const pad = composition === "phone" ? 22 : 16;
  const textWidth = width - pad * 2;
  const code = fields.subjectCode ? subject.code.trim() : "";
  const name = fields.subjectName ? subject.name.trim() : "";
  const primary = code || name;
  const id = `${day}-${occurrence.id}`;
  nodes.push({
    id: `card-${id}`,
    kind: "rect",
    geometry: { x, y, width, height: plan.height },
    fill: color,
    stroke: theme.border,
    strokeWidth: 1,
    cornerRadius: composition === "phone" ? 15 : 11,
  });
  let cursor = y + pad;
  if (primary) {
    const fit = fitText({
      text: primary,
      width: textWidth,
      preferredFontSize: typography.code,
      minimumFontSize: composition === "phone" ? 33 : 17,
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
        { fontWeight: 800, height: composition === "phone" ? 46 : 27 },
      ),
    );
    cursor += composition === "phone" ? 46 : 27;
  }
  if (plan.nameFit) {
    cursor += composition === "phone" ? 4 : 2;
    nodes.push(
      textNode(
        `name-${id}`,
        plan.nameFit.text,
        x + pad,
        cursor,
        textWidth,
        plan.nameFit.fontSize,
        theme.secondary,
        {
          lineHeight: plan.nameFit.lineHeight,
          height:
            plan.nameFit.lines *
            plan.nameFit.fontSize *
            plan.nameFit.lineHeight,
          wrap: "word",
          fontWeight: 500,
        },
      ),
    );
    cursor +=
      plan.nameFit.lines * plan.nameFit.fontSize * plan.nameFit.lineHeight;
  }
  if (plan.time || plan.support || plan.professor)
    cursor += composition === "phone" ? 13 : 9;
  if (plan.time) {
    nodes.push(
      textNode(
        `time-${id}`,
        plan.time,
        x + pad,
        cursor,
        textWidth,
        typography.time,
        theme.foreground,
        { height: composition === "phone" ? 35 : 22, fontWeight: 700 },
      ),
    );
    cursor += composition === "phone" ? 35 : 22;
  }
  if (plan.support) {
    const fit = fitText({
      text: plan.support,
      width: textWidth,
      preferredFontSize: typography.support,
      minimumFontSize: composition === "phone" ? 23 : 12,
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
        theme.muted,
        { height: composition === "phone" ? 33 : 20, fontWeight: 600 },
      ),
    );
    cursor += composition === "phone" ? 33 : 20;
  }
  if (plan.professor) {
    const fit = fitText({
      text: plan.professor,
      width: textWidth,
      preferredFontSize: typography.professor,
      minimumFontSize: composition === "phone" ? 23 : 12,
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
        theme.muted,
        { height: composition === "phone" ? 32 : 20 },
      ),
    );
  }
}

export function buildCardsRenderModel(
  project: ScheduleProject,
  variant: DeviceVariant,
  theme: CleanSlateRenderTheme = CLEAN_SLATE_RENDER_THEME,
): CardsRenderResult {
  const { width, height } = variant.dimensions;
  const composition: CardsComposition =
    variant.category === "phone" ? "phone" : "desktop";
  const typography = typographyFor(
    composition,
    project.design.typography.scale,
  );
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
  const availableWidth = width - margin * 2;
  const columnGap = composition === "phone" ? 28 : 18;
  const groupWidth =
    composition === "phone"
      ? Math.min(920, availableWidth)
      : visibleDays.length === 0
        ? Math.min(600, availableWidth)
        : Math.min(
            availableWidth,
            visibleDays.length * (visibleDays.length <= 2 ? 360 : 300) +
              Math.max(0, visibleDays.length - 1) * columnGap,
          );
  const pairedPhoneWidth = (groupWidth - columnGap) / 2;
  const desktopWidth =
    visibleDays.length > 0
      ? (groupWidth - Math.max(0, visibleDays.length - 1) * columnGap) /
        visibleDays.length
      : groupWidth;
  const titleVisible =
    project.design.wallpaperTitle.visible &&
    project.design.wallpaperTitle.text.trim().length > 0;
  const titleBlockHeight = titleVisible
    ? composition === "phone"
      ? 154
      : 96
    : 0;
  const dayHeaderHeight = composition === "phone" ? 88 : 51;
  const cardGap = composition === "phone" ? 16 : 12;
  const rowGap = composition === "phone" ? 34 : 0;
  const dayPlans = visibleDays.map((day, index) => {
    const row = composition === "phone" ? Math.floor(index / 2) : 0;
    const isSingleton =
      composition === "phone" &&
      index === visibleDays.length - 1 &&
      visibleDays.length % 2 === 1;
    const dayWidth =
      composition === "phone"
        ? visibleDays.length === 1
          ? Math.min(620, groupWidth)
          : pairedPhoneWidth
        : desktopWidth;
    const items = (byDay.get(day) ?? []).map((occurrence) =>
      createCardPlan(
        project,
        occurrence,
        subjects.get(occurrence.subjectId)!,
        fields,
        dayWidth,
        composition,
        typography,
      ),
    );
    const dayHeight =
      dayHeaderHeight +
      items.reduce((sum, item) => sum + item.height, 0) +
      Math.max(0, items.length - 1) * cardGap;
    return {
      day,
      row,
      column: composition === "phone" ? (isSingleton ? 0 : index % 2) : index,
      width: dayWidth,
      height: dayHeight,
      items,
      isSingleton,
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
      minimumFontSize: composition === "phone" ? 68 : 38,
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
          height: composition === "phone" ? 112 : 70,
          verticalAlign: "middle",
        },
      ),
    );
  }
  const dayLayout: CardsDayLayout[] = [];
  for (const plan of dayPlans) {
    const x =
      composition === "phone"
        ? plan.isSingleton || visibleDays.length === 1
          ? (groupWidth - plan.width) / 2
          : plan.column * (pairedPhoneWidth + columnGap)
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
          height: composition === "phone" ? 55 : 34,
        },
      ),
      {
        id: `day-line-${plan.day}`,
        kind: "line",
        points: [
          { x, y: y + (composition === "phone" ? 65 : 38) },
          { x: x + plan.width, y: y + (composition === "phone" ? 65 : 38) },
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
        composition,
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
        id: "clean-slate-background",
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
    typography,
    dayLayout,
  };
}
