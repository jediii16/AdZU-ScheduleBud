export const CLEAN_SLATE_RENDER_THEME = {
  id: "clean-slate",
  background: "#F7F8FA",
  surface: "#FFFFFF",
  foreground: "#172033",
  secondary: "#526075",
  muted: "#7A8798",
  minimalSupport: "#66758A",
  gridSupport: "#5F6E82",
  gridGuide: "#D9E2EB",
  gridDivider: "#E8EDF2",
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
  minimalMarkerPalette: [
    "#9AC7E4",
    "#A9CDB8",
    "#D8B999",
    "#BFB3D9",
    "#D7AFBB",
    "#A7CAD3",
  ],
} as const;

export type CleanSlateRenderTheme = typeof CLEAN_SLATE_RENDER_THEME;
