import {
  themeDefinitionSchema,
  type ThemeDefinition,
} from "@/domain/design/types";

const rawThemes: ThemeDefinition[] = [
  {
    id: "clean-slate",
    name: "Clean Slate",
    description: "Quiet, neutral, typography-first.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#F7F8FA",
      foreground: "#172033",
      accent: "#145F9B",
    },
    assets: { "background-pattern": "/themes/clean-slate/background.svg" },
  },
  {
    id: "adzu-classic",
    name: "AdZU Classic",
    description: "Academic navy with layered collegiate blues.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#F7F9FC",
      foreground: "#102A43",
      accent: "#1F5F9B",
    },
    assets: {},
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy tones for late-night studying.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#0F1623",
      foreground: "#F2F5F9",
      accent: "#7DA6D8",
    },
    assets: {},
  },
];

export const themeRegistry = themeDefinitionSchema.array().parse(rawThemes);
export const themeById = new Map(
  themeRegistry.map((theme) => [theme.id, theme]),
);

export const availableThemes = themeRegistry;
