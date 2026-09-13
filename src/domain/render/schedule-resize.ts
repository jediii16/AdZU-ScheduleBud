import {
  MIN_SCHEDULE_SIZE_RATIO,
  type DeviceVariant,
  type ScheduleSize,
} from "@/domain/device/types";
import type {
  Point,
  Rect,
  RenderNode,
  ScheduleRenderResult,
  TextRenderNode,
} from "./types";

export const SCHEDULE_READABILITY_SCALE_THRESHOLD = 0.62;

export const PHONE_SCHEDULE_FRAME = {
  left: 0.12,
  top: 0.3,
  right: 0.12,
  bottom: 0.09,
} as const;

const SQUARE_SCHEDULE_MARGIN_RATIO = 0.05;

type ResizeTransform = {
  source: Rect;
  target: Rect;
  scaleX: number;
  scaleY: number;
  fontScale: number;
};

type LayoutEntry = Record<string, unknown> & {
  bounds?: Rect;
  gridBounds?: Rect;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type ResizableMetadata = {
  typography?: Record<string, number>;
  dayLayout?: readonly LayoutEntry[];
  classLayout?: readonly LayoutEntry[];
  bandLayout?: readonly LayoutEntry[];
  blockLayout?: readonly LayoutEntry[];
  photoCells?: readonly LayoutEntry[];
  polaroids?: readonly (LayoutEntry & {
    paper?: Rect;
    image?: Rect;
    captionBounds?: Rect | null;
  })[];
  scheduleRegion?: Rect;
  photoMosaicGap?: number;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function transformPoint(point: Point, transform: ResizeTransform): Point {
  return {
    x: transform.target.x + (point.x - transform.source.x) * transform.scaleX,
    y: transform.target.y + (point.y - transform.source.y) * transform.scaleY,
  };
}

function transformRect(rect: Rect, transform: ResizeTransform): Rect {
  return {
    ...transformPoint(rect, transform),
    width: rect.width * transform.scaleX,
    height: rect.height * transform.scaleY,
  };
}

function transformRadius(
  value: number | readonly [number, number, number, number] | undefined,
  scale: number,
) {
  if (value === undefined) return undefined;
  return typeof value === "number"
    ? value * scale
    : (value.map((radius) => radius * scale) as [
        number,
        number,
        number,
        number,
      ]);
}

function transformNode(
  node: RenderNode,
  transform: ResizeTransform,
): RenderNode {
  if (node.kind === "text")
    return {
      ...node,
      position: transformPoint(node.position, transform),
      width: node.width * transform.scaleX,
      ...(node.height === undefined
        ? {}
        : { height: node.height * transform.scaleY }),
      fontSize: node.fontSize * transform.fontScale,
      ...(node.letterSpacing === undefined
        ? {}
        : { letterSpacing: node.letterSpacing * transform.fontScale }),
    };
  if (node.kind === "line")
    return {
      ...node,
      points: node.points.map((point) => transformPoint(point, transform)),
      strokeWidth: node.strokeWidth * transform.fontScale,
      ...(node.dash
        ? {
            dash: node.dash.map((value) => value * transform.fontScale),
          }
        : {}),
    };
  if (node.kind === "rect")
    return {
      ...node,
      geometry: transformRect(node.geometry, transform),
      ...(node.strokeWidth === undefined
        ? {}
        : { strokeWidth: node.strokeWidth * transform.fontScale }),
      ...(node.cornerRadius === undefined
        ? {}
        : { cornerRadius: node.cornerRadius * transform.fontScale }),
      ...(node.shadowBlur === undefined
        ? {}
        : { shadowBlur: node.shadowBlur * transform.fontScale }),
      ...(node.shadowOffset === undefined
        ? {}
        : {
            shadowOffset: {
              x: node.shadowOffset.x * transform.scaleX,
              y: node.shadowOffset.y * transform.scaleY,
            },
          }),
    };
  const cornerRadius = transformRadius(node.cornerRadius, transform.fontScale);
  const imageNode = { ...node };
  // A cover image must be cropped again for its reshaped frame. Keeping an
  // old source crop would stretch the image when only one axis changes.
  if (imageNode.fit === "cover") delete imageNode.crop;
  return {
    ...imageNode,
    geometry: transformRect(node.geometry, transform),
    ...(cornerRadius === undefined ? {} : { cornerRadius }),
  };
}

const CARD_TEXT_ROLES = ["code", "time", "support", "professor"] as const;

function textBoxHeight(node: TextRenderNode) {
  return node.height ?? node.fontSize * (node.lineHeight ?? 1.2);
}

/**
 * Card text should respond to vertical compression instead of becoming
 * uniformly tiny. Preserve the horizontal type scale, remove lower-priority
 * details as each card runs out of height, and keep the remaining block
 * vertically centered. The removal order is professor, room/section, time,
 * then the subject code remains by itself.
 */
function adaptCardsToVerticalSpace(
  sourceNodes: readonly RenderNode[],
  resizedNodes: readonly RenderNode[],
  transform: ResizeTransform,
): RenderNode[] {
  const contentScale = Math.min(1, transform.scaleX);
  if (transform.scaleY >= contentScale - 0.001) return [...resizedNodes];

  const sourceById = new Map(sourceNodes.map((node) => [node.id, node]));
  const resizedById = new Map(resizedNodes.map((node) => [node.id, node]));
  const replacements = new Map<string, RenderNode>();

  for (const sourceCard of sourceNodes) {
    if (sourceCard.kind !== "rect" || !sourceCard.id.startsWith("card-"))
      continue;

    const cardKey = sourceCard.id.slice("card-".length);
    const resizedCard = resizedById.get(sourceCard.id);
    if (resizedCard?.kind !== "rect") continue;

    const entries = CARD_TEXT_ROLES.flatMap((role) => {
      const id = `${role}-${cardKey}`;
      const source = sourceById.get(id);
      const resized = resizedById.get(id);
      return source?.kind === "text" && resized?.kind === "text"
        ? [{ role, source, resized }]
        : [];
    });
    const code = entries.find((entry) => entry.role === "code");
    if (!code) continue;

    const detail = entries.find((entry) => entry.role !== "code");
    const sourceGap = detail
      ? Math.max(
          0,
          detail.source.position.y -
            (code.source.position.y + textBoxHeight(code.source)),
        )
      : 0;
    const detailGap = sourceGap * transform.scaleY;
    const scaledHeight = (
      entry: (typeof entries)[number],
      scale = contentScale,
    ) => textBoxHeight(entry.source) * scale;
    const blockHeight = (
      visible: readonly (typeof entries)[number][],
      codeScale = contentScale,
    ) =>
      visible.reduce(
        (height, entry) =>
          height +
          scaledHeight(entry, entry.role === "code" ? codeScale : contentScale),
        visible.length > 1 ? detailGap : 0,
      );

    const availableHeight = Math.max(1, resizedCard.geometry.height);
    const visible = [...entries];
    while (visible.length > 1 && blockHeight(visible) > availableHeight)
      visible.pop();

    const codeScale =
      visible.length === 1
        ? Math.min(contentScale, availableHeight / textBoxHeight(code.source))
        : contentScale;
    const visibleIds = new Set(visible.map((entry) => entry.resized.id));
    const visibleHeight = blockHeight(visible, codeScale);
    let cursor =
      resizedCard.geometry.y +
      Math.max(0, (resizedCard.geometry.height - visibleHeight) / 2);
    let detailGapApplied = false;

    for (const entry of entries) {
      if (!visibleIds.has(entry.resized.id)) {
        replacements.set(entry.resized.id, {
          ...entry.resized,
          visible: false,
        });
        continue;
      }

      if (entry.role !== "code" && !detailGapApplied) {
        cursor += detailGap;
        detailGapApplied = true;
      }
      const scale = entry.role === "code" ? codeScale : contentScale;
      const height = scaledHeight(entry, scale);
      replacements.set(entry.resized.id, {
        ...entry.resized,
        position: { ...entry.resized.position, y: cursor },
        height,
        fontSize: entry.source.fontSize * scale,
        ...(entry.source.letterSpacing === undefined
          ? {}
          : { letterSpacing: entry.source.letterSpacing * scale }),
      });
      cursor += height;
    }
  }

  return resizedNodes.map((node) => replacements.get(node.id) ?? node);
}

function transformLayoutEntry(
  entry: LayoutEntry,
  transform: ResizeTransform,
): LayoutEntry {
  const next: LayoutEntry = { ...entry };
  if (entry.bounds) next.bounds = transformRect(entry.bounds, transform);
  if (entry.gridBounds)
    next.gridBounds = transformRect(entry.gridBounds, transform);
  if (
    typeof entry.x === "number" &&
    typeof entry.y === "number" &&
    typeof entry.width === "number" &&
    typeof entry.height === "number"
  ) {
    const rect = transformRect(
      {
        x: entry.x,
        y: entry.y,
        width: entry.width,
        height: entry.height,
      },
      transform,
    );
    Object.assign(next, rect);
  }
  if (typeof entry.dayWidth === "number")
    next.dayWidth = entry.dayWidth * transform.scaleX;
  if (typeof entry.pixelsPerMinute === "number")
    next.pixelsPerMinute = entry.pixelsPerMinute * transform.scaleY;
  return next;
}

function transformMetadata<T extends ScheduleRenderResult>(
  result: T,
  transform: ResizeTransform,
): T {
  const source = result as T & ResizableMetadata;
  const transformed = { ...source } as T & ResizableMetadata;
  for (const key of [
    "dayLayout",
    "classLayout",
    "bandLayout",
    "blockLayout",
    "photoCells",
  ] as const) {
    const entries = source[key];
    if (entries)
      transformed[key] = entries.map((entry) =>
        transformLayoutEntry(entry, transform),
      );
  }
  if (source.typography)
    transformed.typography = Object.fromEntries(
      Object.entries(source.typography).map(([key, value]) => [
        key,
        value * transform.fontScale,
      ]),
    );
  if (source.scheduleRegion)
    transformed.scheduleRegion = transformRect(
      source.scheduleRegion,
      transform,
    );
  if (source.photoMosaicGap !== undefined)
    transformed.photoMosaicGap = source.photoMosaicGap * transform.fontScale;
  if (source.polaroids)
    transformed.polaroids = source.polaroids.map((polaroid) => ({
      ...transformLayoutEntry(polaroid, transform),
      ...(polaroid.paper
        ? { paper: transformRect(polaroid.paper, transform) }
        : {}),
      ...(polaroid.image
        ? { image: transformRect(polaroid.image, transform) }
        : {}),
      ...(polaroid.captionBounds
        ? {
            captionBounds: transformRect(polaroid.captionBounds, transform),
          }
        : {}),
    }));
  return transformed;
}

export function phoneScheduleFrame(
  model: Pick<ScheduleRenderResult["model"], "width" | "height">,
): Rect {
  return {
    x: model.width * PHONE_SCHEDULE_FRAME.left,
    y: model.height * PHONE_SCHEDULE_FRAME.top,
    width:
      model.width *
      (1 - PHONE_SCHEDULE_FRAME.left - PHONE_SCHEDULE_FRAME.right),
    height:
      model.height *
      (1 - PHONE_SCHEDULE_FRAME.top - PHONE_SCHEDULE_FRAME.bottom),
  };
}

/**
 * Phone wallpapers reserve their upper portion for lock-screen chrome. Scale
 * schedule-first layouts for a compact, readable default below the clock while
 * retaining a full-canvas position range. Photo layouts deliberately skip this
 * transform so artwork can continue behind the clock.
 */
export function fitScheduleIntoPhoneFrame<T extends ScheduleRenderResult>(
  result: T,
  variant: DeviceVariant,
  balancedY: number,
): T {
  if (variant.category !== "phone" || variant.orientation !== "portrait")
    return result;

  const natural = result.scheduleBounds;
  const frame = phoneScheduleFrame(result.model);
  const scale = Math.min(
    1,
    frame.width / Math.max(1, natural.width),
    frame.height / Math.max(1, natural.height),
  );
  const width = natural.width * scale;
  const height = natural.height * scale;
  const rightInset = Math.max(
    0,
    result.model.width -
      (result.positionRange.maxX + result.scheduleBounds.width),
  );
  const bottomInset = Math.max(
    0,
    result.model.height -
      (result.positionRange.maxY + result.scheduleBounds.height),
  );
  const minX = result.positionRange.minX;
  const minY = result.positionRange.minY;
  const maxX = Math.max(minX, result.model.width - rightInset - width);
  const maxY = Math.max(minY, result.model.height - bottomInset - height);
  const balancedTop = clamp(frame.y, minY, maxY);
  const normalizedBalancedY = clamp(balancedY, 0.001, 0.999);
  const y =
    variant.schedulePosition.y <= normalizedBalancedY
      ? minY +
        (balancedTop - minY) *
          (variant.schedulePosition.y / normalizedBalancedY)
      : balancedTop +
        (maxY - balancedTop) *
          ((variant.schedulePosition.y - normalizedBalancedY) /
            (1 - normalizedBalancedY));
  const target: Rect = {
    x: minX + (maxX - minX) * variant.schedulePosition.x,
    y,
    width,
    height,
  };
  const transform: ResizeTransform = {
    source: natural,
    target,
    scaleX: scale,
    scaleY: scale,
    fontScale: scale,
  };
  const metadata = transformMetadata(result, transform);
  const [background, scenery, photos, schedule, foreground] =
    result.model.layers;
  const transformedScheduleNodes = schedule.nodes.map((node) =>
    transformNode(node, transform),
  );

  return {
    ...metadata,
    model: {
      ...result.model,
      layers: [
        background,
        scenery,
        photos,
        {
          ...schedule,
          nodes: adaptCardsToVerticalSpace(
            schedule.nodes,
            transformedScheduleNodes,
            transform,
          ),
        },
        foreground,
      ],
    },
    overlay: {
      ...result.overlay,
      ...(result.overlay.selection
        ? { selection: transformRect(result.overlay.selection, transform) }
        : {}),
      warningRegions: result.overlay.warningRegions.map((region) =>
        transformRect(region, transform),
      ),
    },
    scheduleBounds: target,
    positionRange: {
      minX,
      maxX,
      minY,
      maxY,
    },
    ...(scale < 1
      ? {
          scheduleResize: {
            naturalBounds: natural,
            scaleX: scale,
            scaleY: scale,
            fontScale: scale,
            constrained: true,
            readabilityWarning: scale < SCHEDULE_READABILITY_SCALE_THRESHOLD,
          },
        }
      : {}),
  } as T;
}

/**
 * Dense Square schedules can be taller than their canvas. Fit only overflowing
 * compositions, preserve their aspect ratio, and keep the resized group freely
 * movable within an even outer margin.
 */
export function fitScheduleIntoSquareCanvas<T extends ScheduleRenderResult>(
  result: T,
  variant: DeviceVariant,
): T {
  if (variant.category !== "square" && variant.orientation !== "square")
    return result;

  const natural = result.scheduleBounds;
  const margin =
    Math.min(result.model.width, result.model.height) *
    SQUARE_SCHEDULE_MARGIN_RATIO;
  const availableWidth = Math.max(1, result.model.width - margin * 2);
  const availableHeight = Math.max(1, result.model.height - margin * 2);
  const overflows =
    natural.x < 0 ||
    natural.y < 0 ||
    natural.x + natural.width > result.model.width ||
    natural.y + natural.height > result.model.height;
  if (!overflows) return result;

  const scale = Math.min(
    1,
    availableWidth / Math.max(1, natural.width),
    availableHeight / Math.max(1, natural.height),
  );
  const width = natural.width * scale;
  const height = natural.height * scale;
  const minX = margin;
  const minY = margin;
  const maxX = Math.max(minX, result.model.width - margin - width);
  const maxY = Math.max(minY, result.model.height - margin - height);
  const target: Rect = {
    x: minX + (maxX - minX) * variant.schedulePosition.x,
    y: minY + (maxY - minY) * variant.schedulePosition.y,
    width,
    height,
  };
  const transform: ResizeTransform = {
    source: natural,
    target,
    scaleX: scale,
    scaleY: scale,
    fontScale: scale,
  };
  const metadata = transformMetadata(result, transform);
  const [background, scenery, photos, schedule, foreground] =
    result.model.layers;
  const resizedScheduleNodes = schedule.nodes.map((node) =>
    transformNode(node, transform),
  );

  return {
    ...metadata,
    model: {
      ...result.model,
      layers: [
        background,
        scenery,
        {
          ...photos,
          nodes: photos.nodes.map((node) => transformNode(node, transform)),
        },
        {
          ...schedule,
          nodes: adaptCardsToVerticalSpace(
            schedule.nodes,
            resizedScheduleNodes,
            transform,
          ),
        },
        foreground,
      ],
    },
    overlay: {
      ...result.overlay,
      ...(result.overlay.selection
        ? { selection: transformRect(result.overlay.selection, transform) }
        : {}),
      warningRegions: result.overlay.warningRegions.map((region) =>
        transformRect(region, transform),
      ),
    },
    scheduleBounds: target,
    positionRange: { minX, maxX, minY, maxY },
    scheduleResize: {
      naturalBounds: natural,
      scaleX: scale,
      scaleY: scale,
      fontScale: scale,
      constrained: true,
      readabilityWarning: scale < SCHEDULE_READABILITY_SCALE_THRESHOLD,
    },
    ...(result.photoFrame
      ? { photoFrame: transformRect(result.photoFrame, transform) }
      : {}),
    ...(result.photoFrames
      ? {
          photoFrames: result.photoFrames.map((photo) => ({
            ...photo,
            frame: transformRect(photo.frame, transform),
          })),
        }
      : {}),
    ...(result.photoPlaceholders
      ? {
          photoPlaceholders: result.photoPlaceholders.map((placeholder) => ({
            ...placeholder,
            paper: transformRect(placeholder.paper, transform),
            frame: transformRect(placeholder.frame, transform),
          })),
        }
      : {}),
    ...(result.photoPlaceholderSets
      ? {
          photoPlaceholderSets: result.photoPlaceholderSets.map((set) =>
            set.map((placeholder) => ({
              ...placeholder,
              paper: transformRect(placeholder.paper, transform),
              frame: transformRect(placeholder.frame, transform),
            })),
          ),
        }
      : {}),
  } as T;
}

export function scheduleSizeLimits(result: ScheduleRenderResult): {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
} {
  const { scheduleBounds: bounds, positionRange: range, model } = result;
  const rightInset = Math.max(0, model.width - (range.maxX + bounds.width));
  const bottomInset = Math.max(0, model.height - (range.maxY + bounds.height));
  const maxWidth = Math.max(1, model.width - range.minX - rightInset);
  const maxHeight = Math.max(1, model.height - range.minY - bottomInset);
  return {
    minWidth: Math.min(
      maxWidth,
      Math.max(1, model.width * MIN_SCHEDULE_SIZE_RATIO),
    ),
    maxWidth,
    minHeight: Math.min(
      maxHeight,
      Math.max(1, model.height * MIN_SCHEDULE_SIZE_RATIO),
    ),
    maxHeight,
  };
}

export function scheduleSizeFromPixels(
  model: Pick<ScheduleRenderResult["model"], "width" | "height">,
  pixels: { width: number; height: number },
  lockAspectRatio: boolean,
): ScheduleSize {
  return {
    widthRatio: clamp(pixels.width / model.width, MIN_SCHEDULE_SIZE_RATIO, 1),
    heightRatio: clamp(
      pixels.height / model.height,
      MIN_SCHEDULE_SIZE_RATIO,
      1,
    ),
    lockAspectRatio,
  };
}

export function applyScheduleSize<T extends ScheduleRenderResult>(
  result: T,
  variant: DeviceVariant,
): T {
  const preferences = variant.scheduleSize;
  if (preferences.widthRatio === null && preferences.heightRatio === null)
    return result;

  const natural = result.scheduleBounds;
  const limits = scheduleSizeLimits(result);
  const requestedWidth =
    preferences.widthRatio === null
      ? natural.width
      : result.model.width * preferences.widthRatio;
  const requestedHeight =
    preferences.heightRatio === null
      ? natural.height
      : result.model.height * preferences.heightRatio;
  const width = clamp(requestedWidth, limits.minWidth, limits.maxWidth);
  const height = clamp(requestedHeight, limits.minHeight, limits.maxHeight);
  const maxX = Math.max(
    result.positionRange.minX,
    result.positionRange.minX + limits.maxWidth - width,
  );
  const maxY = Math.max(
    result.positionRange.minY,
    result.positionRange.minY + limits.maxHeight - height,
  );
  const target: Rect = {
    x:
      result.positionRange.minX +
      (maxX - result.positionRange.minX) * variant.schedulePosition.x,
    y:
      result.positionRange.minY +
      (maxY - result.positionRange.minY) * variant.schedulePosition.y,
    width,
    height,
  };
  const scaleX = width / Math.max(1, natural.width);
  const scaleY = height / Math.max(1, natural.height);
  const transform: ResizeTransform = {
    source: natural,
    target,
    scaleX,
    scaleY,
    fontScale: Math.min(scaleX, scaleY),
  };
  const metadata = transformMetadata(result, transform);
  const [background, scenery, photos, schedule, foreground] =
    result.model.layers;
  const resizedScheduleNodes = schedule.nodes.map((node) =>
    transformNode(node, transform),
  );
  return {
    ...metadata,
    model: {
      ...result.model,
      layers: [
        background,
        scenery,
        {
          ...photos,
          nodes: photos.nodes.map((node) => transformNode(node, transform)),
        },
        {
          ...schedule,
          nodes: adaptCardsToVerticalSpace(
            schedule.nodes,
            resizedScheduleNodes,
            transform,
          ),
        },
        foreground,
      ],
    },
    overlay: {
      ...result.overlay,
      ...(result.overlay.selection
        ? { selection: transformRect(result.overlay.selection, transform) }
        : {}),
      warningRegions: result.overlay.warningRegions.map((region) =>
        transformRect(region, transform),
      ),
    },
    scheduleBounds: target,
    positionRange: {
      minX: result.positionRange.minX,
      maxX,
      minY: result.positionRange.minY,
      maxY,
    },
    scheduleResize: {
      naturalBounds: natural,
      scaleX,
      scaleY,
      fontScale: transform.fontScale,
      constrained:
        Math.abs(width - requestedWidth) > 0.5 ||
        Math.abs(height - requestedHeight) > 0.5,
      readabilityWarning:
        transform.fontScale < SCHEDULE_READABILITY_SCALE_THRESHOLD,
    },
    ...(result.photoFrame
      ? { photoFrame: transformRect(result.photoFrame, transform) }
      : {}),
    ...(result.photoFrames
      ? {
          photoFrames: result.photoFrames.map((photo) => ({
            ...photo,
            frame: transformRect(photo.frame, transform),
          })),
        }
      : {}),
    ...(result.photoPlaceholders
      ? {
          photoPlaceholders: result.photoPlaceholders.map((placeholder) => ({
            ...placeholder,
            paper: transformRect(placeholder.paper, transform),
            frame: transformRect(placeholder.frame, transform),
          })),
        }
      : {}),
    ...(result.photoPlaceholderSets
      ? {
          photoPlaceholderSets: result.photoPlaceholderSets.map((set) =>
            set.map((placeholder) => ({
              ...placeholder,
              paper: transformRect(placeholder.paper, transform),
              frame: transformRect(placeholder.frame, transform),
            })),
          ),
        }
      : {}),
  } as T;
}
