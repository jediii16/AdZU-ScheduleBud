import { devicePresetById } from "./registry";
import type { DeviceVariant } from "@/domain/device/types";

export const INITIAL_STUDIO_PRESET_IDS = [
  "generic-phone-1080x2400",
  "desktop-1920x1080",
] as const;
export type StudioTargetId = "phone" | "desktop";
export function balancedPositionFor(category: DeviceVariant["category"]) {
  return category === "phone" ? { x: 0.5, y: 0.42 } : { x: 0.5, y: 0.45 };
}
export const STUDIO_TARGETS = INITIAL_STUDIO_PRESET_IDS.map(
  (presetId, index) => {
    const preset = devicePresetById.get(presetId)!;
    const id: StudioTargetId = index === 0 ? "phone" : "desktop";
    return {
      id,
      label: id === "phone" ? "Phone" : "Desktop",
      category: preset.category,
      dimensions: { width: preset.width, height: preset.height },
      presetId,
      defaultPosition: balancedPositionFor(preset.category),
      filename: `adzu-schedule-${id}.png`,
    };
  },
);
export function studioTargetForVariant(variant: DeviceVariant) {
  const preset = variant.presetId
    ? devicePresetById.get(variant.presetId)
    : undefined;
  const category = `${variant.category[0]!.toUpperCase()}${variant.category.slice(1)}`;
  return {
    id: variant.id,
    label:
      preset?.displayName ??
      `${category} ${variant.dimensions.width} × ${variant.dimensions.height}`,
    category: variant.category,
    dimensions: variant.dimensions,
    presetId: variant.presetId,
    defaultPosition: balancedPositionFor(variant.category),
    filename:
      variant.presetId === "generic-phone-1080x2400"
        ? "adzu-schedule-phone.png"
        : variant.presetId === "desktop-1920x1080"
          ? "adzu-schedule-desktop.png"
          : `adzu-schedule-${variant.category}-${variant.dimensions.width}x${variant.dimensions.height}.png`,
  };
}
