import type { FontId } from "@/lib/font-registry";

export const EXPORT_LAYER_IDS = [
  "background",
  "scenery",
  "photos",
  "schedule",
  "foreground",
] as const;
export type ExportLayerId = (typeof EXPORT_LAYER_IDS)[number];

export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };

type BaseRenderNode = {
  id: string;
  opacity?: number;
  visible?: boolean;
  rotation?: number;
};

export type RectRenderNode = BaseRenderNode & {
  kind: "rect";
  geometry: Rect;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: Point;
  shadowOpacity?: number;
};

export type TextRenderNode = BaseRenderNode & {
  kind: "text";
  position: Point;
  width: number;
  height?: number;
  text: string;
  fontId: FontId;
  fontSize: number;
  fontWeight?: 400 | 500 | 600 | 700 | 800;
  fontStyle?: "normal" | "italic";
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  lineHeight?: number;
  wrap?: "none" | "word" | "character";
  fill: string;
};

export type ImageRenderNode = BaseRenderNode & {
  kind: "image";
  geometry: Rect;
  assetId: string;
  fit: "cover" | "contain" | "stretch";
  crop?: Rect;
  focalPoint?: Point;
  zoom?: number;
  cornerRadius?: number;
};

export type LineRenderNode = BaseRenderNode & {
  kind: "line";
  points: readonly Point[];
  stroke: string;
  strokeWidth: number;
  lineCap?: "butt" | "round" | "square";
  lineJoin?: "miter" | "round" | "bevel";
  dash?: readonly number[];
  closed?: boolean;
};

export type RenderNode =
  RectRenderNode | TextRenderNode | ImageRenderNode | LineRenderNode;

export type RenderLayer<Id extends ExportLayerId = ExportLayerId> = {
  id: Id;
  nodes: readonly RenderNode[];
};

export type OrderedRenderLayers = readonly [
  RenderLayer<"background">,
  RenderLayer<"scenery">,
  RenderLayer<"photos">,
  RenderLayer<"schedule">,
  RenderLayer<"foreground">,
];

export type RenderModel = {
  width: number;
  height: number;
  layers: OrderedRenderLayers;
};

export type ScheduleRenderResult = {
  model: RenderModel;
  overlay: EditorOverlayModel;
  scheduleBounds: Rect;
  positionRange: { minX: number; maxX: number; minY: number; maxY: number };
  photoFrame?: Rect;
  photoAssetId?: string | null;
  photoFrames?: readonly {
    assetId: string;
    frame: Rect;
    rotation: number;
  }[];
  photoPlaceholders?: readonly {
    slot: number;
    paper: Rect;
    frame: Rect;
    rotation: number;
  }[];
};

export type EditorOverlayModel = {
  safeAreas: readonly Rect[];
  selection?: Rect;
  warningRegions: readonly Rect[];
};
