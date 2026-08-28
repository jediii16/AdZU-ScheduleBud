import type { WallpaperThemeDefinition } from "./types";

export const PINK_DIARY_THEME: WallpaperThemeDefinition = {
  tokens: {
    id: "pink-diary",
    background: "#FFF6F8",
    surface: "#FFFDFB",
    foreground: "#5C2238",
    secondary: "#80636F",
    muted: "#7C626C",
    cardsTime: "#7A304D",
    cardsMetadata: "#70545F",
    minimalTime: "#80636F",
    minimalSupport: "#80636F",
    minimalProfessor: "#7C626C",
    minimalRule: "#D993AA",
    plannerSurface: "#FFFDFB",
    plannerBorder: "#DFB8C7",
    plannerRule: "#D993AA",
    plannerSupport: "#80636F",
    photoSupport: "#80636F",
    photoMuted: "#80636F",
    photoRule: "#D993AA",
    polaroidPaper: "#FFFDFB",
    polaroidCaption: "#51454A",
    polaroidShadow: "#4A3F42",
    gridTime: "#80636F",
    gridSupport: "#70545F",
    gridAxis: "#80636F",
    gridGuide: "#DFB8C7",
    gridDivider: "#E8C7D3",
    border: "#DFB8C7",
    dayAccent: "#7A304D",
    subjectPalette: [
      "#F5D7E2",
      "#EFD0DB",
      "#F3D8D2",
      "#E7D5E5",
      "#F1DFE8",
      "#EAD8D1",
    ],
  },
  layoutTokens: {
    cards: {
      surface: "#FFFDFB",
      border: "#DFB8C7",
    },
    minimal: {
      minimalRule: "#D993AA",
    },
    grid: {
      gridGuide: "#DFB8C7",
      gridDivider: "#E8C7D3",
    },
    planner: {
      plannerSurface: "#FFFDFB",
      plannerBorder: "#DFB8C7",
      plannerRule: "#D993AA",
    },
    photo: {
      photoRule: "#D993AA",
    },
  },
};
