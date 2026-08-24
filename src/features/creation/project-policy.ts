import type { StoreApi } from "zustand/vanilla";

import type { ScheduleBudState } from "@/state/types";

export function ensureCreationProject(
  store: StoreApi<ScheduleBudState>,
  title = "My schedule",
): string {
  const state = store.getState();
  const active = state.activeProjectId
    ? state.projectsById[state.activeProjectId]
    : undefined;
  if (active && active.schedule.length === 0) return active.id;
  return state.createProject(title);
}
