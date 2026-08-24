import { describe, expect, it } from "vitest";

import {
  calculateAutomaticTimeRange,
  resolveTimeRange,
} from "@/domain/schedule";

import { subject } from "./fixtures";

describe("time range calculation", () => {
  it("uses the documented default without complete meetings", () => {
    expect(calculateAutomaticTimeRange([])).toEqual({
      startTime: "07:00",
      endTime: "18:00",
      source: "default",
    });
  });

  it("rounds outward to hours and clamps to supported hours", () => {
    const value = subject({
      meetings: [
        { ...subject().meetings[0]!, startTime: "07:05", endTime: "20:15" },
      ],
    });
    expect(calculateAutomaticTimeRange([value])).toEqual({
      startTime: "07:00",
      endTime: "21:00",
      source: "automatic",
    });
  });

  it("accepts a valid manual range and falls back from an invalid one", () => {
    expect(
      resolveTimeRange([], { startTime: "08:00", endTime: "17:00" }).source,
    ).toBe("manual");
    expect(
      resolveTimeRange([], { startTime: "18:00", endTime: "08:00" }).source,
    ).toBe("default");
  });

  it("accepts exact supported manual boundaries", () => {
    expect(
      resolveTimeRange([], { startTime: "07:00", endTime: "21:00" }),
    ).toEqual({ startTime: "07:00", endTime: "21:00", source: "manual" });
  });

  it.each([
    { startTime: "06:59", endTime: "17:00" },
    { startTime: "08:00", endTime: "21:01" },
    { startTime: "21:00", endTime: "21:00" },
  ])("rejects an out-of-domain or non-positive manual range", (manual) => {
    expect(resolveTimeRange([], manual).source).toBe("default");
  });

  it("ignores externally malformed out-of-domain meetings safely", () => {
    const value = subject({
      meetings: [
        { ...subject().meetings[0]!, startTime: "20:30", endTime: "22:00" },
      ],
    });
    expect(calculateAutomaticTimeRange([value])).toEqual({
      startTime: "07:00",
      endTime: "18:00",
      source: "default",
    });
  });

  it("ignores disabled subjects when calculating timetable bounds", () => {
    const disabled = subject({
      enabled: false,
      meetings: [
        { ...subject().meetings[0]!, startTime: "07:00", endTime: "21:00" },
      ],
    });
    const included = subject({
      id: "included",
      meetings: [
        { ...subject().meetings[0]!, startTime: "10:15", endTime: "11:45" },
      ],
    });
    expect(calculateAutomaticTimeRange([disabled, included])).toEqual({
      startTime: "10:00",
      endTime: "12:00",
      source: "automatic",
    });
    expect(calculateAutomaticTimeRange([disabled])).toEqual({
      startTime: "07:00",
      endTime: "18:00",
      source: "default",
    });
  });
});
