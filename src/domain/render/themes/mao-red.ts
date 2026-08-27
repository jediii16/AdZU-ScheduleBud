import type { WallpaperThemeDefinition } from "./types";

export const MAO_RED_THEME: WallpaperThemeDefinition = {
  tokens: {
    id: "mao-red",
    background: "#FCF5F4",
    surface: "#F8EAEA",
    foreground: "#5A1010",
    secondary: "#93504E",
    muted: "#995D59",
    cardsTime: "#6B1717",
    cardsMetadata: "#93504E",
    minimalTime: "#6B1717",
    minimalSupport: "#93504E",
    minimalProfessor: "#995D59",
    minimalRule: "#A61F1F",
    plannerSurface: "#FAEFED",
    plannerBorder: "#E6C1BC",
    plannerRule: "#EDD6D3",
    plannerSupport: "#93504E",
    photoSupport: "#93504E",
    photoMuted: "#995D59",
    photoRule: "#A61F1F",
    polaroidPaper: "#FFFDF8",
    polaroidCaption: "#4E2525",
    polaroidShadow: "#2C0A0A",
    gridTime: "#6B1717",
    gridSupport: "#93504E",
    gridAxis: "#995D59",
    gridGuide: "#E6C1BC",
    gridDivider: "#EED8D5",
    border: "#E6C1BC",
    dayAccent: "#7A1212",
    subjectPalette: [
      "#F3DDDC",
      "#EBCFCD",
      "#DFC1C0",
      "#D6B3B0",
      "#F4E3DF",
      "#E8D7D2",
    ],
  },
  layoutTokens: {
    cards: {
      surface: "#F8EAEA",
      border: "#E6C1BC",
    },
    minimal: {
      minimalRule: "#A61F1F",
    },
    grid: {
      gridGuide: "#E6C1BC",
      gridDivider: "#EED8D5",
    },
    planner: {
      plannerSurface: "#FAEFED",
      plannerBorder: "#E6C1BC",
      plannerRule: "#EDD6D3",
    },
    photo: {
      photoRule: "#A61F1F",
    },
  },
};
