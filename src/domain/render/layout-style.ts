import {
  layoutStyleById,
  resolveLayoutStyleId,
  type LayoutStyleDefinition,
} from "@/data/layout-styles/registry";
import type {
  LayoutId,
  LayoutStyleId,
  LayoutStylePreferences,
  PhotoComposition,
} from "@/domain/design/types";
import type { DeviceVariant } from "@/domain/device/types";
import { fitText } from "./text-fit";
import type { RenderLayer, RenderModel, RenderNode } from "./types";
import type { WallpaperThemeTokens } from "./themes/types";

export type ResolvedLayoutStyleTokens = {
  styleId: LayoutStyleId;
  layout: LayoutId;
  surfaceTreatment:
    "baseline" | "outline" | "soft" | "bold" | "glass" | "editorial" | "framed";
  borderWidth: number;
  ruleWidth: number;
  radiusScale: number;
};

export type ResolveLayoutStyleInput = {
  layout: LayoutId;
  preferences: Partial<LayoutStylePreferences> | null | undefined;
  theme: WallpaperThemeTokens;
  target: DeviceVariant;
  composition?: PhotoComposition | undefined;
};

function parseHex(color: string): [number, number, number] | null {
  const value = color.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return [0, 2, 4].map((index) =>
    Number.parseInt(value.slice(index, index + 2), 16),
  ) as [number, number, number];
}

function mix(base: string, overlay: string, amount: number): string {
  const a = parseHex(base);
  const b = parseHex(overlay);
  if (!a || !b) return overlay;
  const channel = (index: number) =>
    Math.round(a[index]! + (b[index]! - a[index]!) * amount)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

function withAlpha(color: string, alpha: number): string {
  const rgb = parseHex(color);
  return rgb ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})` : color;
}

function scaleFor(target: DeviceVariant): number {
  return Math.max(
    1,
    Math.min(
      3,
      Math.min(target.dimensions.width, target.dimensions.height) / 500,
    ),
  );
}

export function resolveLayoutStyle(input: ResolveLayoutStyleInput): {
  definition: LayoutStyleDefinition;
  tokens: ResolvedLayoutStyleTokens;
} {
  const styleId = resolveLayoutStyleId(
    input.layout,
    input.preferences,
    input.composition,
  );
  const definition = layoutStyleById.get(styleId)!;
  const scale = scaleFor(input.target);
  const treatment = styleId.endsWith("-outline")
    ? "outline"
    : styleId.endsWith("-soft") && !definition.baseline
      ? "soft"
      : styleId.endsWith("-bold")
        ? "bold"
        : styleId.endsWith("-glass")
          ? "glass"
          : styleId.endsWith("-editorial")
            ? "editorial"
            : styleId.endsWith("-framed")
              ? "framed"
              : "baseline";
  return {
    definition,
    tokens: {
      styleId,
      layout: input.layout,
      surfaceTreatment: treatment,
      borderWidth: Math.max(1, Math.round(scale)),
      ruleWidth: Math.max(1, Math.round(scale * 0.8)),
      radiusScale:
        treatment === "bold" ? 0.72 : treatment === "outline" ? 0.84 : 1,
    },
  };
}

function styleNode(
  node: RenderNode,
  style: ResolvedLayoutStyleTokens,
  theme: WallpaperThemeTokens,
): RenderNode {
  const { styleId, borderWidth, ruleWidth, radiusScale } = style;
  if (styleId.startsWith("minimal-")) {
    if (node.kind === "line" && node.id.startsWith("day-line-"))
      return {
        ...node,
        strokeWidth:
          styleId === "minimal-bold"
            ? Math.max(node.strokeWidth, ruleWidth * 1.5)
            : styleId === "minimal-editorial"
              ? Math.max(1, ruleWidth * 0.65)
              : node.strokeWidth,
        ...(styleId === "minimal-editorial"
          ? { lineCap: "square" as const }
          : {}),
      };
    if (node.kind === "text" && node.id.startsWith("day-")) {
      if (styleId === "minimal-bold") return { ...node, fontWeight: 800 };
      if (styleId === "minimal-editorial") {
        const fitted = fitText({
          text: node.text.toUpperCase(),
          width: node.width,
          preferredFontSize: node.fontSize,
          minimumFontSize: Math.max(8, node.fontSize * 0.78),
          maximumLines: 1,
          // Keep a conservative reserve for the actual uppercase font metrics.
          // This also makes the desktop headings settle at one consistent size.
          averageGlyphWidth: 0.72,
        });
        return {
          ...node,
          text: fitted.text,
          fontSize: fitted.fontSize,
          fontWeight: 600,
        };
      }
      return node;
    }
    if (
      node.kind === "text" &&
      node.id.startsWith("code-") &&
      styleId === "minimal-editorial"
    )
      return { ...node, fontWeight: 600 };
    if (
      node.kind === "text" &&
      node.id.startsWith("code-") &&
      styleId === "minimal-bold"
    )
      return { ...node, fontWeight: 800 };
  }

  if (node.kind === "rect" && node.id.startsWith("card-")) {
    if (styleId === "cards-outline")
      return {
        ...node,
        fill: mix(theme.background, node.fill ?? theme.surface, 0.07),
        stroke: mix(node.fill ?? theme.border, theme.foreground, 0.18),
        strokeWidth: borderWidth * 1.2,
        cornerRadius: (node.cornerRadius ?? 0) * radiusScale,
      };
    if (styleId === "cards-bold")
      return {
        ...node,
        stroke: mix(node.fill ?? theme.surface, theme.foreground, 0.45),
        strokeWidth: borderWidth,
        cornerRadius: (node.cornerRadius ?? 0) * radiusScale,
        shadowColor: theme.foreground,
        shadowBlur: borderWidth * 1.5,
        shadowOffset: { x: 0, y: borderWidth },
        shadowOpacity: 0.12,
      };
    if (styleId === "cards-glass")
      return {
        ...node,
        fill: withAlpha(
          mix(theme.surface, node.fill ?? theme.surface, 0.58),
          0.76,
        ),
        stroke: mix(node.fill ?? theme.border, theme.foreground, 0.3),
        strokeWidth: Math.max(1, borderWidth * 0.9),
        shadowColor: theme.foreground,
        shadowBlur: borderWidth * 3.5,
        shadowOffset: { x: 0, y: borderWidth * 1.25 },
        shadowOpacity: 0.13,
      };
  }

  if (node.kind === "rect" && node.id.startsWith("grid-block-")) {
    if (styleId === "grid-outline")
      return {
        ...node,
        fill: mix(theme.background, node.fill ?? theme.surface, 0.2),
        stroke: mix(node.fill ?? theme.border, theme.foreground, 0.2),
        strokeWidth: borderWidth * 1.2,
        cornerRadius: (node.cornerRadius ?? 0) * radiusScale,
      };
    if (styleId === "grid-soft")
      return {
        ...node,
        fill: mix(theme.background, node.fill ?? theme.surface, 0.64),
        stroke: mix(theme.background, node.stroke ?? theme.border, 0.55),
        strokeWidth: Math.max(1, borderWidth * 0.6),
      };
  }

  if (styleId.startsWith("planner-")) {
    if (node.kind === "rect" && node.id.startsWith("planner-panel-")) {
      if (styleId === "planner-soft")
        return {
          ...node,
          fill: mix(
            mix(theme.background, theme.plannerSurface, 0.78),
            theme.plannerRule,
            0.07,
          ),
          stroke: mix(theme.background, theme.plannerBorder, 0.38),
          shadowColor: theme.foreground,
          shadowBlur: borderWidth * 2,
          shadowOffset: { x: 0, y: borderWidth * 0.5 },
          shadowOpacity: 0.035,
        };
      if (styleId === "planner-editorial")
        return {
          ...node,
          fill: mix(theme.background, theme.plannerSurface, 0.08),
          stroke: mix(theme.background, theme.plannerBorder, 0.18),
          strokeWidth: 1,
          cornerRadius: 0,
        };
    }
    if (
      styleId === "planner-soft" &&
      node.kind === "line" &&
      node.id.startsWith("planner-entry-rule-")
    )
      return {
        ...node,
        stroke: mix(theme.background, theme.plannerRule, 0.32),
        strokeWidth: Math.max(1, ruleWidth * 0.5),
        opacity: 0.3,
      };
    if (
      styleId === "planner-soft" &&
      node.kind === "line" &&
      node.id.startsWith("planner-day-rule-")
    )
      return {
        ...node,
        stroke: mix(theme.background, theme.plannerRule, 0.46),
        strokeWidth: Math.max(1, ruleWidth * 0.65),
      };
    if (
      styleId === "planner-editorial" &&
      node.kind === "line" &&
      node.id.startsWith("planner-day-rule-")
    )
      return {
        ...node,
        stroke: theme.plannerRule,
        strokeWidth: Math.max(1.5, ruleWidth * 1.25),
      };
    if (
      styleId === "planner-editorial" &&
      node.kind === "line" &&
      node.id.startsWith("planner-entry-rule-")
    )
      return {
        ...node,
        stroke: mix(theme.background, theme.plannerRule, 0.62),
        strokeWidth: Math.max(1, ruleWidth * 0.65),
        opacity: 0.72,
      };
    if (
      styleId === "planner-editorial" &&
      node.kind === "text" &&
      node.id.startsWith("planner-day-")
    )
      return { ...node, text: node.text.toUpperCase(), fontWeight: 700 };
  }
  return node;
}

function styleLayer(
  layer: RenderLayer,
  style: ResolvedLayoutStyleTokens,
  theme: WallpaperThemeTokens,
): RenderLayer {
  if (style.styleId === "photo-framed" && layer.id === "photos") {
    const images = layer.nodes.filter(
      (node): node is Extract<RenderNode, { kind: "image" }> =>
        node.kind === "image" &&
        (node.id === "photo-hero-image" ||
          node.id.startsWith("photo-split-image-")),
    );
    if (images.length > 0) {
      const left = Math.min(...images.map((node) => node.geometry.x));
      const top = Math.min(...images.map((node) => node.geometry.y));
      const right = Math.max(
        ...images.map((node) => node.geometry.x + node.geometry.width),
      );
      const bottom = Math.max(
        ...images.map((node) => node.geometry.y + node.geometry.height),
      );
      const mat = style.borderWidth * 2;
      const photoRadius =
        images.length === 1 && typeof images[0]!.cornerRadius === "number"
          ? images[0]!.cornerRadius
          : style.borderWidth * 2.5;
      const frameGeometry = {
        x: left - mat,
        y: top - mat,
        width: right - left + mat * 2,
        height: bottom - top + mat * 2,
      };
      return {
        ...layer,
        nodes: [
          {
            id: "photo-framed-mat",
            kind: "rect",
            geometry: frameGeometry,
            fill: theme.surface,
            stroke: mix(theme.background, theme.foreground, 0.24),
            strokeWidth: Math.max(1, style.borderWidth * 0.65),
            cornerRadius: photoRadius + mat,
            shadowColor: theme.foreground,
            shadowBlur: style.borderWidth * 2.5,
            shadowOffset: { x: 0, y: style.borderWidth },
            shadowOpacity: 0.11,
          },
          ...layer.nodes.map((node) => styleNode(node, style, theme)),
          {
            id: "photo-framed-inner-edge",
            kind: "rect",
            geometry: {
              x: left,
              y: top,
              width: right - left,
              height: bottom - top,
            },
            stroke: mix(theme.background, theme.foreground, 0.18),
            strokeWidth: Math.max(1, style.borderWidth * 0.5),
            cornerRadius: photoRadius,
          },
        ],
      };
    }
  }
  const nodes = layer.nodes.flatMap((node): RenderNode[] => {
    const styled = styleNode(node, style, theme);
    if (
      style.styleId === "cards-glass" &&
      node.kind === "rect" &&
      node.id.startsWith("card-")
    ) {
      const radius = node.cornerRadius ?? 0;
      const inset = Math.max(style.borderWidth * 1.5, radius * 0.45);
      return [
        styled,
        {
          id: `${node.id}-glass-highlight`,
          kind: "line",
          points: [
            {
              x: node.geometry.x + inset,
              y: node.geometry.y + style.borderWidth,
            },
            {
              x: node.geometry.x + node.geometry.width - inset,
              y: node.geometry.y + style.borderWidth,
            },
          ],
          stroke: mix(node.fill ?? theme.surface, theme.foreground, 0.58),
          strokeWidth: Math.max(1, style.borderWidth * 0.5),
          lineCap: "round",
          opacity: 0.58,
        },
      ];
    }
    return [styled];
  });
  return { ...layer, nodes };
}

export function applyLayoutStyle(
  model: RenderModel,
  style: ResolvedLayoutStyleTokens,
  theme: WallpaperThemeTokens,
): RenderModel {
  if (style.surfaceTreatment === "baseline") return model;
  return {
    ...model,
    layers: model.layers.map((layer) =>
      styleLayer(layer, style, theme),
    ) as unknown as RenderModel["layers"],
  };
}
