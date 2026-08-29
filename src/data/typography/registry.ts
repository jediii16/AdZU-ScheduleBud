import type { FontId } from "@/lib/font-registry";

export const TYPOGRAPHY_PRESET_IDS = [
  "schedulebud",
  "poppins-inter",
  "outfit-dm-sans",
  "playfair-inter",
  "cormorant-source-sans",
  "quicksand-dm-sans",
  "league-spartan-inter",
  "allura-manrope",
] as const;
export type TypographyPresetId = (typeof TYPOGRAPHY_PRESET_IDS)[number];
export type SemanticFontWeight = 400 | 500 | 600 | 700 | 800;

export type TypographyPreset = {
  id: TypographyPresetId;
  label: string;
  description: string;
  titleFont: FontId;
  scheduleFont: FontId;
  titleWeight: SemanticFontWeight;
  scheduleWeights: Readonly<Record<SemanticFontWeight, SemanticFontWeight>>;
  titleScale?: number;
  titleLineHeight?: number;
  titleTracking?: number;
  titleAverageGlyphWidth?: number;
  baseline?: boolean;
};

const weights = (
  w400: SemanticFontWeight,
  w500: SemanticFontWeight,
  w600: SemanticFontWeight,
  w700: SemanticFontWeight,
  w800: SemanticFontWeight,
) => ({ 400: w400, 500: w500, 600: w600, 700: w700, 800: w800 }) as const;
const standard = weights(400, 500, 600, 700, 700);

export const typographyPresets: readonly TypographyPreset[] = [
  {
    id: "schedulebud",
    label: "ScheduleBud",
    description: "Original ScheduleBud type",
    titleFont: "heading-sans",
    scheduleFont: "body-sans",
    titleWeight: 700,
    scheduleWeights: weights(400, 500, 600, 700, 800),
    baseline: true,
  },
  {
    id: "poppins-inter",
    label: "Poppins + Inter",
    description: "Modern & balanced",
    titleFont: "poppins",
    scheduleFont: "inter",
    titleWeight: 700,
    scheduleWeights: standard,
  },
  {
    id: "outfit-dm-sans",
    label: "Outfit + DM Sans",
    description: "Fresh & contemporary",
    titleFont: "outfit",
    scheduleFont: "dm-sans",
    titleWeight: 600,
    scheduleWeights: standard,
    titleScale: 1.02,
  },
  {
    id: "playfair-inter",
    label: "Playfair Display + Inter",
    description: "Editorial & refined",
    titleFont: "playfair-display",
    scheduleFont: "inter",
    titleWeight: 700,
    scheduleWeights: standard,
    titleScale: 0.98,
    titleLineHeight: 1.12,
  },
  {
    id: "cormorant-source-sans",
    label: "Cormorant Garamond + Source Sans 3",
    description: "Classic & academic",
    titleFont: "cormorant-garamond",
    scheduleFont: "source-sans-3",
    titleWeight: 700,
    scheduleWeights: weights(400, 600, 600, 700, 700),
    titleScale: 1.08,
    titleLineHeight: 1.12,
  },
  {
    id: "quicksand-dm-sans",
    label: "Quicksand + DM Sans",
    description: "Soft & friendly",
    titleFont: "quicksand",
    scheduleFont: "dm-sans",
    titleWeight: 700,
    scheduleWeights: standard,
  },
  {
    id: "league-spartan-inter",
    label: "League Spartan + Inter",
    description: "Strong & graphic",
    titleFont: "league-spartan",
    scheduleFont: "inter",
    titleWeight: 700,
    scheduleWeights: standard,
    titleScale: 0.93,
  },
  {
    id: "allura-manrope",
    label: "Allura + Manrope",
    description: "Elegant script",
    titleFont: "allura",
    scheduleFont: "manrope",
    titleWeight: 400,
    scheduleWeights: standard,
    titleScale: 1.2,
    titleLineHeight: 1.32,
    titleAverageGlyphWidth: 0.5,
  },
];

export const typographyPresetById = new Map(
  typographyPresets.map((preset) => [preset.id, preset]),
);
export function resolveTypographyPreset(
  id: TypographyPresetId | null | undefined,
): TypographyPreset {
  return typographyPresetById.get(id ?? "schedulebud") ?? typographyPresets[0]!;
}
