import type { ScheduleProject } from "@/domain/project";
import { createDeviceVariantState } from "@/domain/device/defaults";
import { devicePresetById } from "@/data/devices/registry";
import { templateDefinitionSchema, type TemplateDefinition } from "./schema";

export function applyTemplateToProject(
  project: ScheduleProject,
  definition: TemplateDefinition,
  idFactory: (kind: "device-variant" | "sticker-instance") => string = (kind) =>
    `${kind}-${crypto.randomUUID()}`,
): ScheduleProject {
  const template = templateDefinitionSchema.parse(definition);
  const preset = devicePresetById.get(template.device.presetId)!;
  const matching = project.deviceVariants.find(
    (variant) =>
      variant.category === preset.category &&
      variant.dimensions.width === preset.width &&
      variant.dimensions.height === preset.height,
  );
  const target =
    matching ??
    createDeviceVariantState(idFactory("device-variant"), {
      category: preset.category,
      dimensions: { width: preset.width, height: preset.height },
      dimensionSource: "preset",
      presetId: preset.id,
    });
  const applied = {
    ...target,
    schedulePosition: template.recipe.schedulePosition,
    scheduleSize: template.recipe.scheduleSize,
    layoutOverride: null,
    densityOverride: null,
    visibleFieldsOverride: null,
    layoutVisibleFieldsOverride: {},
    photoTransforms: { hero: {}, split: {}, polaroid: {} },
    backgroundImageTransform: { position: { x: 0.5, y: 0.5 }, scale: 1 },
    stickers: template.recipe.stickers.map((sticker) => ({
      ...sticker,
      instanceId: idFactory("sticker-instance"),
    })),
  };
  return {
    ...project,
    design: {
      ...template.recipe.design,
      baseTemplateId: null,
      templateModified: false,
      wallpaperTitle: {
        ...project.design.wallpaperTitle,
        visible: template.recipe.showTitle,
      },
      labels: Object.fromEntries(
        Object.entries(project.design.labels).map(([key, label]) => [
          key,
          { ...label, visible: false },
        ]),
      ) as ScheduleProject["design"]["labels"],
      photoCaptions: {},
    },
    assetReferences: { ...project.assetReferences, photoAssetIds: [] },
    deviceVariants: matching
      ? project.deviceVariants.map((variant) =>
          variant.id === matching.id ? applied : variant,
        )
      : [...project.deviceVariants, applied],
    activeDeviceVariantId: target.id,
  };
}
