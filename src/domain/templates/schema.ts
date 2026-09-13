import { z } from "zod";
import { projectDesignSchema } from "@/domain/project/types";
import {
  deviceCategorySchema,
  normalizedPointSchema,
  scheduleSizeSchema,
} from "@/domain/device/types";
import { stickerInstanceSchema } from "@/domain/stickers/types";
import { devicePresetById } from "@/data/devices/registry";
import { stickerById } from "@/data/stickers/catalog";
import { stylesForLayout } from "@/data/layout-styles/registry";

// Copyable design only: no student text, asset references, or template linkage.
export const templateDesignSchema = projectDesignSchema
  .omit({
    baseTemplateId: true,
    templateModified: true,
    wallpaperTitle: true,
    labels: true,
    photoCaptions: true,
  })
  .strict();

export const templateDefinitionSchema = z
  .object({
    schemaVersion: z.literal(1),
    revision: z.number().int().positive(),
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    description: z.string().min(1),
    device: z
      .object({ category: deviceCategorySchema, presetId: z.string().min(1) })
      .strict(),
    presentation: z
      .object({
        tags: z.array(z.string().min(1)),
        subjects: z.array(z.string().trim().min(1).max(16)).min(5).max(10),
      })
      .strict(),
    recipe: z
      .object({
        design: templateDesignSchema,
        showTitle: z.boolean(),
        schedulePosition: normalizedPointSchema,
        scheduleSize: scheduleSizeSchema,
        stickers: z
          .array(stickerInstanceSchema.omit({ instanceId: true }).strict())
          .max(50),
      })
      .strict(),
  })
  .strict()
  .superRefine((template, context) => {
    const issue = (message: string) =>
      context.addIssue({ code: "custom", message });
    if (
      devicePresetById.get(template.device.presetId)?.category !==
      template.device.category
    )
      issue("Unknown device preset or category mismatch.");
    const design = template.recipe.design;
    if (
      !stylesForLayout(
        design.layoutId,
        design.photoComposition ?? undefined,
      ).some((style) => style.id === design.layoutStyles[design.layoutId])
    )
      issue("Invalid Layout/Style pairing.");
    if (design.themeId === "custom" && !design.customPalette)
      issue("Custom palette is missing.");
    const background = design.background;
    if (background.mode === "image" || background.image)
      issue("Built-in recipes cannot reference uploaded images.");
    if (
      background.mode !== "palette" &&
      background.mode !== "image" &&
      !background[background.mode]
    )
      issue("Background configuration is missing.");
    if (Object.keys(design.subjectColors.bySubjectId).length)
      issue("Recipes cannot contain subject mappings.");
    for (const sticker of template.recipe.stickers)
      if (!stickerById.has(sticker.stickerId))
        issue(`Unknown sticker: ${sticker.stickerId}`);
  });

export type TemplateDefinition = z.infer<typeof templateDefinitionSchema>;
export const templateRegistrySchema = z
  .array(templateDefinitionSchema)
  .superRefine((templates, context) => {
    if (
      new Set(templates.map((template) => template.id)).size !==
      templates.length
    )
      context.addIssue({ code: "custom", message: "Duplicate template ID." });
  });
