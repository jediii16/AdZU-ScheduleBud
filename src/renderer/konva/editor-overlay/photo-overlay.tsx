"use client";

import { Layer, Line, Rect, Text } from "react-konva";
import type { Rect as ModelRect } from "@/domain/render";
import { fontFamilyForId } from "../font-loading";

export function PhotoEditorOverlay({
  frame,
  hasPhoto,
  adjusting,
  previewScale,
  rotation,
}: {
  frame: ModelRect;
  hasPhoto: boolean;
  adjusting: boolean;
  previewScale: number;
  rotation?: number;
}) {
  const strokeWidth = (adjusting ? 2 : 1) / previewScale;
  const radius = Math.min(24, frame.width * 0.025);
  const crosshair = 14 / previewScale;
  return (
    <Layer name="photo-editor-overlay" listening={false}>
      {!hasPhoto ? (
        <>
          <Rect
            name="photo-empty-placeholder"
            {...frame}
            rotation={rotation ?? 0}
            fill="#EEF1F5"
            stroke="#C9D1DC"
            strokeWidth={strokeWidth}
            cornerRadius={radius}
          />
          <Text
            name="photo-empty-copy"
            x={frame.x}
            y={frame.y}
            width={frame.width}
            height={frame.height}
            text="Add a photo in Design"
            align="center"
            verticalAlign="middle"
            fontFamily={fontFamilyForId("body-sans")}
            fontSize={Math.max(18, Math.min(32, frame.width * 0.025))}
            fontStyle="normal 600"
            fill="#66758A"
          />
        </>
      ) : null}
      {adjusting ? (
        <>
          <Rect
            name="photo-adjust-frame"
            {...frame}
            rotation={rotation ?? 0}
            stroke="#145F9B"
            strokeWidth={strokeWidth}
            cornerRadius={radius}
          />
          <Line
            points={[
              frame.x + frame.width / 2 - crosshair,
              frame.y + frame.height / 2,
              frame.x + frame.width / 2 + crosshair,
              frame.y + frame.height / 2,
            ]}
            stroke="#FFFFFF"
            strokeWidth={1.5 / previewScale}
          />
          <Line
            points={[
              frame.x + frame.width / 2,
              frame.y + frame.height / 2 - crosshair,
              frame.x + frame.width / 2,
              frame.y + frame.height / 2 + crosshair,
            ]}
            stroke="#FFFFFF"
            strokeWidth={1.5 / previewScale}
          />
        </>
      ) : null}
    </Layer>
  );
}
