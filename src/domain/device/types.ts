import { z } from "zod";

import { layoutIdSchema } from "@/domain/design/types";

export const deviceCategorySchema = z.enum([
  "phone",
  "tablet",
  "laptop",
  "desktop",
  "square",
]);
export type DeviceCategory = z.infer<typeof deviceCategorySchema>;

export const normalizedPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});
export type NormalizedPoint = z.infer<typeof normalizedPointSchema>;

export function clampNormalizedPoint(point: {
  x: number;
  y: number;
}): NormalizedPoint {
  const finiteOrCenter = (value: number) =>
    Number.isFinite(value) ? value : 0.5;
  return {
    x: Math.min(1, Math.max(0, finiteOrCenter(point.x))),
    y: Math.min(1, Math.max(0, finiteOrCenter(point.y))),
  };
}

export const MIN_CANVAS_EDGE = 320;
export const MAX_CANVAS_EDGE = 5120;
export const MAX_CANVAS_AREA = 16_000_000;
export const deviceDimensionsSchema = z
  .object({
    width: z.number().int().min(MIN_CANVAS_EDGE).max(MAX_CANVAS_EDGE),
    height: z.number().int().min(MIN_CANVAS_EDGE).max(MAX_CANVAS_EDGE),
  })
  .refine(({ width, height }) => width * height <= MAX_CANVAS_AREA, {
    message: "Canvas area must not exceed 16 million pixels.",
  });
export type DeviceDimensions = z.infer<typeof deviceDimensionsSchema>;

export const orientationSchema = z.enum(["portrait", "landscape", "square"]);
export type Orientation = z.infer<typeof orientationSchema>;
export function inferOrientation({
  width,
  height,
}: DeviceDimensions): Orientation {
  return width === height
    ? "square"
    : width > height
      ? "landscape"
      : "portrait";
}

export const densitySchema = z.enum(["compact", "comfortable", "detailed"]);
export type Density = z.infer<typeof densitySchema>;

export const visibleFieldsSchema = z.object({
  subjectCode: z.boolean(),
  subjectName: z.boolean(),
  time: z.boolean(),
  room: z.boolean(),
  professor: z.boolean(),
  section: z.boolean(),
});
export type VisibleFields = z.infer<typeof visibleFieldsSchema>;

export const previewPreferencesSchema = z.object({
  mode: z.enum([
    "clean",
    "lock-screen",
    "home-screen",
    "desktop",
    "windows-desktop",
    "macos-desktop",
    "tablet-interface",
    "uploaded-guide",
  ]),
  showSafeAreas: z.boolean(),
  showWarnings: z.boolean(),
  enableSnapping: z.boolean(),
  guideAssetId: z.string().min(1).nullable(),
});
export type PreviewPreferences = z.infer<typeof previewPreferencesSchema>;

export const photoTransformSchema = z.object({
  position: normalizedPointSchema,
  scale: z.number().finite().min(0.1).max(10),
  rotation: z.number().finite().min(-360).max(360),
});
export type PhotoTransform = z.infer<typeof photoTransformSchema>;

export const deviceVariantSchema = z
  .object({
    id: z.string().min(1),
    category: deviceCategorySchema,
    dimensions: deviceDimensionsSchema,
    dimensionSource: z.enum(["preset", "custom", "matched-screen"]),
    presetId: z.string().min(1).nullable(),
    orientation: orientationSchema,
    compositionId: z.string().min(1),
    schedulePosition: normalizedPointSchema,
    layoutOverride: layoutIdSchema.nullable(),
    densityOverride: densitySchema.nullable(),
    visibleFieldsOverride: visibleFieldsSchema.partial().nullable(),
    photoTransforms: z.record(z.string(), photoTransformSchema),
    preview: previewPreferencesSchema,
  })
  .superRefine((variant, context) => {
    if (variant.orientation !== inferOrientation(variant.dimensions)) {
      context.addIssue({
        code: "custom",
        path: ["orientation"],
        message: "Orientation must match the stored dimensions.",
      });
    }
    if (
      (variant.dimensionSource === "preset") !==
      (variant.presetId !== null)
    ) {
      context.addIssue({
        code: "custom",
        path: ["presetId"],
        message: "Only preset dimensions may carry a preset ID.",
      });
    }
  });
export type DeviceVariant = z.infer<typeof deviceVariantSchema>;

export type ScreenMatch = {
  width: number;
  height: number;
  orientation: Orientation;
  confidence: "high" | "ambiguous";
  candidates: readonly DeviceCategory[];
  recommendedCategory?: DeviceCategory;
  requiresConfirmation: boolean;
};

export function inferScreenMatch(width: number, height: number): ScreenMatch {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new RangeError("Screen dimensions must be positive integers.");
  }
  const orientation = inferOrientation({ width, height });
  if (orientation === "square") {
    return {
      width,
      height,
      orientation,
      confidence: "high",
      candidates: ["square"],
      recommendedCategory: "square",
      requiresConfirmation: false,
    };
  }
  return {
    width,
    height,
    orientation,
    confidence: "ambiguous",
    candidates:
      orientation === "portrait"
        ? ["phone", "tablet"]
        : ["laptop", "desktop", "tablet"],
    requiresConfirmation: true,
  };
}
