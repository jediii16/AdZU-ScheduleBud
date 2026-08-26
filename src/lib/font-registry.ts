export const FONT_IDS = [
  "body-sans",
  "heading-sans",
  "ui-mono",
  "pixel-heading",
  "caption-hand",
] as const;
export type FontId = (typeof FONT_IDS)[number];

export type FontDefinition = {
  id: FontId;
  label: string;
  cssVariable: string;
  role: "body" | "heading" | "utility" | "accent";
  readableForScheduleDetails: boolean;
  status: "available" | "planned-local";
};

export const fontRegistry: Record<FontId, FontDefinition> = {
  "body-sans": {
    id: "body-sans",
    label: "Geist",
    cssVariable: "--font-body-sans",
    role: "body",
    readableForScheduleDetails: true,
    status: "available",
  },
  "heading-sans": {
    id: "heading-sans",
    label: "Nunito Sans",
    cssVariable: "--font-heading-sans",
    role: "heading",
    readableForScheduleDetails: true,
    status: "available",
  },
  "ui-mono": {
    id: "ui-mono",
    label: "Geist Mono",
    cssVariable: "--font-ui-mono",
    role: "utility",
    readableForScheduleDetails: true,
    status: "available",
  },
  "pixel-heading": {
    id: "pixel-heading",
    label: "Pixel heading (placeholder)",
    cssVariable: "--font-ui-mono",
    role: "accent",
    readableForScheduleDetails: false,
    status: "planned-local",
  },
  "caption-hand": {
    id: "caption-hand",
    label: "Caveat",
    cssVariable: "--font-caption-hand",
    role: "accent",
    readableForScheduleDetails: false,
    status: "available",
  },
};
