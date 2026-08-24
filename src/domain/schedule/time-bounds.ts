import type { Time24 } from "./types";
import { timeToMinutes } from "./time";

export const SUPPORTED_SCHEDULE_START_MINUTES = 7 * 60;
export const SUPPORTED_SCHEDULE_END_MINUTES = 21 * 60;
export const DEFAULT_SCHEDULE_END_MINUTES = 18 * 60;

export const SUPPORTED_SCHEDULE_START_TIME = "07:00" as Time24;
export const SUPPORTED_SCHEDULE_END_TIME = "21:00" as Time24;
export const DEFAULT_SCHEDULE_END_TIME = "18:00" as Time24;

export function isWithinSupportedScheduleTime(minutes: number): boolean {
  return (
    minutes >= SUPPORTED_SCHEDULE_START_MINUTES &&
    minutes <= SUPPORTED_SCHEDULE_END_MINUTES
  );
}

export function isSupportedScheduleRange(
  startTime: string,
  endTime: string,
): boolean {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return (
    start !== null &&
    end !== null &&
    start < end &&
    start >= SUPPORTED_SCHEDULE_START_MINUTES &&
    end <= SUPPORTED_SCHEDULE_END_MINUTES
  );
}
