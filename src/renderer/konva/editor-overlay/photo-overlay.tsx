"use client";

import { Fragment } from "react";
import { Layer, Line, Rect, Text } from "react-konva";
import type { Rect as ModelRect } from "@/domain/render";
import { fontFamilyForId } from "../font-loading";

export type PolaroidPlaceholderFrame = {
  slot: number;
  paper: ModelRect;
  frame: ModelRect;
  rotation: number;
};

export function PolaroidPlaceholderOverlay({
  placeholders,
  previewScale,
}: {
  placeholders: readonly PolaroidPlaceholderFrame[];
  previewScale: number;
}) {
  return (
    <Layer name="polaroid-placeholder-overlay" listening={false}>
      {placeholders.map((placeholder) => (
        <Fragment key={placeholder.slot}>
          <Rect
            name="polaroid-empty-paper"
            {...placeholder.paper}
            rotation={placeholder.rotation}
            fill="#FBF8F1"
            stroke="#D7DCE4"
            strokeWidth={1 / previewScale}
            cornerRadius={Math.max(3, placeholder.paper.width * 0.015)}
            shadowColor="#1B2533"
            shadowBlur={Math.max(2, placeholder.paper.width * 0.015)}
            shadowOffsetY={Math.max(1, placeholder.paper.height * 0.01)}
            shadowOpacity={0.08}
          />
          <Rect
            name="polaroid-empty-photo"
            {...placeholder.frame}
            rotation={placeholder.rotation}
            fill="#E9EDF2"
            stroke="#CDD4DE"
            strokeWidth={1 / previewScale}
            cornerRadius={Math.max(2, placeholder.frame.width * 0.008)}
          />
          <Text
            name="polaroid-empty-copy"
            {...placeholder.frame}
            rotation={placeholder.rotation}
            text={`Photo ${placeholder.slot}`}
            align="center"
            verticalAlign="middle"
            fontFamily={fontFamilyForId("body-sans")}
            fontSize={Math.max(
              14,
              Math.min(28, placeholder.frame.width * 0.075),
            )}
            fontStyle="normal 600"
            fill="#7A8799"
          />
        </Fragment>
      ))}
    </Layer>
  );
}

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
