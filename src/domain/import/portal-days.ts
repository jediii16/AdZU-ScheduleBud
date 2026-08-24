import type { ScheduleDay } from "@/domain/schedule";

const TOKENS: ReadonlyArray<readonly [string, ScheduleDay]> = [
  ["SAT", "Sat"],
  ["TH", "Thu"],
  ["M", "Mon"],
  ["T", "Tue"],
  ["W", "Wed"],
  ["F", "Fri"],
  ["S", "Sat"],
];

export type PortalDayParseResult = {
  days: ScheduleDay[];
  valid: boolean;
  warnings: string[];
  normalizedInput: string;
};

export function parsePortalDays(value: unknown): PortalDayParseResult {
  const raw = String(value ?? "")
    .trim()
    .toUpperCase();
  const normalizedInput = raw.replace(/[\s,\/;|\-]+/g, "");
  if (!normalizedInput) {
    return {
      days: [],
      valid: false,
      warnings: ["Meeting has no day value."],
      normalizedInput,
    };
  }
  const days: ScheduleDay[] = [];
  const warnings: string[] = [];
  let cursor = 0;
  while (cursor < normalizedInput.length) {
    const token = TOKENS.find(([candidate]) =>
      normalizedInput.startsWith(candidate, cursor),
    );
    if (!token) {
      warnings.push(
        `Unknown day token '${normalizedInput[cursor]}' at position ${cursor + 1}.`,
      );
      cursor += 1;
      continue;
    }
    if (!days.includes(token[1])) days.push(token[1]);
    cursor += token[0].length;
  }
  return {
    days,
    valid: warnings.length === 0 && days.length > 0,
    warnings,
    normalizedInput,
  };
}
