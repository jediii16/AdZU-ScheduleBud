import type { WallpaperThemeDefinition } from "./types";

export const ADZU_CLASSIC_THEME: WallpaperThemeDefinition = {
  tokens: {
    id: "adzu-classic",
    background: "#F7F9FC",
    surface: "#FFFFFF",
    foreground: "#102A43",
    secondary: "#6F8195",
    muted: "#6F8195",
    cardsTime: "#102A43",
    cardsMetadata: "#6F8195",
    minimalTime: "#102A43",
    minimalSupport: "#6F8195",
    minimalProfessor: "#6F8195",
    minimalRule: "#1F5F9B",
    plannerSurface: "#EAF2FA",
    plannerBorder: "#CBD9E8",
    plannerRule: "#CBD9E8",
    plannerSupport: "#6F8195",
    photoSupport: "#6F8195",
    photoMuted: "#6F8195",
    photoRule: "#4F7FAF",
    polaroidPaper: "#FFFDF8",
    polaroidCaption: "#404A57",
    polaroidShadow: "#102A43",
    gridTime: "#102A43",
    gridSupport: "#6F8195",
    gridAxis: "#6F8195",
    gridGuide: "#CBD9E8",
    gridDivider: "#CBD9E8",
    border: "#CBD9E8",
    dayAccent: "#1F5F9B",
    subjectPalette: [
      "#D6E5F3",
      "#C7D9EA",
      "#DDE4EC",
      "#D2E5E7",
      "#DCDCF0",
      "#E8E1CF",
    ],
  },
  layoutTokens: {
    cards: {
      surface: "#FFFFFF",
      border: "#CBD9E8",
    },
    minimal: {
      minimalRule: "#1F5F9B",
    },
    grid: {
      gridGuide: "#CBD9E8",
      gridDivider: "#CBD9E8",
    },
    planner: {
      plannerSurface: "#EAF2FA",
      plannerBorder: "#CBD9E8",
      plannerRule: "#CBD9E8",
    },
    photo: {
      photoRule: "#4F7FAF",
    },
  },
};
