import type { WallpaperThemeDefinition } from "./types";

export const SITEAO_ORANGE_THEME: WallpaperThemeDefinition = {
  tokens: {
    id: "siteao-orange",
    background: "#FFF8F2",
    surface: "#FFF1E6",
    foreground: "#611305",
    secondary: "#7A3A1D",
    muted: "#8A4C2A",
    cardsTime: "#6B1B08",
    cardsMetadata: "#7A3A1D",
    minimalTime: "#6B1B08",
    minimalSupport: "#7A3A1D",
    minimalProfessor: "#8A4C2A",
    minimalRule: "#FD6A00",
    plannerSurface: "#FFF2E8",
    plannerBorder: "#F2C7A3",
    plannerRule: "#F4D2B5",
    plannerSupport: "#7A3A1D",
    photoSupport: "#7A3A1D",
    photoMuted: "#8A4C2A",
    photoRule: "#FD6A00",
    polaroidPaper: "#FFFDF8",
    polaroidCaption: "#5D1E0D",
    polaroidShadow: "#280A02",
    gridTime: "#6B1B08",
    gridSupport: "#7A3A1D",
    gridAxis: "#8A4C2A",
    gridGuide: "#F2C7A3",
    gridDivider: "#F6DCC5",
    border: "#F2C7A3",
    dayAccent: "#8A1A04",
    subjectPalette: [
      "#FFD9C2",
      "#FFE7AD",
      "#EDD3CC",
      "#FFE8DB",
      "#F4D9D1",
      "#F9E2BF",
    ],
  },
  layoutTokens: {
    cards: {
      surface: "#FFF1E6",
      border: "#F2C7A3",
    },
    minimal: {
      minimalRule: "#FD6A00",
    },
    grid: {
      gridGuide: "#F2C7A3",
      gridDivider: "#F6DCC5",
    },
    planner: {
      plannerSurface: "#FFF2E8",
      plannerBorder: "#F2C7A3",
      plannerRule: "#F4D2B5",
    },
    photo: {
      photoRule: "#FD6A00",
    },
  },
};
