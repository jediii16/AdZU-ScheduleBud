import type { LayoutId } from "@/domain/design/types";

export type LayoutDefinition = {
  id: LayoutId;
  name: string;
  status: "available" | "planned";
};

export const layoutRegistry: readonly LayoutDefinition[] = [
  { id: "cards", name: "Cards", status: "available" },
  { id: "minimal", name: "Minimal", status: "available" },
  { id: "grid", name: "Grid", status: "planned" },
  { id: "planner", name: "Planner", status: "planned" },
  { id: "photo", name: "Photo", status: "planned" },
];

export const layoutById = new Map(
  layoutRegistry.map((layout) => [layout.id, layout]),
);

export const availableLayouts = layoutRegistry.filter(
  (layout) => layout.status === "available",
);
