"use client";

import type Konva from "konva";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Stage } from "react-konva";

import type { ScheduleRenderResult } from "@/domain/render";
import type { AlignmentGuides } from "@/domain/render";
import type { DeviceVariant } from "@/domain/device/types";
import type { SafeAreaModel } from "@/domain/device/safe-areas";
import { PreviewEnvironmentOverlay } from "./editor-overlay/preview-environment";
import { PhotoEditorOverlay } from "./editor-overlay/photo-overlay";
import { ScheduleEditorOverlay } from "./editor-overlay/schedule-overlay";
import { ScheduleScene, type RenderAssetImages } from "./schedule-scene";

type PhotoEditorInteraction = {
  frame: { x: number; y: number; width: number; height: number };
  rotation?: number;
  hasPhoto: boolean;
  adjusting: boolean;
  onPanStart(): void;
  onPanMove(delta: { x: number; y: number }): void;
  onPanEnd(): void;
};

export function ScheduleArtboard({
  result,
  zoom,
  exportStageRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  dragging,
  guides,
  variant,
  safeAreas,
  guideImage,
  guideOpacity,
  assetImages,
  photoEditor,
}: {
  result: ScheduleRenderResult;
  zoom: number;
  exportStageRef: RefObject<Konva.Stage | null>;
  onDragStart(): void;
  onDragMove(x: number, y: number, previewScale: number): void;
  onDragEnd(x: number, y: number, previewScale: number): void;
  dragging: boolean;
  guides: AlignmentGuides;
  variant: DeviceVariant;
  safeAreas: SafeAreaModel;
  guideImage: HTMLImageElement | null;
  guideOpacity: number;
  assetImages?: RenderAssetImages | undefined;
  photoEditor?: PhotoEditorInteraction | undefined;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [space, setSpace] = useState({ width: 720, height: 720 });
  const [scheduleSelected, setScheduleSelected] = useState(false);
  const [scheduleHovered, setScheduleHovered] = useState(false);
  const [photoDragging, setPhotoDragging] = useState(false);
  const photoDragStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () =>
      setSpace({ width: element.clientWidth, height: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const fit = Math.min(
    (space.width - 32) / result.model.width,
    (space.height - 32) / result.model.height,
  );
  const scale = Math.max(0.04, fit * zoom);
  return (
    <div
      ref={containerRef}
      data-testid="artboard-workspace"
      className="flex min-h-0 flex-1 items-center justify-center overflow-auto overscroll-contain p-4 select-none"
      onPointerDown={(event) => {
        if (event.currentTarget === event.target) setScheduleSelected(false);
      }}
    >
      <div
        data-testid="artboard-preview"
        data-target-width={result.model.width}
        data-target-height={result.model.height}
        data-preview-scale={scale}
        data-schedule-x={result.scheduleBounds.x}
        data-schedule-y={result.scheduleBounds.y}
        data-schedule-width={result.scheduleBounds.width}
        data-schedule-height={result.scheduleBounds.height}
        data-dragging={dragging ? "true" : "false"}
        data-schedule-selected={scheduleSelected ? "true" : "false"}
        data-guide-vertical={guides.verticalCenter ? "true" : "false"}
        data-guide-horizontal={guides.horizontalCenter ? "true" : "false"}
        className="shrink-0 overflow-hidden bg-white shadow-[0_10px_35px_rgba(23,32,51,0.15)]"
        style={{
          width: result.model.width * scale,
          height: result.model.height * scale,
          cursor:
            photoEditor?.adjusting && photoEditor.hasPhoto
              ? photoDragging
                ? "grabbing"
                : "grab"
              : undefined,
        }}
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const point = {
            x: (event.clientX - rect.left) / scale,
            y: (event.clientY - rect.top) / scale,
          };
          if (photoEditor?.adjusting && photoEditor.hasPhoto) {
            const frame = photoEditor.frame;
            const radians = (-(photoEditor.rotation ?? 0) * Math.PI) / 180;
            const local = {
              x:
                frame.x +
                (point.x - frame.x) * Math.cos(radians) -
                (point.y - frame.y) * Math.sin(radians),
              y:
                frame.y +
                (point.x - frame.x) * Math.sin(radians) +
                (point.y - frame.y) * Math.cos(radians),
            };
            if (
              local.x >= frame.x &&
              local.x <= frame.x + frame.width &&
              local.y >= frame.y &&
              local.y <= frame.y + frame.height
            ) {
              event.currentTarget.setPointerCapture(event.pointerId);
              photoDragStart.current = {
                x: event.clientX,
                y: event.clientY,
              };
              setPhotoDragging(true);
              photoEditor.onPanStart();
              return;
            }
          }
          const bounds = result.scheduleBounds;
          setScheduleSelected(
            point.x >= bounds.x &&
              point.x <= bounds.x + bounds.width &&
              point.y >= bounds.y &&
              point.y <= bounds.y + bounds.height,
          );
        }}
        onPointerMove={(event) => {
          const start = photoDragStart.current;
          if (!start || !photoEditor?.adjusting) return;
          photoEditor.onPanMove({
            x: (event.clientX - start.x) / scale,
            y: (event.clientY - start.y) / scale,
          });
        }}
        onPointerUp={(event) => {
          if (!photoDragStart.current) return;
          photoDragStart.current = null;
          setPhotoDragging(false);
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
          photoEditor?.onPanEnd();
        }}
        onPointerCancel={() => {
          if (!photoDragStart.current) return;
          photoDragStart.current = null;
          setPhotoDragging(false);
          photoEditor?.onPanEnd();
        }}
      >
        <Stage
          width={result.model.width * scale}
          height={result.model.height * scale}
          scaleX={scale}
          scaleY={scale}
        >
          <ScheduleScene model={result.model} assets={assetImages} />
          <PreviewEnvironmentOverlay
            variant={variant}
            safeAreas={safeAreas}
            showSafeAreas={variant.preview.showSafeAreas}
            guideImage={guideImage}
            guideOpacity={guideOpacity}
            previewScale={scale}
          />
          {photoEditor ? (
            <PhotoEditorOverlay
              frame={photoEditor.frame}
              rotation={photoEditor.rotation ?? 0}
              hasPhoto={photoEditor.hasPhoto}
              adjusting={photoEditor.adjusting}
              previewScale={scale}
            />
          ) : null}
          {!photoEditor?.adjusting ? (
            <ScheduleEditorOverlay
              bounds={result.scheduleBounds}
              canvasSize={{
                width: result.model.width,
                height: result.model.height,
              }}
              previewScale={scale}
              dragging={dragging}
              guides={guides}
              selected={scheduleSelected}
              hovered={scheduleHovered}
              onHover={setScheduleHovered}
              onSelect={() => setScheduleSelected(true)}
              onDragStart={onDragStart}
              onDragMove={(x, y) => onDragMove(x, y, scale)}
              onDragEnd={(x, y) => onDragEnd(x, y, scale)}
            />
          ) : null}
        </Stage>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 -left-[20000px]"
      >
        <Stage
          ref={exportStageRef}
          width={result.model.width}
          height={result.model.height}
        >
          <ScheduleScene model={result.model} assets={assetImages} />
        </Stage>
      </div>
    </div>
  );
}
