import type { WallpaperThemeDefinition } from "./types";

export const LAAO_GREEN_THEME: WallpaperThemeDefinition = {
  tokens: {
    id: "laao-green",
    background: "#F4FBF7",
    surface: "#ECF7F0",
    foreground: "#123B29",
    secondary: "#3F674F",
    muted: "#557763",
    cardsTime: "#184933",
    cardsMetadata: "#3F674F",
    minimalTime: "#184933",
    minimalSupport: "#3F674F",
    minimalProfessor: "#557763",
    minimalRule: "#1E8E5A",
    plannerSurface: "#EEF8F1",
    plannerBorder: "#C8E2D1",
    plannerRule: "#D7EBDD",
    plannerSupport: "#3F674F",
    photoSupport: "#3F674F",
    photoMuted: "#557763",
    photoRule: "#1E8E5A",
    polaroidPaper: "#FFFDF8",
    polaroidCaption: "#244535",
    polaroidShadow: "#0E2C20",
    gridTime: "#184933",
    gridSupport: "#3F674F",
    gridAxis: "#557763",
    gridGuide: "#C8E2D1",
    gridDivider: "#DCECDF",
    border: "#C8E2D1",
    dayAccent: "#136B43",
    subjectPalette: [
      "#D7EFE0",
      "#E2F4EA",
      "#DCE9D8",
      "#A9D7BC",
      "#D9EEE7",
      "#E8F2D8",
    ],
  },
  layoutTokens: {
    cards: {
      surface: "#ECF7F0",
      border: "#C8E2D1",
    },
    minimal: {
      minimalRule: "#1E8E5A",
    },
    grid: {
      gridGuide: "#C8E2D1",
      gridDivider: "#DCECDF",
    },
    planner: {
      plannerSurface: "#EEF8F1",
      plannerBorder: "#C8E2D1",
      plannerRule: "#D7EBDD",
    },
    photo: {
      photoRule: "#1E8E5A",
    },
  },
};
