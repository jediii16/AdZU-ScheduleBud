import { describe, expect, it } from "vitest";

import { calculateOverlapLayout, expandOccurrences } from "@/domain/schedule";

import { subject } from "./fixtures";

describe("overlap timetable layout", () => {
  it("places overlapping classes side by side and back-to-back classes in a reusable column", () => {
    const subjects = [
      subject(),
      subject({
        id: "b",
        meetings: [
          {
            ...subject().meetings[0]!,
            id: "b-m",
            startTime: "08:30",
            endTime: "09:30",
          },
        ],
      }),
      subject({
        id: "c",
        meetings: [
          {
            ...subject().meetings[0]!,
            id: "c-m",
            startTime: "09:00",
            endTime: "10:00",
          },
        ],
      }),
    ];
    const result = calculateOverlapLayout(
      expandOccurrences(subjects),
      { startTime: "07:00", endTime: "11:00" },
      240,
    );
    expect(result.map((item) => item.columnCount)).toEqual([2, 2, 2]);
    expect(result.map((item) => item.widthPercent)).toEqual([50, 50, 50]);
    expect(result[2]?.column).toBe(0);
  });

  it("uses connected overlap clusters and proportional vertical geometry", () => {
    const subjects = [
      subject(),
      subject({
        id: "b",
        meetings: [
          {
            ...subject().meetings[0]!,
            id: "b-m",
            startTime: "08:30",
            endTime: "09:30",
          },
        ],
      }),
      subject({
        id: "c",
        meetings: [
          {
            ...subject().meetings[0]!,
            id: "c-m",
            startTime: "09:15",
            endTime: "10:00",
          },
        ],
      }),
    ];
    const result = calculateOverlapLayout(
      expandOccurrences(subjects),
      { startTime: "07:00", endTime: "11:00" },
      240,
    );
    expect(result.every((item) => item.columnCount === 2)).toBe(true);
    expect(result[0]).toMatchObject({ top: 60, height: 60 });
  });

  it("uses three columns for three simultaneous classes", () => {
    const subjects = [
      subject(),
      subject({
        id: "b",
        meetings: [
          {
            ...subject().meetings[0]!,
            id: "b-m",
            startTime: "08:10",
            endTime: "08:50",
          },
        ],
      }),
      subject({
        id: "c",
        meetings: [
          {
            ...subject().meetings[0]!,
            id: "c-m",
            startTime: "08:20",
            endTime: "08:40",
          },
        ],
      }),
    ];
    const result = calculateOverlapLayout(
      expandOccurrences(subjects),
      { startTime: "07:00", endTime: "11:00" },
      240,
    );
    expect(result.map((item) => item.columnCount)).toEqual([3, 3, 3]);
    expect(result.map((item) => item.widthPercent)).toEqual([
      100 / 3,
      100 / 3,
      100 / 3,
    ]);
  });

  it("lets a later non-overlapping cluster reuse the full width", () => {
    const subjects = [
      subject(),
      subject({
        id: "b",
        meetings: [
          {
            ...subject().meetings[0]!,
            id: "b-m",
            startTime: "08:30",
            endTime: "09:30",
          },
        ],
      }),
      subject({
        id: "later",
        meetings: [
          {
            ...subject().meetings[0]!,
            id: "later-m",
            startTime: "10:00",
            endTime: "11:00",
          },
        ],
      }),
    ];
    const result = calculateOverlapLayout(
      expandOccurrences(subjects),
      { startTime: "07:00", endTime: "12:00" },
      300,
    );
    expect(result.slice(0, 2).map((item) => item.columnCount)).toEqual([2, 2]);
    expect(result[2]).toMatchObject({
      column: 0,
      columnCount: 1,
      leftPercent: 0,
      widthPercent: 100,
    });
  });

  it("enforces minimum block height and rejects invalid canvas ranges", () => {
    const tiny = subject({
      meetings: [{ ...subject().meetings[0]!, endTime: "08:05" }],
    });
    expect(
      calculateOverlapLayout(
        expandOccurrences([tiny]),
        { startTime: "07:00", endTime: "18:00" },
        110,
        18,
      )[0]?.height,
    ).toBe(18);
    expect(
      calculateOverlapLayout([], { startTime: "18:00", endTime: "07:00" }, 100),
    ).toEqual([]);
  });
});
