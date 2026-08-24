export type WarningGateState = "idle" | "revealed" | "acknowledged";

export type WarningGateResult = {
  allowed: boolean;
  state: WarningGateState;
};

export function attemptWarningGate(
  hasWarnings: boolean,
  current: WarningGateState,
): WarningGateResult {
  if (!hasWarnings) return { allowed: true, state: "idle" };
  if (current === "idle") return { allowed: false, state: "revealed" };
  return { allowed: true, state: "acknowledged" };
}
