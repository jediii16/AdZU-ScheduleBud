import {
  resolveTypographyPreset,
  type SemanticFontWeight,
  type TypographyPreset,
  type TypographyPresetId,
} from "@/data/typography/registry";
import { fontRegistry, type FontId } from "@/lib/font-registry";
import type {
  RenderLayer,
  RenderModel,
  RenderNode,
  TextRenderNode,
} from "./types";

export function isWallpaperTitleNode(node: TextRenderNode): boolean {
  return (
    node.id === "wallpaper-title" ||
    node.id === "planner-title" ||
    /^photo-(hero|split|polaroid)-title$/.test(node.id)
  );
}

export function resolveAvailableWeight(
  fontId: FontId,
  requested: SemanticFontWeight,
): SemanticFontWeight {
  const available = fontRegistry[fontId].availableWeights;
  return available.reduce(
    (best, candidate) =>
      Math.abs(candidate - requested) < Math.abs(best - requested)
        ? candidate
        : best,
    available[0]!,
  ) as SemanticFontWeight;
}

const FONT_WIDTH_SCALE: Partial<Record<FontId, number>> = {
  "body-sans": 1,
  inter: 0.99,
  "dm-sans": 1.01,
  "source-sans-3": 0.96,
  manrope: 1.04,
};

function glyphWidth(character: string): number {
  if (/\s/.test(character)) return 0.34;
  if (/[1Ilitfj.,:;'|!]/.test(character)) return 0.33;
  if (/[MW@%&]/.test(character)) return 0.9;
  if (/[A-Z]/.test(character)) return 0.68;
  if (/[0-9]/.test(character)) return 0.62;
  if (/[a-z]/.test(character)) return 0.56;
  if (/[–—-]/.test(character)) return 0.55;
  return 0.6;
}

export function estimateTextWidthForFont(
  text: string,
  fontSize: number,
  fontId: FontId,
  fontWeight: SemanticFontWeight = 400,
  letterSpacing = 0,
): number {
  const units = [...text].reduce(
    (total, character) => total + glyphWidth(character),
    0,
  );
  const weightScale = fontWeight >= 700 ? 1.02 : 1;
  return (
    units * fontSize * (FONT_WIDTH_SCALE[fontId] ?? 1) * weightScale +
    Math.max(0, text.length - 1) * letterSpacing
  );
}

function fitFunctionalNode(node: TextRenderNode): TextRenderNode {
  if (node.wrap === "character" || node.text.includes("\n")) return node;
  const fontWeight = (node.fontWeight ?? 400) as SemanticFontWeight;
  const estimatedWidth = estimateTextWidthForFont(
    node.text,
    node.fontSize,
    node.fontId,
    fontWeight,
    node.letterSpacing ?? 0,
  );
  const safeWidth = Math.max(1, node.width - Math.max(1, node.fontSize * 0.08));
  const scale = Math.min(1, safeWidth / Math.max(1, estimatedWidth));
  return {
    ...node,
    fontSize: node.fontSize * scale,
    wrap: "none",
  };
}

function safeTitleScale(
  node: TextRenderNode,
  preset: TypographyPreset,
): number {
  const requested = preset.titleScale ?? 1;
  if (!node.text.trim()) return requested;
  const glyphUnits = [...node.text].reduce(
    (total, character) =>
      total + (character === " " ? 0.36 : character === "\n" ? 0 : 1),
    0,
  );
  const estimatedWidth =
    glyphUnits * node.fontSize * (preset.titleAverageGlyphWidth ?? 0.58);
  const swashReserve = node.fontSize * 0.8;
  return Math.min(
    requested,
    node.width / Math.max(1, estimatedWidth + swashReserve),
  );
}

function applyNodeTypography(
  node: RenderNode,
  presetId: TypographyPresetId,
): RenderNode {
  if (node.kind !== "text" || node.fontId === "caption-hand") return node;
  const preset = resolveTypographyPreset(presetId);
  if (isWallpaperTitleNode(node)) {
    const scale = safeTitleScale(node, preset);
    const fontSize = node.fontSize * scale;
    return {
      ...node,
      fontId: preset.titleFont,
      fontSize,
      fontWeight: resolveAvailableWeight(preset.titleFont, preset.titleWeight),
      ...(preset.titleLineHeight ? { lineHeight: preset.titleLineHeight } : {}),
      ...(preset.titleTracking ? { letterSpacing: preset.titleTracking } : {}),
      ...(node.height === undefined
        ? {}
        : {
            height: Math.max(
              node.height,
              fontSize * (preset.titleLineHeight ?? 1.12),
            ),
          }),
    };
  }
  const requested = (node.fontWeight ?? 400) as SemanticFontWeight;
  return fitFunctionalNode({
    ...node,
    fontId: preset.scheduleFont,
    fontWeight: resolveAvailableWeight(
      preset.scheduleFont,
      preset.scheduleWeights[requested] ?? requested,
    ),
  });
}

export function applyTypographyPreset(
  model: RenderModel,
  presetId: TypographyPresetId,
): RenderModel {
  // Backward compatibility is stronger than normalization for the baseline:
  // retain the exact pre-8H title, weekday, and detail font assignments.
  if (presetId === "schedulebud") return model;
  return {
    ...model,
    layers: model.layers.map((layer): RenderLayer => ({
      ...layer,
      nodes: layer.nodes.map((node) => applyNodeTypography(node, presetId)),
    })) as unknown as RenderModel["layers"],
  };
}
