import { stickerById } from "@/data/stickers/catalog";
import type { DeviceDimensions } from "@/domain/device/types";
import type { StickerInstance } from "./types";

export const MIN_STICKER_WIDTH_RATIO = 0.04;
export const MAX_STICKER_WIDTH_RATIO = 1.5;
export const MAX_STICKERS_PER_VARIANT = 50;

export function normalizeRotation(rotation: number): number {
  if (!Number.isFinite(rotation)) return 0;
  return ((((rotation + 180) % 360) + 360) % 360) - 180;
}

export function stickerAspectRatio(stickerId: string): number {
  const crop = stickerById.get(stickerId)?.crop;
  return crop ? crop.height / crop.width : 1;
}

export function stickerPixelGeometry(
  instance: StickerInstance,
  dimensions: DeviceDimensions,
) {
  const width = instance.widthRatio * dimensions.width;
  const height = width * stickerAspectRatio(instance.stickerId);
  return {
    x: instance.xRatio * dimensions.width - width / 2,
    y: instance.yRatio * dimensions.height - height / 2,
    width,
    height,
  };
}

export function clampStickerInstance(
  instance: StickerInstance,
  dimensions: DeviceDimensions,
): StickerInstance {
  const widthRatio = Math.min(
    MAX_STICKER_WIDTH_RATIO,
    Math.max(MIN_STICKER_WIDTH_RATIO, instance.widthRatio),
  );
  const heightRatio =
    (widthRatio * dimensions.width * stickerAspectRatio(instance.stickerId)) /
    dimensions.height;
  const visibleX = Math.min(widthRatio / 2, 0.04);
  const visibleY = Math.min(heightRatio / 2, 0.04);
  return {
    ...instance,
    widthRatio,
    xRatio: Math.min(
      1 + widthRatio / 2 - visibleX,
      Math.max(-widthRatio / 2 + visibleX, instance.xRatio),
    ),
    yRatio: Math.min(
      1 + heightRatio / 2 - visibleY,
      Math.max(-heightRatio / 2 + visibleY, instance.yRatio),
    ),
    rotation: normalizeRotation(instance.rotation),
  };
}
