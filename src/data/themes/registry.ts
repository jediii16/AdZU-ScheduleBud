import {
  themeDefinitionSchema,
  type ThemeDefinition,
} from "@/domain/design/types";

const rawThemes: ThemeDefinition[] = [
  {
    id: "clean-slate",
    name: "Clean Slate",
    description: "Malinis",
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
    description: "Blue and clean, the classic Ateneo way.",
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
    description: "For schedules made after “one last task.”",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#0F1623",
      foreground: "#F2F5F9",
      accent: "#7DA6D8",
    },
    assets: {},
  },
  {
    id: "siteao-orange",
    name: "SITEAO",
    description: "Griffin energy, but make it organized.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#FFF8F2",
      foreground: "#611305",
      accent: "#FD6A00",
    },
    assets: {},
  },
  {
    id: "laao-green",
    name: "LAAO",
    description: "Fresh, bold, and thriving like the Dragons.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#F4FBF7",
      foreground: "#123B29",
      accent: "#1E8E5A",
    },
    assets: {},
  },
  {
    id: "eao-blue",
    name: "EAO",
    description: "Cool, calm, and sharp like the Eagles.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#F4F8FC",
      foreground: "#102C52",
      accent: "#2C69B3",
    },
    assets: {},
  },
  {
    id: "mao-red",
    name: "MAO",
    description: "Bold, driven, and ready to lead like the Lions.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#FCF5F4",
      foreground: "#5A1010",
      accent: "#A61F1F",
    },
    assets: {},
  },
  {
    id: "aao-yellow",
    name: "AAO",
    description: "Bright, confident, and fierce like the Tigers.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#FFFBEF",
      foreground: "#5A4410",
      accent: "#D9A31A",
    },
    assets: {},
  },
  {
    id: "nao-white",
    name: "NAO",
    description: "Clean, calm, and angel-approved.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#FBFBFB",
      foreground: "#4D1D1D",
      accent: "#B63A3A",
    },
    assets: {},
  },
  {
    id: "matcha-study",
    name: "Matcha Study",
    description: "Calm, cozy, and mildly powered by matcha.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#F5F3E9",
      foreground: "#314438",
      accent: "#738B5E",
    },
    assets: {},
  },
  {
    id: "girlfriends-choice",
    name: "Girlfriend's Choice",
    description: "Made for the developer’s girlfriend and her favorite color.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#F5F1F8",
      foreground: "#33213F",
      accent: "#684B80",
    },
    assets: {},
  },
  {
    id: "pink-diary",
    name: "Pink Diary",
    description: "For schedules that deserve a little main-character energy.",
    fontId: "body-sans",
    headingFontId: "heading-sans",
    previewColors: {
      background: "#FFF6F8",
      foreground: "#5C2238",
      accent: "#C95F86",
    },
    assets: {},
  },
];

export const themeRegistry = themeDefinitionSchema.array().parse(rawThemes);
export const themeById = new Map(
  themeRegistry.map((theme) => [theme.id, theme]),
);

export const availableThemes = themeRegistry;
