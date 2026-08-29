import type { ScheduleProject } from "./types";
import { PROJECT_SCHEMA_VERSION, scheduleProjectSchema } from "./types";

export type BlankProjectOptions = { id: string; now: string; title?: string };

export function createBlankProject({
  id,
  now,
  title,
}: BlankProjectOptions): ScheduleProject {
  return scheduleProjectSchema.parse({
    id,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    metadata: {
      title: title?.trim() || "Untitled schedule",
      source: "manual",
      term: null,
      curriculum: null,
    },
    schedule: [],
    design: {
      baseTemplateId: null,
      templateModified: false,
      themeId: "clean-slate",
      customPalette: null,
      themeVariantId: null,
      layoutId: "cards",
      layoutStyles: {
        minimal: "minimal-clean",
        cards: "cards-soft",
        grid: "grid-filled",
        planner: "planner-paper",
        photo: "photo-clean",
      },
      photoComposition: null,
      photoCaptions: {},
      weekMode: "full",
      dayVisibility: "scheduled-only",
      clockFormat: "12-hour",
      density: "comfortable",
      visibleFields: {
        time: true,
        room: true,
        professor: true,
        section: true,
      },
      subjectColors: { mode: "automatic", singleColor: null, bySubjectId: {} },
      background: { mode: "palette" },
      typography: {
        presetId: "schedulebud",
      },
      decorationIntensity: 0.5,
      wallpaperTitle: { visible: true, text: "Weekly Schedule" },
      labels: {
        semester: { visible: false, text: "" },
        schoolYear: { visible: false, text: "" },
        program: { visible: false, text: "" },
        section: { visible: false, text: "" },
      },
    },
    deviceVariants: [],
    activeDeviceVariantId: null,
    assetReferences: { photoAssetIds: [], screenGuideAssetIds: [] },
    createdAt: now,
    updatedAt: now,
  });
}
