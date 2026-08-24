import {
  normalizeSubject,
  type IdFactory,
  type Subject,
} from "@/domain/schedule";

export function sequentialIds(): IdFactory {
  let value = 0;
  return (kind) => `${kind}-${value++}`;
}

export function subject(overrides: Partial<Subject> = {}): Subject {
  return normalizeSubject(
    {
      id: "subject-a",
      code: "FIC.101",
      units: 3,
      section: "A",
      enabled: true,
      isCustom: false,
      meetings: [
        {
          id: "meeting-a",
          days: ["Mon"],
          startTime: "08:00",
          endTime: "09:00",
        },
      ],
      ...overrides,
    },
    sequentialIds(),
  );
}
