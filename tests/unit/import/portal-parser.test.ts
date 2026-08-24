import { describe, expect, it } from "vitest";

import { parsePortalRows, PortalImportError } from "@/domain/import";

import { sequentialIds } from "../schedule/fixtures";

const headers = [
  "Current Subject",
  "Section",
  "Day",
  "Time",
  "Session",
  "Room",
  "Instructor",
  "School Year",
];

describe("Portal row parsing", () => {
  it("normalizes aliases, removes blank rows, and groups repeated subject rows", () => {
    const result = parsePortalRows(
      [
        [
          "Subject Code",
          "Section",
          "Days",
          "Time",
          "Session",
          "Room",
          "Professor",
          "School-Year",
        ],
        [
          "LAB.201",
          "C",
          "MTH",
          "09:00 AM - 10:15 AM",
          1,
          "SCI-1",
          "Prof. Ada",
          "2099-2100-2",
        ],
        [
          "LAB.201",
          "C",
          "W",
          "02:00 PM - 05:00 PM",
          2,
          "LAB-3",
          "Prof. Ada",
          "2099-2100-2",
        ],
        [null, null, null, null, null, null, null, null],
      ],
      { idFactory: sequentialIds() },
    );
    expect(result.kind).toBe("pending-portal-import");
    expect(result.subjects).toHaveLength(1);
    expect(result.subjects[0]).toMatchObject({
      code: "LAB.201",
      units: 0,
      enabled: true,
      isCustom: true,
    });
    expect(result.subjects[0]?.meetings).toHaveLength(2);
    expect(result.metadata.sourceRowCount).toBe(2);
  });

  it("keeps malformed meetings incomplete and editable with warnings", () => {
    const result = parsePortalRows(
      [
        headers,
        ["EDGE.301", "A", "", "03:45 AM - 03:45 AM", 1, "", "", "2099-2100-1"],
      ],
      { idFactory: sequentialIds() },
    );
    expect(result.subjects[0]?.meetings[0]).toMatchObject({
      days: [],
      startTime: "07:00",
      endTime: "07:00",
    });
    expect(result.subjects[0]?.meetings[0]?.importMetadata?.rawTime).toBe(
      "03:45 AM - 03:45 AM",
    );
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      "invalid-day",
      "invalid-time",
    ]);
  });

  it("warns before skipping an ungroupable row without a subject code", () => {
    const result = parsePortalRows(
      [
        headers,
        [
          "",
          "A",
          "W",
          "01:00 PM - 02:00 PM",
          1,
          "E-4",
          "Prof. Kira",
          "2099-2100-1",
        ],
      ],
      { idFactory: sequentialIds() },
    );
    expect(result.subjects).toEqual([]);
    expect(result.warnings[0]).toMatchObject({
      code: "missing-subject",
      rowNumber: 2,
    });
  });

  it("rejects missing required columns with exact details", () => {
    expect(() =>
      parsePortalRows([["Current Subject", "Day"]], {
        idFactory: sequentialIds(),
      }),
    ).toThrow(PortalImportError);
    try {
      parsePortalRows([["Current Subject", "Day"]], {
        idFactory: sequentialIds(),
      });
    } catch (error) {
      expect((error as PortalImportError).details).toContain("School Year");
    }
  });

  it("treats an enrolled subject code as authoritative without curriculum lookup", () => {
    const result = parsePortalRows(
      [
        headers,
        [
          "UNKNOWN.1",
          "A",
          "M",
          "08:00 AM - 09:00 AM",
          1,
          "",
          "",
          "2099-2100-1",
        ],
      ],
      { idFactory: sequentialIds() },
    );
    expect(result.subjects[0]).toMatchObject({
      units: 0,
      isCustom: true,
    });
    expect(result.warnings).toEqual([]);
  });
});
