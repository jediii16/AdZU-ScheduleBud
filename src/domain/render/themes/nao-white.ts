import type { WallpaperThemeDefinition } from "./types";

export const NAO_WHITE_THEME: WallpaperThemeDefinition = {
  tokens: {
    id: "nao-white",
    background: "#FBFBFB",
    surface: "#FFFFFF",
    foreground: "#4D1D1D",
    secondary: "#6A6A6A",
    muted: "#707070",
    cardsTime: "#313131",
    cardsMetadata: "#6A6A6A",
    minimalTime: "#313131",
    minimalSupport: "#6A6A6A",
    minimalProfessor: "#707070",
    minimalRule: "#B63A3A",
    plannerSurface: "#F7F7F7",
    plannerBorder: "#E5E1E1",
    plannerRule: "#EDEAEA",
    plannerSupport: "#6A6A6A",
    photoSupport: "#6A6A6A",
    photoMuted: "#707070",
    photoRule: "#B63A3A",
    polaroidPaper: "#FFFFFF",
    polaroidCaption: "#414141",
    polaroidShadow: "#2F2323",
    gridTime: "#313131",
    gridSupport: "#6A6A6A",
    gridAxis: "#707070",
    gridGuide: "#E5E1E1",
    gridDivider: "#EEECEC",
    border: "#E5E1E1",
    dayAccent: "#8F2323",
    subjectPalette: [
      "#FFFFFF",
      "#F2F2F2",
      "#F8ECEC",
      "#F3E3E3",
      "#F7F5F5",
      "#EEE7E7",
    ],
  },
  layoutTokens: {
    cards: {
      surface: "#FFFFFF",
      border: "#E5E1E1",
    },
    minimal: {
      minimalRule: "#B63A3A",
    },
    grid: {
      gridGuide: "#E5E1E1",
      gridDivider: "#EEECEC",
    },
    planner: {
      plannerSurface: "#F7F7F7",
      plannerBorder: "#E5E1E1",
      plannerRule: "#EDEAEA",
    },
    photo: {
      photoRule: "#B63A3A",
    },
  },
};
