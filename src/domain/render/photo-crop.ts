import type { DeviceVariant, PhotoTransform } from "@/domain/device/types";
import type { PhotoComposition } from "@/domain/design/types";
import type { Rect } from "./types";

export const PHOTO_ZOOM_MIN = 1;
export const PHOTO_ZOOM_MAX = 3;
export const DEFAULT_PHOTO_TRANSFORM: PhotoTransform = {
  position: { x: 0.5, y: 0.5 },
  scale: PHOTO_ZOOM_MIN,
  rotation: 0,
};

export type AvailablePhotoComposition = Extract<
  PhotoComposition,
  "hero" | "split" | "polaroid"
>;

export const AVAILABLE_PHOTO_COMPOSITIONS: readonly AvailablePhotoComposition[] =
  ["hero", "split", "polaroid"];

export function resolveAvailablePhotoComposition(
  value: PhotoComposition | null,
): AvailablePhotoComposition {
  return value === "split" || value === "polaroid" ? value : "hero";
}

export function photoTransformFor(
  variant: DeviceVariant,
  composition: AvailablePhotoComposition,
  assetId: string,
): PhotoTransform {
  return (
    variant.photoTransforms[composition][assetId] ?? DEFAULT_PHOTO_TRANSFORM
  );
}

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
    !Number.isFinite(source.width) ||
    !Number.isFinite(source.height) ||
    !Number.isFinite(frame.width) ||
    !Number.isFinite(frame.height) ||
    source.width <= 0 ||
    source.height <= 0 ||
    frame.width <= 0 ||
    frame.height <= 0
  )
    return { x: 0, y: 0, width: 0, height: 0 };
  const transform = clampPhotoTransform(input);
  const sourceAspect = source.width / source.height;
  const frameAspect = frame.width / frame.height;
  let width: number;
  let height: number;
  if (sourceAspect >= frameAspect) {
    height = source.height / transform.scale;
    width = height * frameAspect;
  } else {
    width = source.width / transform.scale;
    height = width / frameAspect;
  }
  width = Math.min(source.width, Math.max(Number.EPSILON, width));
  height = Math.min(source.height, Math.max(Number.EPSILON, height));
  const overflowX = Math.max(0, source.width - width);
  const overflowY = Math.max(0, source.height - height);
  const rawX = Math.min(
    overflowX,
    Math.max(0, overflowX * transform.position.x),
  );
  const rawY = Math.min(
    overflowY,
    Math.max(0, overflowY * transform.position.y),
  );
  const boundScale = Math.min(
    1,
    (source.width - rawX) / width,
    (source.height - rawY) / height,
  );
  width *= boundScale;
  height *= boundScale;
  const x = Math.min(source.width - width, Math.max(0, rawX));
  const y = Math.min(source.height - height, Math.max(0, rawY));
  return {
    x,
    y,
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
