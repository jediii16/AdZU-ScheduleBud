import type { WallpaperThemeDefinition } from "./types";

export const MIDNIGHT_THEME: WallpaperThemeDefinition = {
  tokens: {
    id: "midnight",
    background: "#0F1623",
    surface: "#172131",
    foreground: "#F2F5F9",
    secondary: "#A7B3C2",
    muted: "#8998AB",
    cardsTime: "#A7B3C2",
    cardsMetadata: "#A7B3C2",
    minimalTime: "#A7B3C2",
    minimalSupport: "#A7B3C2",
    minimalProfessor: "#8998AB",
    minimalRule: "#7DA6D8",
    plannerSurface: "#172131",
    plannerBorder: "#2D3B4E",
    plannerRule: "#587FAF",
    plannerSupport: "#A7B3C2",
    photoSupport: "#A7B3C2",
    photoMuted: "#8998AB",
    photoRule: "#7DA6D8",
    polaroidPaper: "#F4F1EA",
    polaroidCaption: "#34383E",
    polaroidShadow: "#080C13",
    gridTime: "#A7B3C2",
    gridSupport: "#A7B3C2",
    gridAxis: "#8998AB",
    gridGuide: "#243145",
    gridDivider: "#2D3B4E",
    border: "#2D3B4E",
    dayAccent: "#7DA6D8",
    subjectPalette: [
      "#203A56",
      "#2A3C52",
      "#214447",
      "#353650",
      "#443444",
      "#493D30",
    ],
  },
  layoutTokens: {
    cards: {
      surface: "#172131",
      border: "#2D3B4E",
    },
    minimal: {
      minimalRule: "#7DA6D8",
    },
    grid: {
      gridGuide: "#243145",
      gridDivider: "#2D3B4E",
    },
    planner: {
      plannerSurface: "#172131",
      plannerBorder: "#2D3B4E",
      plannerRule: "#587FAF",
    },
    photo: {
      photoRule: "#7DA6D8",
    },
  },
};
