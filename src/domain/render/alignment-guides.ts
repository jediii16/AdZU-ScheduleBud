import type { Point, Rect } from "./types";

export const GUIDE_SNAP_THRESHOLD_PX = 8;
export const GUIDE_RELEASE_THRESHOLD_PX = 14;

export type AlignmentGuides = {
  verticalCenter: boolean;
  horizontalCenter: boolean;
};

export type AlignmentSnapResult = {
  origin: Point;
  guides: AlignmentGuides;
};

export function resolveAlignmentSnap({
  proposedOrigin,
  scheduleSize,
  canvasSize,
  positionRange,
  previewScale,
  enabled,
  previous = { verticalCenter: false, horizontalCenter: false },
}: {
  proposedOrigin: Point;
  scheduleSize: { width: number; height: number };
  canvasSize: { width: number; height: number };
  positionRange: { minX: number; maxX: number; minY: number; maxY: number };
  previewScale: number;
  enabled: boolean;
  previous?: AlignmentGuides;
}): AlignmentSnapResult {
  const clamp = (value: number, minimum: number, maximum: number) =>
    Math.min(maximum, Math.max(minimum, value));
  const proposed = {
    x: clamp(proposedOrigin.x, positionRange.minX, positionRange.maxX),
    y: clamp(proposedOrigin.y, positionRange.minY, positionRange.maxY),
  };
  if (!enabled)
    return {
      origin: proposed,
      guides: { verticalCenter: false, horizontalCenter: false },
    };
  const scale = Math.max(0.001, previewScale);
  const threshold = GUIDE_SNAP_THRESHOLD_PX / scale;
  const releaseThreshold = GUIDE_RELEASE_THRESHOLD_PX / scale;
  const centered = {
    x: canvasSize.width / 2 - scheduleSize.width / 2,
    y: canvasSize.height / 2 - scheduleSize.height / 2,
  };
  const verticalCenter =
    Math.abs(proposed.x - centered.x) <=
    (previous.verticalCenter ? releaseThreshold : threshold);
  const horizontalCenter =
    Math.abs(proposed.y - centered.y) <=
    (previous.horizontalCenter ? releaseThreshold : threshold);
  return {
    origin: {
      x: verticalCenter ? centered.x : proposed.x,
      y: horizontalCenter ? centered.y : proposed.y,
    },
    guides: { verticalCenter, horizontalCenter },
  };
}

export function scheduleRectAt(
  origin: Point,
  size: Pick<Rect, "width" | "height">,
): Rect {
  return { ...origin, ...size };
}
