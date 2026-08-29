import type {
  BuiltInThemeId,
  LayoutId,
  ThemeId,
} from "@/domain/design/types";
import type {
  CustomPalette,
  CustomPaletteColorRole,
} from "@/domain/project";
import { AAO_YELLOW_THEME } from "./aao-yellow";
import { ADZU_CLASSIC_THEME } from "./adzu-classic";
import { CLEAN_SLATE_RENDER_THEME } from "./clean-slate";
import { EAO_BLUE_THEME } from "./eao-blue";
import { GIRLFRIENDS_CHOICE_THEME } from "./girlfriends-choice";
import { MIDNIGHT_THEME } from "./midnight";
import { LAAO_GREEN_THEME } from "./laao-green";
import { MAO_RED_THEME } from "./mao-red";
import { MATCHA_STUDY_THEME } from "./matcha-study";
import { NAO_WHITE_THEME } from "./nao-white";
import { PINK_DIARY_THEME } from "./pink-diary";
import { SITEAO_ORANGE_THEME } from "./siteao-orange";
import type { WallpaperThemeDefinition, WallpaperThemeTokens } from "./types";

const WALLPAPER_THEMES: Record<BuiltInThemeId, WallpaperThemeDefinition> = {
  "clean-slate": { tokens: CLEAN_SLATE_RENDER_THEME },
  "adzu-classic": ADZU_CLASSIC_THEME,
  midnight: MIDNIGHT_THEME,
  "siteao-orange": SITEAO_ORANGE_THEME,
  "laao-green": LAAO_GREEN_THEME,
  "eao-blue": EAO_BLUE_THEME,
  "mao-red": MAO_RED_THEME,
  "aao-yellow": AAO_YELLOW_THEME,
  "nao-white": NAO_WHITE_THEME,
  "matcha-study": MATCHA_STUDY_THEME,
  "girlfriends-choice": GIRLFRIENDS_CHOICE_THEME,
  "pink-diary": PINK_DIARY_THEME,
};

export function resolveWallpaperThemeDefinition(
  themeId: ThemeId | null | undefined,
  customPalette?: CustomPalette | null,
): WallpaperThemeDefinition {
  const baseId =
    themeId === "custom"
      ? (customPalette?.basedOnPaletteId ?? "clean-slate")
      : (themeId ?? "clean-slate");
  return WALLPAPER_THEMES[baseId];
}

export function createCustomPalette(
  basedOnPaletteId: BuiltInThemeId,
): CustomPalette {
  const tokens = WALLPAPER_THEMES[basedOnPaletteId].tokens;
  return {
    basedOnPaletteId,
    canvas: tokens.background,
    primary: tokens.foreground,
    secondary: tokens.secondary,
    accent: tokens.minimalRule,
    surface: tokens.surface,
    border: tokens.border,
  };
}

const CUSTOM_ROLE_TOKEN_KEYS = {
  canvas: ["background"],
  primary: [
    "foreground",
    "cardsTime",
    "minimalTime",
    "gridTime",
    "polaroidCaption",
  ],
  secondary: [
    "secondary",
    "muted",
    "cardsMetadata",
    "minimalSupport",
    "minimalProfessor",
    "plannerSupport",
    "photoSupport",
    "photoMuted",
    "gridSupport",
    "gridAxis",
  ],
  accent: ["dayAccent", "minimalRule", "plannerRule", "photoRule"],
  surface: ["surface", "plannerSurface", "polaroidPaper"],
  border: ["border", "plannerBorder", "gridGuide", "gridDivider"],
} as const satisfies Record<
  CustomPaletteColorRole,
  readonly (keyof WallpaperThemeTokens)[]
>;

function applyCustomPalette(
  tokens: WallpaperThemeTokens,
  customPalette: CustomPalette,
): WallpaperThemeTokens {
  const basePalette = createCustomPalette(customPalette.basedOnPaletteId);
  const customTokens: WallpaperThemeTokens = { ...tokens, id: "custom" };
  for (const role of Object.keys(
    CUSTOM_ROLE_TOKEN_KEYS,
  ) as CustomPaletteColorRole[]) {
    if (customPalette[role] === basePalette[role]) continue;
    for (const key of CUSTOM_ROLE_TOKEN_KEYS[role]) {
      (customTokens as unknown as Record<string, string>)[key] =
        customPalette[role];
    }
  }
  return customTokens;
}

export function resolveWallpaperTheme(
  themeId: ThemeId | null | undefined,
  layoutId: LayoutId,
  customPalette?: CustomPalette | null,
): WallpaperThemeTokens {
  const definition = resolveWallpaperThemeDefinition(themeId, customPalette);
  const tokens = {
    ...definition.tokens,
    ...definition.layoutTokens?.[layoutId],
  };
  return themeId === "custom" && customPalette
    ? applyCustomPalette(tokens, customPalette)
    : tokens;
}
