import { describe, expect, it } from "vitest";

import { extractPortalPdfRows, parsePortalRows } from "@/domain/import";

describe("PDF schedule table extraction", () => {
  it("reassembles wrapped table cells using their PDF columns", () => {
    const rows = extractPortalPdfRows([
      [
        { str: "Subject", x: 57, y: 747 },
        { str: "Section", x: 120, y: 760 },
        { str: "Day", x: 167, y: 760 },
        { str: "Time", x: 223, y: 760 },
        { str: "Session", x: 283, y: 760 },
        { str: "Room", x: 339, y: 760 },
        { str: "Instructor", x: 414, y: 760 },
        { str: "School", x: 511, y: 760 },
        { str: "CS.412", x: 40, y: 731 },
        { str: "A", x: 120, y: 731 },
        { str: "MTH", x: 165, y: 731 },
        { str: "08:00 AM - 09:20", x: 195, y: 731 },
        { str: "AM", x: 195, y: 720 },
        { str: "1", x: 283, y: 731 },
        { str: "ADV", x: 331, y: 731 },
        { str: "LAB", x: 331, y: 720 },
        { str: "Jausan, Aleekhazer J.", x: 384, y: 731 },
        { str: "2026-2027-", x: 501, y: 731 },
        { str: "1", x: 501, y: 720 },
      ],
    ]);

    expect(rows).toEqual([
      [
        "CS.412",
        "A",
        "",
        "MTH",
        "08:00 AM - 09:20 AM",
        "ADV LAB",
        "Jausan, Aleekhazer J.",
        "2026-2027-1",
      ],
    ]);
    const parsed = parsePortalRows(
      [
        [
          "Current Subject",
          "Section",
          "Units",
          "Day",
          "Time",
          "Room",
          "Instructor",
          "School Year",
        ],
        ...rows,
      ],
      { idFactory: (kind) => `${kind}-pdf` },
    );
    expect(parsed.subjects[0]?.meetings[0]).toMatchObject({
      days: ["Mon", "Thu"],
      startTime: "08:00",
      endTime: "09:20",
      room: "ADV LAB",
    });
  });

  it("detects aliased columns and a combined schedule from another school", () => {
    const rows = extractPortalPdfRows([
      [
        { str: "Subject", x: 40, y: 760 },
        { str: "Sec", x: 220, y: 760 },
        { str: "Units", x: 290, y: 760 },
        { str: "Schedule", x: 350, y: 760 },
        { str: "Room", x: 500, y: 760 },
        { str: "Faculty", x: 580, y: 760 },
        { str: "JDN503 Property Law", x: 40, y: 730 },
        { str: "2A-JDN-ONSITE", x: 220, y: 730 },
        { str: "4.00", x: 290, y: 730 },
        { str: "Mon 17:30 - 21:30", x: 350, y: 730 },
        { str: "No Room", x: 500, y: 730 },
        { str: "No Instructor", x: 580, y: 730 },
      ],
    ]);

    expect(rows).toEqual([
      ["JDN503", "2A-JDN-ONSITE", "4.00", "M", "5:30 PM - 9:30 PM", "", "", ""],
    ]);
  });

  it("falls back to schedule rows when a school uses subject names without codes", () => {
    expect(
      extractPortalPdfRows([
        [
          { str: "Subject", x: 40, y: 760 },
          { str: "Schedule", x: 300, y: 760 },
          { str: "Room", x: 500, y: 760 },
          { str: "Property Law", x: 40, y: 730 },
          { str: "Tuesday 18:30 - 20:30", x: 300, y: 730 },
          { str: "L201", x: 500, y: 730 },
        ],
      ]),
    ).toEqual([
      ["Property Law", "", "", "T", "6:30 PM - 8:30 PM", "L201", "", ""],
    ]);
  });
});
