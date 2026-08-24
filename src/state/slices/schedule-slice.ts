import {
  duplicateMeeting as copyMeeting,
  duplicateSubject as copySubject,
  normalizeMeeting,
  normalizeSubject,
  removeMeeting as removeMeetingSafely,
} from "@/domain/schedule/normalization";
import {
  meetingSchema,
  scheduleSchema,
  subjectSchema,
} from "@/domain/schedule/types";
import type { ScheduleSlice, StoreContext } from "../types";

export function createScheduleSlice(context: StoreContext): ScheduleSlice {
  const ids = (kind: "subject" | "meeting") =>
    context.dependencies.idFactory!(kind);
  return {
    replaceSchedule(schedule, origin) {
      const validated = scheduleSchema.parse(schedule);
      context.commit("Replace schedule", (project) => ({
        ...project,
        metadata: {
          ...project.metadata,
          source: origin.source,
          term: origin.term === undefined ? project.metadata.term : origin.term,
          curriculum:
            origin.curriculum === undefined
              ? project.metadata.curriculum
              : origin.curriculum,
        },
        schedule: validated,
      }));
    },
    addSubject(input) {
      const subject = normalizeSubject(input, ids);
      const result = context.commit("Add subject", (project) => ({
        ...project,
        schedule: [...project.schedule, subject],
      }));
      return result ? subject.id : null;
    },
    updateSubject(subjectId, updates) {
      context.commit("Edit subject", (project) => ({
        ...project,
        schedule: project.schedule.map((subject) =>
          subject.id === subjectId
            ? subjectSchema.parse({
                ...subject,
                ...updates,
                id: subject.id,
                meetings: subject.meetings,
              })
            : subject,
        ),
      }));
    },
    removeSubject(subjectId) {
      context.commit("Remove subject from project", (project) => ({
        ...project,
        schedule: project.schedule.filter(
          (subject) => subject.id !== subjectId,
        ),
      }));
    },
    duplicateSubject(subjectId) {
      const source = context
        .get()
        .projectsById[context.get().activeProjectId ?? ""]?.schedule.find(
          (subject) => subject.id === subjectId,
        );
      if (!source) return null;
      const duplicate = copySubject(source, ids);
      const result = context.commit("Duplicate subject", (project) => ({
        ...project,
        schedule: [...project.schedule, duplicate],
      }));
      return result ? duplicate.id : null;
    },
    setSubjectEnabled(subjectId, enabled) {
      context.commit(
        enabled ? "Include subject" : "Exclude subject",
        (project) => ({
          ...project,
          schedule: project.schedule.map((subject) =>
            subject.id === subjectId ? { ...subject, enabled } : subject,
          ),
        }),
      );
    },
    addMeeting(subjectId, input = {}) {
      const meeting = normalizeMeeting(input, ids);
      const result = context.commit("Add meeting", (project) => ({
        ...project,
        schedule: project.schedule.map((subject) =>
          subject.id === subjectId
            ? { ...subject, meetings: [...subject.meetings, meeting] }
            : subject,
        ),
      }));
      return result ? meeting.id : null;
    },
    updateMeeting(subjectId, meetingId, updates) {
      context.commit("Edit meeting", (project) => ({
        ...project,
        schedule: project.schedule.map((subject) =>
          subject.id !== subjectId
            ? subject
            : {
                ...subject,
                meetings: subject.meetings.map((meeting) =>
                  meeting.id === meetingId
                    ? meetingSchema.parse({
                        ...meeting,
                        ...updates,
                        id: meeting.id,
                      })
                    : meeting,
                ),
              },
        ),
      }));
    },
    removeMeeting(subjectId, meetingId) {
      context.commit("Remove meeting", (project) => ({
        ...project,
        schedule: project.schedule.map((subject) =>
          subject.id === subjectId
            ? removeMeetingSafely(subject, meetingId)
            : subject,
        ),
      }));
    },
    duplicateMeeting(subjectId, meetingId) {
      const subject = context
        .get()
        .projectsById[context.get().activeProjectId ?? ""]?.schedule.find(
          (item) => item.id === subjectId,
        );
      const source = subject?.meetings.find(
        (meeting) => meeting.id === meetingId,
      );
      if (!source) return null;
      const duplicate = copyMeeting(source, ids);
      const result = context.commit("Duplicate meeting", (project) => ({
        ...project,
        schedule: project.schedule.map((item) =>
          item.id === subjectId
            ? { ...item, meetings: [...item.meetings, duplicate] }
            : item,
        ),
      }));
      return result ? duplicate.id : null;
    },
    toggleMeetingDay(subjectId, meetingId, day) {
      context.commit("Change meeting days", (project) => ({
        ...project,
        schedule: project.schedule.map((subject) =>
          subject.id !== subjectId
            ? subject
            : {
                ...subject,
                meetings: subject.meetings.map((meeting) =>
                  meeting.id !== meetingId
                    ? meeting
                    : {
                        ...meeting,
                        days: meeting.days.includes(day)
                          ? meeting.days.filter((value) => value !== day)
                          : [...meeting.days, day],
                      },
                ),
              },
        ),
      }));
    },
  };
}
