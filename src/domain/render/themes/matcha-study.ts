import type { WallpaperThemeDefinition } from "./types";

export const MATCHA_STUDY_THEME: WallpaperThemeDefinition = {
  tokens: {
    id: "matcha-study",
    background: "#F5F3E9",
    surface: "#FAF8F0",
    foreground: "#314438",
    secondary: "#6A7164",
    muted: "#6A7164",
    cardsTime: "#314438",
    cardsMetadata: "#4D5749",
    minimalTime: "#314438",
    minimalSupport: "#6A7164",
    minimalProfessor: "#6A7164",
    minimalRule: "#8FA276",
    plannerSurface: "#FAF8F0",
    plannerBorder: "#CED5BE",
    plannerRule: "#8FA276",
    plannerSupport: "#6A7164",
    photoSupport: "#6A7164",
    photoMuted: "#6A7164",
    photoRule: "#8FA276",
    polaroidPaper: "#FAF8F0",
    polaroidCaption: "#514D43",
    polaroidShadow: "#7C6D5A",
    gridTime: "#6A7164",
    gridSupport: "#4D5749",
    gridAxis: "#6A7164",
    gridGuide: "#CED5BE",
    gridDivider: "#E2E2D5",
    border: "#CED5BE",
    dayAccent: "#314438",
    subjectPalette: [
      "#D6E0C7",
      "#CBD7BE",
      "#E1E2C4",
      "#EEE4CD",
      "#D8CDBA",
      "#C1CDB6",
    ],
  },
  layoutTokens: {
    cards: {
      surface: "#FAF8F0",
      border: "#CED5BE",
    },
    minimal: {
      minimalRule: "#8FA276",
    },
    grid: {
      gridGuide: "#CED5BE",
      gridDivider: "#E2E2D5",
    },
    planner: {
      plannerSurface: "#FAF8F0",
      plannerBorder: "#CED5BE",
      plannerRule: "#8FA276",
    },
    photo: {
      photoRule: "#8FA276",
    },
  },
};
