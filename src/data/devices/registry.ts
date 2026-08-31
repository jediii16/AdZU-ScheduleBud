import { z } from "zod";
import {
  deviceCategorySchema,
  deviceDimensionsSchema,
  inferOrientation,
} from "@/domain/device/types";

export type DeviceCategoryDefinition = {
  id: z.infer<typeof deviceCategorySchema>;
  label: string;
  supportsCustomDimensions: true;
};
export const deviceCategoryRegistry: readonly DeviceCategoryDefinition[] = [
  { id: "phone", label: "Phone", supportsCustomDimensions: true },
  { id: "tablet", label: "Tablet", supportsCustomDimensions: true },
  { id: "laptop", label: "Laptop", supportsCustomDimensions: true },
  { id: "desktop", label: "Desktop", supportsCustomDimensions: true },
  { id: "square", label: "Square", supportsCustomDimensions: true },
];

const devicePresetSchema = z
  .object({
    id: z.string().min(1),
    category: deviceCategorySchema,
    displayName: z.string().min(1),
    width: z.number().int(),
    height: z.number().int(),
    orientation: z.enum(["portrait", "landscape", "square"]),
    aspectLabel: z.string().optional(),
  })
  .superRefine((preset, context) => {
    if (preset.orientation !== inferOrientation(preset))
      context.addIssue({
        code: "custom",
        path: ["orientation"],
        message: "Preset orientation must match dimensions.",
      });
    if (!deviceDimensionsSchema.safeParse(preset).success)
      context.addIssue({
        code: "custom",
        path: ["width"],
        message: "Preset exceeds canvas safety limits.",
      });
  });
export type DevicePreset = z.infer<typeof devicePresetSchema>;

export const DEVICE_PRESET_IDS = {
  iphone: "iphone-1206x2622",
  android: "generic-phone-1080x2400",
  macbook: "laptop-2560x1600",
} as const;

const supplied = [
  {
    id: DEVICE_PRESET_IDS.iphone,
    category: "phone",
    displayName: "iPhone",
    width: 1206,
    height: 2622,
    orientation: "portrait",
    aspectLabel: "19.6:9",
  },
  {
    id: DEVICE_PRESET_IDS.android,
    category: "phone",
    displayName: "Android Phone",
    width: 1080,
    height: 2400,
    orientation: "portrait",
    aspectLabel: "20:9",
  },
  {
    id: "tablet-4-3-portrait",
    category: "tablet",
    displayName: "iPad Portrait",
    width: 1536,
    height: 2048,
    orientation: "portrait",
    aspectLabel: "4:3",
  },
  {
    id: "tablet-4-3-landscape",
    category: "tablet",
    displayName: "iPad Landscape",
    width: 2048,
    height: 1536,
    orientation: "landscape",
    aspectLabel: "4:3",
  },
  {
    id: "laptop-1366x768",
    category: "laptop",
    displayName: "Laptop 16:9",
    width: 1366,
    height: 768,
    orientation: "landscape",
    aspectLabel: "16:9",
  },
  {
    id: DEVICE_PRESET_IDS.macbook,
    category: "laptop",
    displayName: "MacBook 16:10",
    width: 2560,
    height: 1600,
    orientation: "landscape",
    aspectLabel: "16:10",
  },
  {
    id: "desktop-1920x1080",
    category: "desktop",
    displayName: "Desktop Full HD",
    width: 1920,
    height: 1080,
    orientation: "landscape",
  },
  {
    id: "square-1080",
    category: "square",
    displayName: "Square 1080",
    width: 1080,
    height: 1080,
    orientation: "square",
  },
] as const;
export const devicePresetRegistry: readonly DevicePreset[] = z
  .array(devicePresetSchema)
  .parse(supplied);
export const devicePresetById = new Map(
  devicePresetRegistry.map((preset) => [preset.id, preset]),
);
