import type { WallpaperThemeDefinition } from "./types";

export const EAO_BLUE_THEME: WallpaperThemeDefinition = {
  tokens: {
    id: "eao-blue",
    background: "#F4F8FC",
    surface: "#EAF2FA",
    foreground: "#102C52",
    secondary: "#52708F",
    muted: "#587493",
    cardsTime: "#173A67",
    cardsMetadata: "#52708F",
    minimalTime: "#173A67",
    minimalSupport: "#52708F",
    minimalProfessor: "#587493",
    minimalRule: "#2C69B3",
    plannerSurface: "#EDF4FA",
    plannerBorder: "#C9D9EB",
    plannerRule: "#D8E5F1",
    plannerSupport: "#52708F",
    photoSupport: "#52708F",
    photoMuted: "#587493",
    photoRule: "#2C69B3",
    polaroidPaper: "#FFFDF8",
    polaroidCaption: "#33485F",
    polaroidShadow: "#0F2743",
    gridTime: "#173A67",
    gridSupport: "#52708F",
    gridAxis: "#587493",
    gridGuide: "#C9D9EB",
    gridDivider: "#DCE7F2",
    border: "#C9D9EB",
    dayAccent: "#174E91",
    subjectPalette: [
      "#DDEAF7",
      "#D3E5F5",
      "#CEDBE9",
      "#B9D3EC",
      "#E3EDF7",
      "#D7E1F0",
    ],
  },
  layoutTokens: {
    cards: {
      surface: "#EAF2FA",
      border: "#C9D9EB",
    },
    minimal: {
      minimalRule: "#2C69B3",
    },
    grid: {
      gridGuide: "#C9D9EB",
      gridDivider: "#DCE7F2",
    },
    planner: {
      plannerSurface: "#EDF4FA",
      plannerBorder: "#C9D9EB",
      plannerRule: "#D8E5F1",
    },
    photo: {
      photoRule: "#2C69B3",
    },
  },
};
