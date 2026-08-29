import type { WallpaperThemeTokens } from "./themes/types";
import type { ImageRenderNode, ScheduleRenderResult } from "./types";

export const SCHEDULEBUD_WATERMARK_ASSET_ID = "brand:schedulebud-watermark";
export const SCHEDULEBUD_WATERMARK_OPACITY = 0.14;

const LOGO_ASPECT_RATIO = 172 / 162;

function isDark(color: string): boolean {
  const value = color.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return false;
  const [red, green, blue] = [0, 2, 4].map((index) =>
    Number.parseInt(value.slice(index, index + 2), 16),
  );
  const luminance = (0.2126 * red! + 0.7152 * green! + 0.0722 * blue!) / 255;
  return luminance < 0.5;
}

export function resolveScheduleBudWatermarkNode(
  result: ScheduleRenderResult,
  theme: WallpaperThemeTokens,
): ImageRenderNode {
  const shortestEdge = Math.min(result.model.width, result.model.height);
  const width = shortestEdge * 0.09;
  const height = width / LOGO_ASPECT_RATIO;
  const inset = shortestEdge * 0.035;

  return {
    id: "schedulebud-watermark",
    kind: "image",
    assetId: SCHEDULEBUD_WATERMARK_ASSET_ID,
    source: isDark(theme.background)
      ? "/brand/schedulebud-logo-on-dark.svg"
      : "/brand/schedulebud-logo-on-light.svg",
    geometry: {
      x: result.model.width - inset - width,
      y: result.model.height - inset - height,
      width,
      height,
    },
    fit: "contain",
    opacity: SCHEDULEBUD_WATERMARK_OPACITY,
  };
}

export function applyScheduleBudWatermark<T extends ScheduleRenderResult>(
  result: T,
  theme: WallpaperThemeTokens,
): T {
  const [background, scenery, photos, schedule, foreground] =
    result.model.layers;
  return {
    ...result,
    model: {
      ...result.model,
      layers: [
        background,
        scenery,
        photos,
        schedule,
        {
          ...foreground,
          nodes: [
            ...foreground.nodes.filter(
              (node) => node.id !== "schedulebud-watermark",
            ),
            resolveScheduleBudWatermarkNode(result, theme),
          ],
        },
      ],
    },
  };
}
