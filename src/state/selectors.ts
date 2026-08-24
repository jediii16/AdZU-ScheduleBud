import type { ScheduleBudState } from "./types";

export const selectActiveProject = (state: ScheduleBudState) =>
  state.activeProjectId ? state.projectsById[state.activeProjectId] : undefined;
export const selectActiveSchedule = (state: ScheduleBudState) =>
  selectActiveProject(state)?.schedule ?? [];
export const selectActiveProjectDesign = (state: ScheduleBudState) =>
  selectActiveProject(state)?.design;
export const selectActiveDeviceVariant = (state: ScheduleBudState) => {
  const project = selectActiveProject(state);
  return project?.deviceVariants.find(
    (variant) => variant.id === project.activeDeviceVariantId,
  );
};
export const selectProjectById =
  (projectId: string) => (state: ScheduleBudState) =>
    state.projectsById[projectId];
export const selectSubjectById =
  (subjectId: string) => (state: ScheduleBudState) =>
    selectActiveSchedule(state).find((subject) => subject.id === subjectId);
export const selectCurrentThemeId = (state: ScheduleBudState) =>
  selectActiveProjectDesign(state)?.themeId;
export const selectCurrentLayoutId = (state: ScheduleBudState) =>
  selectActiveProjectDesign(state)?.layoutId;
