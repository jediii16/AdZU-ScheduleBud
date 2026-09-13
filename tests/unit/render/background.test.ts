import { describe, expect, it } from "vitest";

import { emojiCatalog } from "@/data/emojis/catalog";
import {
  BACKGROUND_PATTERN_TYPES,
  buildScheduleRenderModel,
  createDefaultBackgroundPattern,
  mixGradientColors,
  resolveBackgroundNodes,
  resolveWallpaperTheme,
} from "@/domain/render";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

describe("background render system", () => {
  it("keeps Palette as the exact legacy canvas path", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const model = buildScheduleRenderModel(project, variant).model;
    expect(model.layers[0].nodes[0]).toMatchObject({
      id: "wallpaper-background",
      kind: "rect",
      fill: "#F7F8FA",
    });
  });

  it("resolves deterministic perceptual linear gradients", () => {
    const base = visualScheduleProject();
    const variant = base.deviceVariants[0]!;
    const solid = {
      ...base,
      design: {
        ...base.design,
        background: { mode: "solid" as const, solid: { color: "#DCE4F5" } },
      },
    };
    expect(
      buildScheduleRenderModel(solid, variant).model.layers[0].nodes[0],
    ).toMatchObject({ kind: "rect", fill: "#DCE4F5" });

    const gradient = {
      ...base,
      design: {
        ...base.design,
        background: {
          mode: "gradient" as const,
          gradient: {
            type: "linear" as const,
            color1: "#112233",
            color2: "#AABBCC",
            direction: 45 as const,
            center: { x: 0.5, y: 0.5 },
          },
        },
      },
    };
    const first = buildScheduleRenderModel(gradient, variant).model.layers[0]
      .nodes[0];
    const second = buildScheduleRenderModel(gradient, variant).model.layers[0]
      .nodes[0];
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      kind: "rect",
    });
    if (first?.kind !== "rect" || !first.linearGradient)
      throw new Error("Expected a linear gradient background");
    expect(first.linearGradient.colorStops).toEqual([
      0,
      "#112233",
      0.25,
      "#334456",
      0.5,
      "#586A7B",
      0.75,
      "#8091A3",
      1,
      "#AABBCC",
    ]);
    expect(mixGradientColors("#112233", "#AABBCC", 0.5)).toBe("#586A7B");
  });

  it("resolves radial and conic gradients around a configurable center", () => {
    const base = visualScheduleProject();
    const variant = base.deviceVariants[0]!;
    const makeProject = (type: "radial" | "conic") => ({
      ...base,
      design: {
        ...base.design,
        background: {
          mode: "gradient" as const,
          gradient: {
            type,
            color1: "#112233",
            color2: "#AABBCC",
            color3: "#DDEEFF",
            direction: 90 as const,
            center: { x: 0.2, y: 0.8 },
          },
        },
      },
    });
    expect(
      buildScheduleRenderModel(makeProject("radial"), variant).model.layers[0]
        .nodes[0],
    ).toMatchObject({
      radialGradient: {
        center: {
          x: variant.dimensions.width * 0.2,
          y: variant.dimensions.height * 0.8,
        },
        radiusX:
          Math.max(
            variant.dimensions.width * 0.2,
            variant.dimensions.width * 0.8,
          ) * Math.SQRT2,
        radiusY:
          Math.max(
            variant.dimensions.height * 0.8,
            variant.dimensions.height * 0.2,
          ) * Math.SQRT2,
      },
    });
    const radial = buildScheduleRenderModel(makeProject("radial"), variant)
      .model.layers[0].nodes[0];
    if (radial?.kind !== "rect" || !radial.radialGradient)
      throw new Error("Expected a radial gradient background");
    expect(radial.radialGradient.colorStops.at(0)).toBe(0);
    expect(radial.radialGradient.colorStops.at(1)).toBe("#112233");
    expect(radial.radialGradient.colorStops.at(-2)).toBe(1);
    expect(radial.radialGradient.colorStops.at(-1)).toBe("#AABBCC");
    expect(
      buildScheduleRenderModel(makeProject("conic"), variant).model.layers[0]
        .nodes[0],
    ).toMatchObject({
      conicGradient: {
        center: {
          x: variant.dimensions.width * 0.2,
          y: variant.dimensions.height * 0.8,
        },
        angle: 90,
        softCenterColor: expect.stringMatching(/^#[0-9A-F]{6}$/),
        softCenterRadius:
          Math.min(variant.dimensions.width, variant.dimensions.height) * 0.2,
      },
    });
    const conic = buildScheduleRenderModel(makeProject("conic"), variant).model
      .layers[0].nodes[0];
    if (conic?.kind !== "rect" || !conic.conicGradient)
      throw new Error("Expected a conic gradient background");
    expect(conic.conicGradient.colorStops).toContain("#DDEEFF");
    expect(conic.conicGradient.colorStops.at(1)).toBe("#112233");
    expect(conic.conicGradient.colorStops.at(-1)).toBe("#112233");
  });

  it("registers all six target-relative deterministic patterns", () => {
    expect(BACKGROUND_PATTERN_TYPES).toEqual([
      "dots",
      "grid",
      "checker",
      "diagonal",
      "crumpled",
      "emoji",
    ]);
    const base = visualScheduleProject();
    const variant = base.deviceVariants[0]!;
    const theme = resolveWallpaperTheme("matcha-study", "cards");
    for (const type of BACKGROUND_PATTERN_TYPES) {
      const pattern = createDefaultBackgroundPattern(type, theme);
      const project = {
        ...base,
        design: {
          ...base.design,
          background: { mode: "pattern" as const, pattern },
        },
      };
      const first = resolveBackgroundNodes(project, variant, theme);
      expect(first).toEqual(resolveBackgroundNodes(project, variant, theme));
      expect(first[0]).toMatchObject({
        kind: "rect",
        geometry: variant.dimensions,
        pattern: { type },
      });
      if (type === "crumpled")
        expect(first[0]).toMatchObject({
          patternTextureAssetId: "background-texture:crumpled-paper",
          patternTextureSource: "/textures/crumpled-paper.webp",
        });
    }
  });

  it("reuses the emoji catalog source and never creates a sticker node", () => {
    const base = visualScheduleProject();
    const variant = base.deviceVariants[0]!;
    const emoji = emojiCatalog[12]!;
    const pattern = {
      type: "emoji" as const,
      backgroundColor: "#FFFFFF",
      emojiId: emoji.id,
      size: 0.05,
      spacing: 0.1,
      opacity: 0.7,
      rotation: 15,
      layout: "offset" as const,
    };
    const project = {
      ...base,
      design: {
        ...base.design,
        background: { mode: "pattern" as const, pattern },
      },
    };
    const node = buildScheduleRenderModel(project, variant).model.layers[0]
      .nodes[0];
    expect(node).toMatchObject({
      kind: "rect",
      emojiAssetId: `background-emoji:${emoji.id}`,
      emojiSource: emoji.src,
      pattern: { emojiId: emoji.id, layout: "offset" },
    });
    expect(
      buildScheduleRenderModel(project, variant)
        .model.layers.flatMap((layer) => layer.nodes)
        .some((item) => item.id.startsWith("sticker-")),
    ).toBe(variant.stickers.length > 0);
  });

  it("resolves image cover, per-device transform, and overlay in the background layer", () => {
    const base = visualScheduleProject();
    const variant = {
      ...base.deviceVariants[0]!,
      backgroundImageTransform: {
        position: { x: 0.2, y: 0.75 },
        scale: 1.8,
      },
    };
    const project = {
      ...base,
      design: {
        ...base.design,
        background: {
          mode: "image" as const,
          image: {
            assetId: "background-one",
            overlay: "dark" as const,
            overlayIntensity: 0.35,
          },
        },
      },
    };
    const nodes = buildScheduleRenderModel(project, variant).model.layers[0]
      .nodes;
    expect(nodes[1]).toMatchObject({
      kind: "image",
      assetId: "background-one",
      fit: "cover",
      focalPoint: { x: 0.2, y: 0.75 },
      zoom: 1.8,
    });
    expect(nodes[2]).toMatchObject({
      id: "wallpaper-background-overlay",
      fill: "#101827",
      opacity: 0.35,
    });
  });
});
