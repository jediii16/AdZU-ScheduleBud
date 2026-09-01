import type Konva from "konva";
import { deviceDimensionsSchema } from "@/domain/device/types";
import type { LayoutId } from "@/domain/design/types";
import type { AvailablePhotoComposition, RenderModel } from "@/domain/render";
import { ensureRenderModelFonts } from "@/renderer/konva/font-loading";
import type { RenderAssetImages } from "@/renderer/konva/schedule-scene";

export type ExportStatus =
  "idle" | "preparing" | "exporting" | "success" | "error";
export type ExportContent = "wallpaper" | "schedule" | "background";

export type ExportPreparationFailure = "dimensions" | "font" | "asset";

export class ExportPreparationError extends Error {
  constructor(
    readonly failure: ExportPreparationFailure,
    message: string,
  ) {
    super(message);
    this.name = "ExportPreparationError";
  }
}

export function photoExportBlockReason(
  layoutId: LayoutId,
  photoAssetCount: number,
  composition: AvailablePhotoComposition = "hero",
): string | null {
  if (layoutId !== "photo") return null;
  if (photoAssetCount === 0)
    return "Add a photo in Design before exporting this Photo wallpaper.";
  if (composition === "polaroid" && photoAssetCount > 4)
    return "Polaroid supports a maximum of 4 photos.";
  return null;
}

export class PngExportCoordinator {
  private running = false;

  get busy(): boolean {
    return this.running;
  }

  async run<T>(operation: () => Promise<T>): Promise<T | null> {
    if (this.running) return null;
    this.running = true;
    try {
      return await operation();
    } finally {
      this.running = false;
    }
  }
}

export function sanitizeFilenamePart(value: string, maximumLength = 80): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maximumLength)
    .replace(/-$/g, "");
}

export function schedulebudPngFilename(
  projectName?: string | null,
  targetLabel?: string | null,
  content: ExportContent = "wallpaper",
): string {
  const project = sanitizeFilenamePart(projectName ?? "", 72);
  const target = sanitizeFilenamePart(targetLabel ?? "", 48);
  const contentSuffix = content === "wallpaper" ? "" : content;
  const suffix = [project, target, contentSuffix].filter(Boolean).join("-");
  return `schedulebud-${suffix || "wallpaper"}.png`;
}

export function schedulebudZipFilename(
  projectName?: string | null,
  content: ExportContent = "wallpaper",
): string {
  const project = sanitizeFilenamePart(projectName ?? "", 72);
  const contentSuffix = content === "wallpaper" ? "wallpapers" : content;
  return `schedulebud-${[project, contentSuffix, "all-sizes"].filter(Boolean).join("-")}.zip`;
}

export function uniqueArchiveFilename(
  filename: string,
  used: ReadonlySet<string>,
): string {
  if (!used.has(filename)) return filename;
  const extensionIndex = filename.lastIndexOf(".");
  const base = extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename;
  const extension = extensionIndex > 0 ? filename.slice(extensionIndex) : "";
  let copy = 2;
  while (used.has(`${base}-${copy}${extension}`)) copy += 1;
  return `${base}-${copy}${extension}`;
}

/** Compatibility wrapper for callers that already supply a complete base name. */
export function sanitizePngFilename(filename: string): string {
  const base = sanitizeFilenamePart(filename.replace(/\.png$/i, ""));
  return `${base || "schedulebud-wallpaper"}.png`;
}

export function requiredRenderAssetIds(model: RenderModel): readonly string[] {
  const ids = new Set<string>();
  for (const layer of model.layers)
    for (const node of layer.nodes) {
      if (node.kind === "image") ids.add(node.assetId);
      if (node.kind === "rect" && node.emojiAssetId)
        ids.add(node.emojiAssetId);
    }
  return [...ids];
}

export function renderModelForExportContent(
  model: RenderModel,
  content: ExportContent,
): RenderModel {
  if (content === "wallpaper") return model;
  const nodesFor = (layer: RenderModel["layers"][number]) =>
    content === "schedule"
      ? layer.id === "schedule"
        ? layer.nodes
        : []
      : layer.id === "schedule"
        ? []
        : layer.nodes;
  const [background, scenery, photos, schedule, foreground] = model.layers;
  return {
    ...model,
    layers: [
      { ...background, nodes: nodesFor(background) },
      { ...scenery, nodes: nodesFor(scenery) },
      { ...photos, nodes: nodesFor(photos) },
      { ...schedule, nodes: nodesFor(schedule) },
      { ...foreground, nodes: nodesFor(foreground) },
    ],
  };
}

function bounded<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error("Export preparation timed out.")),
      timeoutMs,
    );
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function preparePngExport({
  model,
  availableAssets,
  resolveAssets,
  ensureFonts = ensureRenderModelFonts,
  timeoutMs = 10_000,
}: {
  model: RenderModel;
  availableAssets?: RenderAssetImages;
  resolveAssets?: (
    assetIds: readonly string[],
  ) => Promise<RenderAssetImages>;
  ensureFonts?: (model: RenderModel) => Promise<void>;
  timeoutMs?: number;
}): Promise<RenderAssetImages> {
  if (
    !deviceDimensionsSchema.safeParse({
      width: model.width,
      height: model.height,
    }).success
  )
    throw new ExportPreparationError(
      "dimensions",
      "The selected wallpaper dimensions are not valid for export.",
    );

  try {
    await bounded(ensureFonts(model), timeoutMs);
  } catch {
    throw new ExportPreparationError(
      "font",
      "A font failed to load. Try again.",
    );
  }

  const assets = new Map(availableAssets ?? []);
  const missing = requiredRenderAssetIds(model).filter(
    (assetId) => !assets.has(assetId),
  );
  if (missing.length > 0 && resolveAssets) {
    try {
      const resolved = await bounded(resolveAssets(missing), timeoutMs);
      for (const entry of resolved) assets.set(...entry);
    } catch {
      throw new ExportPreparationError(
        "asset",
        "Wallpaper artwork could not be loaded. Try again.",
      );
    }
  }
  const unresolved = requiredRenderAssetIds(model).filter(
    (assetId) => !assets.has(assetId),
  );
  if (unresolved.length > 0)
    throw new ExportPreparationError(
      "asset",
      "Wallpaper artwork could not be loaded. Try again.",
    );
  return assets;
}

export async function exportStagePng(
  stage: Konva.Stage,
  model: RenderModel,
  filename: string,
): Promise<void> {
  const blob = await stagePngBlob(stage, model);
  downloadBlob(blob, sanitizePngFilename(filename));
}

export async function stagePngBlob(
  stage: Konva.Stage,
  model: RenderModel,
): Promise<Blob> {
  stage.batchDraw();
  if (stage.width() !== model.width || stage.height() !== model.height)
    throw new Error(
      "The export stage does not match the selected target size.",
    );
  const dataUrl = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
  return (await fetch(dataUrl)).blob();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function createPngZip(
  files: ReadonlyMap<string, Blob>,
): Promise<Blob> {
  const { zip } = await import("fflate");
  const entries = Object.fromEntries(
    await Promise.all(
      [...files].map(async ([filename, blob]) => [
        filename,
        new Uint8Array(await blob.arrayBuffer()),
      ]),
    ),
  );
  const archive = await new Promise<Uint8Array>((resolve, reject) => {
    zip(entries, { level: 0 }, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
  const bytes = new Uint8Array(archive.byteLength);
  bytes.set(archive);
  return new Blob([bytes.buffer], { type: "application/zip" });
}
