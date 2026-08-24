import { isMeetingComplete } from "./validation";
import { timeToMinutes } from "./time";
import type { Meeting, ScheduleDay, Subject } from "./types";

export type WeekMode = "full" | "compact";
export type FullWeekKey = ScheduleDay;
export type CompactWeekKey = "M/TH" | "T/F" | "W" | "S";
export type DisplayWeekKey = FullWeekKey | CompactWeekKey;

export type ScheduleOccurrence = {
  id: string;
  subjectId: string;
  subjectCode: string;
  meetingId: string;
  actualDays: ScheduleDay[];
  displayKey: DisplayWeekKey;
  displayLabel: string;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  room: string;
  professor: string;
  irregular: boolean;
};

const compactKeyByDay: Record<ScheduleDay, CompactWeekKey> = {
  Mon: "M/TH",
  Tue: "T/F",
  Wed: "W",
  Thu: "M/TH",
  Fri: "T/F",
  Sat: "S",
};

function baseOccurrence(subject: Subject, meeting: Meeting) {
  return {
    subjectId: subject.id,
    subjectCode: subject.code,
    meetingId: meeting.id,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    startMinutes: timeToMinutes(meeting.startTime)!,
    endMinutes: timeToMinutes(meeting.endTime)!,
    room: meeting.room,
    professor: meeting.professor,
  };
}

function hasExactDays(
  days: readonly ScheduleDay[],
  left: ScheduleDay,
  right: ScheduleDay,
): boolean {
  return days.length === 2 && days.includes(left) && days.includes(right);
}

export function expandOccurrences(
  subjects: readonly Subject[],
  mode: WeekMode = "full",
): ScheduleOccurrence[] {
  const output: ScheduleOccurrence[] = [];
  for (const subject of subjects) {
    if (!subject.enabled) continue;
    for (const meeting of subject.meetings) {
      if (!meeting.enabled || !isMeetingComplete(meeting)) continue;
      const base = baseOccurrence(subject, meeting);
      if (mode === "compact" && hasExactDays(meeting.days, "Mon", "Thu")) {
        output.push({
          ...base,
          id: `${meeting.id}:M-TH`,
          actualDays: ["Mon", "Thu"],
          displayKey: "M/TH",
          displayLabel: "M/TH",
          irregular: false,
        });
        continue;
      }
      if (mode === "compact" && hasExactDays(meeting.days, "Tue", "Fri")) {
        output.push({
          ...base,
          id: `${meeting.id}:T-F`,
          actualDays: ["Tue", "Fri"],
          displayKey: "T/F",
          displayLabel: "T/F",
          irregular: false,
        });
        continue;
      }
      for (const day of meeting.days) {
        output.push({
          ...base,
          id: `${meeting.id}:${day}`,
          actualDays: [day],
          displayKey: mode === "compact" ? compactKeyByDay[day] : day,
          displayLabel: day,
          irregular:
            mode === "compact" &&
            (day === "Mon" || day === "Tue" || day === "Thu" || day === "Fri"),
        });
      }
    }
  }
  return output;
}
