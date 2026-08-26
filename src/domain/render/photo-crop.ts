import type { PhotoTransform } from "@/domain/device/types";
import type { Rect } from "./types";

export const PHOTO_ZOOM_MIN = 1;
export const PHOTO_ZOOM_MAX = 3;
export const DEFAULT_PHOTO_TRANSFORM: PhotoTransform = {
  position: { x: 0.5, y: 0.5 },
  scale: PHOTO_ZOOM_MIN,
  rotation: 0,
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0.5));
}

export function clampPhotoTransform(transform: PhotoTransform): PhotoTransform {
  return {
    position: {
      x: clamp01(transform.position.x),
      y: clamp01(transform.position.y),
    },
    scale: Math.min(
      PHOTO_ZOOM_MAX,
      Math.max(
        PHOTO_ZOOM_MIN,
        Number.isFinite(transform.scale) ? transform.scale : PHOTO_ZOOM_MIN,
      ),
    ),
    rotation: 0,
  };
}

export function resolvePhotoCoverCrop(
  source: { width: number; height: number },
  frame: { width: number; height: number },
  input: PhotoTransform,
): Rect {
  if (
    source.width <= 0 ||
    source.height <= 0 ||
    frame.width <= 0 ||
    frame.height <= 0
  )
    return { x: 0, y: 0, width: 0, height: 0 };
  const transform = clampPhotoTransform(input);
  const sourceAspect = source.width / source.height;
  const frameAspect = frame.width / frame.height;
  const baseWidth =
    sourceAspect > frameAspect ? source.height * frameAspect : source.width;
  const baseHeight =
    sourceAspect > frameAspect ? source.height : source.width / frameAspect;
  const width = Math.min(source.width, baseWidth / transform.scale);
  const height = Math.min(source.height, baseHeight / transform.scale);
  return {
    x: (source.width - width) * transform.position.x,
    y: (source.height - height) * transform.position.y,
    width,
    height,
  };
}

export function panPhotoTransform(
  input: PhotoTransform,
  source: { width: number; height: number },
  frame: { width: number; height: number },
  delta: { x: number; y: number },
): PhotoTransform {
  const transform = clampPhotoTransform(input);
  const crop = resolvePhotoCoverCrop(source, frame, transform);
  const overflowX = Math.max(0, source.width - crop.width);
  const overflowY = Math.max(0, source.height - crop.height);
  const sourceDeltaX = delta.x * (crop.width / Math.max(1, frame.width));
  const sourceDeltaY = delta.y * (crop.height / Math.max(1, frame.height));
  return clampPhotoTransform({
    ...transform,
    position: {
      x:
        overflowX === 0 ? 0.5 : transform.position.x - sourceDeltaX / overflowX,
      y:
        overflowY === 0 ? 0.5 : transform.position.y - sourceDeltaY / overflowY,
    },
  });
}
