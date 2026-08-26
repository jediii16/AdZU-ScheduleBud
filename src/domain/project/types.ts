import { z } from "zod";
import {
  dayVisibilitySchema,
  fontIdSchema,
  layoutIdSchema,
  photoCompositionSchema,
  scheduleTitleSchema,
} from "@/domain/design/types";
import {
  densitySchema,
  deviceVariantSchema,
  visibleFieldsSchema,
} from "@/domain/device/types";
import { scheduleSchema } from "@/domain/schedule/types";

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

export const projectDesignSchema = z.object({
  baseTemplateId: z.string().min(1).nullable(),
  templateModified: z.boolean(),
  themeId: z.string().min(1),
  themeVariantId: z.string().min(1).nullable(),
  layoutId: layoutIdSchema,
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
  background: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("theme") }),
    z.object({ kind: z.literal("solid"), color: z.string().min(1) }),
    z.object({ kind: z.literal("asset"), assetId: z.string().min(1) }),
  ]),
  typography: z.object({
    bodyFontId: fontIdSchema,
    headingFontId: fontIdSchema,
    scale: z.number().finite().min(0.75).max(1.5),
  }),
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
