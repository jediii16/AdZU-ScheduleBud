import type { IdFactory, Meeting, ScheduleDay, Subject } from "./types";
import { time24Schema } from "./types";

const defaultIdFactory: IdFactory = (kind) => `${kind}-${crypto.randomUUID()}`;

export function createDefaultMeeting(
  idFactory: IdFactory = defaultIdFactory,
): Meeting {
  return {
    id: idFactory("meeting"),
    days: [],
    startTime: "07:00",
    endTime: "07:00",
    room: "",
    professor: "",
    enabled: true,
  };
}

export type MeetingInput = Partial<Omit<Meeting, "id" | "days">> & {
  id?: string;
  days?: readonly ScheduleDay[];
};

export function normalizeMeeting(
  input: MeetingInput,
  idFactory: IdFactory = defaultIdFactory,
): Meeting {
  const days = [...new Set(input.days ?? [])];
  return {
    id: input.id?.trim() || idFactory("meeting"),
    days,
    startTime: time24Schema.safeParse(input.startTime).success
      ? input.startTime!
      : "07:00",
    endTime: time24Schema.safeParse(input.endTime).success
      ? input.endTime!
      : "07:00",
    room: input.room?.trim() ?? "",
    professor: input.professor?.trim() ?? "",
    enabled: input.enabled ?? true,
    ...(input.importMetadata
      ? { importMetadata: { ...input.importMetadata } }
      : {}),
  };
}

export type SubjectInput = Partial<Omit<Subject, "id" | "meetings">> & {
  id?: string;
  meetings?: readonly MeetingInput[];
};

export function normalizeSubject(
  input: SubjectInput,
  idFactory: IdFactory = defaultIdFactory,
): Subject {
  const meetings =
    input.meetings?.map((meeting) => normalizeMeeting(meeting, idFactory)) ??
    [];
  return {
    id: input.id?.trim() || idFactory("subject"),
    code: input.code?.trim() ?? "",
    name: input.name?.trim() ?? "",
    units:
      Number.isFinite(input.units) && (input.units ?? 0) >= 0
        ? input.units!
        : 0,
    section: input.section?.trim() ?? "",
    enabled: input.enabled ?? true,
    isCustom: input.isCustom ?? true,
    ...(input.importMetadata
      ? { importMetadata: { ...input.importMetadata } }
      : {}),
    meetings:
      meetings.length > 0 ? meetings : [createDefaultMeeting(idFactory)],
  };
}

export function duplicateMeeting(
  meeting: Meeting,
  idFactory: IdFactory = defaultIdFactory,
): Meeting {
  return {
    ...meeting,
    id: idFactory("meeting"),
    days: [...meeting.days],
    ...(meeting.importMetadata
      ? {
          importMetadata: {
            ...meeting.importMetadata,
            duplicatedFrom: meeting.id,
          },
        }
      : {}),
  };
}

export function duplicateSubject(
  subject: Subject,
  idFactory: IdFactory = defaultIdFactory,
): Subject {
  return {
    ...subject,
    id: idFactory("subject"),
    ...(subject.importMetadata
      ? {
          importMetadata: {
            ...subject.importMetadata,
            duplicatedFrom: subject.id,
          },
        }
      : {}),
    meetings: subject.meetings.map((meeting) =>
      duplicateMeeting(meeting, idFactory),
    ),
  };
}

export function removeMeeting(subject: Subject, meetingId: string): Subject {
  if (subject.meetings.length === 1) return subject;
  const meetings = subject.meetings.filter(
    (meeting) => meeting.id !== meetingId,
  );
  return meetings.length === 0 ? subject : { ...subject, meetings };
}
