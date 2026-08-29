import type {
  LayoutId,
  LayoutStyleId,
  LayoutStylePreferences,
  PhotoComposition,
} from "@/domain/design/types";

export type LayoutStyleDefinition = {
  id: LayoutStyleId;
  label: string;
  layout: LayoutId;
  baseline: boolean;
  description: string;
  supportedCompositions?: readonly PhotoComposition[];
};

export const DEFAULT_LAYOUT_STYLES: LayoutStylePreferences = {
  minimal: "minimal-clean",
  cards: "cards-soft",
  grid: "grid-filled",
  planner: "planner-paper",
  photo: "photo-clean",
};

export const layoutStyleRegistry: readonly LayoutStyleDefinition[] = [
  {
    id: "minimal-clean",
    label: "Clean",
    layout: "minimal",
    baseline: true,
    description: "Simple and understated",
  },
  {
    id: "minimal-editorial",
    label: "Editorial",
    layout: "minimal",
    baseline: false,
    description: "Refined rules and hierarchy",
  },
  {
    id: "minimal-bold",
    label: "Bold",
    layout: "minimal",
    baseline: false,
    description: "Stronger graphic emphasis",
  },
  {
    id: "cards-soft",
    label: "Soft",
    layout: "cards",
    baseline: true,
    description: "Gentle surfaces and borders",
  },
  {
    id: "cards-outline",
    label: "Outline",
    layout: "cards",
    baseline: false,
    description: "Border-led treatment",
  },
  {
    id: "cards-bold",
    label: "Bold",
    layout: "cards",
    baseline: false,
    description: "Stronger graphic emphasis",
  },
  {
    id: "cards-glass",
    label: "Glass",
    layout: "cards",
    baseline: false,
    description: "Subtle translucent cards",
  },
  {
    id: "grid-filled",
    label: "Filled",
    layout: "grid",
    baseline: true,
    description: "Solid subject blocks",
  },
  {
    id: "grid-outline",
    label: "Outline",
    layout: "grid",
    baseline: false,
    description: "Border-led treatment",
  },
  {
    id: "grid-soft",
    label: "Soft",
    layout: "grid",
    baseline: false,
    description: "Gentle surfaces and borders",
  },
  {
    id: "planner-paper",
    label: "Paper",
    layout: "planner",
    baseline: true,
    description: "Planner-inspired stationery",
  },
  {
    id: "planner-soft",
    label: "Soft",
    layout: "planner",
    baseline: false,
    description: "Gentle surfaces and borders",
  },
  {
    id: "planner-editorial",
    label: "Editorial",
    layout: "planner",
    baseline: false,
    description: "Refined rules and hierarchy",
  },
  {
    id: "photo-clean",
    label: "Clean",
    layout: "photo",
    baseline: true,
    description: "Simple and understated",
  },
  {
    id: "photo-framed",
    label: "Framed",
    layout: "photo",
    baseline: false,
    description: "Defined photo presentation",
    supportedCompositions: ["hero", "split"],
  },
] as const;

export const layoutStyleById = new Map(
  layoutStyleRegistry.map((style) => [style.id, style]),
);

export function stylesForLayout(
  layout: LayoutId,
  composition?: PhotoComposition,
): readonly LayoutStyleDefinition[] {
  return layoutStyleRegistry.filter(
    (style) =>
      style.layout === layout &&
      (!style.supportedCompositions ||
        composition === undefined ||
        style.supportedCompositions.includes(composition)),
  );
}

export function resolveLayoutStyleId(
  layout: LayoutId,
  preferences: Partial<LayoutStylePreferences> | null | undefined,
  composition?: PhotoComposition,
): LayoutStyleId {
  const requested = preferences?.[layout] ?? DEFAULT_LAYOUT_STYLES[layout];
  return stylesForLayout(layout, composition).some(
    (style) => style.id === requested,
  )
    ? requested
    : DEFAULT_LAYOUT_STYLES[layout];
}
