import { describe, expect, it } from "vitest";

import { emojiCatalog } from "@/data/emojis/catalog";
import {
  BACKGROUND_PATTERN_TYPES,
  buildScheduleRenderModel,
  createDefaultBackgroundPattern,
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

  it("resolves exact solid and deterministic two-color gradient backgrounds", () => {
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
            color1: "#112233",
            color2: "#AABBCC",
            direction: 45 as const,
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
      linearGradient: { colorStops: [0, "#112233", 1, "#AABBCC"] },
    });
  });

  it("registers all five target-relative deterministic patterns", () => {
    expect(BACKGROUND_PATTERN_TYPES).toEqual([
      "dots",
      "grid",
      "checker",
      "diagonal",
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
