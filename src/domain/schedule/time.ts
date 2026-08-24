import type { Time24 } from "./types";

export function timeToMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function minutesToTime(value: number): Time24 {
  const clamped = Math.min(23 * 60 + 59, Math.max(0, Math.round(value)));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}` as Time24;
}
