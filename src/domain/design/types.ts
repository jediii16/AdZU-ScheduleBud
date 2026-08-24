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

export const themeDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  status: z.enum(["available", "planned"]),
  fontId: fontIdSchema,
  headingFontId: fontIdSchema,
  palette: z.object({
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
