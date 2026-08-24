"use client";

import { Fragment } from "react";
import { Layer, Line, Rect, Text } from "react-konva";

import type { RenderModel, RenderNode } from "@/domain/render";
import { fontFamilyForId } from "./font-loading";

function SceneNode({ node }: { node: RenderNode }) {
  if (node.visible === false) return null;
  const common = { opacity: node.opacity ?? 1, listening: false };
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
    case "image":
      return null;
  }
}

export function ScheduleScene({ model }: { model: RenderModel }) {
  return model.layers
    .filter((layer) => layer.nodes.length > 0)
    .map((layer) => (
      <Layer key={layer.id} name={`export-${layer.id}`} listening={false}>
        {layer.nodes.map((node) => (
          <Fragment key={node.id}>
            <SceneNode node={node} />
          </Fragment>
        ))}
      </Layer>
    ));
}
