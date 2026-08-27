import type { WallpaperThemeDefinition } from "./types";

export const AAO_YELLOW_THEME: WallpaperThemeDefinition = {
  tokens: {
    id: "aao-yellow",
    background: "#FFFBEF",
    surface: "#FFF4D3",
    foreground: "#5A4410",
    secondary: "#80672E",
    muted: "#866F3D",
    cardsTime: "#6A5311",
    cardsMetadata: "#80672E",
    minimalTime: "#6A5311",
    minimalSupport: "#80672E",
    minimalProfessor: "#866F3D",
    minimalRule: "#D9A31A",
    plannerSurface: "#FFF7E3",
    plannerBorder: "#E7D495",
    plannerRule: "#F0E3B8",
    plannerSupport: "#80672E",
    photoSupport: "#80672E",
    photoMuted: "#866F3D",
    photoRule: "#D9A31A",
    polaroidPaper: "#FFFDF8",
    polaroidCaption: "#57492A",
    polaroidShadow: "#332503",
    gridTime: "#6A5311",
    gridSupport: "#80672E",
    gridAxis: "#866F3D",
    gridGuide: "#E7D495",
    gridDivider: "#F0E4BE",
    border: "#E7D495",
    dayAccent: "#87610A",
    subjectPalette: [
      "#FFF0B8",
      "#F7E2A0",
      "#F2D28A",
      "#E8C779",
      "#FFF4D3",
      "#F5E8C8",
    ],
  },
  layoutTokens: {
    cards: {
      surface: "#FFF4D3",
      border: "#E7D495",
    },
    minimal: {
      minimalRule: "#D9A31A",
    },
    grid: {
      gridGuide: "#E7D495",
      gridDivider: "#F0E4BE",
    },
    planner: {
      plannerSurface: "#FFF7E3",
      plannerBorder: "#E7D495",
      plannerRule: "#F0E3B8",
    },
    photo: {
      photoRule: "#D9A31A",
    },
  },
};
