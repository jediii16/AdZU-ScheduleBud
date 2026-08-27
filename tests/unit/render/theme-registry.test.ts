import { describe, expect, it } from "vitest";

import {
  AAO_YELLOW_THEME,
  ADZU_CLASSIC_THEME,
  CLEAN_SLATE_RENDER_THEME,
  EAO_BLUE_THEME,
  GIRLFRIENDS_CHOICE_THEME,
  LAAO_GREEN_THEME,
  MAO_RED_THEME,
  MATCHA_STUDY_THEME,
  MIDNIGHT_THEME,
  NAO_WHITE_THEME,
  SITEAO_ORANGE_THEME,
  buildScheduleRenderModel,
  resolveWallpaperTheme,
} from "@/domain/render";
import { availableThemes } from "@/data/themes/registry";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

describe("wallpaper theme registry", () => {
  it("keeps the approved Clean Slate tokens unchanged", () => {
    expect(
      availableThemes.find((theme) => theme.id === "clean-slate"),
    ).toMatchObject({ name: "Clean Slate", description: "Malinis" });
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

  it("registers Matcha Study with its warm palette and dedicated subject fills", () => {
    const cards = resolveWallpaperTheme("matcha-study", "cards");
    const grid = resolveWallpaperTheme("matcha-study", "grid");
    const subjectPalette = [
      "#D6E0C7",
      "#CBD7BE",
      "#E1E2C4",
      "#EEE4CD",
      "#D8CDBA",
      "#C1CDB6",
    ];

    expect(
      availableThemes.find((theme) => theme.id === "matcha-study"),
    ).toMatchObject({
      name: "Matcha Study",
      description: "Calm, cozy, and mildly powered by matcha.",
      previewColors: {
        background: "#F5F3E9",
        foreground: "#314438",
        accent: "#738B5E",
      },
      assets: {},
    });
    expect(cards).toMatchObject({
      background: "#F5F3E9",
      surface: "#FAF8F0",
      foreground: "#314438",
      secondary: "#6A7164",
      border: "#CED5BE",
      dayAccent: "#314438",
      cardsMetadata: "#4D5749",
    });
    expect(cards.subjectPalette).toEqual(subjectPalette);
    expect(grid.subjectPalette).toEqual(subjectPalette);
    expect(MATCHA_STUDY_THEME.tokens.subjectPalette).toEqual(subjectPalette);
    expect(resolveWallpaperTheme("matcha-study", "minimal")).toMatchObject({
      minimalRule: "#8FA276",
      minimalSupport: "#6A7164",
    });
    expect(resolveWallpaperTheme("matcha-study", "planner")).toMatchObject({
      plannerSurface: "#FAF8F0",
      plannerBorder: "#CED5BE",
      plannerRule: "#8FA276",
    });
  });

  it("uses Matcha tokens in the shared preview/export model without changing geometry", () => {
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
      const matchaProject = {
        ...cleanProject,
        design: { ...cleanProject.design, themeId: "matcha-study" as const },
      };
      const clean = buildScheduleRenderModel(cleanProject, variant);
      const matcha = buildScheduleRenderModel(matchaProject, variant);

      expect(matcha.model.layers[0].nodes[0]).toMatchObject({
        kind: "rect",
        fill: "#F5F3E9",
      });
      const titleId =
        designCase.layoutId === "photo"
          ? designCase.photoComposition === "split"
            ? "photo-split-title"
            : designCase.photoComposition === "polaroid"
              ? "photo-polaroid-title"
              : "photo-title"
          : designCase.layoutId === "planner"
            ? "planner-title"
            : "wallpaper-title";
      expect(
        matcha.model.layers
          .flatMap((layer) => layer.nodes)
          .find((node) => node.id === titleId),
      ).toMatchObject({ kind: "text", fill: "#314438" });
      expect(matcha.scheduleBounds).toEqual(clean.scheduleBounds);
      expect(matcha.positionRange).toEqual(clean.positionRange);
      expect(matcha.photoFrame).toEqual(clean.photoFrame);
      expect(matcha.photoFrames).toEqual(clean.photoFrames);
      expect(matcha.photoPlaceholders).toEqual(clean.photoPlaceholders);
      expect(matcha.model).toMatchObject({
        width: clean.model.width,
        height: clean.model.height,
      });
    }
  });

  it("keeps Matcha Polaroid paper light, captions neutral, and photos untreated", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: {
        ...base.design,
        themeId: "matcha-study" as const,
        layoutId: "photo" as const,
        photoComposition: "polaroid" as const,
        photoCaptions: { "photo-one": "Study break" },
      },
      assetReferences: {
        ...base.assetReferences,
        photoAssetIds: ["photo-one"],
      },
    };
    const result = buildScheduleRenderModel(project, base.deviceVariants[0]!);
    const nodes = result.model.layers[2].nodes;

    expect(
      nodes.find((node) => node.id === "polaroid-paper-photo-one"),
    ).toMatchObject({
      kind: "rect",
      fill: "#FAF8F0",
      shadowColor: "#7C6D5A",
    });
    expect(
      nodes.find((node) => node.id === "polaroid-caption-photo-one"),
    ).toMatchObject({ kind: "text", fill: "#514D43" });
    expect(
      nodes.find((node) => node.id === "polaroid-image-photo-one"),
    ).toMatchObject({ kind: "image", assetId: "photo-one" });
  });

  it("registers Girlfriend's Choice with rich purple tokens and cohesive subject fills", () => {
    const cards = resolveWallpaperTheme("girlfriends-choice", "cards");
    const grid = resolveWallpaperTheme("girlfriends-choice", "grid");
    const subjectPalette = [
      "#E3D8EC",
      "#D8C8E5",
      "#CDBDDD",
      "#D8C5D5",
      "#D2D0E6",
      "#E4D8DF",
    ];

    expect(
      availableThemes.find((theme) => theme.id === "girlfriends-choice"),
    ).toMatchObject({
      name: "Girlfriend's Choice",
      description:
        "Made for the developer’s girlfriend and her favorite color.",
      previewColors: {
        background: "#F5F1F8",
        foreground: "#33213F",
        accent: "#684B80",
      },
      assets: {},
    });
    expect(cards).toMatchObject({
      background: "#F5F1F8",
      surface: "#FBF8FC",
      foreground: "#33213F",
      secondary: "#6D6275",
      cardsTime: "#503565",
      cardsMetadata: "#574D5F",
      border: "#D4C8DC",
      dayAccent: "#503565",
      subjectPalette,
    });
    expect(grid).toMatchObject({
      gridTime: "#6D6275",
      gridSupport: "#574D5F",
      gridGuide: "#D4C8DC",
      gridDivider: "#E6DFEA",
      subjectPalette,
    });
    expect(GIRLFRIENDS_CHOICE_THEME.tokens.subjectPalette).toEqual(
      subjectPalette,
    );
    expect(
      resolveWallpaperTheme("girlfriends-choice", "minimal"),
    ).toMatchObject({
      minimalTime: "#503565",
      minimalSupport: "#6D6275",
      minimalRule: "#84689A",
    });
    expect(
      resolveWallpaperTheme("girlfriends-choice", "planner"),
    ).toMatchObject({
      plannerSurface: "#FBF8FC",
      plannerBorder: "#D4C8DC",
      plannerRule: "#84689A",
    });
  });

  it("uses Girlfriend's Choice in shared preview/export without changing geometry", () => {
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
      const purpleProject = {
        ...cleanProject,
        design: {
          ...cleanProject.design,
          themeId: "girlfriends-choice" as const,
        },
      };
      const clean = buildScheduleRenderModel(cleanProject, variant);
      const purple = buildScheduleRenderModel(purpleProject, variant);

      expect(purple.model.layers[0].nodes[0]).toMatchObject({
        kind: "rect",
        fill: "#F5F1F8",
      });
      expect(purple.scheduleBounds).toEqual(clean.scheduleBounds);
      expect(purple.positionRange).toEqual(clean.positionRange);
      expect(purple.photoFrame).toEqual(clean.photoFrame);
      expect(purple.photoFrames).toEqual(clean.photoFrames);
      expect(purple.photoPlaceholders).toEqual(clean.photoPlaceholders);
      expect(purple.model).toMatchObject({
        width: clean.model.width,
        height: clean.model.height,
      });
    }
  });

  it("keeps Girlfriend's Choice Polaroids light and photos untreated", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: {
        ...base.design,
        themeId: "girlfriends-choice" as const,
        layoutId: "photo" as const,
        photoComposition: "polaroid" as const,
        photoCaptions: { "photo-one": "Study date" },
      },
      assetReferences: {
        ...base.assetReferences,
        photoAssetIds: ["photo-one"],
      },
    };
    const result = buildScheduleRenderModel(project, base.deviceVariants[0]!);
    const nodes = result.model.layers[2].nodes;

    expect(
      nodes.find((node) => node.id === "polaroid-paper-photo-one"),
    ).toMatchObject({
      kind: "rect",
      fill: "#FBF8FC",
      shadowColor: "#3C3640",
    });
    expect(
      nodes.find((node) => node.id === "polaroid-caption-photo-one"),
    ).toMatchObject({ kind: "text", fill: "#4A414D" });
    expect(
      nodes.find((node) => node.id === "polaroid-image-photo-one"),
    ).toMatchObject({ kind: "image", assetId: "photo-one" });
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

    expect(
      availableThemes.find((theme) => theme.id === "adzu-classic"),
    ).toMatchObject({
      name: "AdZU Classic",
      description: "Blue and clean, the classic Ateneo way.",
    });
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
      description: "For schedules made after “one last task.”",
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

  it("registers SITEAO with warm, readable tokens and UI-safe subject fills", () => {
    const cards = resolveWallpaperTheme("siteao-orange", "cards");
    const grid = resolveWallpaperTheme("siteao-orange", "grid");
    const minimal = resolveWallpaperTheme("siteao-orange", "minimal");
    const planner = resolveWallpaperTheme("siteao-orange", "planner");
    const photo = resolveWallpaperTheme("siteao-orange", "photo");
    const subjectPalette = [
      "#FFD9C2",
      "#FFE7AD",
      "#EDD3CC",
      "#FFE8DB",
      "#F4D9D1",
      "#F9E2BF",
    ];

    expect(
      availableThemes.find((theme) => theme.id === "siteao-orange"),
    ).toMatchObject({
      name: "SITEAO",
      description: "Griffin energy, but make it organized.",
      previewColors: {
        background: "#FFF8F2",
        foreground: "#611305",
        accent: "#FD6A00",
      },
    });
    expect(cards).toMatchObject({
      background: "#FFF8F2",
      surface: "#FFF1E6",
      foreground: "#611305",
      secondary: "#7A3A1D",
      muted: "#8A4C2A",
      border: "#F2C7A3",
      dayAccent: "#8A1A04",
      cardsTime: "#6B1B08",
      cardsMetadata: "#7A3A1D",
    });
    expect(cards.subjectPalette).toEqual(subjectPalette);
    expect(grid).toMatchObject({
      subjectPalette,
      gridTime: "#6B1B08",
      gridSupport: "#7A3A1D",
      gridAxis: "#8A4C2A",
      gridGuide: "#F2C7A3",
      gridDivider: "#F6DCC5",
    });
    expect(minimal).toMatchObject({
      minimalTime: "#6B1B08",
      minimalSupport: "#7A3A1D",
      minimalProfessor: "#8A4C2A",
      minimalRule: "#FD6A00",
    });
    expect(planner).toMatchObject({
      plannerSurface: "#FFF2E8",
      plannerBorder: "#F2C7A3",
      plannerRule: "#F4D2B5",
    });
    expect(photo).toMatchObject({
      photoRule: "#FD6A00",
      photoMuted: "#8A4C2A",
      polaroidPaper: "#FFFDF8",
      polaroidCaption: "#5D1E0D",
    });
    expect(SITEAO_ORANGE_THEME.tokens.subjectPalette).toEqual(subjectPalette);
    expect(JSON.stringify(SITEAO_ORANGE_THEME)).not.toContain("#000000");
  });

  it("puts SITEAO into every shared preview/export render path without changing geometry", () => {
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
      const siteaoProject = {
        ...cleanProject,
        design: { ...cleanProject.design, themeId: "siteao-orange" as const },
      };
      const clean = buildScheduleRenderModel(cleanProject, variant);
      const siteao = buildScheduleRenderModel(siteaoProject, variant);

      expect(siteao.model.layers[0].nodes[0]).toMatchObject({
        kind: "rect",
        fill: "#FFF8F2",
      });
      expect(siteao.scheduleBounds).toEqual(clean.scheduleBounds);
      expect(siteao.positionRange).toEqual(clean.positionRange);
      expect(siteao.photoFrame).toEqual(clean.photoFrame);
      expect(siteao.photoFrames).toEqual(clean.photoFrames);
      expect(siteao.photoPlaceholders).toEqual(clean.photoPlaceholders);
    }
  });

  it("registers LAAO with accessible academic tokens and UI-safe subject fills", () => {
    const cards = resolveWallpaperTheme("laao-green", "cards");
    const grid = resolveWallpaperTheme("laao-green", "grid");
    const minimal = resolveWallpaperTheme("laao-green", "minimal");
    const planner = resolveWallpaperTheme("laao-green", "planner");
    const photo = resolveWallpaperTheme("laao-green", "photo");
    const subjectPalette = [
      "#D7EFE0",
      "#E2F4EA",
      "#DCE9D8",
      "#A9D7BC",
      "#D9EEE7",
      "#E8F2D8",
    ];

    expect(
      availableThemes.find((theme) => theme.id === "laao-green"),
    ).toMatchObject({
      name: "LAAO",
      description: "Fresh, bold, and thriving like the Dragons.",
      previewColors: {
        background: "#F4FBF7",
        foreground: "#123B29",
        accent: "#1E8E5A",
      },
    });
    expect(cards).toMatchObject({
      background: "#F4FBF7",
      surface: "#ECF7F0",
      foreground: "#123B29",
      secondary: "#3F674F",
      muted: "#557763",
      border: "#C8E2D1",
      dayAccent: "#136B43",
      cardsTime: "#184933",
      cardsMetadata: "#3F674F",
    });
    expect(cards.subjectPalette).toEqual(subjectPalette);
    expect(grid).toMatchObject({
      subjectPalette,
      gridTime: "#184933",
      gridSupport: "#3F674F",
      gridAxis: "#557763",
      gridGuide: "#C8E2D1",
      gridDivider: "#DCECDF",
    });
    expect(minimal).toMatchObject({
      minimalTime: "#184933",
      minimalSupport: "#3F674F",
      minimalProfessor: "#557763",
      minimalRule: "#1E8E5A",
    });
    expect(planner).toMatchObject({
      plannerSurface: "#EEF8F1",
      plannerBorder: "#C8E2D1",
      plannerRule: "#D7EBDD",
    });
    expect(photo).toMatchObject({
      photoRule: "#1E8E5A",
      photoMuted: "#557763",
      polaroidPaper: "#FFFDF8",
      polaroidCaption: "#244535",
    });
    expect(LAAO_GREEN_THEME.tokens.subjectPalette).toEqual(subjectPalette);
    expect(JSON.stringify(LAAO_GREEN_THEME)).not.toContain("#000000");
  });

  it("puts LAAO tokens into the shared preview/export RenderModel", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: { ...base.design, themeId: "laao-green" as const },
    };
    const result = buildScheduleRenderModel(project, base.deviceVariants[0]!);
    const nodes = result.model.layers[3].nodes;

    expect(result.model.layers[0].nodes[0]).toMatchObject({
      kind: "rect",
      fill: "#F4FBF7",
    });
    expect(nodes.find((node) => node.id === "wallpaper-title")).toMatchObject({
      kind: "text",
      fill: "#123B29",
    });
    expect(nodes.find((node) => node.id === "day-Mon")).toMatchObject({
      kind: "text",
      fill: "#136B43",
    });
    expect(nodes.find((node) => node.id.startsWith("card-"))).toMatchObject({
      kind: "rect",
      fill: "#D7EFE0",
      stroke: "#C8E2D1",
    });
    expect(nodes.find((node) => node.id.startsWith("code-"))).toMatchObject({
      kind: "text",
      fill: "#123B29",
    });
    expect(nodes.find((node) => node.id.startsWith("time-"))).toMatchObject({
      kind: "text",
      fill: "#184933",
    });
  });

  it("keeps LAAO Polaroid paper neutral and captions readable", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: {
        ...base.design,
        themeId: "laao-green" as const,
        layoutId: "photo" as const,
        photoComposition: "polaroid" as const,
        photoCaptions: { "photo-one": "Campus life" },
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
      fill: "#FFFDF8",
      shadowColor: "#0E2C20",
    });
    expect(
      photoNodes.find((node) => node.id === "polaroid-caption-photo-one"),
    ).toMatchObject({
      kind: "text",
      fill: "#244535",
    });
  });

  it("puts LAAO into every shared preview/export render path without changing geometry", () => {
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
      const laaoProject = {
        ...cleanProject,
        design: { ...cleanProject.design, themeId: "laao-green" as const },
      };
      const clean = buildScheduleRenderModel(cleanProject, variant);
      const laao = buildScheduleRenderModel(laaoProject, variant);

      expect(laao.model.layers[0].nodes[0]).toMatchObject({
        kind: "rect",
        fill: "#F4FBF7",
      });
      expect(laao.scheduleBounds).toEqual(clean.scheduleBounds);
      expect(laao.positionRange).toEqual(clean.positionRange);
      expect(laao.photoFrame).toEqual(clean.photoFrame);
      expect(laao.photoFrames).toEqual(clean.photoFrames);
      expect(laao.photoPlaceholders).toEqual(clean.photoPlaceholders);
    }
  });

  it("registers EAO with accessible academic tokens and UI-safe subject fills", () => {
    const cards = resolveWallpaperTheme("eao-blue", "cards");
    const grid = resolveWallpaperTheme("eao-blue", "grid");
    const minimal = resolveWallpaperTheme("eao-blue", "minimal");
    const planner = resolveWallpaperTheme("eao-blue", "planner");
    const photo = resolveWallpaperTheme("eao-blue", "photo");
    const subjectPalette = [
      "#DDEAF7",
      "#D3E5F5",
      "#CEDBE9",
      "#B9D3EC",
      "#E3EDF7",
      "#D7E1F0",
    ];

    expect(
      availableThemes.find((theme) => theme.id === "eao-blue"),
    ).toMatchObject({
      name: "EAO",
      description: "Cool, calm, and sharp like the Eagles.",
      previewColors: {
        background: "#F4F8FC",
        foreground: "#102C52",
        accent: "#2C69B3",
      },
    });
    expect(cards).toMatchObject({
      background: "#F4F8FC",
      surface: "#EAF2FA",
      foreground: "#102C52",
      secondary: "#52708F",
      muted: "#587493",
      border: "#C9D9EB",
      dayAccent: "#174E91",
      cardsTime: "#173A67",
      cardsMetadata: "#52708F",
    });
    expect(cards.subjectPalette).toEqual(subjectPalette);
    expect(grid).toMatchObject({
      subjectPalette,
      gridTime: "#173A67",
      gridSupport: "#52708F",
      gridAxis: "#587493",
      gridGuide: "#C9D9EB",
      gridDivider: "#DCE7F2",
    });
    expect(minimal).toMatchObject({
      minimalTime: "#173A67",
      minimalSupport: "#52708F",
      minimalProfessor: "#587493",
      minimalRule: "#2C69B3",
    });
    expect(planner).toMatchObject({
      plannerSurface: "#EDF4FA",
      plannerBorder: "#C9D9EB",
      plannerRule: "#D8E5F1",
    });
    expect(photo).toMatchObject({
      photoRule: "#2C69B3",
      photoMuted: "#587493",
      polaroidPaper: "#FFFDF8",
      polaroidCaption: "#33485F",
    });
    expect(EAO_BLUE_THEME.tokens.subjectPalette).toEqual(subjectPalette);
    expect(JSON.stringify(EAO_BLUE_THEME)).not.toContain("#000000");
  });

  it("puts EAO tokens into the shared preview/export RenderModel", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: { ...base.design, themeId: "eao-blue" as const },
    };
    const result = buildScheduleRenderModel(project, base.deviceVariants[0]!);
    const nodes = result.model.layers[3].nodes;

    expect(result.model.layers[0].nodes[0]).toMatchObject({
      kind: "rect",
      fill: "#F4F8FC",
    });
    expect(nodes.find((node) => node.id === "wallpaper-title")).toMatchObject({
      kind: "text",
      fill: "#102C52",
    });
    expect(nodes.find((node) => node.id === "day-Mon")).toMatchObject({
      kind: "text",
      fill: "#174E91",
    });
    expect(nodes.find((node) => node.id.startsWith("card-"))).toMatchObject({
      kind: "rect",
      fill: "#DDEAF7",
      stroke: "#C9D9EB",
    });
    expect(nodes.find((node) => node.id.startsWith("code-"))).toMatchObject({
      kind: "text",
      fill: "#102C52",
    });
    expect(nodes.find((node) => node.id.startsWith("time-"))).toMatchObject({
      kind: "text",
      fill: "#173A67",
    });
  });

  it("keeps EAO Polaroid paper neutral and captions readable", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: {
        ...base.design,
        themeId: "eao-blue" as const,
        layoutId: "photo" as const,
        photoComposition: "polaroid" as const,
        photoCaptions: { "photo-one": "Campus life" },
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
      fill: "#FFFDF8",
      shadowColor: "#0F2743",
    });
    expect(
      photoNodes.find((node) => node.id === "polaroid-caption-photo-one"),
    ).toMatchObject({
      kind: "text",
      fill: "#33485F",
    });
  });

  it("puts EAO into every shared preview/export render path without changing geometry", () => {
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
      const eaoProject = {
        ...cleanProject,
        design: { ...cleanProject.design, themeId: "eao-blue" as const },
      };
      const clean = buildScheduleRenderModel(cleanProject, variant);
      const eao = buildScheduleRenderModel(eaoProject, variant);

      expect(eao.model.layers[0].nodes[0]).toMatchObject({
        kind: "rect",
        fill: "#F4F8FC",
      });
      expect(eao.scheduleBounds).toEqual(clean.scheduleBounds);
      expect(eao.positionRange).toEqual(clean.positionRange);
      expect(eao.photoFrame).toEqual(clean.photoFrame);
      expect(eao.photoFrames).toEqual(clean.photoFrames);
      expect(eao.photoPlaceholders).toEqual(clean.photoPlaceholders);
    }
  });

  it("registers MAO with accessible academic tokens and UI-safe subject fills", () => {
    const cards = resolveWallpaperTheme("mao-red", "cards");
    const grid = resolveWallpaperTheme("mao-red", "grid");
    const minimal = resolveWallpaperTheme("mao-red", "minimal");
    const planner = resolveWallpaperTheme("mao-red", "planner");
    const photo = resolveWallpaperTheme("mao-red", "photo");
    const subjectPalette = [
      "#F3DDDC",
      "#EBCFCD",
      "#DFC1C0",
      "#D6B3B0",
      "#F4E3DF",
      "#E8D7D2",
    ];

    expect(
      availableThemes.find((theme) => theme.id === "mao-red"),
    ).toMatchObject({
      name: "MAO",
      description: "Bold, driven, and ready to lead like the Lions.",
      previewColors: {
        background: "#FCF5F4",
        foreground: "#5A1010",
        accent: "#A61F1F",
      },
    });
    expect(cards).toMatchObject({
      background: "#FCF5F4",
      surface: "#F8EAEA",
      foreground: "#5A1010",
      secondary: "#93504E",
      muted: "#995D59",
      border: "#E6C1BC",
      dayAccent: "#7A1212",
      cardsTime: "#6B1717",
      cardsMetadata: "#93504E",
    });
    expect(cards.subjectPalette).toEqual(subjectPalette);
    expect(grid).toMatchObject({
      subjectPalette,
      gridTime: "#6B1717",
      gridSupport: "#93504E",
      gridAxis: "#995D59",
      gridGuide: "#E6C1BC",
      gridDivider: "#EED8D5",
    });
    expect(minimal).toMatchObject({
      minimalTime: "#6B1717",
      minimalSupport: "#93504E",
      minimalProfessor: "#995D59",
      minimalRule: "#A61F1F",
    });
    expect(planner).toMatchObject({
      plannerSurface: "#FAEFED",
      plannerBorder: "#E6C1BC",
      plannerRule: "#EDD6D3",
    });
    expect(photo).toMatchObject({
      photoRule: "#A61F1F",
      photoMuted: "#995D59",
      polaroidPaper: "#FFFDF8",
      polaroidCaption: "#4E2525",
    });
    expect(MAO_RED_THEME.tokens.subjectPalette).toEqual(subjectPalette);
    expect(JSON.stringify(MAO_RED_THEME)).not.toContain("#000000");
  });

  it("puts MAO tokens into the shared preview/export RenderModel", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: { ...base.design, themeId: "mao-red" as const },
    };
    const result = buildScheduleRenderModel(project, base.deviceVariants[0]!);
    const nodes = result.model.layers[3].nodes;

    expect(result.model.layers[0].nodes[0]).toMatchObject({
      kind: "rect",
      fill: "#FCF5F4",
    });
    expect(nodes.find((node) => node.id === "wallpaper-title")).toMatchObject({
      kind: "text",
      fill: "#5A1010",
    });
    expect(nodes.find((node) => node.id === "day-Mon")).toMatchObject({
      kind: "text",
      fill: "#7A1212",
    });
    expect(nodes.find((node) => node.id.startsWith("card-"))).toMatchObject({
      kind: "rect",
      fill: "#F3DDDC",
      stroke: "#E6C1BC",
    });
    expect(nodes.find((node) => node.id.startsWith("code-"))).toMatchObject({
      kind: "text",
      fill: "#5A1010",
    });
    expect(nodes.find((node) => node.id.startsWith("time-"))).toMatchObject({
      kind: "text",
      fill: "#6B1717",
    });
  });

  it("keeps MAO Polaroid paper neutral and captions readable", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: {
        ...base.design,
        themeId: "mao-red" as const,
        layoutId: "photo" as const,
        photoComposition: "polaroid" as const,
        photoCaptions: { "photo-one": "Campus life" },
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
      fill: "#FFFDF8",
      shadowColor: "#2C0A0A",
    });
    expect(
      photoNodes.find((node) => node.id === "polaroid-caption-photo-one"),
    ).toMatchObject({
      kind: "text",
      fill: "#4E2525",
    });
  });

  it("puts MAO into every shared preview/export render path without changing geometry", () => {
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
      const maoProject = {
        ...cleanProject,
        design: { ...cleanProject.design, themeId: "mao-red" as const },
      };
      const clean = buildScheduleRenderModel(cleanProject, variant);
      const mao = buildScheduleRenderModel(maoProject, variant);

      expect(mao.model.layers[0].nodes[0]).toMatchObject({
        kind: "rect",
        fill: "#FCF5F4",
      });
      expect(mao.scheduleBounds).toEqual(clean.scheduleBounds);
      expect(mao.positionRange).toEqual(clean.positionRange);
      expect(mao.photoFrame).toEqual(clean.photoFrame);
      expect(mao.photoFrames).toEqual(clean.photoFrames);
      expect(mao.photoPlaceholders).toEqual(clean.photoPlaceholders);
    }
  });

  it("registers AAO with accessible academic tokens and UI-safe subject fills", () => {
    const cards = resolveWallpaperTheme("aao-yellow", "cards");
    const grid = resolveWallpaperTheme("aao-yellow", "grid");
    const minimal = resolveWallpaperTheme("aao-yellow", "minimal");
    const planner = resolveWallpaperTheme("aao-yellow", "planner");
    const photo = resolveWallpaperTheme("aao-yellow", "photo");
    const subjectPalette = [
      "#FFF0B8",
      "#F7E2A0",
      "#F2D28A",
      "#E8C779",
      "#FFF4D3",
      "#F5E8C8",
    ];

    expect(
      availableThemes.find((theme) => theme.id === "aao-yellow"),
    ).toMatchObject({
      name: "AAO",
      description: "Bright, confident, and fierce like the Tigers.",
      previewColors: {
        background: "#FFFBEF",
        foreground: "#5A4410",
        accent: "#D9A31A",
      },
    });
    expect(cards).toMatchObject({
      background: "#FFFBEF",
      surface: "#FFF4D3",
      foreground: "#5A4410",
      secondary: "#80672E",
      muted: "#866F3D",
      border: "#E7D495",
      dayAccent: "#87610A",
      cardsTime: "#6A5311",
      cardsMetadata: "#80672E",
    });
    expect(cards.subjectPalette).toEqual(subjectPalette);
    expect(grid).toMatchObject({
      subjectPalette,
      gridTime: "#6A5311",
      gridSupport: "#80672E",
      gridAxis: "#866F3D",
      gridGuide: "#E7D495",
      gridDivider: "#F0E4BE",
    });
    expect(minimal).toMatchObject({
      minimalTime: "#6A5311",
      minimalSupport: "#80672E",
      minimalProfessor: "#866F3D",
      minimalRule: "#D9A31A",
    });
    expect(planner).toMatchObject({
      plannerSurface: "#FFF7E3",
      plannerBorder: "#E7D495",
      plannerRule: "#F0E3B8",
    });
    expect(photo).toMatchObject({
      photoRule: "#D9A31A",
      photoMuted: "#866F3D",
      polaroidPaper: "#FFFDF8",
      polaroidCaption: "#57492A",
    });
    expect(AAO_YELLOW_THEME.tokens.subjectPalette).toEqual(subjectPalette);
    expect(JSON.stringify(AAO_YELLOW_THEME)).not.toContain("#000000");
  });

  it("puts AAO tokens into the shared preview/export RenderModel", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: { ...base.design, themeId: "aao-yellow" as const },
    };
    const result = buildScheduleRenderModel(project, base.deviceVariants[0]!);
    const nodes = result.model.layers[3].nodes;

    expect(result.model.layers[0].nodes[0]).toMatchObject({
      kind: "rect",
      fill: "#FFFBEF",
    });
    expect(nodes.find((node) => node.id === "wallpaper-title")).toMatchObject({
      kind: "text",
      fill: "#5A4410",
    });
    expect(nodes.find((node) => node.id === "day-Mon")).toMatchObject({
      kind: "text",
      fill: "#87610A",
    });
    expect(nodes.find((node) => node.id.startsWith("card-"))).toMatchObject({
      kind: "rect",
      fill: "#FFF0B8",
      stroke: "#E7D495",
    });
    expect(nodes.find((node) => node.id.startsWith("code-"))).toMatchObject({
      kind: "text",
      fill: "#5A4410",
    });
    expect(nodes.find((node) => node.id.startsWith("time-"))).toMatchObject({
      kind: "text",
      fill: "#6A5311",
    });
  });

  it("keeps AAO Polaroid paper neutral and captions readable", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: {
        ...base.design,
        themeId: "aao-yellow" as const,
        layoutId: "photo" as const,
        photoComposition: "polaroid" as const,
        photoCaptions: { "photo-one": "Campus life" },
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
      fill: "#FFFDF8",
      shadowColor: "#332503",
    });
    expect(
      photoNodes.find((node) => node.id === "polaroid-caption-photo-one"),
    ).toMatchObject({
      kind: "text",
      fill: "#57492A",
    });
  });

  it("puts AAO into every shared preview/export render path without changing geometry", () => {
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
      const aaoProject = {
        ...cleanProject,
        design: { ...cleanProject.design, themeId: "aao-yellow" as const },
      };
      const clean = buildScheduleRenderModel(cleanProject, variant);
      const aao = buildScheduleRenderModel(aaoProject, variant);

      expect(aao.model.layers[0].nodes[0]).toMatchObject({
        kind: "rect",
        fill: "#FFFBEF",
      });
      expect(aao.scheduleBounds).toEqual(clean.scheduleBounds);
      expect(aao.positionRange).toEqual(clean.positionRange);
      expect(aao.photoFrame).toEqual(clean.photoFrame);
      expect(aao.photoFrames).toEqual(clean.photoFrames);
      expect(aao.photoPlaceholders).toEqual(clean.photoPlaceholders);
    }
  });

  it("registers NAO with accessible neutral tokens and subtle red accents", () => {
    const cards = resolveWallpaperTheme("nao-white", "cards");
    const grid = resolveWallpaperTheme("nao-white", "grid");
    const minimal = resolveWallpaperTheme("nao-white", "minimal");
    const planner = resolveWallpaperTheme("nao-white", "planner");
    const photo = resolveWallpaperTheme("nao-white", "photo");
    const subjectPalette = [
      "#FFFFFF",
      "#F2F2F2",
      "#F8ECEC",
      "#F3E3E3",
      "#F7F5F5",
      "#EEE7E7",
    ];

    expect(
      availableThemes.find((theme) => theme.id === "nao-white"),
    ).toMatchObject({
      name: "NAO",
      description: "Clean, calm, and angel-approved.",
      previewColors: {
        background: "#FBFBFB",
        foreground: "#4D1D1D",
        accent: "#B63A3A",
      },
    });
    expect(cards).toMatchObject({
      background: "#FBFBFB",
      surface: "#FFFFFF",
      foreground: "#4D1D1D",
      secondary: "#6A6A6A",
      muted: "#707070",
      border: "#E5E1E1",
      dayAccent: "#8F2323",
      cardsTime: "#313131",
      cardsMetadata: "#6A6A6A",
    });
    expect(cards.subjectPalette).toEqual(subjectPalette);
    expect(grid).toMatchObject({
      subjectPalette,
      gridTime: "#313131",
      gridSupport: "#6A6A6A",
      gridAxis: "#707070",
      gridGuide: "#E5E1E1",
      gridDivider: "#EEECEC",
    });
    expect(minimal).toMatchObject({
      minimalTime: "#313131",
      minimalSupport: "#6A6A6A",
      minimalProfessor: "#707070",
      minimalRule: "#B63A3A",
    });
    expect(planner).toMatchObject({
      plannerSurface: "#F7F7F7",
      plannerBorder: "#E5E1E1",
      plannerRule: "#EDEAEA",
    });
    expect(photo).toMatchObject({
      photoRule: "#B63A3A",
      photoMuted: "#707070",
      polaroidPaper: "#FFFFFF",
      polaroidCaption: "#414141",
    });
    expect(NAO_WHITE_THEME.tokens.subjectPalette).toEqual(subjectPalette);
    expect(JSON.stringify(NAO_WHITE_THEME)).not.toContain("#000000");
  });

  it("puts NAO tokens into the shared preview/export RenderModel", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: { ...base.design, themeId: "nao-white" as const },
    };
    const result = buildScheduleRenderModel(project, base.deviceVariants[0]!);
    const nodes = result.model.layers[3].nodes;

    expect(result.model.layers[0].nodes[0]).toMatchObject({
      kind: "rect",
      fill: "#FBFBFB",
    });
    expect(nodes.find((node) => node.id === "wallpaper-title")).toMatchObject({
      kind: "text",
      fill: "#4D1D1D",
    });
    expect(nodes.find((node) => node.id === "day-Mon")).toMatchObject({
      kind: "text",
      fill: "#8F2323",
    });
    expect(nodes.find((node) => node.id.startsWith("card-"))).toMatchObject({
      kind: "rect",
      fill: "#FFFFFF",
      stroke: "#E5E1E1",
    });
    expect(nodes.find((node) => node.id.startsWith("code-"))).toMatchObject({
      kind: "text",
      fill: "#4D1D1D",
    });
    expect(nodes.find((node) => node.id.startsWith("time-"))).toMatchObject({
      kind: "text",
      fill: "#313131",
    });
  });

  it("keeps NAO Polaroid paper neutral and captions readable", () => {
    const base = visualScheduleProject();
    const project = {
      ...base,
      design: {
        ...base.design,
        themeId: "nao-white" as const,
        layoutId: "photo" as const,
        photoComposition: "polaroid" as const,
        photoCaptions: { "photo-one": "Campus life" },
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
      fill: "#FFFFFF",
      shadowColor: "#2F2323",
    });
    expect(
      photoNodes.find((node) => node.id === "polaroid-caption-photo-one"),
    ).toMatchObject({
      kind: "text",
      fill: "#414141",
    });
  });

  it("puts NAO into every shared preview/export render path without changing geometry", () => {
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
      const naoProject = {
        ...cleanProject,
        design: { ...cleanProject.design, themeId: "nao-white" as const },
      };
      const clean = buildScheduleRenderModel(cleanProject, variant);
      const nao = buildScheduleRenderModel(naoProject, variant);

      expect(nao.model.layers[0].nodes[0]).toMatchObject({
        kind: "rect",
        fill: "#FBFBFB",
      });
      expect(nao.scheduleBounds).toEqual(clean.scheduleBounds);
      expect(nao.positionRange).toEqual(clean.positionRange);
      expect(nao.photoFrame).toEqual(clean.photoFrame);
      expect(nao.photoFrames).toEqual(clean.photoFrames);
      expect(nao.photoPlaceholders).toEqual(clean.photoPlaceholders);
    }
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
