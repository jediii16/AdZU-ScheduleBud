import { layoutById } from "@/data/layouts/registry";
import type { LayoutId } from "@/domain/design/types";
import type { DeviceVariant } from "@/domain/device/types";
import type { ScheduleProject } from "@/domain/project";
import type { ScheduleRenderResult } from "./types";
import { applyStickers } from "./stickers";
import { buildCardsRenderModel } from "./cards-layout";
import { buildMinimalRenderModel } from "./minimal-layout";
import { buildGridRenderModel } from "./grid-layout";
import { buildPlannerRenderModel } from "./planner-layout";
import { buildPhotoHeroRenderModel } from "./photo-layout";
import { buildPhotoSplitRenderModel } from "./photo-split-layout";
import { buildPhotoPolaroidRenderModel } from "./photo-polaroid-layout";
import { resolveAvailablePhotoComposition } from "./photo-crop";
import { resolveWallpaperTheme } from "./themes/registry";
import { applyLayoutStyle, resolveLayoutStyle } from "./layout-style";
import { applyTypographyPreset } from "./typography";
import { applyBackground } from "./background";
import { applyScheduleBudWatermark } from "./watermark";

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
  const theme = resolveWallpaperTheme(
    project.design.themeId,
    layout,
    project.design.customPalette,
  );
  const composition =
    layout === "photo"
      ? resolveAvailablePhotoComposition(project.design.photoComposition)
      : undefined;
  const finish = <T extends ScheduleRenderResult>(result: T): T => {
    const style = resolveLayoutStyle({
      layout,
      preferences: project.design.layoutStyles,
      theme,
      target: variant,
      composition,
    });
    return applyStickers(
      applyScheduleBudWatermark(
        {
          ...result,
          model: applyTypographyPreset(
            applyLayoutStyle(
              applyBackground(result, project, variant, theme).model,
              style.tokens,
              theme,
            ),
            project.design.typography.presetId,
          ),
          resolvedStyle: style.tokens,
        },
        theme,
      ),
      variant,
    ) as T;
  };
  if (layout === "minimal")
    return finish(buildMinimalRenderModel(project, variant, theme));
  if (layout === "grid")
    return finish(buildGridRenderModel(project, variant, theme));
  if (layout === "planner")
    return finish(buildPlannerRenderModel(project, variant, theme));
  if (layout === "photo") {
    if (composition === "polaroid")
      return finish(buildPhotoPolaroidRenderModel(project, variant, theme));
    if (composition === "split")
      return finish(buildPhotoSplitRenderModel(project, variant, theme));
    return finish(buildPhotoHeroRenderModel(project, variant, theme));
  }
  return finish(buildCardsRenderModel(project, variant, theme));
}
