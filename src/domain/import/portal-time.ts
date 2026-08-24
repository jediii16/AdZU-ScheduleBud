import {
  isWithinSupportedScheduleTime,
  minutesToTime,
  SUPPORTED_SCHEDULE_END_TIME,
  SUPPORTED_SCHEDULE_START_TIME,
} from "@/domain/schedule";

export type PortalTimeErrorCode =
  "missing" | "malformed" | "non-positive" | "outside-supported-hours";

export type PortalTimeParseResult =
  | { valid: true; startTime: string; endTime: string; raw: string }
  | {
      valid: false;
      startTime: "07:00";
      endTime: "07:00";
      raw: string;
      code: PortalTimeErrorCode;
      warning: string;
    };

function parseClock(
  hoursText: string,
  minutesText: string,
  meridiem: string,
): number | null {
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
  const normalizedHours =
    (hours % 12) + (meridiem.toUpperCase() === "PM" ? 12 : 0);
  return normalizedHours * 60 + minutes;
}

export function parsePortalTimeRange(value: unknown): PortalTimeParseResult {
  const raw = String(value ?? "").trim();
  if (!raw)
    return {
      valid: false,
      startTime: "07:00",
      endTime: "07:00",
      raw,
      code: "missing",
      warning: "Meeting has no time value.",
    };
  const normalized = raw.replace(/[–—]/g, "-").replace(/\s+/g, " ");
  const match =
    /^(\d{1,2}):(\d{2})\s*([AP]M)\s*-\s*(\d{1,2}):(\d{2})\s*([AP]M)$/i.exec(
      normalized,
    );
  if (!match) {
    return {
      valid: false,
      startTime: "07:00",
      endTime: "07:00",
      raw,
      code: "malformed",
      warning: `Could not parse time range '${raw}'.`,
    };
  }
  const start = parseClock(match[1]!, match[2]!, match[3]!);
  const end = parseClock(match[4]!, match[5]!, match[6]!);
  if (start === null || end === null) {
    return {
      valid: false,
      startTime: "07:00",
      endTime: "07:00",
      raw,
      code: "malformed",
      warning: `Could not parse time range '${raw}'.`,
    };
  }
  if (end <= start) {
    return {
      valid: false,
      startTime: "07:00",
      endTime: "07:00",
      raw,
      code: "non-positive",
      warning: `Time range '${raw}' must end after it starts.`,
    };
  }
  if (
    !isWithinSupportedScheduleTime(start) ||
    !isWithinSupportedScheduleTime(end)
  ) {
    return {
      valid: false,
      startTime: "07:00",
      endTime: "07:00",
      raw,
      code: "outside-supported-hours",
      warning: `Time range '${raw}' falls outside ${SUPPORTED_SCHEDULE_START_TIME}–${SUPPORTED_SCHEDULE_END_TIME}.`,
    };
  }
  return {
    valid: true,
    startTime: minutesToTime(start),
    endTime: minutesToTime(end),
    raw,
  };
}
