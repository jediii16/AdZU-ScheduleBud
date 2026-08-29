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

export const layoutStyleIdSchema = z.enum([
  "minimal-clean",
  "minimal-editorial",
  "minimal-bold",
  "cards-soft",
  "cards-outline",
  "cards-bold",
  "cards-glass",
  "grid-filled",
  "grid-outline",
  "grid-soft",
  "planner-paper",
  "planner-soft",
  "planner-editorial",
  "photo-clean",
  "photo-framed",
]);
export type LayoutStyleId = z.infer<typeof layoutStyleIdSchema>;

export const layoutStylePreferencesSchema = z
  .object({
    minimal: z
      .enum(["minimal-clean", "minimal-editorial", "minimal-bold"])
      .default("minimal-clean"),
    cards: z
      .enum(["cards-soft", "cards-outline", "cards-bold", "cards-glass"])
      .default("cards-soft"),
    grid: z
      .enum(["grid-filled", "grid-outline", "grid-soft"])
      .default("grid-filled"),
    planner: z
      .enum(["planner-paper", "planner-soft", "planner-editorial"])
      .default("planner-paper"),
    photo: z.enum(["photo-clean", "photo-framed"]).default("photo-clean"),
  })
  .default({
    minimal: "minimal-clean",
    cards: "cards-soft",
    grid: "grid-filled",
    planner: "planner-paper",
    photo: "photo-clean",
  });
export type LayoutStylePreferences = z.infer<
  typeof layoutStylePreferencesSchema
>;

export const photoCompositionSchema = z.enum(["hero", "split", "polaroid"]);
export type PhotoComposition = z.infer<typeof photoCompositionSchema>;

export const dayVisibilitySchema = z.enum(["scheduled-only", "full-week"]);
export type DayVisibility = z.infer<typeof dayVisibilitySchema>;

export const fontIdSchema = z.enum(FONT_IDS);

export const builtInThemeIdSchema = z.enum([
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
export type BuiltInThemeId = z.infer<typeof builtInThemeIdSchema>;

export const themeIdSchema = z.enum([
  ...builtInThemeIdSchema.options,
  "custom",
]);
export type ThemeId = z.infer<typeof themeIdSchema>;

export const themeDefinitionSchema = z.object({
  id: builtInThemeIdSchema,
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
