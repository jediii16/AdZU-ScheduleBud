import { z } from "zod";

import { FONT_IDS } from "@/lib/font-registry";

export const layoutIdSchema = z.enum([
  "cards",
  "minimal",
  "grid",
  "planner",
  "photo",
]);
export type LayoutId = z.infer<typeof layoutIdSchema>;

export const photoCompositionSchema = z.enum(["hero", "split", "polaroid"]);
export type PhotoComposition = z.infer<typeof photoCompositionSchema>;

export const dayVisibilitySchema = z.enum(["scheduled-only", "full-week"]);
export type DayVisibility = z.infer<typeof dayVisibilitySchema>;

export const fontIdSchema = z.enum(FONT_IDS);

export const themeIdSchema = z.enum([
  "clean-slate",
  "adzu-classic",
  "midnight",
  "siteao-orange",
  "laao-green",
  "eao-blue",
  "mao-red",
  "aao-yellow",
  "nao-white",
  "matcha-study",
  "girlfriends-choice",
  "pink-diary",
]);
export type ThemeId = z.infer<typeof themeIdSchema>;

export const themeDefinitionSchema = z.object({
  id: themeIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  fontId: fontIdSchema,
  headingFontId: fontIdSchema,
  previewColors: z.object({
    background: z.string(),
    foreground: z.string(),
    accent: z.string(),
  }),
  assets: z.record(z.string(), z.string()),
});
export type ThemeDefinition = z.infer<typeof themeDefinitionSchema>;

export const scheduleTitleSchema = z.object({
  visible: z.boolean(),
  text: z.string(),
});
export type ScheduleTitle = z.infer<typeof scheduleTitleSchema>;
