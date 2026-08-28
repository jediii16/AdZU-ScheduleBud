import { z } from "zod";

export const stickerLayerSchema = z.enum(["behind-schedule", "in-front"]);
export type StickerLayer = z.infer<typeof stickerLayerSchema>;

export const stickerInstanceSchema = z.object({
  instanceId: z.string().min(1),
  stickerId: z.string().min(1),
  xRatio: z.number().finite().min(-1).max(2),
  yRatio: z.number().finite().min(-1).max(2),
  widthRatio: z.number().finite().min(0.04).max(1.5),
  rotation: z.number().finite().min(-180).max(180),
  layer: stickerLayerSchema,
  order: z.number().int().min(0),
});
export type StickerInstance = z.infer<typeof stickerInstanceSchema>;

export type StickerDefinition = {
  id: string;
  label: string;
  category: string;
  subcategory?: string;
  src: string;
  keywords?: readonly string[];
  /** The visible artwork within the source SVG canvas. */
  crop: { x: number; y: number; width: number; height: number };
  intrinsic: { width: number; height: number };
  defaultWidthRatio?: number;
};
