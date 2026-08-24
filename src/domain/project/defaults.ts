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
      themeVariantId: null,
      layoutId: "cards",
      photoComposition: null,
      weekMode: "full",
      clockFormat: "12-hour",
      density: "comfortable",
      visibleFields: {
        subjectCode: true,
        subjectName: true,
        time: true,
        room: true,
        professor: true,
        section: true,
      },
      subjectColors: { mode: "automatic", singleColor: null, bySubjectId: {} },
      background: { kind: "theme" },
      typography: {
        bodyFontId: "body-sans",
        headingFontId: "heading-sans",
        scale: 1,
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
