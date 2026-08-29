"use client";

import type { RenderModel } from "@/domain/render";
import type { RenderAssetImages } from "./schedule-scene";

export type RenderAssetSourceEntry = readonly [assetId: string, source: string];

const staticImageCache = new Map<string, Promise<HTMLImageElement | null>>();
const warnedSources = new Set<string>();

export function renderAssetSourceEntries(
  model: RenderModel,
): readonly RenderAssetSourceEntry[] {
  const entries = new Map<string, string>();
  for (const layer of model.layers) {
    for (const node of layer.nodes) {
      if (node.kind === "image" && node.source)
        entries.set(node.assetId, node.source);
      if (node.kind === "rect" && node.emojiAssetId && node.emojiSource)
        entries.set(node.emojiAssetId, node.emojiSource);
    }
  }
  return [...entries.entries()];
}

export function renderAssetLoadSignature(model: RenderModel): string {
  return JSON.stringify(renderAssetSourceEntries(model));
}

function loadStaticImage(source: string): Promise<HTMLImageElement | null> {
  const cached = staticImageCache.get(source);
  if (cached) return cached;
  const pending = new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => {
      if (!warnedSources.has(source)) {
        warnedSources.add(source);
        console.warn(`ScheduleBud built-in artwork could not load: ${source}`);
      }
      resolve(null);
    };
    image.src = source;
  });
  staticImageCache.set(source, pending);
  return pending;
}

export async function loadRenderAssetSources(
  sources: readonly RenderAssetSourceEntry[],
): Promise<RenderAssetImages> {
  const entries = await Promise.all(
    sources.map(async ([assetId, source]) => {
      const image = await loadStaticImage(source);
      return image ? ([assetId, image] as const) : null;
    }),
  );
  return new Map(entries.filter((entry) => entry !== null));
}

export function loadRenderModelThemeAssets(
  model: RenderModel,
): Promise<RenderAssetImages> {
  return loadRenderAssetSources(renderAssetSourceEntries(model));
}

// Compatibility aliases for the partial theme-artwork implementation this replaced.
export const themeAssetSourceEntries = renderAssetSourceEntries;
export const themeAssetLoadSignature = renderAssetLoadSignature;
export const loadThemeAssetSources = loadRenderAssetSources;
export type ThemeAssetSourceEntry = RenderAssetSourceEntry;
