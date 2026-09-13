import {
  DEFAULT_SCHEDULE_SIZE,
  clampNormalizedPoint,
  inferOrientation,
  type DeviceVariant,
} from "./types";
import { DEVICE_PRESET_IDS } from "@/data/devices/registry";

function defaultPreviewModeFor(
  category: DeviceVariant["category"],
  presetId: DeviceVariant["presetId"],
): DeviceVariant["preview"]["mode"] {
  if (category === "phone" || category === "tablet") return "lock-screen";
  if (presetId === DEVICE_PRESET_IDS.macbook) return "clean";
  if (category === "laptop" || category === "desktop") return "windows-desktop";
  return "clean";
}

export type DeviceVariantInput = Pick<
  DeviceVariant,
  "category" | "dimensions"
> &
  Partial<
    Pick<
      DeviceVariant,
      "dimensionSource" | "presetId" | "schedulePosition" | "compositionId"
    >
  >;

export function createDeviceVariantState(
  id: string,
  input: DeviceVariantInput,
): DeviceVariant {
  return {
    id,
    category: input.category,
    dimensions: input.dimensions,
    dimensionSource: input.dimensionSource ?? "custom",
    presetId: input.presetId ?? null,
    orientation: inferOrientation(input.dimensions),
    compositionId: input.compositionId ?? "default",
    schedulePosition: clampNormalizedPoint(
      input.schedulePosition ?? { x: 0.5, y: 0.5 },
    ),
    scheduleSize: DEFAULT_SCHEDULE_SIZE,
    layoutOverride: null,
    densityOverride: null,
    visibleFieldsOverride: null,
    photoTransforms: { hero: {}, split: {}, polaroid: {} },
    backgroundImageTransform: {
      position: { x: 0.5, y: 0.5 },
      scale: 1,
    },
    stickers: [],
    preview: {
      mode: defaultPreviewModeFor(input.category, input.presetId ?? null),
      showSafeAreas: false,
      showWarnings: true,
      enableSnapping: true,
      guideAssetId: null,
    },
  };
}
