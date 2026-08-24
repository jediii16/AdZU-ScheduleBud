"use client";

import type Konva from "konva";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Stage } from "react-konva";

import type { ScheduleRenderResult } from "@/domain/render";
import type { AlignmentGuides } from "@/domain/render";
import type { DeviceVariant } from "@/domain/device/types";
import type { SafeAreaModel } from "@/domain/device/safe-areas";
import { PreviewEnvironmentOverlay } from "./editor-overlay/preview-environment";
import { ScheduleEditorOverlay } from "./editor-overlay/schedule-overlay";
import { ScheduleScene } from "./schedule-scene";

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
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [space, setSpace] = useState({ width: 720, height: 720 });
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
      className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4"
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
        data-guide-vertical={guides.verticalCenter ? "true" : "false"}
        data-guide-horizontal={guides.horizontalCenter ? "true" : "false"}
        className="shrink-0 overflow-hidden bg-white shadow-[0_10px_35px_rgba(23,32,51,0.15)]"
        style={{
          width: result.model.width * scale,
          height: result.model.height * scale,
        }}
      >
        <Stage
          width={result.model.width * scale}
          height={result.model.height * scale}
          scaleX={scale}
          scaleY={scale}
        >
          <ScheduleScene model={result.model} />
          <PreviewEnvironmentOverlay
            variant={variant}
            safeAreas={safeAreas}
            showSafeAreas={variant.preview.showSafeAreas}
            guideImage={guideImage}
            guideOpacity={guideOpacity}
            previewScale={scale}
          />
          <ScheduleEditorOverlay
            bounds={result.scheduleBounds}
            canvasSize={{
              width: result.model.width,
              height: result.model.height,
            }}
            previewScale={scale}
            dragging={dragging}
            guides={guides}
            onDragStart={onDragStart}
            onDragMove={(x, y) => onDragMove(x, y, scale)}
            onDragEnd={(x, y) => onDragEnd(x, y, scale)}
          />
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
          <ScheduleScene model={result.model} />
        </Stage>
      </div>
    </div>
  );
}
