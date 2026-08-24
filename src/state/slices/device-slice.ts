import {
  clampNormalizedPoint,
  inferOrientation,
  type DeviceVariant,
} from "@/domain/device/types";
import type { DeviceSlice, StoreContext } from "../types";

function updateVariant(
  project: Parameters<StoreContext["commit"]>[1] extends (
    value: infer P,
  ) => unknown
    ? P
    : never,
  variantId: string,
  update: (variant: DeviceVariant) => DeviceVariant,
) {
  return {
    ...project,
    deviceVariants: project.deviceVariants.map((variant) =>
      variant.id === variantId ? update(variant) : variant,
    ),
  };
}

export function createDeviceSlice(context: StoreContext): DeviceSlice {
  const edit = (
    label: string,
    variantId: string,
    update: (variant: DeviceVariant) => DeviceVariant,
    history = true,
  ) => {
    context.commit(
      label,
      (project) => updateVariant(project, variantId, update),
      { history, autosave: true },
    );
  };
  return {
    createDeviceVariant(input) {
      const id = context.dependencies.idFactory!("device-variant");
      const variant: DeviceVariant = {
        id,
        category: input.category,
        dimensions: input.dimensions,
        dimensionSource: input.dimensionSource ?? "custom",
        presetId: input.presetId ?? null,
        orientation: inferOrientation(input.dimensions),
        compositionId: input.compositionId ?? "default",
        schedulePosition: clampNormalizedPoint(
          input.schedulePosition ?? { x: 0.5, y: 0.5 },
        ),
        layoutOverride: null,
        densityOverride: null,
        visibleFieldsOverride: null,
        photoTransforms: {},
        preview: {
          mode: "clean",
          showSafeAreas: false,
          showWarnings: true,
          enableSnapping: true,
          guideAssetId: null,
        },
      };
      const result = context.commit("Create device variant", (project) => ({
        ...project,
        deviceVariants: [...project.deviceVariants, variant],
        activeDeviceVariantId: id,
      }));
      return result ? id : null;
    },
    removeDeviceVariant(variantId) {
      context.commit("Remove device variant", (project) => {
        const variants = project.deviceVariants.filter(
          (variant) => variant.id !== variantId,
        );
        return {
          ...project,
          deviceVariants: variants,
          activeDeviceVariantId:
            project.activeDeviceVariantId === variantId
              ? (variants[0]?.id ?? null)
              : project.activeDeviceVariantId,
        };
      });
    },
    setActiveDeviceVariant(variantId) {
      context.commit(
        "Switch device variant",
        (project) =>
          project.deviceVariants.some((variant) => variant.id === variantId)
            ? { ...project, activeDeviceVariantId: variantId }
            : project,
        { history: false, autosave: true },
      );
    },
    setCanvasDimensions(variantId, dimensions, source = "custom") {
      edit("Change canvas dimensions", variantId, (variant) => ({
        ...variant,
        dimensions,
        dimensionSource: source,
        presetId: source === "preset" ? variant.presetId : null,
        orientation: inferOrientation(dimensions),
      }));
    },
    setDevicePreset(variantId, presetId) {
      edit("Change device preset", variantId, (variant) => ({
        ...variant,
        presetId,
        dimensionSource: presetId ? "preset" : "custom",
      }));
    },
    setDeviceOrientation(variantId, orientation) {
      edit("Change device orientation", variantId, (variant) => {
        const { width, height } = variant.dimensions;
        const dimensions =
          orientation === "square"
            ? {
                width: Math.min(width, height),
                height: Math.min(width, height),
              }
            : (orientation === "portrait" && width > height) ||
                (orientation === "landscape" && height > width)
              ? { width: height, height: width }
              : variant.dimensions;
        return {
          ...variant,
          dimensions,
          orientation: inferOrientation(dimensions),
          dimensionSource: "custom",
          presetId: null,
        };
      });
    },
    setPreviewMode: (id, mode) =>
      edit(
        "Change preview mode",
        id,
        (variant) => ({ ...variant, preview: { ...variant.preview, mode } }),
        false,
      ),
    setShowSafeAreas: (id, showSafeAreas) =>
      edit(
        "Toggle safe areas",
        id,
        (variant) => ({
          ...variant,
          preview: { ...variant.preview, showSafeAreas },
        }),
        false,
      ),
    setShowWarnings: (id, showWarnings) =>
      edit(
        "Toggle warnings",
        id,
        (variant) => ({
          ...variant,
          preview: { ...variant.preview, showWarnings },
        }),
        false,
      ),
    setSnappingEnabled: (id, enableSnapping) =>
      edit(
        "Toggle snapping",
        id,
        (variant) => ({
          ...variant,
          preview: { ...variant.preview, enableSnapping },
        }),
        false,
      ),
    setGuideAsset(id, guideAssetId) {
      edit(
        "Change preview guide",
        id,
        (variant) => ({
          ...variant,
          preview: {
            ...variant.preview,
            guideAssetId,
            showSafeAreas: guideAssetId ? false : variant.preview.showSafeAreas,
            mode: guideAssetId
              ? "uploaded-guide"
              : variant.preview.mode === "uploaded-guide"
                ? "clean"
                : variant.preview.mode,
          },
        }),
        false,
      );
      context.commit(
        "Update screen guide references",
        (project) => ({
          ...project,
          assetReferences: {
            ...project.assetReferences,
            screenGuideAssetIds: guideAssetId
              ? [
                  ...new Set([
                    ...project.assetReferences.screenGuideAssetIds,
                    guideAssetId,
                  ]),
                ]
              : project.assetReferences.screenGuideAssetIds.filter((assetId) =>
                  project.deviceVariants.some(
                    (variant) =>
                      variant.id !== id &&
                      variant.preview.guideAssetId === assetId,
                  ),
                ),
          },
        }),
        { history: false, autosave: true },
      );
    },
    setSchedulePosition: (id, position) =>
      edit("Move schedule", id, (variant) => ({
        ...variant,
        schedulePosition: clampNormalizedPoint(position),
      })),
    setComposition: (id, compositionId) =>
      edit("Change composition", id, (variant) => ({
        ...variant,
        compositionId,
      })),
    setDeviceOverrides(id, overrides) {
      edit("Change device overrides", id, (variant) => ({
        ...variant,
        layoutOverride:
          overrides.layout === undefined
            ? variant.layoutOverride
            : overrides.layout,
        densityOverride:
          overrides.density === undefined
            ? variant.densityOverride
            : overrides.density,
        visibleFieldsOverride:
          overrides.visibleFields === undefined
            ? variant.visibleFieldsOverride
            : overrides.visibleFields,
      }));
    },
    setPhotoTransform: (id, assetId, transform) =>
      edit("Change photo crop", id, (variant) => ({
        ...variant,
        photoTransforms: { ...variant.photoTransforms, [assetId]: transform },
      })),
    clearPhotoTransform: (id, assetId) =>
      edit("Remove photo crop", id, (variant) => {
        const photoTransforms = { ...variant.photoTransforms };
        delete photoTransforms[assetId];
        return { ...variant, photoTransforms };
      }),
  };
}
