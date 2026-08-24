export const CLEAN_SLATE_RENDER_THEME = {
  id: "clean-slate",
  background: "#F7F8FA",
  surface: "#FFFFFF",
  foreground: "#172033",
  secondary: "#526075",
  muted: "#7A8798",
  border: "#DDE3EA",
  dayAccent: "#145F9B",
  subjectPalette: [
    "#DCEAF5",
    "#E4EEE8",
    "#F3E8DD",
    "#E9E4F2",
    "#F1E5E8",
    "#E3EDF0",
  ],
} as const;

export type CleanSlateRenderTheme = typeof CLEAN_SLATE_RENDER_THEME;
