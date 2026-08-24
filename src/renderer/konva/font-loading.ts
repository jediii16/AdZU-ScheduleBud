import { fontRegistry, type FontId } from "@/lib/font-registry";
import type { RenderModel } from "@/domain/render";

export function fontFamilyForId(fontId: FontId): string {
  const definition = fontRegistry[fontId];
  if (typeof document !== "undefined") {
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue(definition.cssVariable)
      .trim();
    if (resolved) return resolved;
  }
  return `"${definition.label.replace(" (placeholder)", "")}"`;
}

export async function ensureRenderModelFonts(
  model: RenderModel,
): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const requests = new Set<string>();
  for (const layer of model.layers)
    for (const node of layer.nodes)
      if (node.kind === "text")
        requests.add(
          `${node.fontWeight ?? 400} ${node.fontSize}px ${fontFamilyForId(node.fontId)}`,
        );
  await Promise.all([...requests].map((font) => document.fonts.load(font)));
  await document.fonts.ready;
}
