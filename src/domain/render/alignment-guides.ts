import type { Point, Rect } from "./types";

export const GUIDE_SNAP_THRESHOLD_PX = 8;
export const GUIDE_RELEASE_THRESHOLD_PX = 14;

export type AlignmentGuides = {
  verticalCenter: boolean;
  horizontalCenter: boolean;
  verticalPosition?: number;
  horizontalPosition?: number;
  source?: "canvas-center" | "safe-area";
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
  anchors = { x: [], y: [] },
}: {
  proposedOrigin: Point;
  scheduleSize: { width: number; height: number };
  canvasSize: { width: number; height: number };
  positionRange: { minX: number; maxX: number; minY: number; maxY: number };
  previewScale: number;
  enabled: boolean;
  previous?: AlignmentGuides;
  anchors?: { x: readonly number[]; y: readonly number[] };
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
  const nearest = (value: number, values: readonly number[]) =>
    values
      .map((anchor) => ({ anchor, distance: Math.abs(value - anchor) }))
      .filter((item) => item.distance <= threshold)
      .toSorted((left, right) => left.distance - right.distance)[0];
  const xAnchor = verticalCenter ? undefined : nearest(proposed.x, anchors.x);
  const yAnchor = horizontalCenter ? undefined : nearest(proposed.y, anchors.y);
  const snappedX = verticalCenter
    ? centered.x
    : (xAnchor?.anchor ?? proposed.x);
  const snappedY = horizontalCenter
    ? centered.y
    : (yAnchor?.anchor ?? proposed.y);
  return {
    origin: {
      x: snappedX,
      y: snappedY,
    },
    guides: {
      verticalCenter,
      horizontalCenter,
      ...(verticalCenter || xAnchor ? { verticalPosition: snappedX } : {}),
      ...(horizontalCenter || yAnchor ? { horizontalPosition: snappedY } : {}),
      ...(verticalCenter || horizontalCenter
        ? { source: "canvas-center" as const }
        : xAnchor || yAnchor
          ? { source: "safe-area" as const }
          : {}),
    },
  };
}

export function scheduleRectAt(
  origin: Point,
  size: Pick<Rect, "width" | "height">,
): Rect {
  return { ...origin, ...size };
}
