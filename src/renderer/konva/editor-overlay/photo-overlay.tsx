"use client";

import Konva from "konva";
import { Fragment, useEffect, useRef, useState } from "react";
import { Group, Layer, Line, Rect, Text } from "react-konva";
import type { Rect as ModelRect } from "@/domain/render";
import { resolvePhotoSplitMosaicFrames } from "@/domain/render/photo-split-layout";
import { fontFamilyForId } from "../font-loading";

type SplitPhotoCount = 1 | 2 | 3 | 4;

const SPLIT_PREVIEW_HOLD_MS = 1500;
const SPLIT_PREVIEW_TRANSITION_SECONDS = 0.45;

export function nextSplitPreviewCount(count: SplitPhotoCount): SplitPhotoCount {
  return count === 4 ? 1 : ((count + 1) as SplitPhotoCount);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function SplitPlaceholderGroup({
  frame,
  count,
  portrait,
  gap,
  previewScale,
}: {
  frame: ModelRect;
  count: SplitPhotoCount;
  portrait: boolean;
  gap: number;
  previewScale: number;
}) {
  const cells = resolvePhotoSplitMosaicFrames(frame, count, portrait, gap);
  return cells.map((cell, index) => (
    <Fragment key={index}>
      <Rect
        name="split-empty-photo"
        {...cell}
        fill="#E9EDF2"
        stroke="#CDD4DE"
        strokeWidth={1 / previewScale}
        cornerRadius={Math.max(2, Math.min(cell.width, cell.height) * 0.025)}
      />
      <Text
        name="split-empty-copy"
        {...cell}
        text={`Photo ${index + 1}`}
        align="center"
        verticalAlign="middle"
        fontFamily={fontFamilyForId("body-sans")}
        fontSize={Math.max(14, Math.min(28, cell.width * 0.06))}
        fontStyle="normal 600"
        fill="#7A8799"
      />
    </Fragment>
  ));
}

export function SplitPlaceholderPreviewOverlay({
  frame,
  portrait,
  gap,
  previewScale,
}: {
  frame: ModelRect;
  portrait: boolean;
  gap: number;
  previewScale: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [cycle, setCycle] = useState<{
    current: SplitPhotoCount;
    previous: SplitPhotoCount | null;
  }>({ current: 1, previous: null });
  const incomingRef = useRef<Konva.Group>(null);
  const outgoingRef = useRef<Konva.Group>(null);
  const { current, previous } = cycle;
  const displayedCycle = reducedMotion
    ? ({ current: 4, previous: null } as const)
    : cycle;

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setCycle((value) =>
        value.previous === null
          ? {
              current: nextSplitPreviewCount(value.current),
              previous: value.current,
            }
          : value,
      );
    }, SPLIT_PREVIEW_HOLD_MS);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || previous === null) return;
    const incoming = incomingRef.current;
    const outgoing = outgoingRef.current;
    if (!incoming || !outgoing) return;
    incoming.opacity(0);
    outgoing.opacity(1);
    incoming.getLayer()?.batchDraw();
    const tweens = [
      new Konva.Tween({
        node: incoming,
        opacity: 1,
        duration: SPLIT_PREVIEW_TRANSITION_SECONDS,
        easing: Konva.Easings.EaseInOut,
      }),
      new Konva.Tween({
        node: outgoing,
        opacity: 0,
        duration: SPLIT_PREVIEW_TRANSITION_SECONDS,
        easing: Konva.Easings.EaseInOut,
      }),
    ];
    tweens.forEach((tween) => tween.play());
    const finish = window.setTimeout(
      () => setCycle((value) => ({ ...value, previous: null })),
      SPLIT_PREVIEW_TRANSITION_SECONDS * 1000,
    );
    return () => {
      window.clearTimeout(finish);
      tweens.forEach((tween) => tween.destroy());
    };
  }, [current, previous, reducedMotion]);

  return (
    <Layer name="split-placeholder-preview" listening={false}>
      {displayedCycle.previous === null ? null : (
        <Group ref={outgoingRef}>
          <SplitPlaceholderGroup
            frame={frame}
            count={displayedCycle.previous}
            portrait={portrait}
            gap={gap}
            previewScale={previewScale}
          />
        </Group>
      )}
      <Group ref={incomingRef}>
        <SplitPlaceholderGroup
          frame={frame}
          count={displayedCycle.current}
          portrait={portrait}
          gap={gap}
          previewScale={previewScale}
        />
      </Group>
    </Layer>
  );
}

export type PolaroidPlaceholderFrame = {
  slot: number;
  paper: ModelRect;
  frame: ModelRect;
  rotation: number;
};

function PolaroidPlaceholderGroup({
  placeholders,
  previewScale,
}: {
  placeholders: readonly PolaroidPlaceholderFrame[];
  previewScale: number;
}) {
  return placeholders.map((placeholder) => (
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
  ));
}

export function PolaroidPlaceholderOverlay({
  placeholders,
  placeholderSets,
  previewScale,
}: {
  placeholders: readonly PolaroidPlaceholderFrame[];
  placeholderSets?: readonly (readonly PolaroidPlaceholderFrame[])[];
  previewScale: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [cycle, setCycle] = useState<{
    current: SplitPhotoCount;
    previous: SplitPhotoCount | null;
  }>({ current: 1, previous: null });
  const incomingRef = useRef<Konva.Group>(null);
  const outgoingRef = useRef<Konva.Group>(null);
  const { current, previous } = cycle;
  const canCycle = placeholderSets?.length === 4;
  const displayedCycle = reducedMotion
    ? ({ current: 4, previous: null } as const)
    : cycle;
  const currentPlaceholders = canCycle
    ? (placeholderSets[displayedCycle.current - 1] ?? placeholders)
    : placeholders;
  const previousPlaceholders =
    canCycle && displayedCycle.previous !== null
      ? (placeholderSets[displayedCycle.previous - 1] ?? placeholders)
      : null;

  useEffect(() => {
    if (reducedMotion || !canCycle) return;
    const timer = window.setInterval(() => {
      setCycle((value) =>
        value.previous === null
          ? {
              current: nextSplitPreviewCount(value.current),
              previous: value.current,
            }
          : value,
      );
    }, SPLIT_PREVIEW_HOLD_MS);
    return () => window.clearInterval(timer);
  }, [canCycle, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !canCycle || previous === null) return;
    const incoming = incomingRef.current;
    const outgoing = outgoingRef.current;
    if (!incoming || !outgoing) return;
    const travel = 6 / previewScale;
    incoming.opacity(0);
    incoming.y(travel);
    outgoing.opacity(1);
    outgoing.y(0);
    incoming.getLayer()?.batchDraw();
    const tweens = [
      new Konva.Tween({
        node: incoming,
        opacity: 1,
        y: 0,
        duration: SPLIT_PREVIEW_TRANSITION_SECONDS,
        easing: Konva.Easings.EaseInOut,
      }),
      new Konva.Tween({
        node: outgoing,
        opacity: 0,
        y: -travel / 2,
        duration: SPLIT_PREVIEW_TRANSITION_SECONDS,
        easing: Konva.Easings.EaseInOut,
      }),
    ];
    tweens.forEach((tween) => tween.play());
    const finish = window.setTimeout(
      () => setCycle((value) => ({ ...value, previous: null })),
      SPLIT_PREVIEW_TRANSITION_SECONDS * 1000,
    );
    return () => {
      window.clearTimeout(finish);
      tweens.forEach((tween) => tween.destroy());
    };
  }, [canCycle, current, previous, previewScale, reducedMotion]);

  return (
    <Layer name="polaroid-placeholder-overlay" listening={false}>
      {previousPlaceholders ? (
        <Group ref={outgoingRef}>
          <PolaroidPlaceholderGroup
            placeholders={previousPlaceholders}
            previewScale={previewScale}
          />
        </Group>
      ) : null}
      <Group ref={incomingRef}>
        <PolaroidPlaceholderGroup
          placeholders={currentPlaceholders}
          previewScale={previewScale}
        />
      </Group>
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
