import {
  themeDefinitionSchema,
  type ThemeDefinition,
} from "@/domain/design/types";

const plannedThemeNames = [
  ["adzu-classic", "AdZU Classic"],
  ["midnight", "Midnight"],
  ["pink-diary", "Pink Diary"],
  ["matcha-study", "Matcha Study"],
  ["capybara-study-buddy", "Capybara Study Buddy"],
  ["cat-cafe", "Cat Café"],
  ["puppy-club", "Puppy Club"],
  ["stargazer", "Stargazer"],
  ["pixel-grove", "Pixel Grove"],
] as const;

const cleanSlate: ThemeDefinition = {
  id: "clean-slate",
  name: "Clean Slate",
  status: "available",
  fontId: "body-sans",
  headingFontId: "heading-sans",
  palette: { background: "#F8FAFC", foreground: "#172033", accent: "#136F8A" },
  assets: { "background-pattern": "/themes/clean-slate/background.svg" },
};

const rawThemes: ThemeDefinition[] = [
  cleanSlate,
  ...plannedThemeNames.map(([id, name]) => ({
    id,
    name,
    status: "planned" as const,
    fontId: "body-sans" as const,
    headingFontId:
      id === "pixel-grove"
        ? ("pixel-heading" as const)
        : ("heading-sans" as const),
    palette: {
      background: "#F4F4F5",
      foreground: "#27272A",
      accent: "#71717A",
    },
    assets: { "background-pattern": "/themes/_shared/placeholder-pattern.svg" },
  })),
];

export const themeRegistry = themeDefinitionSchema.array().parse(rawThemes);
export const themeById = new Map(
  themeRegistry.map((theme) => [theme.id, theme]),
);
