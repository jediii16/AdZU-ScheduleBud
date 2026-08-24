"use client";

import { Layer, Line, Rect } from "react-konva";
import type { AlignmentGuides, Rect as ModelRect } from "@/domain/render";

export function ScheduleEditorOverlay({
  bounds,
  onDragStart,
  onDragMove,
  onDragEnd,
  canvasSize,
  previewScale,
  dragging,
  guides,
}: {
  bounds: ModelRect;
  onDragStart(): void;
  onDragMove(x: number, y: number): void;
  onDragEnd(x: number, y: number): void;
  canvasSize: { width: number; height: number };
  previewScale: number;
  dragging: boolean;
  guides: AlignmentGuides;
}) {
  const strokeWidth = 1 / previewScale;
  const crosshairSize = 6 / previewScale;
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
        strokeWidth={1.5 / previewScale}
        dash={[7 / previewScale, 5 / previewScale]}
        cornerRadius={8}
        draggable
        onDragStart={onDragStart}
        onDragMove={(event) => onDragMove(event.target.x(), event.target.y())}
        onDragEnd={(event) => onDragEnd(event.target.x(), event.target.y())}
      />
    </Layer>
  );
}
