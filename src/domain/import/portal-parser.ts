import {
  normalizeSubject,
  type IdFactory,
  type Subject,
} from "@/domain/schedule";

import { parsePortalDays } from "./portal-days";
import { parsePortalTimeRange } from "./portal-time";

export const PORTAL_REQUIRED_COLUMNS = [
  "Current Subject",
  "Day",
  "Time",
] as const;

const HEADER_ALIASES: Record<string, string> = {
  currentsubject: "Current Subject",
  subject: "Current Subject",
  subjectcode: "Current Subject",
  section: "Section",
  day: "Day",
  days: "Day",
  time: "Time",
  room: "Room",
  instructor: "Instructor",
  professor: "Instructor",
  schoolyear: "School Year",
  session: "Session",
  units: "Units",
  unit: "Units",
};

export type PortalImportWarning = {
  code: "missing-subject" | "invalid-day" | "invalid-time";
  message: string;
  rowNumber: number;
};

export type PendingPortalImport = {
  kind: "pending-portal-import";
  subjects: Subject[];
  warnings: PortalImportWarning[];
  metadata: {
    sheetName?: string;
    schoolYears: string[];
    sourceRowCount: number;
  };
};

export class PortalImportError extends Error {
  constructor(
    message: string,
    public readonly code: "missing-headers" | "empty-workbook",
    public readonly details: string[] = [],
  ) {
    super(message);
    this.name = "PortalImportError";
  }
}

export function normalizePortalHeader(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function parsePortalRows(
  rawRows: readonly (readonly unknown[])[],
  options: {
    idFactory: IdFactory;
    sheetName?: string;
  },
): PendingPortalImport {
  if (rawRows.length === 0)
    throw new PortalImportError("The workbook is empty.", "empty-workbook");
  const rawHeaders = rawRows[0] ?? [];
  const canonicalHeaders = rawHeaders.map(
    (header) => HEADER_ALIASES[normalizePortalHeader(header)],
  );
  const missing = PORTAL_REQUIRED_COLUMNS.filter(
    (required) => !canonicalHeaders.includes(required),
  );
  if (missing.length > 0) {
    throw new PortalImportError(
      `Missing required Portal columns: ${missing.join(", ")}`,
      "missing-headers",
      missing,
    );
  }
  const column = (name: string) => canonicalHeaders.indexOf(name);
  const dataRows = rawRows
    .slice(1)
    .map((row, index) => ({ row, rowNumber: index + 2 }))
    .filter(({ row }) => row.some((value) => cellText(value) !== ""));
  const groups = new Map<
    string,
    { code: string; section: string; rows: typeof dataRows }
  >();
  const warnings: PortalImportWarning[] = [];
  for (const item of dataRows) {
    const code = cellText(item.row[column("Current Subject")]);
    const sectionIndex = column("Section");
    const section = cellText(
      sectionIndex >= 0 ? item.row[sectionIndex] : undefined,
    );
    if (!code) {
      warnings.push({
        code: "missing-subject",
        message:
          "A row without a subject code could not be grouped and was skipped.",
        rowNumber: item.rowNumber,
      });
      continue;
    }
    const key = `${code.toLocaleUpperCase()}\u0000${section.toLocaleUpperCase()}`;
    const group = groups.get(key) ?? { code, section, rows: [] };
    group.rows.push(item);
    groups.set(key, group);
  }
  const schoolYears = new Set<string>();
  const subjects: Subject[] = [];
  for (const group of groups.values()) {
    const unitsIndex = column("Units");
    const units = group.rows.reduce((value, { row }) => {
      if (value > 0 || unitsIndex < 0) return value;
      const parsed = Number(row[unitsIndex]);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : value;
    }, 0);
    const meetings = group.rows.map(({ row, rowNumber }) => {
      const day = parsePortalDays(row[column("Day")]);
      const time = parsePortalTimeRange(row[column("Time")]);
      if (!day.valid)
        day.warnings.forEach((message) =>
          warnings.push({ code: "invalid-day", message, rowNumber }),
        );
      if (!time.valid)
        warnings.push({
          code: "invalid-time",
          message: time.warning,
          rowNumber,
        });
      const schoolYearIndex = column("School Year");
      const schoolYear = cellText(
        schoolYearIndex >= 0 ? row[schoolYearIndex] : undefined,
      );
      if (schoolYear) schoolYears.add(schoolYear);
      const sessionIndex = column("Session");
      const sessionValue = sessionIndex >= 0 ? row[sessionIndex] : undefined;
      return {
        days: day.valid ? day.days : [],
        startTime: time.startTime,
        endTime: time.endTime,
        room: cellText(column("Room") >= 0 ? row[column("Room")] : undefined),
        professor: cellText(
          column("Instructor") >= 0 ? row[column("Instructor")] : undefined,
        ),
        importMetadata: {
          source: "portal" as const,
          sourceRows: [rowNumber],
          rawSubject: group.code,
          rawTime: time.raw,
          ...(sessionValue === undefined ||
          sessionValue === null ||
          sessionValue === ""
            ? {}
            : {
                session:
                  typeof sessionValue === "number"
                    ? sessionValue
                    : cellText(sessionValue),
              }),
          ...(schoolYear ? { schoolYear } : {}),
        },
      };
    });
    subjects.push(
      normalizeSubject(
        {
          code: group.code,
          units,
          section: group.section,
          enabled: true,
          isCustom: true,
          importMetadata: {
            source: "portal",
            sourceRows: group.rows.map(({ rowNumber }) => rowNumber),
            rawSubject: group.code,
          },
          meetings,
        },
        options.idFactory,
      ),
    );
  }
  return {
    kind: "pending-portal-import",
    subjects,
    warnings,
    metadata: {
      ...(options.sheetName ? { sheetName: options.sheetName } : {}),
      schoolYears: [...schoolYears],
      sourceRowCount: dataRows.length,
    },
  };
}
