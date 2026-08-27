import { describe, expect, it } from "vitest";

import {
  ADZU_CLASSIC_THEME,
  CLEAN_SLATE_RENDER_THEME,
  MIDNIGHT_THEME,
  buildScheduleRenderModel,
  resolveWallpaperTheme,
} from "@/domain/render";
import { availableThemes } from "@/data/themes/registry";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

describe("wallpaper theme registry", () => {
  it("keeps the approved Clean Slate tokens unchanged", () => {
    expect(resolveWallpaperTheme("clean-slate", "cards")).toEqual(
      CLEAN_SLATE_RENDER_THEME,
    );
    expect(CLEAN_SLATE_RENDER_THEME).toMatchObject({
      background: "#F7F8FA",
      surface: "#FFFFFF",
      foreground: "#172033",
      secondary: "#526075",
      dayAccent: "#145F9B",
      border: "#DDE3EA",
    });
  });

  it("resolves deterministic AdZU Classic tokens with restrained per-layout treatment", () => {
    const cards = resolveWallpaperTheme("adzu-classic", "cards");
    const grid = resolveWallpaperTheme("adzu-classic", "grid");
    const planner = resolveWallpaperTheme("adzu-classic", "planner");
    const minimal = resolveWallpaperTheme("adzu-classic", "minimal");
    const photo = resolveWallpaperTheme("adzu-classic", "photo");
    const subjectPalette = [
      "#D6E5F3",
      "#C7D9EA",
      "#DDE4EC",
      "#D2E5E7",
      "#DCDCF0",
      "#E8E1CF",
    ];

    expect(cards).toEqual(resolveWallpaperTheme("adzu-classic", "cards"));
    expect(cards).toMatchObject({
      background: "#F7F9FC",
      surface: "#FFFFFF",
      foreground: "#102A43",
      secondary: "#6F8195",
      muted: "#6F8195",
      dayAccent: "#1F5F9B",
      border: "#CBD9E8",
    });
    expect(cards.subjectPalette).toEqual(subjectPalette);
    expect(grid.subjectPalette).toEqual(subjectPalette);
    expect(ADZU_CLASSIC_THEME.tokens.subjectPalette).toEqual(subjectPalette);
    expect(minimal.minimalRule).toBe("#1F5F9B");
    expect(planner).toMatchObject({
      plannerSurface: "#EAF2FA",
      plannerBorder: "#CBD9E8",
      plannerRule: "#CBD9E8",
    });
    expect(photo.photoRule).toBe("#4F7FAF");
    expect(JSON.stringify(ADZU_CLASSIC_THEME)).not.toContain("#C3A25A");
  });

  it("registers Midnight with readable dark tokens and dedicated subject fills", () => {
    const cards = resolveWallpaperTheme("midnight", "cards");
    const grid = resolveWallpaperTheme("midnight", "grid");
    const minimal = resolveWallpaperTheme("midnight", "minimal");
    const planner = resolveWallpaperTheme("midnight", "planner");
    const photo = resolveWallpaperTheme("midnight", "photo");
    const subjectPalette = [
      "#203A56",
      "#2A3C52",
      "#214447",
      "#353650",
      "#443444",
      "#493D30",
    ];

    expect(
      availableThemes.find((theme) => theme.id === "midnight"),
    ).toMatchObject({
      name: "Midnight",
      description: "Deep navy tones for late-night studying.",
      previewColors: {
        background: "#0F1623",
        foreground: "#F2F5F9",
        accent: "#7DA6D8",
      },
    });
    expect(cards).toMatchObject({
      background: "#0F1623",
      surface: "#172131",
      foreground: "#F2F5F9",
      secondary: "#A7B3C2",
      muted: "#8998AB",
      border: "#2D3B4E",
      dayAccent: "#7DA6D8",
      cardsTime: "#A7B3C2",
      cardsMetadata: "#A7B3C2",
    });
    expect(cards.subjectPalette).toEqual(subjectPalette);
    expect(grid).toMatchObject({
      subjectPalette,
      gridTime: "#A7B3C2",
      gridSupport: "#A7B3C2",
      gridAxis: "#8998AB",
      gridGuide: "#243145",
      gridDivider: "#2D3B4E",
    });
    expect(minimal).toMatchObject({
      minimalTime: "#A7B3C2",
      minimalSupport: "#A7B3C2",
      minimalProfessor: "#8998AB",
      minimalRule: "#7DA6D8",
    });
    expect(planner).toMatchObject({
      plannerSurface: "#172131",
      plannerBorder: "#2D3B4E",
      plannerRule: "#587FAF",
    });
    expect(photo).toMatchObject({
      photoRule: "#7DA6D8",
      photoMuted: "#8998AB",
    });
    expect(MIDNIGHT_THEME.tokens).toMatchObject({
      polaroidPaper: "#F4F1EA",
      polaroidCaption: "#34383E",
    });
    expect(JSON.stringify(MIDNIGHT_THEME)).not.toContain("#000000");
    expect(JSON.stringify(MIDNIGHT_THEME)).not.toContain("#FFFFFF");
  });

  it("puts Midnight into the shared preview/export RenderModel", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: { ...base.design, themeId: "midnight" as const },
    };
    const result = buildScheduleRenderModel(project, base.deviceVariants[0]!);
    const nodes = result.model.layers[3].nodes;

    expect(result.model.layers[0].nodes[0]).toMatchObject({
      kind: "rect",
      fill: "#0F1623",
    });
    expect(nodes.find((node) => node.id === "wallpaper-title")).toMatchObject({
      kind: "text",
      fill: "#F2F5F9",
    });
    expect(nodes.find((node) => node.id === "day-Mon")).toMatchObject({
      kind: "text",
      fill: "#7DA6D8",
    });
    expect(nodes.find((node) => node.id.startsWith("card-"))).toMatchObject({
      kind: "rect",
      fill: "#203A56",
      stroke: "#2D3B4E",
    });
    expect(nodes.find((node) => node.id.startsWith("code-"))).toMatchObject({
      kind: "text",
      fill: "#F2F5F9",
    });
    expect(nodes.find((node) => node.id.startsWith("time-"))).toMatchObject({
      kind: "text",
      fill: "#A7B3C2",
    });
  });

  it("keeps all frozen layout geometry identical under Midnight", () => {
    const base = visualScheduleProject();
    const variant = base.deviceVariants[0]!;
    const cases = [
      { layoutId: "cards" as const, photoComposition: null },
      { layoutId: "minimal" as const, photoComposition: null },
      { layoutId: "grid" as const, photoComposition: null },
      { layoutId: "planner" as const, photoComposition: null },
      { layoutId: "photo" as const, photoComposition: "hero" as const },
      { layoutId: "photo" as const, photoComposition: "split" as const },
      { layoutId: "photo" as const, photoComposition: "polaroid" as const },
    ];

    for (const designCase of cases) {
      const cleanProject = {
        ...base,
        design: {
          ...base.design,
          ...designCase,
          themeId: "clean-slate" as const,
        },
      };
      const midnightProject = {
        ...cleanProject,
        design: { ...cleanProject.design, themeId: "midnight" as const },
      };
      const clean = buildScheduleRenderModel(cleanProject, variant);
      const midnight = buildScheduleRenderModel(midnightProject, variant);

      expect(midnight.scheduleBounds).toEqual(clean.scheduleBounds);
      expect(midnight.positionRange).toEqual(clean.positionRange);
      expect(midnight.photoFrame).toEqual(clean.photoFrame);
      expect(midnight.photoFrames).toEqual(clean.photoFrames);
      expect(midnight.photoPlaceholders).toEqual(clean.photoPlaceholders);
    }
  });

  it("keeps Midnight Polaroid paper light and captions dark neutral", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: {
        ...base.design,
        themeId: "midnight" as const,
        layoutId: "photo" as const,
        photoComposition: "polaroid" as const,
        photoCaptions: { "photo-one": "Late study" },
      },
      assetReferences: {
        ...base.assetReferences,
        photoAssetIds: ["photo-one"],
      },
    };
    const result = buildScheduleRenderModel(project, base.deviceVariants[0]!);
    const photoNodes = result.model.layers[2].nodes;

    expect(
      photoNodes.find((node) => node.id === "polaroid-paper-photo-one"),
    ).toMatchObject({
      kind: "rect",
      fill: "#F4F1EA",
      shadowColor: "#080C13",
    });
    expect(
      photoNodes.find((node) => node.id === "polaroid-caption-photo-one"),
    ).toMatchObject({
      kind: "text",
      fill: "#34383E",
    });
  });

  it("puts the selected theme into the shared preview/export RenderModel without changing geometry", () => {
    const cleanProject = visualScheduleProject();
    const adzuProject = {
      ...cleanProject,
      design: { ...cleanProject.design, themeId: "adzu-classic" as const },
    };
    const variant = cleanProject.deviceVariants[0]!;
    const clean = buildScheduleRenderModel(cleanProject, variant);
    const adzu = buildScheduleRenderModel(adzuProject, variant);
    const cleanBackground = clean.model.layers[0].nodes[0];
    const adzuBackground = adzu.model.layers[0].nodes[0];

    expect(cleanBackground).toMatchObject({ kind: "rect", fill: "#F7F8FA" });
    expect(adzuBackground).toMatchObject({ kind: "rect", fill: "#F7F9FC" });
    expect(
      adzu.model.layers[3].nodes.find((node) => node.id === "wallpaper-title"),
    ).toMatchObject({ kind: "text", fill: "#102A43" });
    expect(
      adzu.model.layers[3].nodes.find((node) => node.id === "day-Mon"),
    ).toMatchObject({ kind: "text", fill: "#1F5F9B" });
    expect(adzu.scheduleBounds).toEqual(clean.scheduleBounds);
    expect(adzu.positionRange).toEqual(clean.positionRange);
    expect(adzu.model).toMatchObject({
      width: clean.model.width,
      height: clean.model.height,
    });
  });

  it("preserves explicit Cards and Grid subject colors", () => {
    const base = visualScheduleProject();
    const explicitColor = "#ABCDEF";
    const themed = {
      ...base,
      design: {
        ...base.design,
        themeId: "midnight" as const,
        subjectColors: {
          mode: "single" as const,
          singleColor: explicitColor,
          bySubjectId: {},
        },
      },
    };
    const variant = base.deviceVariants[0]!;
    const cards = buildScheduleRenderModel(themed, variant);
    const grid = buildScheduleRenderModel(
      { ...themed, design: { ...themed.design, layoutId: "grid" as const } },
      variant,
    );

    expect(
      cards.model.layers[3].nodes.find((node) => node.id.startsWith("card-")),
    ).toMatchObject({ kind: "rect", fill: explicitColor });
    expect(
      grid.model.layers[3].nodes.find((node) =>
        node.id.startsWith("grid-block-"),
      ),
    ).toMatchObject({ kind: "rect", fill: explicitColor });
  });
});
