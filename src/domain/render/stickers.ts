import { stickerById } from "@/data/stickers/catalog";
import type { DeviceVariant } from "@/domain/device/types";
import { stickerPixelGeometry } from "@/domain/stickers/geometry";
import type { ImageRenderNode, ScheduleRenderResult } from "./types";

export function resolveStickerNodes(variant: DeviceVariant) {
  const behind: ImageRenderNode[] = [];
  const front: ImageRenderNode[] = [];
  const ordered = [...variant.stickers].sort(
    (left, right) => left.order - right.order,
  );
  for (const instance of ordered) {
    const definition = stickerById.get(instance.stickerId);
    if (!definition) continue;
    const node: ImageRenderNode = {
      id: `sticker-${instance.instanceId}`,
      kind: "image",
      assetId: `sticker:${definition.id}`,
      source: definition.src,
      geometry: stickerPixelGeometry(instance, variant.dimensions),
      crop: definition.crop,
      fit: "contain",
      rotation: instance.rotation,
      rotationOrigin: "center",
    };
    (instance.layer === "behind-schedule" ? behind : front).push(node);
  }
  return { behind, front };
}

export function applyStickers<T extends ScheduleRenderResult>(
  result: T,
  variant: DeviceVariant,
): T {
  const { behind, front } = resolveStickerNodes(variant);
  if (behind.length === 0 && front.length === 0) return result;
  const [background, scenery, photos, schedule, foreground] =
    result.model.layers;
  return {
    ...result,
    model: {
      ...result.model,
      layers: [
        background,
        { ...scenery, nodes: [...scenery.nodes, ...behind] },
        photos,
        schedule,
        { ...foreground, nodes: [...foreground.nodes, ...front] },
      ],
    },
  };
}
