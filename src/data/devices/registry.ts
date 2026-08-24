import type { DeviceCategory } from "@/domain/device/types";

export type DeviceCategoryDefinition = {
  id: DeviceCategory;
  label: string;
  supportsCustomDimensions: boolean;
};

export const deviceCategoryRegistry: DeviceCategoryDefinition[] = [
  { id: "phone", label: "Phone", supportsCustomDimensions: true },
  { id: "tablet", label: "Tablet", supportsCustomDimensions: true },
  { id: "laptop", label: "Laptop", supportsCustomDimensions: true },
  { id: "desktop", label: "Desktop", supportsCustomDimensions: true },
  { id: "square", label: "Square", supportsCustomDimensions: true },
];

// Exact model presets are deliberately deferred until verified device data is supplied.
export const devicePresetRegistry: readonly [] = [];
