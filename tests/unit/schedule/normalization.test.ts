import { describe, expect, it } from "vitest";

import {
  duplicateSubject,
  normalizeSubject,
  removeMeeting,
} from "@/domain/schedule";

import { sequentialIds, subject } from "./fixtures";

describe("schedule normalization", () => {
  it("always creates at least one editable meeting", () => {
    const normalized = normalizeSubject(
      { code: "  CUSTOM ", name: " Untitled class " },
      sequentialIds(),
    );
    expect(normalized.code).toBe("CUSTOM");
    expect(normalized.meetings).toHaveLength(1);
    expect(normalized.meetings[0]?.days).toEqual([]);
  });

  it("deduplicates days and trims editable fields", () => {
    const normalized = normalizeSubject(
      { meetings: [{ days: ["Mon", "Mon", "Thu"], room: "  F101 " }] },
      sequentialIds(),
    );
    expect(normalized.meetings[0]).toMatchObject({
      days: ["Mon", "Thu"],
      room: "F101",
    });
  });

  it("prevents removing a subject's last meeting", () => {
    const original = subject();
    expect(removeMeeting(original, "meeting-a")).toBe(original);
  });

  it("duplicates subjects, meetings, arrays, and metadata independently", () => {
    const ids = sequentialIds();
    const original = subject({ importMetadata: { source: "portal" } });
    const copy = duplicateSubject(original, ids);
    expect(copy.id).not.toBe(original.id);
    expect(copy.meetings[0]?.id).not.toBe(original.meetings[0]?.id);
    expect(copy.meetings[0]?.days).not.toBe(original.meetings[0]?.days);
    copy.meetings[0]!.days.push("Fri");
    expect(original.meetings[0]?.days).toEqual(["Mon"]);
    expect(copy.importMetadata?.duplicatedFrom).toBe(original.id);
  });
});
