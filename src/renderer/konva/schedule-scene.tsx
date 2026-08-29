"use client";

import { Fragment } from "react";
import {
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Shape,
  Text,
} from "react-konva";

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
    case "rect": {
      const pattern = node.pattern;
      if (!pattern)
        return (
          <Rect
            {...common}
            {...node.geometry}
            {...(node.fill ? { fill: node.fill } : {})}
            {...(node.linearGradient
              ? {
                  fillLinearGradientStartPoint: node.linearGradient.start,
                  fillLinearGradientEndPoint: node.linearGradient.end,
                  fillLinearGradientColorStops: [
                    ...node.linearGradient.colorStops,
                  ],
                }
              : {})}
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
      const emojiImage = node.emojiAssetId
        ? assets?.get(node.emojiAssetId)
        : undefined;
      return (
        <Shape
          {...common}
          {...node.geometry}
          sceneFunc={(context) => {
            const { width, height } = node.geometry;
            const edge = Math.min(width, height);
            context.save();
            context.beginPath();
            context.rect(0, 0, width, height);
            context.clip();
            context.fillStyle = pattern.backgroundColor;
            context.fillRect(0, 0, width, height);
            context.globalAlpha = pattern.opacity;
            if (pattern.type === "dots") {
              const step = Math.max(12, pattern.spacing * edge);
              const radius = Math.max(1.5, (pattern.size * edge) / 2);
              context.fillStyle = pattern.color;
              for (let row = 0, y = 0; y <= height + step; row++, y += step)
                for (
                  let x = pattern.offset && row % 2 ? -step / 2 : 0;
                  x <= width + step;
                  x += step
                ) {
                  context.beginPath();
                  context.arc(x, y, radius, 0, Math.PI * 2);
                  context.fill();
                }
            } else if (pattern.type === "grid") {
              const step = Math.max(12, pattern.spacing * edge);
              context.strokeStyle = pattern.color;
              context.lineWidth = Math.max(1, pattern.lineWeight * edge);
              for (let x = 0; x <= width; x += step) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, height);
                context.stroke();
              }
              for (let y = 0; y <= height; y += step) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(width, y);
                context.stroke();
              }
            } else if (pattern.type === "checker") {
              const size = Math.max(10, pattern.cellSize * edge);
              context.fillStyle = pattern.color;
              for (let row = 0, y = 0; y < height; row++, y += size)
                for (
                  let column = row % 2, x = column * size;
                  x < width;
                  x += size * 2
                )
                  context.fillRect(x, y, size, size);
            } else if (pattern.type === "diagonal") {
              const step = Math.max(14, pattern.spacing * edge);
              context.strokeStyle = pattern.color;
              context.lineWidth = Math.max(2, pattern.stripeWidth * edge);
              for (
                let offset = -height;
                offset <= width + height;
                offset += step
              ) {
                context.beginPath();
                context.moveTo(offset, pattern.angle === 45 ? height : 0);
                context.lineTo(
                  offset + height,
                  pattern.angle === 45 ? 0 : height,
                );
                context.stroke();
              }
            } else if (emojiImage) {
              const size = Math.max(18, pattern.size * edge);
              const step = Math.max(size * 1.1, pattern.spacing * edge);
              const radians = (pattern.rotation * Math.PI) / 180;
              for (
                let row = 0, y = step / 2;
                y < height + step;
                row++, y += step
              )
                for (
                  let x =
                    step / 2 +
                    (pattern.layout === "offset" && row % 2 ? step / 2 : 0);
                  x < width + step;
                  x += step
                ) {
                  context.save();
                  context.translate(x, y);
                  context.rotate(radians);
                  context.drawImage(
                    emojiImage,
                    -size / 2,
                    -size / 2,
                    size,
                    size,
                  );
                  context.restore();
                }
            }
            context.restore();
          }}
        />
      );
    }
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
          {...(node.letterSpacing === undefined
            ? {}
            : { letterSpacing: node.letterSpacing })}
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
          {...(node.rotationOrigin === "center"
            ? {
                x: node.geometry.x + node.geometry.width / 2,
                y: node.geometry.y + node.geometry.height / 2,
                width: node.geometry.width,
                height: node.geometry.height,
                offsetX: node.geometry.width / 2,
                offsetY: node.geometry.height / 2,
              }
            : node.geometry)}
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
