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

const supplied = [
  {
    id: "generic-phone-1080x2400",
    category: "phone",
    displayName: "Generic FHD+ Portrait",
    width: 1080,
    height: 2400,
    orientation: "portrait",
    aspectLabel: "20:9",
  },
  {
    id: "tablet-4-3-portrait",
    category: "tablet",
    displayName: "Generic 4:3 Portrait",
    width: 1536,
    height: 2048,
    orientation: "portrait",
    aspectLabel: "4:3",
  },
  {
    id: "tablet-4-3-landscape",
    category: "tablet",
    displayName: "Generic 4:3 Landscape",
    width: 2048,
    height: 1536,
    orientation: "landscape",
    aspectLabel: "4:3",
  },
  {
    id: "tablet-16-10-portrait",
    category: "tablet",
    displayName: "Generic 16:10 Portrait",
    width: 1600,
    height: 2560,
    orientation: "portrait",
    aspectLabel: "16:10",
  },
  {
    id: "tablet-16-10-landscape",
    category: "tablet",
    displayName: "Generic 16:10 Landscape",
    width: 2560,
    height: 1600,
    orientation: "landscape",
    aspectLabel: "16:10",
  },
  {
    id: "laptop-1366x768",
    category: "laptop",
    displayName: "Laptop HD",
    width: 1366,
    height: 768,
    orientation: "landscape",
  },
  {
    id: "laptop-1920x1080",
    category: "laptop",
    displayName: "Laptop Full HD",
    width: 1920,
    height: 1080,
    orientation: "landscape",
  },
  {
    id: "laptop-2560x1600",
    category: "laptop",
    displayName: "Laptop 16:10",
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
    id: "desktop-2560x1440",
    category: "desktop",
    displayName: "Desktop QHD",
    width: 2560,
    height: 1440,
    orientation: "landscape",
  },
  {
    id: "desktop-3840x2160",
    category: "desktop",
    displayName: "Desktop 4K",
    width: 3840,
    height: 2160,
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
  {
    id: "square-2048",
    category: "square",
    displayName: "Square 2048",
    width: 2048,
    height: 2048,
    orientation: "square",
  },
] as const;
export const devicePresetRegistry: readonly DevicePreset[] = z
  .array(devicePresetSchema)
  .parse(supplied);
export const devicePresetById = new Map(
  devicePresetRegistry.map((preset) => [preset.id, preset]),
);
