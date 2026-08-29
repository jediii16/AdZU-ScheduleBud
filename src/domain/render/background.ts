import { emojiById, emojiCatalog } from "@/data/emojis/catalog";
import type { DeviceVariant } from "@/domain/device/types";
import type {
  BackgroundDesign,
  BackgroundPattern,
  ScheduleProject,
} from "@/domain/project";
import type { WallpaperThemeTokens } from "./themes/types";
import type {
  Point,
  RenderModel,
  RenderNode,
  ScheduleRenderResult,
} from "./types";

export const BACKGROUND_MODES = [
  "palette",
  "solid",
  "gradient",
  "pattern",
  "image",
] as const;
export const BACKGROUND_PATTERN_TYPES = [
  "dots",
  "grid",
  "checker",
  "diagonal",
  "emoji",
] as const;

export function createDefaultBackgroundPattern(
  type: BackgroundPattern["type"],
  theme: WallpaperThemeTokens,
): BackgroundPattern {
  const common = {
    backgroundColor: theme.background,
    color: theme.dayAccent,
    opacity: 0.22,
  };
  if (type === "grid")
    return { type, ...common, spacing: 0.045, lineWeight: 0.0015 };
  if (type === "checker")
    return { type, ...common, cellSize: 0.055, opacity: 0.16 };
  if (type === "diagonal")
    return {
      type,
      ...common,
      stripeWidth: 0.008,
      spacing: 0.055,
      angle: 45,
      opacity: 0.14,
    };
  if (type === "emoji")
    return {
      type,
      backgroundColor: theme.background,
      emojiId: emojiCatalog[0]!.id,
      size: 0.052,
      spacing: 0.105,
      opacity: 0.72,
      rotation: 0,
      layout: "offset",
    };
  return { type, ...common, size: 0.009, spacing: 0.043, offset: true };
}

export function initializeBackgroundMode(
  background: BackgroundDesign,
  mode: BackgroundDesign["mode"],
  theme: WallpaperThemeTokens,
): BackgroundDesign {
  const next: BackgroundDesign = { ...background, mode };
  if (mode === "solid" && !next.solid) next.solid = { color: theme.background };
  if (mode === "gradient" && !next.gradient)
    next.gradient = {
      color1: theme.background,
      color2: theme.surface,
      direction: 135,
    };
  if (mode === "pattern" && !next.pattern)
    next.pattern = createDefaultBackgroundPattern("dots", theme);
  return next;
}

function gradientEndpoints(
  width: number,
  height: number,
  angle: NonNullable<BackgroundDesign["gradient"]>["direction"],
): { start: Point; end: Point } {
  const radians = (angle * Math.PI) / 180;
  const center = { x: width / 2, y: height / 2 };
  const distance =
    Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
  const dx = (Math.cos(radians) * distance) / 2;
  const dy = (Math.sin(radians) * distance) / 2;
  return {
    start: { x: center.x - dx, y: center.y - dy },
    end: { x: center.x + dx, y: center.y + dy },
  };
}

export function resolveBackgroundNodes(
  project: ScheduleProject,
  variant: DeviceVariant,
  theme: WallpaperThemeTokens,
): readonly RenderNode[] {
  const { width, height } = variant.dimensions;
  const geometry = { x: 0, y: 0, width, height };
  const background = project.design.background;
  if (background.mode === "solid" && background.solid)
    return [
      {
        id: "wallpaper-background",
        kind: "rect",
        geometry,
        fill: background.solid.color,
      },
    ];
  if (background.mode === "gradient" && background.gradient) {
    const { start, end } = gradientEndpoints(
      width,
      height,
      background.gradient.direction,
    );
    return [
      {
        id: "wallpaper-background",
        kind: "rect",
        geometry,
        linearGradient: {
          start,
          end,
          colorStops: [
            0,
            background.gradient.color1,
            1,
            background.gradient.color2,
          ],
        },
      },
    ];
  }
  if (background.mode === "pattern" && background.pattern) {
    const emoji =
      background.pattern.type === "emoji"
        ? (emojiById.get(background.pattern.emojiId) ?? emojiCatalog[0])
        : undefined;
    return [
      {
        id: "wallpaper-background",
        kind: "rect",
        geometry,
        pattern: background.pattern,
        ...(emoji
          ? {
              emojiAssetId: `background-emoji:${emoji.id}`,
              emojiSource: emoji.src,
            }
          : {}),
      },
    ];
  }
  if (background.mode === "image" && background.image) {
    const overlay = background.image.overlay;
    return [
      {
        id: "wallpaper-background-fallback",
        kind: "rect",
        geometry,
        fill: theme.background,
      },
      {
        id: "wallpaper-background",
        kind: "image",
        geometry,
        assetId: background.image.assetId,
        fit: "cover",
        focalPoint: variant.backgroundImageTransform.position,
        zoom: variant.backgroundImageTransform.scale,
      },
      ...(overlay === "none" || background.image.overlayIntensity === 0
        ? []
        : [
            {
              id: "wallpaper-background-overlay",
              kind: "rect" as const,
              geometry,
              fill: overlay === "light" ? "#FFFFFF" : "#101827",
              opacity: background.image.overlayIntensity,
            },
          ]),
    ];
  }
  return [
    {
      id: "wallpaper-background",
      kind: "rect",
      geometry,
      fill: theme.background,
    },
  ];
}

export function applyBackground<T extends ScheduleRenderResult>(
  result: T,
  project: ScheduleProject,
  variant: DeviceVariant,
  theme: WallpaperThemeTokens,
): T {
  const [background, ...rest] = result.model.layers;
  const retained = background.nodes.filter(
    (node) => !node.id.startsWith("wallpaper-background"),
  );
  const layers: RenderModel["layers"] = [
    {
      ...background,
      nodes: [...resolveBackgroundNodes(project, variant, theme), ...retained],
    },
    ...rest,
  ];
  return { ...result, model: { ...result.model, layers } };
}
