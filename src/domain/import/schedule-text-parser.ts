import type { IdFactory } from "@/domain/schedule";

import { parsePortalDays } from "./portal-days";
import {
  parsePortalRows,
  PortalImportError,
  type PendingPortalImport,
} from "./portal-parser";

const TEXT_HEADERS = [
  "Current Subject",
  "Section",
  "Units",
  "Day",
  "Time",
  "Room",
  "Instructor",
  "School Year",
] as const;

const SUBJECT_CODE = /^(?=.*\d)[A-Z][A-Z0-9._-]*$/i;
const SCHOOL_YEAR = /^\d{4}-\d{4}(?:-\d+)?$/;
const TIME_RANGE =
  /\b\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)\b/i;
const LONG_DAY =
  /Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?/i;

function decodeCopiedText(value: string): string {
  return value
    .replace(/&#x0*9;|&#0*9;/gi, "\t")
    .replace(/&#x20;|&#32;|&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .trim();
}

function cleanCell(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isHeaderCell(value: string): boolean {
  const normalized = cleanCell(value).toLowerCase();
  return [
    "current subject",
    "subject",
    "section",
    "sec",
    "day",
    "time",
    "schedule",
    "session",
    "room",
    "instructor",
    "faculty",
    "school year",
    "units",
  ].includes(normalized);
}

function dedupeRows(rows: unknown[][]): unknown[][] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = row
      .slice(0, 7)
      .map((value) => cleanCell(String(value ?? "")).toLowerCase())
      .join("\u0000");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parsePortalCellStream(text: string): unknown[][] {
  const cells = text
    .split(/[\t\n]/)
    .map(cleanCell)
    .filter(Boolean);
  const starts: number[] = [];

  cells.forEach((cell, index) => {
    if (!SUBJECT_CODE.test(cell) || SCHOOL_YEAR.test(cell)) return;
    if (isHeaderCell(cell)) return;
    const nearby = cells.slice(index + 1, index + 6);
    if (nearby.some((value) => TIME_RANGE.test(value))) starts.push(index);
  });

  return starts.flatMap((start, rowIndex) => {
    const block = cells
      .slice(start, starts[rowIndex + 1] ?? cells.length)
      .filter((value) => !isHeaderCell(value));
    const timeIndex = block.findIndex((value) => TIME_RANGE.test(value));
    if (timeIndex < 2) return [];
    const dayCandidate = block[timeIndex - 1] ?? "";
    const parsedDay = parsePortalDays(dayCandidate);
    if (!parsedDay.valid) return [];

    const afterTime = block.slice(timeIndex + 1);
    if (/^\d+(?:\.\d+)?$/.test(afterTime[0] ?? "")) afterTime.shift();
    const schoolYearIndex = afterTime.findIndex((value) =>
      SCHOOL_YEAR.test(value),
    );
    const details = afterTime.slice(
      0,
      schoolYearIndex >= 0 ? schoolYearIndex : afterTime.length,
    );
    const schoolYear = schoolYearIndex >= 0 ? afterTime[schoolYearIndex] : "";

    return [
      [
        block[0],
        block[1],
        "",
        dayCandidate,
        block[timeIndex],
        details[0] ?? "",
        details.slice(1).join(" "),
        schoolYear,
      ],
    ];
  });
}

type FlatMatch = {
  index: number;
  end: number;
  code: string;
  section: string;
  units: string;
  day: string;
  time: string;
};

function portalDayForLongName(day: string): string {
  const normalized = day.slice(0, 3).toLowerCase();
  return {
    mon: "M",
    tue: "T",
    wed: "W",
    thu: "TH",
    fri: "F",
    sat: "SAT",
  }[normalized]!;
}

function parseFlattenedRows(text: string): unknown[][] {
  const flattened = text.replace(/[\t\n]+/g, " ").replace(/\s+/g, " ");
  const record = new RegExp(
    String.raw`\b([A-Z][A-Z0-9._-]*\d[A-Z0-9._-]*)\s+.+?\s+([A-Z0-9-]*(?:ONLINE|ONSITE)[A-Z0-9-]*)\s+(\d+(?:\.\d+)?)\s+(${LONG_DAY.source})\s+(${TIME_RANGE.source})`,
    "gi",
  );
  const matches: FlatMatch[] = [];
  let match: RegExpExecArray | null;
  while ((match = record.exec(flattened))) {
    matches.push({
      index: match.index,
      end: record.lastIndex,
      code: match[1]!,
      section: match[2]!,
      units: match[3]!,
      day: match[4]!,
      time: match[5]!,
    });
  }

  return matches.map((current, index) => {
    const tail = cleanCell(
      flattened.slice(
        current.end,
        matches[index + 1]?.index ?? flattened.length,
      ),
    );
    const withoutTrailingEntity = tail.replace(/&(?:#x20|#32|nbsp);?$/i, "");
    const noDetails = /^No Room\s+No Instructor\b/i.test(withoutTrailingEntity);
    return [
      current.code,
      current.section,
      current.units,
      portalDayForLongName(current.day),
      current.time,
      noDetails ? "" : withoutTrailingEntity,
      "",
      "",
    ];
  });
}

export function parsePastedSchedule(
  rawText: string,
  options: { idFactory: IdFactory },
): PendingPortalImport {
  const text = decodeCopiedText(rawText);
  if (!text) {
    throw new PortalImportError(
      "The pasted schedule is empty.",
      "empty-workbook",
    );
  }
  const rows = dedupeRows([
    ...parsePortalCellStream(text),
    ...parseFlattenedRows(text),
  ]);
  if (rows.length === 0) {
    throw new PortalImportError(
      "No class meetings could be recognized in the pasted text.",
      "empty-workbook",
    );
  }
  return parsePortalRows([TEXT_HEADERS, ...rows], options);
}
