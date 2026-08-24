import { layoutById } from "@/data/layouts/registry";
import type { LayoutId } from "@/domain/design/types";
import type { DeviceVariant } from "@/domain/device/types";
import type { ScheduleProject } from "@/domain/project";
import { buildCardsRenderModel } from "./cards-layout";
import { buildMinimalRenderModel } from "./minimal-layout";

export function resolveProjectLayout(
  project: ScheduleProject,
  variant: DeviceVariant,
): LayoutId {
  const requested = variant.layoutOverride ?? project.design.layoutId;
  return layoutById.get(requested)?.status === "available"
    ? requested
    : "cards";
}

export function buildScheduleRenderModel(
  project: ScheduleProject,
  variant: DeviceVariant,
) {
  const layout = resolveProjectLayout(project, variant);
  return layout === "minimal"
    ? buildMinimalRenderModel(project, variant)
    : buildCardsRenderModel(project, variant);
}
