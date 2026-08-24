import { createBlankProject, scheduleProjectSchema } from "@/domain/project";
import { normalizeSubject } from "@/domain/schedule/normalization";
import type { DeviceVariant } from "@/domain/device/types";

const phone: DeviceVariant = {
  id: "visual-phone",
  category: "phone",
  dimensions: { width: 1080, height: 2400 },
  dimensionSource: "preset",
  presetId: "generic-phone-1080x2400",
  orientation: "portrait",
  compositionId: "cards-phone",
  schedulePosition: { x: 0.5, y: 0.42 },
  layoutOverride: null,
  densityOverride: null,
  visibleFieldsOverride: null,
  photoTransforms: {},
  preview: {
    mode: "clean",
    showSafeAreas: false,
    showWarnings: true,
    enableSnapping: true,
    guideAssetId: null,
  },
};

const desktop: DeviceVariant = {
  ...phone,
  id: "visual-desktop",
  category: "desktop",
  dimensions: { width: 1920, height: 1080 },
  presetId: "full-hd-desktop",
  orientation: "landscape",
  compositionId: "cards-desktop",
  schedulePosition: { x: 0.5, y: 0.45 },
};

function idFactory(kind: "subject" | "meeting") {
  idFactory.count += 1;
  return `${kind}-visual-${idFactory.count}`;
}
idFactory.count = 0;

export function visualScheduleProject() {
  idFactory.count = 0;
  const project = createBlankProject({
    id: "visual-project",
    now: "2026-08-24T00:00:00.000Z",
    title: "Visual fixture",
  });
  const schedule = [
    normalizeSubject(
      {
        code: "CS.412",
        section: "A",
        meetings: [
          {
            days: ["Mon", "Thu"],
            startTime: "08:00",
            endTime: "09:30",
            room: "ICT 301",
            professor: "Prof. Rivera",
          },
        ],
      },
      idFactory,
    ),
    normalizeSubject(
      {
        code: "HCI 320",
        meetings: [
          {
            days: ["Tue", "Fri"],
            startTime: "10:15",
            endTime: "11:45",
            room: "Innovation Laboratory with a Long Room Name",
            professor: "Professor With A Deliberately Long Display Name",
          },
        ],
      },
      idFactory,
    ),
    normalizeSubject(
      {
        code: "THESIS1",
        enabled: false,
        meetings: [{ days: [], startTime: "07:00", endTime: "07:00" }],
      },
      idFactory,
    ),
    normalizeSubject(
      {
        code: "OPEN 1",
        meetings: [{ days: [], startTime: "07:00", endTime: "07:00" }],
      },
      idFactory,
    ),
  ];
  return scheduleProjectSchema.parse({
    ...project,
    schedule,
    deviceVariants: [phone, desktop],
    activeDeviceVariantId: phone.id,
  });
}

export const VISUAL_RENDER_FIXTURES = [
  "phone-cards-clean-5-days-title",
  "phone-cards-clean-5-days-no-title",
  "desktop-cards-clean-5-days-title",
  "desktop-cards-clean-full-week",
  "phone-minimal-clean-5-days-title",
  "phone-minimal-clean-5-days-no-title",
  "phone-minimal-clean-3-days",
  "tablet-portrait-minimal-clean",
  "tablet-landscape-minimal-clean",
  "tablet-landscape-minimal-clean-6-days",
  "desktop-minimal-clean-5-days",
  "desktop-minimal-clean-3-days",
  "desktop-minimal-clean-6-days",
  "square-minimal-clean-5-days",
  "phone-minimal-clean-long-content",
  "phone-minimal-clean-display-390",
  "phone-minimal-clean-export-display-390",
  "phone-grid-clean-5-days-title",
  "phone-grid-clean-5-days-no-title",
  "phone-grid-clean-6-days",
  "phone-grid-clean-long-range",
  "phone-grid-clean-overlap",
  "phone-grid-clean-display-390",
  "phone-grid-clean-export-display-390",
  "tablet-portrait-grid-clean-5-days",
  "tablet-portrait-grid-clean-6-days",
  "tablet-landscape-grid-clean-5-days",
  "desktop-grid-clean-5-days",
  "desktop-grid-clean-6-days",
  "desktop-grid-clean-3-days",
  "desktop-grid-clean-overlap",
  "square-grid-clean-5-days",
] as const;
