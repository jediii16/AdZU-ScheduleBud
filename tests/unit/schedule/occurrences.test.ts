import { describe, expect, it } from "vitest";

import { expandOccurrences } from "@/domain/schedule";

import { subject } from "./fixtures";

describe("week interpretation and occurrences", () => {
  it("expands full week meetings into actual days", () => {
    const value = subject({
      meetings: [{ ...subject().meetings[0]!, days: ["Mon", "Thu"] }],
    });
    expect(
      expandOccurrences([value], "full").map((item) => item.displayKey),
    ).toEqual(["Mon", "Thu"]);
  });

  it("collapses only exact AdZU compact pairs", () => {
    const exact = subject({
      meetings: [{ ...subject().meetings[0]!, days: ["Mon", "Thu"] }],
    });
    expect(expandOccurrences([exact], "compact")).toMatchObject([
      { displayKey: "M/TH", actualDays: ["Mon", "Thu"], irregular: false },
    ]);

    const mondayOnly = subject({
      meetings: [{ ...subject().meetings[0]!, days: ["Mon"] }],
    });
    expect(expandOccurrences([mondayOnly], "compact")).toMatchObject([
      {
        displayKey: "M/TH",
        displayLabel: "Mon",
        actualDays: ["Mon"],
        irregular: true,
      },
    ]);

    const extraDay = subject({
      meetings: [{ ...subject().meetings[0]!, days: ["Mon", "Wed", "Thu"] }],
    });
    expect(expandOccurrences([extraDay], "compact")).toHaveLength(3);
  });

  it("collapses an exact Tuesday and Friday pair", () => {
    const exact = subject({
      meetings: [{ ...subject().meetings[0]!, days: ["Tue", "Fri"] }],
    });
    expect(expandOccurrences([exact], "compact")).toMatchObject([
      { displayKey: "T/F", actualDays: ["Tue", "Fri"], irregular: false },
    ]);
  });

  it("keeps a Mon/Wed/Thu meeting as three explicit actual occurrences", () => {
    const value = subject({
      meetings: [{ ...subject().meetings[0]!, days: ["Mon", "Wed", "Thu"] }],
    });
    const occurrences = expandOccurrences([value], "compact");
    expect(occurrences.map((item) => item.actualDays)).toEqual([
      ["Mon"],
      ["Wed"],
      ["Thu"],
    ]);
    expect(occurrences.map((item) => item.irregular)).toEqual([
      true,
      false,
      true,
    ]);
  });

  it.each(["Mon", "Tue", "Thu", "Fri"] as const)(
    "marks a single %s compact occurrence irregular",
    (day) => {
      const value = subject({
        meetings: [{ ...subject().meetings[0]!, days: [day] }],
      });
      expect(expandOccurrences([value], "compact")[0]).toMatchObject({
        displayLabel: day,
        actualDays: [day],
        irregular: true,
      });
    },
  );

  it("excludes disabled subjects, disabled meetings, and incomplete meetings", () => {
    expect(expandOccurrences([subject({ enabled: false })])).toEqual([]);
    expect(
      expandOccurrences([
        subject({ meetings: [{ ...subject().meetings[0]!, enabled: false }] }),
      ]),
    ).toEqual([]);
    expect(
      expandOccurrences([
        subject({ meetings: [{ ...subject().meetings[0]!, days: [] }] }),
      ]),
    ).toEqual([]);
  });
});
