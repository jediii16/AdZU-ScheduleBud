import { describe, expect, it } from "vitest";

import { parsePortalTimeRange } from "@/domain/import";

describe("Portal time parsing", () => {
  it.each([
    ["8:05 AM - 9:30 AM", "08:05", "09:30"],
    ["11:00 AM - 12:20 PM", "11:00", "12:20"],
    ["12:00 PM – 1:05 PM", "12:00", "13:05"],
    ["7:00 AM - 9:00 PM", "07:00", "21:00"],
    ["12:00 AM - 7:00 AM", "00:00", "07:00"],
  ])("parses exact minutes in %s", (input, startTime, endTime) => {
    const result = parsePortalTimeRange(input);
    if (input.startsWith("12:00 AM")) {
      expect(result).toMatchObject({
        valid: false,
        code: "outside-supported-hours",
      });
    } else {
      expect(result).toMatchObject({ valid: true, startTime, endTime });
    }
  });

  it.each([
    ["", "missing"],
    ["8 to 9", "malformed"],
    ["03:45 AM - 03:45 AM", "non-positive"],
    ["06:55 AM - 08:00 AM", "outside-supported-hours"],
    ["10:00 PM - 11:05 PM", "outside-supported-hours"],
  ])("retains %s as an invalid repairable range", (input, code) => {
    expect(parsePortalTimeRange(input)).toMatchObject({
      valid: false,
      startTime: "07:00",
      endTime: "07:00",
      code,
    });
  });
});
