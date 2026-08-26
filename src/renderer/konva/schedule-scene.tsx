"use client";

import { Fragment } from "react";
import { Image as KonvaImage, Layer, Line, Rect, Text } from "react-konva";

import type { RenderModel, RenderNode } from "@/domain/render";
import {
  DEFAULT_PHOTO_TRANSFORM,
  resolvePhotoCoverCrop,
} from "@/domain/render";
import { fontFamilyForId } from "./font-loading";

export type RenderAssetImages = ReadonlyMap<string, HTMLImageElement>;

function SceneNode({
  node,
  assets,
}: {
  node: RenderNode;
  assets?: RenderAssetImages | undefined;
}) {
  if (node.visible === false) return null;
  const common = {
    opacity: node.opacity ?? 1,
    rotation: node.rotation ?? 0,
    listening: false,
  };
  switch (node.kind) {
    case "rect":
      return (
        <Rect
          {...common}
          {...node.geometry}
          {...(node.fill ? { fill: node.fill } : {})}
          {...(node.stroke ? { stroke: node.stroke } : {})}
          {...(node.strokeWidth === undefined
            ? {}
            : { strokeWidth: node.strokeWidth })}
          {...(node.cornerRadius === undefined
            ? {}
            : { cornerRadius: node.cornerRadius })}
          {...(node.shadowColor ? { shadowColor: node.shadowColor } : {})}
          {...(node.shadowBlur === undefined
            ? {}
            : { shadowBlur: node.shadowBlur })}
          {...(node.shadowOffset
            ? {
                shadowOffsetX: node.shadowOffset.x,
                shadowOffsetY: node.shadowOffset.y,
              }
            : {})}
          {...(node.shadowOpacity === undefined
            ? {}
            : { shadowOpacity: node.shadowOpacity })}
        />
      );
    case "text":
      return (
        <Text
          {...common}
          x={node.position.x}
          y={node.position.y}
          width={node.width}
          {...(node.height === undefined ? {} : { height: node.height })}
          text={node.text}
          fontFamily={fontFamilyForId(node.fontId)}
          fontSize={node.fontSize}
          fontStyle={`${node.fontStyle ?? "normal"} ${node.fontWeight ?? 400}`}
          {...(node.align ? { align: node.align } : {})}
          {...(node.verticalAlign ? { verticalAlign: node.verticalAlign } : {})}
          {...(node.lineHeight === undefined
            ? {}
            : { lineHeight: node.lineHeight })}
          wrap={
            node.wrap === "character"
              ? "char"
              : node.wrap === "none"
                ? "none"
                : "word"
          }
          fill={node.fill}
        />
      );
    case "line":
      return (
        <Line
          {...common}
          points={node.points.flatMap((point) => [point.x, point.y])}
          stroke={node.stroke}
          strokeWidth={node.strokeWidth}
          {...(node.lineCap ? { lineCap: node.lineCap } : {})}
          {...(node.lineJoin ? { lineJoin: node.lineJoin } : {})}
          {...(node.dash ? { dash: [...node.dash] } : {})}
          {...(node.closed === undefined ? {} : { closed: node.closed })}
        />
      );
    case "image": {
      const image = assets?.get(node.assetId);
      if (!image) return null;
      const crop =
        node.crop ??
        (node.fit === "cover"
          ? resolvePhotoCoverCrop(
              {
                width: image.naturalWidth || image.width,
                height: image.naturalHeight || image.height,
              },
              node.geometry,
              {
                ...DEFAULT_PHOTO_TRANSFORM,
                position: node.focalPoint ?? DEFAULT_PHOTO_TRANSFORM.position,
                scale: node.zoom ?? DEFAULT_PHOTO_TRANSFORM.scale,
              },
            )
          : undefined);
      return (
        <KonvaImage
          {...common}
          {...node.geometry}
          image={image}
          {...(crop
            ? {
                cropX: crop.x,
                cropY: crop.y,
                cropWidth: crop.width,
                cropHeight: crop.height,
              }
            : {})}
          {...(node.cornerRadius === undefined
            ? {}
            : {
                cornerRadius: Array.isArray(node.cornerRadius)
                  ? [...node.cornerRadius]
                  : typeof node.cornerRadius === "number"
                    ? node.cornerRadius
                    : [...node.cornerRadius],
              })}
        />
      );
    }
  }
}

export function ScheduleScene({
  model,
  assets,
}: {
  model: RenderModel;
  assets?: RenderAssetImages | undefined;
}) {
  return model.layers
    .filter((layer) => layer.nodes.length > 0)
    .map((layer) => (
      <Layer key={layer.id} name={`export-${layer.id}`} listening={false}>
        {layer.nodes.map((node) => (
          <Fragment key={node.id}>
            <SceneNode node={node} assets={assets} />
          </Fragment>
        ))}
      </Layer>
    ));
}
