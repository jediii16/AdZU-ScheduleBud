import { describe, expect, it } from "vitest";

import {
  isMeetingComplete,
  isSubjectComplete,
  validateMeeting,
  validateSchedule,
} from "@/domain/schedule";

import { subject } from "./fixtures";

describe("meeting and schedule validation", () => {
  it("requires a day and a positive valid time range", () => {
    expect(
      validateMeeting({ days: [], startTime: "x", endTime: "07:00" }).issues,
    ).toEqual(["missing-days", "invalid-start"]);
    expect(
      isMeetingComplete({
        days: ["Tue"],
        startTime: "09:00",
        endTime: "09:00",
      }),
    ).toBe(false);
    expect(
      isMeetingComplete({
        days: ["Tue"],
        startTime: "09:00",
        endTime: "09:05",
      }),
    ).toBe(true);
  });

  it("marks a subject incomplete when any meeting is incomplete", () => {
    const value = subject({
      meetings: [
        subject().meetings[0]!,
        { ...subject().meetings[0]!, id: "meeting-b", days: [] },
      ],
    });
    expect(isSubjectComplete(value)).toBe(false);
  });

  it("does not require disabled subjects or meetings to be complete", () => {
    expect(
      isSubjectComplete(
        subject({
          enabled: false,
          meetings: [{ ...subject().meetings[0]!, days: [] }],
        }),
      ),
    ).toBe(true);
    expect(
      isSubjectComplete(
        subject({
          meetings: [{ ...subject().meetings[0]!, enabled: false, days: [] }],
        }),
      ),
    ).toBe(true);
  });

  it("accepts exact supported boundaries and rejects times outside them", () => {
    expect(
      validateMeeting({
        days: ["Sat"],
        startTime: "07:00",
        endTime: "23:00",
      }),
    ).toEqual({ complete: true, issues: [] });
    expect(
      validateMeeting({
        days: ["Sat"],
        startTime: "06:59",
        endTime: "08:00",
      }).issues,
    ).toContain("outside-supported-hours");
    expect(
      validateMeeting({
        days: ["Sat"],
        startTime: "22:00",
        endTime: "23:01",
      }).issues,
    ).toContain("outside-supported-hours");
  });

  it("returns validated schedule data and throws helpful paths", () => {
    expect(validateSchedule([subject()])).toHaveLength(1);
    expect(() => validateSchedule([{ ...subject(), code: "   " }])).toThrow(
      /0\.code/,
    );
    expect(() => validateSchedule([{ id: "broken", meetings: [] }])).toThrow(
      /0\.meetings/,
    );
  });
});
