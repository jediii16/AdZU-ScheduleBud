import type Konva from "konva";
import type { LayoutId } from "@/domain/design/types";
import type { AvailablePhotoComposition, RenderModel } from "@/domain/render";
import { ensureRenderModelFonts } from "@/renderer/konva/font-loading";

export type ExportStatus =
  "idle" | "preparing" | "exporting" | "downloaded" | "error";

export function photoExportBlockReason(
  layoutId: LayoutId,
  photoAssetCount: number,
  composition: AvailablePhotoComposition = "hero",
): string | null {
  if (layoutId !== "photo") return null;
  if (photoAssetCount === 0)
    return "Add a photo in Design before exporting this Photo wallpaper.";
  if (composition === "polaroid" && photoAssetCount !== 4)
    return "Polaroid requires exactly 4 photos before export.";
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

export function sanitizePngFilename(filename: string): string {
  const base = filename
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${base || "adzu-schedule"}.png`;
}

export async function exportStagePng(
  stage: Konva.Stage,
  model: RenderModel,
  filename: string,
): Promise<void> {
  await ensureRenderModelFonts(model);
  if (stage.width() !== model.width || stage.height() !== model.height)
    throw new Error(
      "The export stage does not match the selected target size.",
    );
  const dataUrl = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
  const blob = await (await fetch(dataUrl)).blob();
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = sanitizePngFilename(filename.replace(/\.png$/i, ""));
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
