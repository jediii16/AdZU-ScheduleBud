import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MAX_PORTAL_WORKBOOK_BYTES,
  parsePortalWorkbook,
  validatePortalFile,
} from "@/domain/import";

type SanitizedFixtureName =
  | "portal-normal.xlsx"
  | "portal-multiple-meetings.xlsx"
  | "portal-edge-cases.xlsx";

function ids() {
  let index = 0;
  return (kind: "subject" | "meeting") => `${kind}-${index++}`;
}

async function fixture(name: SanitizedFixtureName): Promise<ArrayBuffer> {
  const buffer = await readFile(resolve("tests/fixtures/portal", name));
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
}

describe("sanitized Portal XLSX fixtures", () => {
  it("parses the normal fixture", async () => {
    const result = parsePortalWorkbook(await fixture("portal-normal.xlsx"), {
      idFactory: ids(),
    });
    expect(result.metadata).toMatchObject({
      sheetName: "Sheet1",
      sourceRowCount: 3,
    });
    expect(
      result.subjects.map(({ code, section, meetings }) => ({
        code,
        section,
        meetings: meetings.length,
      })),
    ).toEqual([
      { code: "FIC.101", section: "A", meetings: 1 },
      { code: "FIC.102", section: "B", meetings: 1 },
      { code: "FIC.103", section: "A", meetings: 1 },
    ]);
    expect(
      result.subjects.map(
        (subject) => subject.meetings[0]?.importMetadata?.session,
      ),
    ).toEqual([1, 1, 1]);
    expect(
      result.subjects.map(({ units, enabled }) => ({
        units,
        enabled,
      })),
    ).toEqual([
      { units: 0, enabled: true },
      { units: 0, enabled: true },
      { units: 0, enabled: true },
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("groups multiple worksheet rows into meetings on one subject", async () => {
    const result = parsePortalWorkbook(
      await fixture("portal-multiple-meetings.xlsx"),
      { idFactory: ids() },
    );
    expect(result.subjects).toHaveLength(2);
    expect(result.metadata.sheetName).toBe("Sheet1");
    const meetings = result.subjects.find(
      (item) => item.code === "LAB.201",
    )?.meetings;
    expect(meetings).toHaveLength(2);
    expect(meetings?.map((meeting) => meeting.id)).toEqual([
      "meeting-0",
      "meeting-1",
    ]);
    expect(meetings?.[0]?.days).not.toBe(meetings?.[1]?.days);
    expect(meetings?.map((meeting) => meeting.importMetadata?.session)).toEqual(
      [1, 2],
    );
  });

  it("preserves edge-case meetings and produces repair warnings", async () => {
    const result = parsePortalWorkbook(
      await fixture("portal-edge-cases.xlsx"),
      { idFactory: ids() },
    );
    expect(result.metadata).toMatchObject({
      sheetName: "Sheet1",
      sourceRowCount: 4,
    });
    expect(result.subjects).toHaveLength(3);
    expect(result.subjects.some((subject) => subject.code === "")).toBe(false);
    expect(result.subjects[0]?.meetings[0]).toMatchObject({
      days: [],
      startTime: "07:00",
      endTime: "07:00",
    });
    expect(result.subjects[0]?.meetings[0]?.importMetadata).toMatchObject({
      rawTime: "03:45 AM - 03:45 AM",
      session: 1,
    });
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      "missing-subject",
      "invalid-day",
      "invalid-time",
      "invalid-day",
    ]);
  });

  describe("Portal file validation", () => {
    it("accepts an .xlsx file exactly at the 5 MB limit", () => {
      expect(
        validatePortalFile({
          name: "schedule.XLSX",
          size: MAX_PORTAL_WORKBOOK_BYTES,
        }),
      ).toEqual([]);
    });

    it("rejects invalid extensions", () => {
      expect(validatePortalFile({ name: "schedule.xls", size: 1024 })).toEqual([
        "Portal schedules must be .xlsx files.",
      ]);
    });

    it("rejects files greater than 5 MB", () => {
      expect(
        validatePortalFile({
          name: "schedule.xlsx",
          size: MAX_PORTAL_WORKBOOK_BYTES + 1,
        }),
      ).toEqual(["Portal schedules must be 5 MB or smaller."]);
    });
  });
});
