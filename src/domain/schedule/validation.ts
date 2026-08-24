import type { Meeting, Schedule, Subject } from "./types";
import { scheduleSchema } from "./types";
import { timeToMinutes } from "./time";
import { isWithinSupportedScheduleTime } from "./time-bounds";

export type MeetingIssueCode =
  | "missing-days"
  | "invalid-start"
  | "invalid-end"
  | "non-positive-range"
  | "outside-supported-hours";

export type MeetingValidation = {
  complete: boolean;
  issues: MeetingIssueCode[];
};

export function validateMeeting(
  meeting: Pick<Meeting, "days" | "startTime" | "endTime">,
): MeetingValidation {
  const issues: MeetingIssueCode[] = [];
  const start = timeToMinutes(meeting.startTime);
  const end = timeToMinutes(meeting.endTime);
  if (meeting.days.length === 0) issues.push("missing-days");
  if (start === null) issues.push("invalid-start");
  if (end === null) issues.push("invalid-end");
  if (start !== null && end !== null && end <= start)
    issues.push("non-positive-range");
  if (
    start !== null &&
    end !== null &&
    (!isWithinSupportedScheduleTime(start) ||
      !isWithinSupportedScheduleTime(end))
  )
    issues.push("outside-supported-hours");
  return { complete: issues.length === 0, issues };
}

export function isMeetingComplete(
  meeting: Pick<Meeting, "days" | "startTime" | "endTime">,
): boolean {
  return validateMeeting(meeting).complete;
}

export function isSubjectComplete(subject: Subject): boolean {
  return (
    !subject.enabled ||
    subject.meetings.every(
      (meeting) => !meeting.enabled || isMeetingComplete(meeting),
    )
  );
}

export function validateSchedule(value: unknown): Schedule {
  const parsed = scheduleSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(
      `Malformed schedule data: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`,
    );
  }
  return parsed.data;
}
