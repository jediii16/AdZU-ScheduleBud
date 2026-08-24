import { describe, expect, it } from "vitest";

import { attemptWarningGate } from "@/domain/schedule";

describe("warning acknowledgement", () => {
  it("allows clean schedules immediately", () => {
    expect(attemptWarningGate(false, "idle")).toEqual({
      allowed: true,
      state: "idle",
    });
  });

  it("reveals warnings on the first attempt and allows a deliberate second attempt", () => {
    const first = attemptWarningGate(true, "idle");
    expect(first).toEqual({ allowed: false, state: "revealed" });
    expect(attemptWarningGate(true, first.state)).toEqual({
      allowed: true,
      state: "acknowledged",
    });
  });
});
