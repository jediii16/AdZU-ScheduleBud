import type {
  DeviceCategory,
  DeviceDimensions,
  DeviceVariant,
} from "@/domain/device/types";

export type StudioTargetId = "phone" | "desktop";
export type StudioTarget = {
  id: StudioTargetId;
  label: string;
  category: DeviceCategory;
  dimensions: DeviceDimensions;
  presetId: string;
  defaultPosition: { x: number; y: number };
  filename: string;
};

export const STUDIO_TARGETS: readonly StudioTarget[] = [
  {
    id: "phone",
    label: "Phone",
    category: "phone",
    dimensions: { width: 1080, height: 2400 },
    presetId: "generic-phone-1080x2400",
    defaultPosition: { x: 0.5, y: 0.42 },
    filename: "adzu-schedule-phone.png",
  },
  {
    id: "desktop",
    label: "Desktop",
    category: "desktop",
    dimensions: { width: 1920, height: 1080 },
    presetId: "full-hd-desktop",
    defaultPosition: { x: 0.5, y: 0.45 },
    filename: "adzu-schedule-desktop.png",
  },
] as const;

export function studioTargetForVariant(
  variant: DeviceVariant,
): StudioTarget | undefined {
  return STUDIO_TARGETS.find(
    (target) =>
      target.category === variant.category &&
      target.dimensions.width === variant.dimensions.width &&
      target.dimensions.height === variant.dimensions.height,
  );
}
