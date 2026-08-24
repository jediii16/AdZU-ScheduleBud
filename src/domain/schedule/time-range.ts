import { expandOccurrences } from "./occurrences";
import { minutesToTime } from "./time";
import {
  DEFAULT_SCHEDULE_END_TIME,
  isSupportedScheduleRange,
  SUPPORTED_SCHEDULE_END_MINUTES,
  SUPPORTED_SCHEDULE_START_MINUTES,
  SUPPORTED_SCHEDULE_START_TIME,
} from "./time-bounds";
import type { Subject } from "./types";

export type TimeRange = {
  startTime: string;
  endTime: string;
  source: "automatic" | "manual" | "default";
};

export function calculateAutomaticTimeRange(
  subjects: readonly Subject[],
): TimeRange {
  const occurrences = expandOccurrences(subjects, "full");
  if (occurrences.length === 0) {
    return {
      startTime: SUPPORTED_SCHEDULE_START_TIME,
      endTime: DEFAULT_SCHEDULE_END_TIME,
      source: "default",
    };
  }
  const earliest = Math.min(
    ...occurrences.map((occurrence) => occurrence.startMinutes),
  );
  const latest = Math.max(
    ...occurrences.map((occurrence) => occurrence.endMinutes),
  );
  const start = Math.max(
    SUPPORTED_SCHEDULE_START_MINUTES,
    Math.floor(earliest / 60) * 60,
  );
  const end = Math.min(
    SUPPORTED_SCHEDULE_END_MINUTES,
    Math.ceil(latest / 60) * 60,
  );
  if (start >= end) {
    return {
      startTime: SUPPORTED_SCHEDULE_START_TIME,
      endTime: DEFAULT_SCHEDULE_END_TIME,
      source: "default",
    };
  }
  return {
    startTime: minutesToTime(start),
    endTime: minutesToTime(end),
    source: "automatic",
  };
}

export function resolveTimeRange(
  subjects: readonly Subject[],
  manual?: { startTime: string; endTime: string } | null,
): TimeRange {
  if (manual && isSupportedScheduleRange(manual.startTime, manual.endTime)) {
    return { ...manual, source: "manual" };
  }
  return calculateAutomaticTimeRange(subjects);
}
