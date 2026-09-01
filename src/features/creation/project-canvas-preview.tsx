"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage } from "react-konva";

import type { ScheduleProject } from "@/domain/project";
import { buildScheduleRenderModel } from "@/domain/render";
import {
  ensureRenderModelFontSignature,
  renderModelFontSignature,
} from "@/renderer/konva/font-loading";
import { ScheduleScene } from "@/renderer/konva/schedule-scene";
import {
  loadRenderAssetSources,
  renderAssetLoadSignature,
  type RenderAssetSourceEntry,
} from "@/renderer/konva/theme-asset-loading";

const EMPTY_ASSETS: ReadonlyMap<string, HTMLImageElement> = new Map();

export default function ProjectCanvasPreview({
  project,
}: {
  project: ScheduleProject;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [readyFontSignature, setReadyFontSignature] = useState<string | null>(
    null,
  );
  const [loadedAssets, setLoadedAssets] = useState<{
    signature: string;
    images: ReadonlyMap<string, HTMLImageElement>;
  }>({ signature: "[]", images: EMPTY_ASSETS });
  const variant =
    project.deviceVariants.find(
      (candidate) => candidate.id === project.activeDeviceVariantId,
    ) ?? project.deviceVariants[0];
  const result = useMemo(
    () => (variant ? buildScheduleRenderModel(project, variant) : null),
    [project, variant],
  );
  const fontSignature = result
    ? renderModelFontSignature(result.model)
    : "none";
  const assetSignature = result ? renderAssetLoadSignature(result.model) : "[]";
  const assetSources = useMemo<readonly RenderAssetSourceEntry[]>(
    () => JSON.parse(assetSignature) as RenderAssetSourceEntry[],
    [assetSignature],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () =>
      setSize({ width: element.clientWidth, height: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!result) return;
    let active = true;
    void ensureRenderModelFontSignature(fontSignature).then(
      () => active && setReadyFontSignature(fontSignature),
      () => active && setReadyFontSignature(fontSignature),
    );
    return () => {
      active = false;
    };
  }, [fontSignature, result]);

  useEffect(() => {
    if (assetSources.length === 0) return;
    let active = true;
    void loadRenderAssetSources(assetSources).then((images) => {
      if (active) setLoadedAssets({ signature: assetSignature, images });
    });
    return () => {
      active = false;
    };
  }, [assetSignature, assetSources]);

  if (!result) {
    return <div className="h-full w-full bg-muted" />;
  }

  const scale = Math.min(
    size.width / result.model.width,
    size.height / result.model.height,
  );
  const width = result.model.width * scale;
  const height = result.model.height * scale;
  const assets =
    loadedAssets.signature === assetSignature
      ? loadedAssets.images
      : EMPTY_ASSETS;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center overflow-hidden bg-muted/55"
    >
      {size.width > 0 &&
      size.height > 0 &&
      readyFontSignature === fontSignature ? (
        <Stage
          width={width}
          height={height}
          scaleX={scale}
          scaleY={scale}
          listening={false}
        >
          <ScheduleScene model={result.model} assets={assets} />
        </Stage>
      ) : null}
    </div>
  );
}
