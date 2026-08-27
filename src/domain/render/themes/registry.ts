import type { LayoutId, ThemeId } from "@/domain/design/types";
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
import { SITEAO_ORANGE_THEME } from "./siteao-orange";
import type { WallpaperThemeDefinition, WallpaperThemeTokens } from "./types";

const WALLPAPER_THEMES: Record<ThemeId, WallpaperThemeDefinition> = {
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
};

export function resolveWallpaperTheme(
  themeId: ThemeId | null | undefined,
  layoutId: LayoutId,
): WallpaperThemeTokens {
  const definition = WALLPAPER_THEMES[themeId ?? "clean-slate"];
  return {
    ...definition.tokens,
    ...definition.layoutTokens?.[layoutId],
  };
}
