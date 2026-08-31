import {
  DEFAULT_SCHEDULE_SIZE,
  clampScheduleSize,
  clampNormalizedPoint,
  inferOrientation,
  supportsOrientationSwitch,
  type DeviceVariant,
} from "@/domain/device/types";
import { clampPhotoTransform } from "@/domain/render/photo-crop";
import { stickerById } from "@/data/stickers/catalog";
import {
  MAX_STICKERS_PER_VARIANT,
  clampStickerInstance,
} from "@/domain/stickers/geometry";
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
        scheduleSize: DEFAULT_SCHEDULE_SIZE,
        layoutOverride: null,
        densityOverride: null,
        visibleFieldsOverride: null,
        photoTransforms: { hero: {}, split: {}, polaroid: {} },
        backgroundImageTransform: {
          position: { x: 0.5, y: 0.5 },
          scale: 1,
        },
        stickers: [],
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
        if (!supportsOrientationSwitch(variant.category)) return variant;
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
    setScheduleSize: (id, size, position) =>
      edit("Resize schedule", id, (variant) => ({
        ...variant,
        scheduleSize: clampScheduleSize(size),
        schedulePosition: position
          ? clampNormalizedPoint(position)
          : variant.schedulePosition,
      })),
    setScheduleAspectRatioLocked: (id, lockAspectRatio) =>
      edit(
        "Lock schedule proportions",
        id,
        (variant) => ({
          ...variant,
          scheduleSize: { ...variant.scheduleSize, lockAspectRatio },
        }),
        false,
      ),
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
    setLayoutVisibleField(id, layoutId, field, visible) {
      edit("Change layout detail", id, (variant) => ({
        ...variant,
        layoutVisibleFieldsOverride: {
          ...variant.layoutVisibleFieldsOverride,
          [layoutId]: {
            ...variant.layoutVisibleFieldsOverride?.[layoutId],
            [field]: visible,
          },
        },
      }));
    },
    setPhotoTransform: (id, composition, assetId, transform) =>
      edit("Change photo crop", id, (variant) => ({
        ...variant,
        photoTransforms: {
          ...variant.photoTransforms,
          [composition]: {
            ...variant.photoTransforms[composition],
            [assetId]: clampPhotoTransform(transform),
          },
        },
      })),
    clearPhotoTransform: (id, composition, assetId) =>
      edit("Reset photo crop", id, (variant) => {
        const transforms = { ...variant.photoTransforms[composition] };
        delete transforms[assetId];
        return {
          ...variant,
          photoTransforms: {
            ...variant.photoTransforms,
            [composition]: transforms,
          },
        };
      }),
    setBackgroundImageTransform: (id, transform) =>
      edit("Adjust background image", id, (variant) => ({
        ...variant,
        backgroundImageTransform: {
          position: clampNormalizedPoint(transform.position),
          scale: Math.min(10, Math.max(1, transform.scale)),
        },
      })),
    resetBackgroundImageTransform: (id) =>
      edit("Reset background image", id, (variant) => ({
        ...variant,
        backgroundImageTransform: {
          position: { x: 0.5, y: 0.5 },
          scale: 1,
        },
      })),
    addSticker(id, stickerId) {
      const definition = stickerById.get(stickerId);
      const current = context
        .get()
        .projectsById[context.get().activeProjectId ?? ""]?.deviceVariants.find(
          (variant) => variant.id === id,
        );
      if (
        !definition ||
        !current ||
        current.stickers.length >= MAX_STICKERS_PER_VARIANT
      )
        return null;
      const instanceId = context.dependencies.idFactory!("sticker-instance");
      const order = current.stickers
        .filter((item) => item.layer === "in-front")
        .reduce((maximum, item) => Math.max(maximum, item.order + 1), 0);
      const result = context.commit("Add sticker", (project) =>
        updateVariant(project, id, (variant) => ({
          ...variant,
          stickers: [
            ...variant.stickers,
            clampStickerInstance(
              {
                instanceId,
                stickerId,
                xRatio: 0.5,
                yRatio: 0.5,
                widthRatio: definition.defaultWidthRatio ?? 0.22,
                rotation: 0,
                layer: "in-front",
                order,
              },
              variant.dimensions,
            ),
          ],
        })),
      );
      return result ? instanceId : null;
    },
    updateSticker(id, instanceId, updates) {
      edit("Transform sticker", id, (variant) => ({
        ...variant,
        stickers: variant.stickers.map((item) =>
          item.instanceId === instanceId
            ? clampStickerInstance({ ...item, ...updates }, variant.dimensions)
            : item,
        ),
      }));
    },
    deleteSticker(id, instanceId) {
      edit("Delete sticker", id, (variant) => ({
        ...variant,
        stickers: variant.stickers.filter(
          (item) => item.instanceId !== instanceId,
        ),
      }));
    },
    duplicateSticker(id, instanceId) {
      const current = context
        .get()
        .projectsById[context.get().activeProjectId ?? ""]?.deviceVariants.find(
          (variant) => variant.id === id,
        );
      const source = current?.stickers.find(
        (item) => item.instanceId === instanceId,
      );
      if (
        !current ||
        !source ||
        current.stickers.length >= MAX_STICKERS_PER_VARIANT
      )
        return null;
      const duplicateId = context.dependencies.idFactory!("sticker-instance");
      const order = current.stickers
        .filter((item) => item.layer === source.layer)
        .reduce((maximum, item) => Math.max(maximum, item.order + 1), 0);
      const result = context.commit("Duplicate sticker", (project) =>
        updateVariant(project, id, (variant) => ({
          ...variant,
          stickers: [
            ...variant.stickers,
            clampStickerInstance(
              {
                ...source,
                instanceId: duplicateId,
                xRatio: source.xRatio + 0.035,
                yRatio: source.yRatio + 0.035,
                order,
              },
              variant.dimensions,
            ),
          ],
        })),
      );
      return result ? duplicateId : null;
    },
    resetStickerTransform(id, instanceId) {
      edit("Reset sticker transform", id, (variant) => ({
        ...variant,
        stickers: variant.stickers.map((item) => {
          if (item.instanceId !== instanceId) return item;
          const definition = stickerById.get(item.stickerId);
          return clampStickerInstance(
            {
              ...item,
              xRatio: 0.5,
              yRatio: 0.5,
              widthRatio: definition?.defaultWidthRatio ?? 0.22,
              rotation: 0,
            },
            variant.dimensions,
          );
        }),
      }));
    },
    setStickerLayer(id, instanceId, layer) {
      edit("Change sticker layer", id, (variant) => {
        const source = variant.stickers.find(
          (item) => item.instanceId === instanceId,
        );
        if (!source || source.layer === layer) return variant;
        const order = variant.stickers
          .filter((item) => item.layer === layer)
          .reduce((maximum, item) => Math.max(maximum, item.order + 1), 0);
        return {
          ...variant,
          stickers: variant.stickers.map((item) =>
            item.instanceId === instanceId ? { ...item, layer, order } : item,
          ),
        };
      });
    },
    moveStickerInStack(id, instanceId, direction) {
      edit(
        direction === "forward"
          ? "Bring sticker forward"
          : "Send sticker backward",
        id,
        (variant) => {
          const source = variant.stickers.find(
            (item) => item.instanceId === instanceId,
          );
          if (!source) return variant;
          const band = variant.stickers
            .filter((item) => item.layer === source.layer)
            .sort((left, right) => left.order - right.order);
          const index = band.findIndex(
            (item) => item.instanceId === instanceId,
          );
          const swapIndex = direction === "forward" ? index + 1 : index - 1;
          const swap = band[swapIndex];
          if (!swap) return variant;
          return {
            ...variant,
            stickers: variant.stickers.map((item) =>
              item.instanceId === source.instanceId
                ? { ...item, order: swap.order }
                : item.instanceId === swap.instanceId
                  ? { ...item, order: source.order }
                  : item,
            ),
          };
        },
      );
    },
  };
}
