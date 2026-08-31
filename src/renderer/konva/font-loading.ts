import { fontRegistry, type FontId } from "@/lib/font-registry";
import type { RenderModel } from "@/domain/render";

const loadedFontRequests = new Set<string>();
const pendingFontRequests = new Map<string, Promise<void>>();

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

function renderModelFontDescriptors(model: RenderModel): readonly string[] {
  const descriptors = new Set<string>();
  for (const layer of model.layers)
    for (const node of layer.nodes)
      if (node.kind === "text")
        descriptors.add(
          `${node.fontId}|${node.fontWeight ?? 400}|${node.fontStyle ?? "normal"}`,
        );
  return [...descriptors].sort();
}

function fontRequestForDescriptor(descriptor: string): string {
  const [fontId, weight, style] = descriptor.split("|");
  return `${style} ${weight} 16px ${fontFamilyForId(fontId as FontId)}`;
}

export function renderModelFontRequests(model: RenderModel): readonly string[] {
  return renderModelFontDescriptors(model).map(fontRequestForDescriptor);
}

export function renderModelFontSignature(model: RenderModel): string {
  return JSON.stringify(renderModelFontDescriptors(model));
}

export async function ensureFontRequests(
  requests: readonly string[],
): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(
    requests.map((request) => {
      if (loadedFontRequests.has(request)) return Promise.resolve();
      const pending = pendingFontRequests.get(request);
      if (pending) return pending;
      const loading = document.fonts
        .load(request, "ScheduleBud ñ é á")
        .then((faces) => {
          if (
            faces.length === 0 ||
            !document.fonts.check(request, "ScheduleBud ñ é á")
          )
            throw new Error(`Typography font failed to load: ${request}`);
          loadedFontRequests.add(request);
        })
        .finally(() => pendingFontRequests.delete(request));
      pendingFontRequests.set(request, loading);
      return loading;
    }),
  );
  await document.fonts.ready;
}

export function ensureRenderModelFonts(model: RenderModel): Promise<void> {
  return ensureFontRequests(renderModelFontRequests(model));
}

export function ensureRenderModelFontSignature(
  signature: string,
): Promise<void> {
  const descriptors = JSON.parse(signature) as string[];
  return ensureFontRequests(descriptors.map(fontRequestForDescriptor));
}
