import { layoutById } from "@/data/layouts/registry";
import type { LayoutId } from "@/domain/design/types";
import type { DeviceVariant } from "@/domain/device/types";
import type { ScheduleProject } from "@/domain/project";
import { buildCardsRenderModel } from "./cards-layout";
import { buildMinimalRenderModel } from "./minimal-layout";
import { buildGridRenderModel } from "./grid-layout";
import { buildPlannerRenderModel } from "./planner-layout";
import { buildPhotoHeroRenderModel } from "./photo-layout";
import { buildPhotoSplitRenderModel } from "./photo-split-layout";
import { buildPhotoPolaroidRenderModel } from "./photo-polaroid-layout";
import { resolveAvailablePhotoComposition } from "./photo-crop";

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
  if (layout === "minimal") return buildMinimalRenderModel(project, variant);
  if (layout === "grid") return buildGridRenderModel(project, variant);
  if (layout === "planner") return buildPlannerRenderModel(project, variant);
  if (layout === "photo") {
    const composition = resolveAvailablePhotoComposition(
      project.design.photoComposition,
    );
    if (composition === "polaroid")
      return buildPhotoPolaroidRenderModel(project, variant);
    if (composition === "split")
      return buildPhotoSplitRenderModel(project, variant);
    return buildPhotoHeroRenderModel(project, variant);
  }
  return buildCardsRenderModel(project, variant);
}
