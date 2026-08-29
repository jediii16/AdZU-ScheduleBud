export const FONT_IDS = [
  "body-sans",
  "heading-sans",
  "ui-mono",
  "pixel-heading",
  "caption-hand",
  "inter",
  "poppins",
  "outfit",
  "dm-sans",
  "playfair-display",
  "cormorant-garamond",
  "source-sans-3",
  "quicksand",
  "league-spartan",
  "allura",
  "manrope",
] as const;
export type FontId = (typeof FONT_IDS)[number];

export type FontDefinition = {
  id: FontId;
  label: string;
  cssVariable: string;
  role: "body" | "heading" | "utility" | "accent";
  readableForScheduleDetails: boolean;
  status: "available" | "planned-local";
  availableWeights: readonly (400 | 500 | 600 | 700 | 800)[];
};

export const fontRegistry: Record<FontId, FontDefinition> = {
  "body-sans": {
    id: "body-sans",
    label: "Geist",
    cssVariable: "--font-body-sans",
    role: "body",
    readableForScheduleDetails: true,
    status: "available",
    availableWeights: [400, 500, 600, 700, 800],
  },
  "heading-sans": {
    id: "heading-sans",
    label: "Nunito Sans",
    cssVariable: "--font-heading-sans",
    role: "heading",
    readableForScheduleDetails: true,
    status: "available",
    availableWeights: [400, 500, 600, 700, 800],
  },
  "ui-mono": {
    id: "ui-mono",
    label: "Geist Mono",
    cssVariable: "--font-ui-mono",
    role: "utility",
    readableForScheduleDetails: true,
    status: "available",
    availableWeights: [400, 500, 600, 700],
  },
  "pixel-heading": {
    id: "pixel-heading",
    label: "Pixel heading (placeholder)",
    cssVariable: "--font-ui-mono",
    role: "accent",
    readableForScheduleDetails: false,
    status: "planned-local",
    availableWeights: [400, 700],
  },
  "caption-hand": {
    id: "caption-hand",
    label: "Caveat",
    cssVariable: "--font-caption-hand",
    role: "accent",
    readableForScheduleDetails: false,
    status: "available",
    availableWeights: [400, 500, 600, 700],
  },
  inter: font("inter", "Inter", "--font-inter", "body", [400, 500, 600, 700]),
  poppins: font("poppins", "Poppins", "--font-poppins", "heading", [600, 700]),
  outfit: font("outfit", "Outfit", "--font-outfit", "heading", [600, 700]),
  "dm-sans": font(
    "dm-sans",
    "DM Sans",
    "--font-dm-sans",
    "body",
    [400, 500, 600, 700],
  ),
  "playfair-display": font(
    "playfair-display",
    "Playfair Display",
    "--font-playfair-display",
    "heading",
    [600, 700],
  ),
  "cormorant-garamond": font(
    "cormorant-garamond",
    "Cormorant Garamond",
    "--font-cormorant-garamond",
    "heading",
    [600, 700],
  ),
  "source-sans-3": font(
    "source-sans-3",
    "Source Sans 3",
    "--font-source-sans-3",
    "body",
    [400, 600, 700],
  ),
  quicksand: font(
    "quicksand",
    "Quicksand",
    "--font-quicksand",
    "heading",
    [600, 700],
  ),
  "league-spartan": font(
    "league-spartan",
    "League Spartan",
    "--font-league-spartan",
    "heading",
    [600, 700],
  ),
  allura: font("allura", "Allura", "--font-allura", "accent", [400], false),
  manrope: font(
    "manrope",
    "Manrope",
    "--font-manrope",
    "body",
    [400, 500, 600, 700],
  ),
};

function font(
  id: FontId,
  label: string,
  cssVariable: string,
  role: FontDefinition["role"],
  availableWeights: FontDefinition["availableWeights"],
  readableForScheduleDetails = true,
): FontDefinition {
  return {
    id,
    label,
    cssVariable,
    role,
    readableForScheduleDetails,
    status: "available",
    availableWeights,
  };
}
