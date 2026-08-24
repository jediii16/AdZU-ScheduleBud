import { expandOccurrences } from "./occurrences";
import type { ScheduleDay, Subject } from "./types";
import { minutesToTime } from "./time";

export type ScheduleConflict = {
  leftSubjectId: string;
  leftSubjectCode: string;
  leftMeetingId: string;
  rightSubjectId: string;
  rightSubjectCode: string;
  rightMeetingId: string;
  day: ScheduleDay;
  overlapStart: string;
  overlapEnd: string;
};

export function detectConflicts(
  subjects: readonly Subject[],
): ScheduleConflict[] {
  const occurrences = expandOccurrences(subjects, "full");
  const conflicts: ScheduleConflict[] = [];
  for (let leftIndex = 0; leftIndex < occurrences.length; leftIndex += 1) {
    const left = occurrences[leftIndex]!;
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < occurrences.length;
      rightIndex += 1
    ) {
      const right = occurrences[rightIndex]!;
      if (
        left.meetingId === right.meetingId ||
        left.displayKey !== right.displayKey
      )
        continue;
      const overlapStart = Math.max(left.startMinutes, right.startMinutes);
      const overlapEnd = Math.min(left.endMinutes, right.endMinutes);
      if (overlapStart >= overlapEnd) continue;
      conflicts.push({
        leftSubjectId: left.subjectId,
        leftSubjectCode: left.subjectCode,
        leftMeetingId: left.meetingId,
        rightSubjectId: right.subjectId,
        rightSubjectCode: right.subjectCode,
        rightMeetingId: right.meetingId,
        day: left.actualDays[0]!,
        overlapStart: minutesToTime(overlapStart),
        overlapEnd: minutesToTime(overlapEnd),
      });
    }
  }
  return conflicts;
}
