import { z } from "zod";
import {
  builtInThemeIdSchema,
  dayVisibilitySchema,
  layoutIdSchema,
  layoutStylePreferencesSchema,
  photoCompositionSchema,
  scheduleTitleSchema,
  themeIdSchema,
} from "@/domain/design/types";
import {
  densitySchema,
  deviceVariantSchema,
  visibleFieldsSchema,
} from "@/domain/device/types";
import { scheduleSchema } from "@/domain/schedule/types";
import { TYPOGRAPHY_PRESET_IDS } from "@/data/typography/registry";

export const PROJECT_SCHEMA_VERSION = 1 as const;
export const projectSourceSchema = z.enum([
  "portal",
  "curriculum",
  "manual",
  "mixed",
]);

export const projectMetadataSchema = z.object({
  title: z.string().trim().min(1).max(160),
  source: projectSourceSchema,
  term: z
    .object({
      schoolYear: z.string().trim().max(40).nullable(),
      semester: z.string().trim().max(80).nullable(),
    })
    .nullable(),
  curriculum: z
    .object({
      programId: z.string().min(1),
      yearLevel: z.number().int().positive(),
      semesterId: z.string().min(1),
    })
    .nullable(),
});

export const wallpaperLabelsSchema = z.object({
  semester: scheduleTitleSchema,
  schoolYear: scheduleTitleSchema,
  program: scheduleTitleSchema,
  section: scheduleTitleSchema,
});

export const projectTypographySchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null)
      return { presetId: "schedulebud" };
    if (typeof value === "object" && value !== null && "bodyFontId" in value)
      return { presetId: "schedulebud" };
    return value;
  },
  z.object({ presetId: z.enum(TYPOGRAPHY_PRESET_IDS) }),
);

export const opaqueHexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/)
  .transform((color) => color.toUpperCase());

export const customPaletteSchema = z.object({
  basedOnPaletteId: builtInThemeIdSchema,
  canvas: opaqueHexColorSchema,
  primary: opaqueHexColorSchema,
  secondary: opaqueHexColorSchema,
  accent: opaqueHexColorSchema,
  surface: opaqueHexColorSchema,
  border: opaqueHexColorSchema,
});
export type CustomPalette = z.infer<typeof customPaletteSchema>;
export type CustomPaletteColorRole = Exclude<
  keyof CustomPalette,
  "basedOnPaletteId"
>;

const gradientDirectionSchema = z.union([
  z.literal(0),
  z.literal(45),
  z.literal(90),
  z.literal(135),
  z.literal(180),
  z.literal(225),
  z.literal(270),
  z.literal(315),
]);

const dotsPatternSchema = z.object({
  type: z.literal("dots"),
  backgroundColor: opaqueHexColorSchema,
  color: opaqueHexColorSchema,
  size: z.number().finite().min(0.003).max(0.04),
  spacing: z.number().finite().min(0.02).max(0.12),
  opacity: z.number().finite().min(0.05).max(1),
  offset: z.boolean(),
});
const gridPatternSchema = z.object({
  type: z.literal("grid"),
  backgroundColor: opaqueHexColorSchema,
  color: opaqueHexColorSchema,
  spacing: z.number().finite().min(0.02).max(0.12),
  lineWeight: z.number().finite().min(0.0005).max(0.008),
  opacity: z.number().finite().min(0.05).max(1),
});
const checkerPatternSchema = z.object({
  type: z.literal("checker"),
  backgroundColor: opaqueHexColorSchema,
  color: opaqueHexColorSchema,
  cellSize: z.number().finite().min(0.015).max(0.12),
  opacity: z.number().finite().min(0.05).max(1),
});
const diagonalPatternSchema = z.object({
  type: z.literal("diagonal"),
  backgroundColor: opaqueHexColorSchema,
  color: opaqueHexColorSchema,
  stripeWidth: z.number().finite().min(0.002).max(0.04),
  spacing: z.number().finite().min(0.02).max(0.14),
  angle: z.union([z.literal(45), z.literal(135)]),
  opacity: z.number().finite().min(0.05).max(1),
});
const emojiPatternSchema = z.object({
  type: z.literal("emoji"),
  backgroundColor: opaqueHexColorSchema,
  emojiId: z.string().min(1),
  size: z.number().finite().min(0.025).max(0.12),
  spacing: z.number().finite().min(0.055).max(0.2),
  opacity: z.number().finite().min(0.05).max(1),
  rotation: z.number().finite().min(-180).max(180),
  layout: z.enum(["grid", "offset"]),
});

export const backgroundPatternSchema = z.discriminatedUnion("type", [
  dotsPatternSchema,
  gridPatternSchema,
  checkerPatternSchema,
  diagonalPatternSchema,
  emojiPatternSchema,
]);
export type BackgroundPattern = z.infer<typeof backgroundPatternSchema>;

const backgroundDesignValueSchema = z.object({
  mode: z.enum(["palette", "solid", "gradient", "pattern", "image"]),
  solid: z.object({ color: opaqueHexColorSchema }).optional(),
  gradient: z
    .object({
      color1: opaqueHexColorSchema,
      color2: opaqueHexColorSchema,
      direction: gradientDirectionSchema,
    })
    .optional(),
  pattern: backgroundPatternSchema.optional(),
  image: z
    .object({
      assetId: z.string().min(1),
      overlay: z.enum(["none", "light", "dark"]),
      overlayIntensity: z.number().finite().min(0).max(0.6),
    })
    .optional(),
});

export const backgroundDesignSchema = z.preprocess((value) => {
  if (value === undefined || value === null) return { mode: "palette" };
  if (typeof value !== "object") return value;
  if ("mode" in value) return value;
  if ("kind" in value) {
    const legacy = value as Record<string, unknown>;
    if (legacy.kind === "theme") return { mode: "palette" };
    if (legacy.kind === "solid")
      return { mode: "solid", solid: { color: legacy.color } };
    if (legacy.kind === "asset")
      return {
        mode: "image",
        image: {
          assetId: legacy.assetId,
          overlay: "none",
          overlayIntensity: 0,
        },
      };
  }
  return value;
}, backgroundDesignValueSchema);
export type BackgroundDesign = z.infer<typeof backgroundDesignValueSchema>;

export const projectDesignSchema = z.object({
  baseTemplateId: z.string().min(1).nullable(),
  templateModified: z.boolean(),
  themeId: themeIdSchema.default("clean-slate"),
  customPalette: customPaletteSchema.nullable().default(null),
  themeVariantId: z.string().min(1).nullable(),
  layoutId: layoutIdSchema,
  layoutStyles: layoutStylePreferencesSchema,
  photoComposition: photoCompositionSchema.nullable(),
  photoCaptions: z.record(z.string().min(1), z.string().max(40)).default({}),
  weekMode: z.enum(["full", "compact"]),
  dayVisibility: dayVisibilitySchema.default("scheduled-only"),
  clockFormat: z.enum(["12-hour", "24-hour"]),
  density: densitySchema,
  visibleFields: visibleFieldsSchema,
  subjectColors: z.object({
    mode: z.enum(["automatic", "single", "per-subject"]),
    singleColor: z.string().nullable(),
    bySubjectId: z.record(z.string(), z.string()),
  }),
  background: backgroundDesignSchema.default({ mode: "palette" }),
  typography: projectTypographySchema.default({ presetId: "schedulebud" }),
  decorationIntensity: z.number().finite().min(0).max(1),
  wallpaperTitle: scheduleTitleSchema,
  labels: wallpaperLabelsSchema,
});
export type ProjectDesign = z.infer<typeof projectDesignSchema>;

export const assetReferencesSchema = z.object({
  photoAssetIds: z
    .array(z.string().min(1))
    .max(4)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Photo assets must be unique.",
    }),
  screenGuideAssetIds: z.array(z.string().min(1)),
});

export const scheduleProjectSchema = z
  .object({
    id: z.string().min(1),
    schemaVersion: z.literal(PROJECT_SCHEMA_VERSION),
    metadata: projectMetadataSchema,
    schedule: scheduleSchema,
    design: projectDesignSchema,
    deviceVariants: z.array(deviceVariantSchema),
    activeDeviceVariantId: z.string().min(1).nullable(),
    assetReferences: assetReferencesSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .superRefine((project, context) => {
    if (
      project.activeDeviceVariantId !== null &&
      !project.deviceVariants.some(
        (variant) => variant.id === project.activeDeviceVariantId,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["activeDeviceVariantId"],
        message: "The active device variant must belong to the project.",
      });
    }
    const ids = project.deviceVariants.map((variant) => variant.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        path: ["deviceVariants"],
        message: "Device variant IDs must be unique within a project.",
      });
    }
  });

export type ScheduleProject = z.infer<typeof scheduleProjectSchema>;
export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;
export type WallpaperLabels = z.infer<typeof wallpaperLabelsSchema>;
export type AssetReferences = z.infer<typeof assetReferencesSchema>;
