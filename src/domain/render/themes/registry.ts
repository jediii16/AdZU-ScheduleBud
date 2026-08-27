import type { LayoutId, ThemeId } from "@/domain/design/types";
import { ADZU_CLASSIC_THEME } from "./adzu-classic";
import { CLEAN_SLATE_RENDER_THEME } from "./clean-slate";
import { MIDNIGHT_THEME } from "./midnight";
import type { WallpaperThemeDefinition, WallpaperThemeTokens } from "./types";

const WALLPAPER_THEMES: Record<ThemeId, WallpaperThemeDefinition> = {
  "clean-slate": { tokens: CLEAN_SLATE_RENDER_THEME },
  "adzu-classic": ADZU_CLASSIC_THEME,
  midnight: MIDNIGHT_THEME,
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
