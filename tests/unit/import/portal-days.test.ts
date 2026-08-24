import { describe, expect, it } from "vitest";

import { parsePortalDays } from "@/domain/import";

describe("Portal day parsing", () => {
  it.each([
    ["MTH", ["Mon", "Thu"]],
    ["TF", ["Tue", "Fri"]],
    ["SAT", ["Sat"]],
    ["TH", ["Thu"]],
    ["TTH", ["Tue", "Thu"]],
    ["MMTHTH", ["Mon", "Thu"]],
    ["T / TH", ["Tue", "Thu"]],
    ["M,W;F", ["Mon", "Wed", "Fri"]],
  ])("decodes %s longest-token-first", (input, expected) => {
    expect(parsePortalDays(input)).toMatchObject({
      valid: true,
      days: expected,
    });
  });

  it("reports unknown tokens without inventing a day", () => {
    const result = parsePortalDays("MX");
    expect(result.valid).toBe(false);
    expect(result.days).toEqual(["Mon"]);
    expect(result.warnings[0]).toContain("X");
  });

  it("preserves known days while marking a mixed token invalid", () => {
    const result = parsePortalDays("MTHX");
    expect(result).toMatchObject({
      valid: false,
      days: ["Mon", "Thu"],
    });
    expect(result.warnings).toEqual(["Unknown day token 'X' at position 4."]);
  });

  it("reports a blank day", () => {
    expect(parsePortalDays(" ")).toMatchObject({ valid: false, days: [] });
  });
});
