import type { IdFactory } from "@/domain/schedule";

import {
  parsePortalRows,
  PortalImportError,
  type PendingPortalImport,
} from "./portal-parser";

export type PdfTextItem = { str: string; x: number; y: number };

const PDF_HEADERS = [
  "Current Subject",
  "Section",
  "Units",
  "Day",
  "Time",
  "Room",
  "Instructor",
  "School Year",
] as const;

type PdfColumn =
  | "subject"
  | "section"
  | "units"
  | "day"
  | "time"
  | "schedule"
  | "session"
  | "room"
  | "instructor"
  | "schoolYear";
type ColumnAnchor = PdfTextItem & { column: PdfColumn };

const HEADER_ALIASES: ReadonlyArray<readonly [PdfColumn, readonly string[]]> = [
  [
    "subject",
    [
      "subject",
      "current subject",
      "subject code",
      "course",
      "course code",
      "course no",
      "course number",
      "class code",
    ],
  ],
  ["section", ["section", "sec", "class section"]],
  ["units", ["units", "unit", "credits", "credit"]],
  ["day", ["day", "days"]],
  ["time", ["time", "class time"]],
  ["schedule", ["schedule", "class schedule", "day time"]],
  ["session", ["session"]],
  ["room", ["room", "classroom", "venue"]],
  ["instructor", ["instructor", "professor", "faculty", "teacher", "lecturer"]],
  ["schoolYear", ["school", "school year", "academic year"]],
];

const SUBJECT_CODE = /\b(?=[A-Z0-9._-]*\d)[A-Z][A-Z0-9._-]{1,}\b/i;
const CLOCK_12 = /\d{1,2}:\d{2}\s*(?:AM|PM)/i;
const CLOCK_24 = /\b(?:[01]?\d|2[0-3]):[0-5]\d\b/;
const TIME_RANGE_12 =
  /\b\d{1,2}:\d{2}\s*(?:AM|PM)\s*[-–—]\s*\d{1,2}:\d{2}\s*(?:AM|PM)\b/i;
const TIME_RANGE_24 =
  /\b(?:[01]?\d|2[0-3]):[0-5]\d\s*[-–—]\s*(?:[01]?\d|2[0-3]):[0-5]\d\b/;

function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function columnForHeader(value: string): PdfColumn | undefined {
  const normalized = normalizeHeader(value);
  return HEADER_ALIASES.find(([, aliases]) =>
    aliases.includes(normalized),
  )?.[0];
}

function cleanPdfCell(parts: readonly PdfTextItem[]): string {
  return [...parts]
    .sort((left, right) => right.y - left.y || left.x - right.x)
    .map((part) => part.str.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/^(\d{4}-\d{4}-)\s+(\d+)$/, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

function findHeaderAnchors(items: readonly PdfTextItem[]): ColumnAnchor[] {
  const candidates = items.flatMap((item) => {
    const column = columnForHeader(item.str);
    return column ? [{ ...item, column }] : [];
  });
  const subjectCandidates = candidates.filter(
    (candidate) => candidate.column === "subject",
  );
  for (const subject of subjectCandidates) {
    const nearby = candidates.filter(
      (candidate) => Math.abs(candidate.y - subject.y) <= 20,
    );
    const unique = new Map<PdfColumn, ColumnAnchor>();
    nearby.forEach((candidate) => {
      const existing = unique.get(candidate.column);
      if (
        !existing ||
        Math.abs(candidate.y - subject.y) < Math.abs(existing.y - subject.y)
      ) {
        unique.set(candidate.column, candidate);
      }
    });
    if (
      unique.has("subject") &&
      (unique.has("schedule") || unique.has("time")) &&
      (unique.has("schedule") || unique.has("day"))
    ) {
      return [...unique.values()].sort((left, right) => left.x - right.x);
    }
  }
  return [];
}

function columnBounds(anchors: readonly ColumnAnchor[]) {
  return anchors.map((anchor, index) => ({
    anchor,
    left:
      index === 0
        ? Number.NEGATIVE_INFINITY
        : (anchors[index - 1]!.x + anchor.x) / 2,
    right:
      index === anchors.length - 1
        ? Number.POSITIVE_INFINITY
        : (anchor.x + anchors[index + 1]!.x) / 2,
  }));
}

function itemsInColumn(
  items: readonly PdfTextItem[],
  anchors: readonly ColumnAnchor[],
  column: PdfColumn,
): PdfTextItem[] {
  const bounds = columnBounds(anchors).find(
    (candidate) => candidate.anchor.column === column,
  );
  if (!bounds) return [];
  return items.filter((item) => item.x >= bounds.left && item.x < bounds.right);
}

function normalizePdfDay(value: string): string {
  return value
    .replace(/\b(?:Monday|Mon)\b/gi, "M")
    .replace(/\b(?:Tuesday|Tue)\b/gi, "T")
    .replace(/\b(?:Wednesday|Wed)\b/gi, "W")
    .replace(/\b(?:Thursday|Thu)\b/gi, "TH")
    .replace(/\b(?:Friday|Fri)\b/gi, "F")
    .replace(/\b(?:Saturday|Sat)\b/gi, "SAT")
    .replace(/\s+/g, "")
    .trim();
}

function clock24To12(value: string): string {
  const [hoursText, minutes = "00"] = value.split(":");
  const hours = Number(hoursText);
  const suffix = hours < 12 ? "AM" : "PM";
  return `${hours % 12 || 12}:${minutes} ${suffix}`;
}

function extractTime(value: string): { value: string; index: number } | null {
  const twelveHour = TIME_RANGE_12.exec(value);
  if (twelveHour) {
    return {
      value: twelveHour[0].replace(/[–—]/g, "-"),
      index: twelveHour.index,
    };
  }
  const twentyFourHour = TIME_RANGE_24.exec(value);
  if (!twentyFourHour) return null;
  const [start, end] = twentyFourHour[0].split(/\s*[-–—]\s*/);
  return {
    value: `${clock24To12(start!)} - ${clock24To12(end!)}`,
    index: twentyFourHour.index,
  };
}

function rowBaselines(
  items: readonly PdfTextItem[],
  anchors: readonly ColumnAnchor[],
  headerY: number,
): number[] {
  const subjectItems = itemsInColumn(items, anchors, "subject").filter(
    (item) => item.y < headerY - 2 && SUBJECT_CODE.test(item.str),
  );
  const preferred = subjectItems.length
    ? subjectItems
    : (["schedule", "time"] as const).flatMap((column) =>
        itemsInColumn(items, anchors, column).filter(
          (item) =>
            item.y < headerY - 2 &&
            (CLOCK_12.test(item.str) || CLOCK_24.test(item.str)),
        ),
      );
  const baselines: number[] = [];
  preferred
    .sort((left, right) => right.y - left.y)
    .forEach((item) => {
      if (!baselines.some((value) => Math.abs(value - item.y) <= 2)) {
        baselines.push(item.y);
      }
    });
  return baselines;
}

function extractPageRows(items: readonly PdfTextItem[]): unknown[][] {
  const anchors = findHeaderAnchors(items);
  if (anchors.length === 0) return [];
  const headerY = Math.min(...anchors.map((anchor) => anchor.y));
  const baselines = rowBaselines(items, anchors, headerY);
  const bounds = columnBounds(anchors);
  return baselines.flatMap((baseline, rowIndex) => {
    const nextY = baselines[rowIndex + 1] ?? Number.NEGATIVE_INFINITY;
    const band = items.filter(
      (item) => item.y <= baseline + 2 && item.y > nextY + 2,
    );
    const cells = new Map<PdfColumn, PdfTextItem[]>();
    band.forEach((item) => {
      const column = bounds.find(
        (candidate) => item.x >= candidate.left && item.x < candidate.right,
      )?.anchor.column;
      if (!column) return;
      const parts = cells.get(column) ?? [];
      parts.push(item);
      cells.set(column, parts);
    });
    const cell = (column: PdfColumn) => cleanPdfCell(cells.get(column) ?? []);
    const subjectCell = cell("subject");
    const subject = SUBJECT_CODE.exec(subjectCell)?.[0] ?? subjectCell;
    const schedule = cell("schedule");
    const timeSource = schedule || cell("time");
    const time = extractTime(timeSource);
    const daySource = schedule
      ? schedule.slice(0, time?.index ?? schedule.length)
      : cell("day");
    const day = normalizePdfDay(daySource);
    if (!subject || !day || !time) return [];
    return [
      [
        subject,
        cell("section"),
        cell("units"),
        day,
        time.value,
        cell("room").replace(/^No Room$/i, ""),
        cell("instructor").replace(/^No Instructor$/i, ""),
        cell("schoolYear"),
      ],
    ];
  });
}

export function extractPortalPdfRows(
  pages: readonly (readonly PdfTextItem[])[],
): unknown[][] {
  return pages.flatMap(extractPageRows);
}

export async function parsePortalPdf(
  bytes: ArrayBuffer,
  options: { idFactory: IdFactory },
): Promise<PendingPortalImport> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const document = await pdfjs.getDocument({ data: new Uint8Array(bytes) })
    .promise;
  const pages: PdfTextItem[][] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(
      content.items.flatMap((item) =>
        "str" in item && item.str.trim()
          ? [
              {
                str: item.str,
                x: item.transform[4],
                y: item.transform[5],
              },
            ]
          : [],
      ),
    );
  }
  const rows = extractPortalPdfRows(pages);
  if (rows.length === 0) {
    throw new PortalImportError(
      "The PDF does not contain a recognizable schedule table. Look for a table with Subject and either Day/Time or Schedule headers.",
      "empty-workbook",
    );
  }
  return parsePortalRows([PDF_HEADERS, ...rows], {
    ...options,
    sheetName: "PDF schedule",
  });
}
