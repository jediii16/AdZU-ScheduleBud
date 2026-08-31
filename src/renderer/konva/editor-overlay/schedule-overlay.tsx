"use client";

import type Konva from "konva";
import { useRef } from "react";
import { Circle, Layer, Line, Rect } from "react-konva";
import type { AlignmentGuides, Rect as ModelRect } from "@/domain/render";

export type ScheduleResizeHandle =
  | "north-west"
  | "north"
  | "north-east"
  | "east"
  | "south-east"
  | "south"
  | "south-west"
  | "west";

const RESIZE_HANDLES: readonly ScheduleResizeHandle[] = [
  "north-west",
  "north",
  "north-east",
  "east",
  "south-east",
  "south",
  "south-west",
  "west",
];

function handlePoint(
  bounds: ModelRect,
  handle: ScheduleResizeHandle,
): { x: number; y: number } {
  const horizontal = handle.includes("west")
    ? bounds.x
    : handle.includes("east")
      ? bounds.x + bounds.width
      : bounds.x + bounds.width / 2;
  const vertical = handle.includes("north")
    ? bounds.y
    : handle.includes("south")
      ? bounds.y + bounds.height
      : bounds.y + bounds.height / 2;
  return { x: horizontal, y: vertical };
}

export function resizeScheduleRect(
  bounds: ModelRect,
  handle: ScheduleResizeHandle,
  point: { x: number; y: number },
  lockAspectRatio: boolean,
  minimumEdge = 1,
): ModelRect {
  const movesWest = handle.includes("west");
  const movesEast = handle.includes("east");
  const movesNorth = handle.includes("north");
  const movesSouth = handle.includes("south");
  const isCorner = (movesWest || movesEast) && (movesNorth || movesSouth);
  let left = movesWest
    ? Math.min(point.x, bounds.x + bounds.width - minimumEdge)
    : bounds.x;
  let right = movesEast
    ? Math.max(point.x, bounds.x + minimumEdge)
    : bounds.x + bounds.width;
  let top = movesNorth
    ? Math.min(point.y, bounds.y + bounds.height - minimumEdge)
    : bounds.y;
  let bottom = movesSouth
    ? Math.max(point.y, bounds.y + minimumEdge)
    : bounds.y + bounds.height;

  if (lockAspectRatio) {
    const rawWidth = Math.max(minimumEdge, right - left);
    const rawHeight = Math.max(minimumEdge, bottom - top);
    let factor: number;
    if (isCorner) {
      const widthFactor = rawWidth / bounds.width;
      const heightFactor = rawHeight / bounds.height;
      factor =
        Math.abs(widthFactor - 1) >= Math.abs(heightFactor - 1)
          ? widthFactor
          : heightFactor;
    } else {
      factor =
        movesWest || movesEast
          ? rawWidth / bounds.width
          : rawHeight / bounds.height;
    }
    factor = Math.max(
      minimumEdge / bounds.width,
      minimumEdge / bounds.height,
      factor,
    );
    const width = bounds.width * factor;
    const height = bounds.height * factor;
    if (movesWest) left = bounds.x + bounds.width - width;
    else if (movesEast) right = bounds.x + width;
    else {
      left = bounds.x + (bounds.width - width) / 2;
      right = left + width;
    }
    if (movesNorth) top = bounds.y + bounds.height - height;
    else if (movesSouth) bottom = bounds.y + height;
    else {
      top = bounds.y + (bounds.height - height) / 2;
      bottom = top + height;
    }
  }

  return {
    x: left,
    y: top,
    width: Math.max(minimumEdge, right - left),
    height: Math.max(minimumEdge, bottom - top),
  };
}

function resizeCursor(handle: ScheduleResizeHandle) {
  if (handle === "north" || handle === "south") return "ns-resize";
  if (handle === "east" || handle === "west") return "ew-resize";
  if (handle === "north-west" || handle === "south-east") return "nwse-resize";
  return "nesw-resize";
}

function relativePointerPosition(event: Konva.KonvaEventObject<Event>) {
  return event.target.getLayer()?.getRelativePointerPosition() ?? null;
}

function pinnedToRenderedPosition(this: Konva.Node) {
  return this.getAbsolutePosition();
}

export function scheduleResizeHandleAtPoint(
  bounds: ModelRect,
  point: { x: number; y: number },
  previewScale: number,
): ScheduleResizeHandle | null {
  const edgeDistance = 18 / Math.max(0.01, previewScale);
  const horizontalEdgeDistance = Math.min(edgeDistance, bounds.width / 4);
  const verticalEdgeDistance = Math.min(edgeDistance, bounds.height / 4);
  const nearWest = Math.abs(point.x - bounds.x) <= horizontalEdgeDistance;
  const nearEast =
    Math.abs(point.x - (bounds.x + bounds.width)) <= horizontalEdgeDistance;
  const nearNorth = Math.abs(point.y - bounds.y) <= verticalEdgeDistance;
  const nearSouth =
    Math.abs(point.y - (bounds.y + bounds.height)) <= verticalEdgeDistance;
  const upperThird = point.y <= bounds.y + bounds.height / 3;
  const lowerThird = point.y >= bounds.y + (bounds.height * 2) / 3;
  const leftThird = point.x <= bounds.x + bounds.width / 3;
  const rightThird = point.x >= bounds.x + (bounds.width * 2) / 3;

  if (nearWest) {
    if (nearNorth || upperThird) return "north-west";
    if (nearSouth || lowerThird) return "south-west";
    return "west";
  }
  if (nearEast) {
    if (nearNorth || upperThird) return "north-east";
    if (nearSouth || lowerThird) return "south-east";
    return "east";
  }
  if (nearNorth) {
    if (leftThird) return "north-west";
    if (rightThird) return "north-east";
    return "north";
  }
  if (nearSouth) {
    if (leftThird) return "south-west";
    if (rightThird) return "south-east";
    return "south";
  }
  return null;
}

export function ScheduleEditorOverlay({
  bounds,
  onDragStart,
  onDragMove,
  onDragEnd,
  canvasSize,
  previewScale,
  dragging,
  guides,
  selected,
  hovered,
  onHover,
  onSelect,
  lockAspectRatio,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
}: {
  bounds: ModelRect;
  onDragStart(): void;
  onDragMove(x: number, y: number): void;
  onDragEnd(x: number, y: number): void;
  canvasSize: { width: number; height: number };
  previewScale: number;
  dragging: boolean;
  guides: AlignmentGuides;
  selected: boolean;
  hovered: boolean;
  onHover(value: boolean): void;
  onSelect(): void;
  lockAspectRatio: boolean;
  onResizeStart(handle: ScheduleResizeHandle): void;
  onResizeMove(
    handle: ScheduleResizeHandle,
    bounds: ModelRect,
    previewScale: number,
  ): void;
  onResizeEnd(
    handle: ScheduleResizeHandle,
    bounds: ModelRect,
    previewScale: number,
  ): void;
}) {
  const rectPointerDown = useRef<
    | {
        kind: "move";
        pointerOffset: { x: number; y: number };
      }
    | {
        kind: "resize";
        handle: ScheduleResizeHandle;
        pointerOffset: { x: number; y: number };
      }
    | null
  >(null);
  const moveStart = useRef<{
    pointerOffset: { x: number; y: number };
  } | null>(null);
  const resizePointerDown = useRef<{
    handle: ScheduleResizeHandle;
    pointerOffset: { x: number; y: number };
  } | null>(null);
  const resizeStart = useRef<{
    handle: ScheduleResizeHandle;
    bounds: ModelRect;
    pointerOffset: { x: number; y: number };
  } | null>(null);
  const strokeWidth = 1 / previewScale;
  const crosshairSize = 6 / previewScale;
  const handleRadius = Math.max(5 / previewScale, 4);
  const minimumEdge = 36 / previewScale;
  const stop = (event: Konva.KonvaEventObject<Event>) => {
    event.cancelBubble = true;
  };
  const resizePoint = (
    event: Konva.KonvaEventObject<Event>,
    pointerOffset: { x: number; y: number },
  ) => {
    const pointer = relativePointerPosition(event);
    return pointer
      ? {
          x: pointer.x - pointerOffset.x,
          y: pointer.y - pointerOffset.y,
        }
      : { x: event.target.x(), y: event.target.y() };
  };
  const prepareRectInteraction = (event: Konva.KonvaEventObject<Event>) => {
    const pointer = relativePointerPosition(event);
    if (!pointer) {
      rectPointerDown.current = null;
      return;
    }
    const handle = selected
      ? scheduleResizeHandleAtPoint(bounds, pointer, previewScale)
      : null;
    if (handle) {
      const anchor = handlePoint(bounds, handle);
      rectPointerDown.current = {
        kind: "resize",
        handle,
        pointerOffset: {
          x: pointer.x - anchor.x,
          y: pointer.y - anchor.y,
        },
      };
      return;
    }
    rectPointerDown.current = {
      kind: "move",
      pointerOffset: {
        x: pointer.x - bounds.x,
        y: pointer.y - bounds.y,
      },
    };
  };
  return (
    <Layer name="editor-overlay">
      {dragging && guides.verticalPosition !== undefined ? (
        <Line
          name="vertical-center-guide"
          points={[
            guides.verticalPosition,
            0,
            guides.verticalPosition,
            canvasSize.height,
          ]}
          stroke="#145F9B"
          strokeWidth={strokeWidth}
          listening={false}
        />
      ) : null}
      {dragging && guides.horizontalPosition !== undefined ? (
        <Line
          name="horizontal-center-guide"
          points={[
            0,
            guides.horizontalPosition,
            canvasSize.width,
            guides.horizontalPosition,
          ]}
          stroke="#145F9B"
          strokeWidth={strokeWidth}
          listening={false}
        />
      ) : null}
      {dragging && guides.verticalCenter && guides.horizontalCenter ? (
        <>
          <Line
            name="center-intersection-horizontal"
            points={[
              canvasSize.width / 2 - crosshairSize,
              canvasSize.height / 2,
              canvasSize.width / 2 + crosshairSize,
              canvasSize.height / 2,
            ]}
            stroke="#145F9B"
            strokeWidth={2 / previewScale}
            listening={false}
          />
          <Line
            name="center-intersection-vertical"
            points={[
              canvasSize.width / 2,
              canvasSize.height / 2 - crosshairSize,
              canvasSize.width / 2,
              canvasSize.height / 2 + crosshairSize,
            ]}
            stroke="#145F9B"
            strokeWidth={2 / previewScale}
            listening={false}
          />
        </>
      ) : null}
      <Rect
        name="schedule-drag-handle"
        aria-label="Move schedule"
        {...bounds}
        fill="rgba(20,95,155,0.001)"
        stroke="#145F9B"
        strokeEnabled={selected || hovered || dragging}
        opacity={selected || dragging ? 1 : 0.62}
        strokeWidth={(selected || dragging ? 1.5 : 1) / previewScale}
        dash={selected || dragging ? [] : [5 / previewScale, 4 / previewScale]}
        cornerRadius={8}
        draggable
        dragBoundFunc={pinnedToRenderedPosition}
        onMouseEnter={(event) => {
          onHover(true);
          const stage = event.target.getStage();
          if (stage)
            stage.container().style.cursor = dragging ? "grabbing" : "grab";
        }}
        onMouseMove={(event) => {
          if (event.target.isDragging()) return;
          const stage = event.target.getStage();
          const pointer = relativePointerPosition(event);
          const handle =
            selected && pointer
              ? scheduleResizeHandleAtPoint(bounds, pointer, previewScale)
              : null;
          if (stage)
            stage.container().style.cursor = handle
              ? resizeCursor(handle)
              : "grab";
        }}
        onMouseLeave={(event) => {
          onHover(false);
          const stage = event.target.getStage();
          if (stage && !dragging) stage.container().style.cursor = "default";
        }}
        onMouseDown={(event) => {
          prepareRectInteraction(event);
          onSelect();
        }}
        onTouchStart={(event) => {
          prepareRectInteraction(event);
          onSelect();
        }}
        onDragStart={(event) => {
          onSelect();
          const pending = rectPointerDown.current;
          if (pending?.kind === "resize") {
            resizeStart.current = {
              handle: pending.handle,
              bounds,
              pointerOffset: pending.pointerOffset,
            };
            const stage = event.target.getStage();
            if (stage)
              stage.container().style.cursor = resizeCursor(pending.handle);
            onResizeStart(pending.handle);
            return;
          }
          const pointer = relativePointerPosition(event);
          moveStart.current = {
            pointerOffset:
              pending?.kind === "move"
                ? pending.pointerOffset
                : pointer
                  ? { x: pointer.x - bounds.x, y: pointer.y - bounds.y }
                  : { x: 0, y: 0 },
          };
          const stage = event.target.getStage();
          if (stage) stage.container().style.cursor = "grabbing";
          onDragStart();
        }}
        onDragMove={(event) => {
          const resize = resizeStart.current;
          if (resize) {
            onResizeMove(
              resize.handle,
              resizeScheduleRect(
                resize.bounds,
                resize.handle,
                resizePoint(event, resize.pointerOffset),
                lockAspectRatio,
                minimumEdge,
              ),
              previewScale,
            );
            return;
          }
          const move = moveStart.current;
          const pointer = relativePointerPosition(event);
          if (!move || !pointer) return;
          onDragMove(
            pointer.x - move.pointerOffset.x,
            pointer.y - move.pointerOffset.y,
          );
        }}
        onDragEnd={(event) => {
          const stage = event.target.getStage();
          const resize = resizeStart.current;
          if (resize) {
            onResizeEnd(
              resize.handle,
              resizeScheduleRect(
                resize.bounds,
                resize.handle,
                resizePoint(event, resize.pointerOffset),
                lockAspectRatio,
                minimumEdge,
              ),
              previewScale,
            );
            resizeStart.current = null;
            if (stage)
              stage.container().style.cursor = resizeCursor(resize.handle);
          } else {
            const move = moveStart.current;
            const pointer = relativePointerPosition(event);
            if (move)
              onDragEnd(
                pointer ? pointer.x - move.pointerOffset.x : bounds.x,
                pointer ? pointer.y - move.pointerOffset.y : bounds.y,
              );
            if (stage) stage.container().style.cursor = "grab";
          }
          rectPointerDown.current = null;
          moveStart.current = null;
        }}
      />
      {selected
        ? RESIZE_HANDLES.map((handle) => {
            const point = handlePoint(bounds, handle);
            return (
              <Circle
                key={handle}
                name={`schedule-resize-${handle}`}
                aria-label={`Resize schedule ${handle}`}
                {...point}
                radius={handleRadius}
                fill="#FFFFFF"
                stroke="#145F9B"
                strokeWidth={1.5 / previewScale}
                hitStrokeWidth={Math.max(12 / previewScale, handleRadius * 2)}
                draggable
                dragBoundFunc={pinnedToRenderedPosition}
                onMouseDown={(event) => {
                  stop(event);
                  onSelect();
                  const pointer = relativePointerPosition(event);
                  resizePointerDown.current = {
                    handle,
                    pointerOffset: pointer
                      ? { x: pointer.x - point.x, y: pointer.y - point.y }
                      : { x: 0, y: 0 },
                  };
                }}
                onTouchStart={(event) => {
                  stop(event);
                  onSelect();
                  const pointer = relativePointerPosition(event);
                  resizePointerDown.current = {
                    handle,
                    pointerOffset: pointer
                      ? { x: pointer.x - point.x, y: pointer.y - point.y }
                      : { x: 0, y: 0 },
                  };
                }}
                onMouseEnter={(event) => {
                  const stage = event.target.getStage();
                  if (stage)
                    stage.container().style.cursor = resizeCursor(handle);
                }}
                onMouseLeave={(event) => {
                  const stage = event.target.getStage();
                  if (stage && !resizeStart.current)
                    stage.container().style.cursor = "default";
                }}
                onDragStart={(event) => {
                  stop(event);
                  const pointer = relativePointerPosition(event);
                  const pointerDown = resizePointerDown.current;
                  resizeStart.current = {
                    handle,
                    bounds,
                    pointerOffset:
                      pointerDown?.handle === handle
                        ? pointerDown.pointerOffset
                        : pointer
                          ? {
                              x: pointer.x - point.x,
                              y: pointer.y - point.y,
                            }
                          : { x: 0, y: 0 },
                  };
                  onResizeStart(handle);
                }}
                onDragMove={(event) => {
                  stop(event);
                  const start = resizeStart.current;
                  if (!start) return;
                  onResizeMove(
                    handle,
                    resizeScheduleRect(
                      start.bounds,
                      handle,
                      resizePoint(event, start.pointerOffset),
                      lockAspectRatio,
                      minimumEdge,
                    ),
                    previewScale,
                  );
                }}
                onDragEnd={(event) => {
                  stop(event);
                  const start = resizeStart.current;
                  if (start)
                    onResizeEnd(
                      handle,
                      resizeScheduleRect(
                        start.bounds,
                        handle,
                        resizePoint(event, start.pointerOffset),
                        lockAspectRatio,
                        minimumEdge,
                      ),
                      previewScale,
                    );
                  resizeStart.current = null;
                  resizePointerDown.current = null;
                  const stage = event.target.getStage();
                  if (stage)
                    stage.container().style.cursor = resizeCursor(handle);
                }}
              />
            );
          })
        : null}
    </Layer>
  );
}
