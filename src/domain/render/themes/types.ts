import type { LayoutId, ThemeId } from "@/domain/design/types";

export type WallpaperThemeTokens = {
  id: ThemeId;
  background: string;
  surface: string;
  foreground: string;
  secondary: string;
  muted: string;
  cardsTime: string;
  cardsMetadata: string;
  minimalTime: string;
  minimalSupport: string;
  minimalProfessor: string;
  minimalRule: string;
  plannerSurface: string;
  plannerBorder: string;
  plannerRule: string;
  plannerSupport: string;
  photoSupport: string;
  photoMuted: string;
  photoRule: string;
  polaroidPaper: string;
  polaroidCaption: string;
  polaroidShadow: string;
  gridTime: string;
  gridSupport: string;
  gridAxis: string;
  gridGuide: string;
  gridDivider: string;
  border: string;
  dayAccent: string;
  subjectPalette: readonly string[];
};

export type WallpaperThemeTokenOverrides = Partial<
  Omit<WallpaperThemeTokens, "id">
>;

export type WallpaperThemeDefinition = {
  tokens: WallpaperThemeTokens;
  layoutTokens?: Partial<Record<LayoutId, WallpaperThemeTokenOverrides>>;
};
