import { describe, expect, it } from "vitest";

import { detectConflicts } from "@/domain/schedule";

import { subject } from "./fixtures";

describe("conflict detection", () => {
  it("reports the exact positive intersection", () => {
    const left = subject();
    const right = subject({
      id: "subject-b",
      code: "FIC.102",
      meetings: [
        {
          ...subject().meetings[0]!,
          id: "meeting-b",
          startTime: "08:30",
          endTime: "09:30",
        },
      ],
    });
    expect(detectConflicts([left, right])).toMatchObject([
      { day: "Mon", overlapStart: "08:30", overlapEnd: "09:00" },
    ]);
  });

  it("does not treat back-to-back meetings as conflicts", () => {
    const right = subject({
      id: "subject-b",
      meetings: [
        {
          ...subject().meetings[0]!,
          id: "meeting-b",
          startTime: "09:00",
          endTime: "10:00",
        },
      ],
    });
    expect(detectConflicts([subject(), right])).toEqual([]);
  });

  it("detects distinct overlapping meetings on the same subject", () => {
    const value = subject({
      meetings: [
        { ...subject().meetings[0]!, id: "lecture" },
        {
          ...subject().meetings[0]!,
          id: "laboratory",
          startTime: "08:30",
          endTime: "10:00",
        },
      ],
    });
    expect(detectConflicts([value])).toMatchObject([
      {
        leftSubjectId: "subject-a",
        rightSubjectId: "subject-a",
        leftMeetingId: "lecture",
        rightMeetingId: "laboratory",
        day: "Mon",
      },
    ]);
  });

  it("reports multi-day conflicts only on shared actual days", () => {
    const left = subject({
      meetings: [
        { ...subject().meetings[0]!, id: "left", days: ["Mon", "Thu"] },
      ],
    });
    const right = subject({
      id: "right-subject",
      meetings: [
        {
          ...subject().meetings[0]!,
          id: "right",
          days: ["Thu", "Fri"],
          startTime: "08:30",
          endTime: "09:30",
        },
      ],
    });
    expect(
      detectConflicts([left, right]).map((conflict) => conflict.day),
    ).toEqual(["Thu"]);
  });

  it("ignores different days, disabled records, and incomplete meetings", () => {
    const tue = subject({
      id: "tue",
      meetings: [{ ...subject().meetings[0]!, id: "tue-m", days: ["Tue"] }],
    });
    const disabled = subject({ id: "off", enabled: false });
    const incomplete = subject({
      id: "bad",
      meetings: [{ ...subject().meetings[0]!, id: "bad-m", days: [] }],
    });
    expect(detectConflicts([subject(), tue, disabled, incomplete])).toEqual([]);
  });
});
