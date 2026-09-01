"use client";

import type Konva from "konva";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Stage } from "react-konva";

import type {
  AlignmentGuides,
  Rect as ModelRect,
  RenderModel,
  ScheduleRenderResult,
} from "@/domain/render";
import type { DeviceVariant } from "@/domain/device/types";
import type { SafeAreaModel } from "@/domain/device/safe-areas";
import { deviceArtworkToneForModel } from "./editor-overlay/device-preview-assets";
import { PreviewEnvironmentOverlay } from "./editor-overlay/preview-environment";
import {
  PhotoEditorOverlay,
  PolaroidPlaceholderOverlay,
} from "./editor-overlay/photo-overlay";
import {
  ScheduleEditorOverlay,
  type ScheduleResizeHandle,
} from "./editor-overlay/schedule-overlay";
import {
  StickerEditorOverlay,
  type StickerEditorInteraction,
} from "./editor-overlay/sticker-overlay";
import { ScheduleScene, type RenderAssetImages } from "./schedule-scene";
import {
  ensureRenderModelFontSignature,
  renderModelFontSignature,
} from "./font-loading";

type PhotoEditorInteraction = {
  frame: { x: number; y: number; width: number; height: number };
  rotation?: number;
  hasPhoto: boolean;
  adjusting: boolean;
  onPanStart(): void;
  onPanMove(delta: { x: number; y: number }): void;
  onPanEnd(): void;
};

type BackgroundEditorInteraction = {
  adjusting: boolean;
  onPanStart(): void;
  onPanMove(delta: { x: number; y: number }): void;
  onPanEnd(): void;
};

export function ScheduleArtboard({
  result,
  zoom,
  contentMode,
  exportStageRef,
  exportSnapshot,
  onDragStart,
  onDragMove,
  onDragEnd,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  dragging,
  guides,
  variant,
  safeAreas,
  guideImage,
  guideOpacity,
  assetImages,
  photoEditor,
  backgroundEditor,
  stickerEditor,
}: {
  result: ScheduleRenderResult;
  zoom: number;
  contentMode: "wallpaper" | "schedule" | "background";
  exportStageRef: RefObject<Konva.Stage | null>;
  exportSnapshot?:
    | { key: number; model: RenderModel; assets: RenderAssetImages }
    | null
    | undefined;
  onDragStart(): void;
  onDragMove(x: number, y: number, previewScale: number): void;
  onDragEnd(x: number, y: number, previewScale: number): void;
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
  dragging: boolean;
  guides: AlignmentGuides;
  variant: DeviceVariant;
  safeAreas: SafeAreaModel;
  guideImage: HTMLImageElement | null;
  guideOpacity: number;
  assetImages?: RenderAssetImages | undefined;
  photoEditor?: PhotoEditorInteraction | undefined;
  backgroundEditor?: BackgroundEditorInteraction | undefined;
  stickerEditor?: StickerEditorInteraction | undefined;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [space, setSpace] = useState({ width: 720, height: 720 });
  const [scheduleSelected, setScheduleSelected] = useState(false);
  const [scheduleHovered, setScheduleHovered] = useState(false);
  const [scheduleResizing, setScheduleResizing] = useState(false);
  const [photoDragging, setPhotoDragging] = useState(false);
  const [backgroundDragging, setBackgroundDragging] = useState(false);
  const fontSignature = renderModelFontSignature(result.model);
  const [fontReadiness, setFontReadiness] = useState<{
    signature: string;
    state: "loading" | "ready" | "error";
  }>(() => ({ signature: fontSignature, state: "loading" }));
  const photoDragStart = useRef<{ x: number; y: number } | null>(null);
  const backgroundDragStart = useRef<{ x: number; y: number } | null>(null);
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
  useEffect(() => {
    let active = true;
    void ensureRenderModelFontSignature(fontSignature).then(
      () =>
        active &&
        setFontReadiness({ signature: fontSignature, state: "ready" }),
      () =>
        active &&
        setFontReadiness({ signature: fontSignature, state: "error" }),
    );
    return () => {
      active = false;
    };
  }, [fontSignature]);
  const fontState =
    fontReadiness.signature === fontSignature ? fontReadiness.state : "loading";
  const artworkTone = deviceArtworkToneForModel(result.model);
  const fit = Math.min(
    (space.width - 32) / result.model.width,
    (space.height - 32) / result.model.height,
  );
  const scale = Math.max(0.04, fit * zoom);
  return (
    <div
      ref={containerRef}
      data-testid="artboard-workspace"
      className="flex min-h-0 flex-1 overflow-auto overscroll-contain p-4 select-none"
      onPointerDown={(event) => {
        if (event.currentTarget === event.target) setScheduleSelected(false);
      }}
    >
      <div
        key={contentMode}
        data-testid="artboard-preview"
        data-content-mode={contentMode}
        data-target-width={result.model.width}
        data-target-height={result.model.height}
        data-preview-scale={scale}
        data-schedule-x={result.scheduleBounds.x}
        data-schedule-y={result.scheduleBounds.y}
        data-schedule-width={result.scheduleBounds.width}
        data-schedule-height={result.scheduleBounds.height}
        data-dragging={dragging ? "true" : "false"}
        data-resizing={scheduleResizing ? "true" : "false"}
        data-schedule-selected={scheduleSelected ? "true" : "false"}
        data-guide-vertical={guides.verticalCenter ? "true" : "false"}
        data-guide-horizontal={guides.horizontalCenter ? "true" : "false"}
        data-background-adjusting={
          backgroundEditor?.adjusting ? "true" : "false"
        }
        data-background-position-x={variant.backgroundImageTransform.position.x}
        data-background-position-y={variant.backgroundImageTransform.position.y}
        data-background-zoom={variant.backgroundImageTransform.scale}
        className="sb-content-switch relative m-auto shrink-0 overflow-hidden bg-white shadow-[0_10px_35px_rgba(23,32,51,0.15)]"
        style={{
          width: result.model.width * scale,
          height: result.model.height * scale,
          ...(contentMode === "schedule"
            ? {
                backgroundColor: "#f8fafc",
                backgroundImage:
                  "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                backgroundSize: "16px 16px",
              }
            : {}),
          cursor: backgroundEditor?.adjusting
            ? backgroundDragging
              ? "grabbing"
              : "grab"
            : photoEditor?.adjusting && photoEditor.hasPhoto
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
          if (backgroundEditor?.adjusting) {
            event.currentTarget.setPointerCapture(event.pointerId);
            backgroundDragStart.current = {
              x: event.clientX,
              y: event.clientY,
            };
            setBackgroundDragging(true);
            backgroundEditor.onPanStart();
            return;
          }
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
          const scheduleHitSlop = 12 / scale;
          setScheduleSelected(
            point.x >= bounds.x - scheduleHitSlop &&
              point.x <= bounds.x + bounds.width + scheduleHitSlop &&
              point.y >= bounds.y - scheduleHitSlop &&
              point.y <= bounds.y + bounds.height + scheduleHitSlop,
          );
        }}
        onPointerMove={(event) => {
          const backgroundStart = backgroundDragStart.current;
          if (backgroundStart && backgroundEditor?.adjusting) {
            backgroundEditor.onPanMove({
              x: (event.clientX - backgroundStart.x) / scale,
              y: (event.clientY - backgroundStart.y) / scale,
            });
            return;
          }
          const start = photoDragStart.current;
          if (!start || !photoEditor?.adjusting) return;
          photoEditor.onPanMove({
            x: (event.clientX - start.x) / scale,
            y: (event.clientY - start.y) / scale,
          });
        }}
        onPointerUp={(event) => {
          if (backgroundDragStart.current) {
            backgroundDragStart.current = null;
            setBackgroundDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
            backgroundEditor?.onPanEnd();
            return;
          }
          if (!photoDragStart.current) return;
          photoDragStart.current = null;
          setPhotoDragging(false);
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
          photoEditor?.onPanEnd();
        }}
        onPointerCancel={() => {
          if (backgroundDragStart.current) {
            backgroundDragStart.current = null;
            setBackgroundDragging(false);
            backgroundEditor?.onPanEnd();
            return;
          }
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
          onMouseDown={(event) => {
            if (event.target === event.target.getStage()) {
              setScheduleSelected(false);
              stickerEditor?.onSelect(null);
            }
          }}
          onTouchStart={(event) => {
            if (event.target === event.target.getStage()) {
              setScheduleSelected(false);
              stickerEditor?.onSelect(null);
            }
          }}
        >
          {fontState === "ready" ? (
            <ScheduleScene model={result.model} assets={assetImages} />
          ) : null}
          <PreviewEnvironmentOverlay
            variant={variant}
            safeAreas={safeAreas}
            showSafeAreas={variant.preview.showSafeAreas}
            guideImage={guideImage}
            guideOpacity={guideOpacity}
            previewScale={scale}
            artworkTone={artworkTone}
          />
          {contentMode === "wallpaper" && result.photoPlaceholders?.length ? (
            <PolaroidPlaceholderOverlay
              placeholders={result.photoPlaceholders}
              previewScale={scale}
            />
          ) : null}
          {contentMode !== "schedule" &&
          photoEditor &&
          !backgroundEditor?.adjusting ? (
            <PhotoEditorOverlay
              frame={photoEditor.frame}
              rotation={photoEditor.rotation ?? 0}
              hasPhoto={photoEditor.hasPhoto}
              adjusting={photoEditor.adjusting}
              previewScale={scale}
            />
          ) : null}
          {contentMode !== "background" &&
          !photoEditor?.adjusting &&
          !backgroundEditor?.adjusting ? (
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
              onSelect={() => {
                setScheduleSelected(true);
                stickerEditor?.onSelect(null);
              }}
              onDragStart={onDragStart}
              onDragMove={(x, y) => onDragMove(x, y, scale)}
              onDragEnd={(x, y) => onDragEnd(x, y, scale)}
              lockAspectRatio={variant.scheduleSize.lockAspectRatio}
              onResizeStart={(handle) => {
                setScheduleResizing(true);
                onResizeStart(handle);
              }}
              onResizeMove={(handle, bounds) =>
                onResizeMove(handle, bounds, scale)
              }
              onResizeEnd={(handle, bounds) => {
                onResizeEnd(handle, bounds, scale);
                setScheduleResizing(false);
              }}
            />
          ) : null}
          {contentMode !== "schedule" &&
          !photoEditor?.adjusting &&
          !backgroundEditor?.adjusting &&
          stickerEditor ? (
            <StickerEditorOverlay
              variant={variant}
              previewScale={scale}
              dragging={dragging}
              guides={guides}
              interaction={{
                ...stickerEditor,
                onSelect(instanceId) {
                  if (instanceId) setScheduleSelected(false);
                  stickerEditor.onSelect(instanceId);
                },
              }}
            />
          ) : null}
        </Stage>
        {fontState !== "ready" ? (
          <div
            role="status"
            className="absolute inset-0 flex items-center justify-center bg-white/95 text-xs font-medium text-text-muted"
          >
            {fontState === "error" ? "Type unavailable" : "Loading type…"}
          </div>
        ) : null}
        {backgroundEditor?.adjusting ? (
          <div
            role="status"
            className="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/70 bg-foreground/80 px-3 py-1.5 text-center text-[11px] font-semibold whitespace-nowrap text-white shadow-lg backdrop-blur-sm"
          >
            Adjusting background · Drag to reposition · Esc or Done to finish
          </div>
        ) : null}
      </div>
      {exportSnapshot ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 -left-[20000px]"
        >
          <Stage
            key={exportSnapshot.key}
            ref={exportStageRef}
            width={exportSnapshot.model.width}
            height={exportSnapshot.model.height}
          >
            <ScheduleScene
              model={exportSnapshot.model}
              assets={exportSnapshot.assets}
            />
          </Stage>
        </div>
      ) : null}
    </div>
  );
}
