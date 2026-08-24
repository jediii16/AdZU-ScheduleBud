import { z } from "zod";

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

export const deviceVariantSchema = z.object({
  category: deviceCategorySchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  dimensionSource: z.enum(["preset", "custom"]),
  schedulePosition: normalizedPointSchema,
});
export type DeviceVariant = z.infer<typeof deviceVariantSchema>;

export type ScreenMatch = {
  width: number;
  height: number;
  orientation: "portrait" | "landscape" | "square";
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
  const orientation =
    width === height ? "square" : width > height ? "landscape" : "portrait";
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
