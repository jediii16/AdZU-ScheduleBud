"use client";

import type Konva from "konva";
import { Circle, Group, Layer, Line, Rect } from "react-konva";

import type { AlignmentGuides } from "@/domain/render";
import type { DeviceVariant } from "@/domain/device/types";
import { stickerPixelGeometry } from "@/domain/stickers/geometry";
import type { ClientPoint } from "@/features/studio/sticker-trash-drop-zone";

export type StickerEditorInteraction = {
  selectedId: string | null;
  onSelect(instanceId: string | null): void;
  onTransformStart(label: string): void;
  onMove(
    instanceId: string,
    center: { x: number; y: number },
    previewScale: number,
  ): void;
  onResize(instanceId: string, width: number): void;
  onRotate(instanceId: string, rotation: number): void;
  onMoveStart?(instanceId: string, point: ClientPoint | null): void;
  onMovePointer?(point: ClientPoint): void;
  onMoveEnd?(instanceId: string, point: ClientPoint | null): void;
  onContextMenu?(instanceId: string, point: ClientPoint): void;
  onTransformEnd(): void;
};

function eventClientPoint(
  event: Konva.KonvaEventObject<Event>,
): ClientPoint | null {
  const source = event.evt as Event & {
    clientX?: number;
    clientY?: number;
    touches?: ArrayLike<{ clientX: number; clientY: number }>;
    changedTouches?: ArrayLike<{ clientX: number; clientY: number }>;
  };
  if (Number.isFinite(source.clientX) && Number.isFinite(source.clientY))
    return { x: source.clientX!, y: source.clientY! };
  const touch = source.touches?.[0] ?? source.changedTouches?.[0];
  return touch ? { x: touch.clientX, y: touch.clientY } : null;
}

export function StickerEditorOverlay({
  variant,
  previewScale,
  dragging,
  guides,
  interaction,
}: {
  variant: DeviceVariant;
  previewScale: number;
  dragging: boolean;
  guides: AlignmentGuides;
  interaction: StickerEditorInteraction;
}) {
  const strokeWidth = 1.5 / previewScale;
  const handleRadius = Math.max(7, 8 / previewScale);
  const rotationGap = Math.max(26, 28 / previewScale);
  const ordered = [...variant.stickers].sort((left, right) => {
    if (left.layer !== right.layer)
      return left.layer === "behind-schedule" ? -1 : 1;
    return left.order - right.order;
  });

  const stop = (event: Konva.KonvaEventObject<Event>) => {
    event.cancelBubble = true;
  };

  return (
    <Layer name="editor-stickers">
      {dragging && guides.verticalCenter ? (
        <Line
          points={[
            variant.dimensions.width / 2,
            0,
            variant.dimensions.width / 2,
            variant.dimensions.height,
          ]}
          stroke="#145F9B"
          strokeWidth={strokeWidth}
          listening={false}
        />
      ) : null}
      {dragging && guides.horizontalCenter ? (
        <Line
          points={[
            0,
            variant.dimensions.height / 2,
            variant.dimensions.width,
            variant.dimensions.height / 2,
          ]}
          stroke="#145F9B"
          strokeWidth={strokeWidth}
          listening={false}
        />
      ) : null}
      {ordered.map((instance) => {
        const geometry = stickerPixelGeometry(instance, variant.dimensions);
        const selected = interaction.selectedId === instance.instanceId;
        const halfWidth = geometry.width / 2;
        const halfHeight = geometry.height / 2;
        const corners = [
          [-halfWidth, -halfHeight],
          [halfWidth, -halfHeight],
          [halfWidth, halfHeight],
          [-halfWidth, halfHeight],
        ] as const;
        return (
          <Group
            key={instance.instanceId}
            x={geometry.x + halfWidth}
            y={geometry.y + halfHeight}
            rotation={instance.rotation}
            draggable
            onMouseDown={(event) => {
              stop(event);
              interaction.onSelect(instance.instanceId);
            }}
            onTouchStart={(event) => {
              stop(event);
              interaction.onSelect(instance.instanceId);
            }}
            onContextMenu={(event) => {
              stop(event);
              event.evt.preventDefault();
              const point = eventClientPoint(event);
              if (!point) return;
              interaction.onSelect(instance.instanceId);
              interaction.onContextMenu?.(instance.instanceId, point);
            }}
            onDragStart={(event) => {
              stop(event);
              interaction.onSelect(instance.instanceId);
              interaction.onTransformStart("Move sticker");
              interaction.onMoveStart?.(
                instance.instanceId,
                eventClientPoint(event),
              );
            }}
            onDragMove={(event) => {
              stop(event);
              interaction.onMove(
                instance.instanceId,
                { x: event.target.x(), y: event.target.y() },
                previewScale,
              );
              const point = eventClientPoint(event);
              if (point) interaction.onMovePointer?.(point);
            }}
            onDragEnd={(event) => {
              stop(event);
              interaction.onMove(
                instance.instanceId,
                { x: event.target.x(), y: event.target.y() },
                previewScale,
              );
              interaction.onMoveEnd?.(
                instance.instanceId,
                eventClientPoint(event),
              );
              interaction.onTransformEnd();
            }}
          >
            <Rect
              x={-halfWidth}
              y={-halfHeight}
              width={geometry.width}
              height={geometry.height}
              fill="rgba(20,95,155,0.001)"
              stroke="#145F9B"
              strokeEnabled={selected}
              strokeWidth={strokeWidth}
              dash={[5 / previewScale, 4 / previewScale]}
              hitStrokeWidth={Math.max(12, 14 / previewScale)}
            />
            {selected ? (
              <>
                <Line
                  points={[0, -halfHeight, 0, -halfHeight - rotationGap]}
                  stroke="#145F9B"
                  strokeWidth={strokeWidth}
                  listening={false}
                />
                <Circle
                  x={0}
                  y={-halfHeight - rotationGap}
                  radius={handleRadius}
                  fill="#FFFFFF"
                  stroke="#145F9B"
                  strokeWidth={strokeWidth}
                  draggable
                  onDragStart={(event) => {
                    stop(event);
                    interaction.onTransformStart("Rotate sticker");
                  }}
                  onDragMove={(event) => {
                    stop(event);
                    const stage = event.target.getStage();
                    const pointer = stage?.getPointerPosition();
                    const group = event.target.getParent();
                    if (!pointer || !group) return;
                    const center = group.getAbsolutePosition();
                    interaction.onRotate(
                      instance.instanceId,
                      (Math.atan2(pointer.y - center.y, pointer.x - center.x) *
                        180) /
                        Math.PI +
                        90,
                    );
                  }}
                  onDragEnd={(event) => {
                    stop(event);
                    interaction.onTransformEnd();
                  }}
                />
                {corners.map(([x, y], index) => (
                  <Circle
                    key={`${instance.instanceId}-corner-${index}`}
                    x={x}
                    y={y}
                    radius={handleRadius}
                    fill="#FFFFFF"
                    stroke="#145F9B"
                    strokeWidth={strokeWidth}
                    draggable
                    onDragStart={(event) => {
                      stop(event);
                      interaction.onTransformStart("Resize sticker");
                    }}
                    onDragMove={(event) => {
                      stop(event);
                      const nextWidth = Math.max(
                        Math.abs(event.target.x()) * 2,
                        (Math.abs(event.target.y()) * 2 * geometry.width) /
                          geometry.height,
                      );
                      interaction.onResize(instance.instanceId, nextWidth);
                    }}
                    onDragEnd={(event) => {
                      stop(event);
                      interaction.onTransformEnd();
                    }}
                  />
                ))}
              </>
            ) : null}
          </Group>
        );
      })}
    </Layer>
  );
}
