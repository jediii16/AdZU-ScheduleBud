import type { DesignSlice, StoreContext } from "../types";
import { layoutById } from "@/data/layouts/registry";
import { themeById } from "@/data/themes/registry";
import { resolveAvailablePhotoComposition } from "@/domain/render/photo-crop";

function withPhotoCollection(
  project: Parameters<StoreContext["commit"]>[1] extends (
    value: infer P,
  ) => unknown
    ? P
    : never,
  photoAssetIds: string[],
) {
  const retained = new Set(photoAssetIds);
  return {
    ...project,
    design: {
      ...project.design,
      photoCaptions: Object.fromEntries(
        Object.entries(project.design.photoCaptions).filter(([assetId]) =>
          retained.has(assetId),
        ),
      ),
      templateModified:
        project.design.baseTemplateId !== null ||
        project.design.templateModified,
    },
    assetReferences: {
      ...project.assetReferences,
      photoAssetIds,
    },
    deviceVariants: project.deviceVariants.map((variant) => ({
      ...variant,
      photoTransforms: Object.fromEntries(
        Object.entries(variant.photoTransforms).map(
          ([composition, transforms]) => [
            composition,
            Object.fromEntries(
              Object.entries(transforms).filter(([assetId]) =>
                retained.has(assetId),
              ),
            ),
          ],
        ),
      ) as typeof variant.photoTransforms,
    })),
  };
}

export function createDesignSlice(context: StoreContext): DesignSlice {
  const edit = <
    K extends keyof ReturnType<
      StoreContext["get"]
    >["projectsById"][string]["design"],
  >(
    label: string,
    key: K,
    value: ReturnType<StoreContext["get"]>["projectsById"][string]["design"][K],
  ) => {
    context.commit(label, (project) => ({
      ...project,
      design: {
        ...project.design,
        [key]: value,
        templateModified:
          project.design.baseTemplateId !== null ||
          project.design.templateModified,
      },
    }));
  };
  return {
    setTheme(value) {
      if (themeById.get(value)?.status !== "available") return;
      edit("Change theme", "themeId", value);
    },
    setThemeVariant: (value) =>
      edit("Change theme variant", "themeVariantId", value),
    setLayout(value) {
      if (layoutById.get(value)?.status !== "available") return;
      context.commit("Change layout", (project) => ({
        ...project,
        design: {
          ...project.design,
          layoutId: value,
          photoComposition:
            value === "photo"
              ? resolveAvailablePhotoComposition(
                  project.design.photoComposition,
                )
              : project.design.photoComposition,
          templateModified:
            project.design.baseTemplateId !== null ||
            project.design.templateModified,
        },
      }));
    },
    setPhotoComposition(value) {
      edit("Change Photo composition", "photoComposition", value);
    },
    setPrimaryPhoto(assetId) {
      context.commit(assetId ? "Set Photo" : "Remove Photo", (project) => {
        const current = project.assetReferences.photoAssetIds;
        const next = assetId
          ? [assetId, ...current.slice(1).filter((id) => id !== assetId)]
          : current.slice(1);
        const updated = withPhotoCollection(project, next);
        return {
          ...updated,
          design: {
            ...updated.design,
            photoComposition: assetId
              ? resolveAvailablePhotoComposition(
                  project.design.photoComposition,
                )
              : project.design.photoComposition,
          },
        };
      });
    },
    addPhoto(assetId) {
      const project =
        context.get().projectsById[context.get().activeProjectId ?? ""];
      if (
        !project ||
        project.assetReferences.photoAssetIds.length >= 4 ||
        project.assetReferences.photoAssetIds.includes(assetId)
      )
        return false;
      return Boolean(
        context.commit("Add Photo", (current) =>
          withPhotoCollection(current, [
            ...current.assetReferences.photoAssetIds,
            assetId,
          ]),
        ),
      );
    },
    removePhoto(assetId) {
      context.commit("Remove Photo", (project) =>
        withPhotoCollection(
          project,
          project.assetReferences.photoAssetIds.filter((id) => id !== assetId),
        ),
      );
    },
    movePhoto(assetId, direction) {
      context.commit("Reorder Photos", (project) => {
        const ids = [...project.assetReferences.photoAssetIds];
        const index = ids.indexOf(assetId);
        const nextIndex = direction === "up" ? index - 1 : index + 1;
        if (index < 0 || nextIndex < 0 || nextIndex >= ids.length)
          return project;
        [ids[index], ids[nextIndex]] = [ids[nextIndex]!, ids[index]!];
        return withPhotoCollection(project, ids);
      });
    },
    setPhotoCaption(assetId, caption) {
      const normalized = caption.slice(0, 40).trim();
      context.commit("Change Photo caption", (project) => {
        if (!project.assetReferences.photoAssetIds.includes(assetId))
          return project;
        const photoCaptions = { ...project.design.photoCaptions };
        if (normalized) photoCaptions[assetId] = normalized;
        else delete photoCaptions[assetId];
        return {
          ...project,
          design: {
            ...project.design,
            photoCaptions,
            templateModified:
              project.design.baseTemplateId !== null ||
              project.design.templateModified,
          },
        };
      });
    },
    applyTemplateMetadata(templateId, design) {
      if (themeById.get(design.themeId)?.status !== "available") return;
      context.commit("Apply template", (project) => ({
        ...project,
        design: {
          ...design,
          baseTemplateId: templateId,
          templateModified: false,
        },
      }));
    },
    setDensity: (value) => edit("Change density", "density", value),
    setDayVisibility: (value) =>
      edit("Change day visibility", "dayVisibility", value),
    setVisibleField(field, visible) {
      context.commit("Change visible fields", (project) => ({
        ...project,
        design: {
          ...project.design,
          visibleFields: { ...project.design.visibleFields, [field]: visible },
          templateModified:
            project.design.baseTemplateId !== null ||
            project.design.templateModified,
        },
      }));
    },
    setSubjectColorMode(mode) {
      context.commit("Change subject palette", (project) => ({
        ...project,
        design: {
          ...project.design,
          subjectColors: { ...project.design.subjectColors, mode },
          templateModified:
            project.design.baseTemplateId !== null ||
            project.design.templateModified,
        },
      }));
    },
    setSubjectColor(subjectId, color) {
      context.commit("Change subject color", (project) => {
        const bySubjectId = { ...project.design.subjectColors.bySubjectId };
        if (color === null) delete bySubjectId[subjectId];
        else bySubjectId[subjectId] = color;
        return {
          ...project,
          design: {
            ...project.design,
            subjectColors: { ...project.design.subjectColors, bySubjectId },
            templateModified:
              project.design.baseTemplateId !== null ||
              project.design.templateModified,
          },
        };
      });
    },
    setBackground: (value) => edit("Change background", "background", value),
    setTypography: (value) => edit("Change typography", "typography", value),
    setDecorationIntensity: (value) =>
      edit(
        "Change decoration intensity",
        "decorationIntensity",
        Math.min(1, Math.max(0, value)),
      ),
    setWallpaperTitle: (text) =>
      context.commit("Change wallpaper title", (project) => ({
        ...project,
        design: {
          ...project.design,
          wallpaperTitle: { ...project.design.wallpaperTitle, text },
          templateModified:
            project.design.baseTemplateId !== null ||
            project.design.templateModified,
        },
      })),
    setWallpaperTitleVisible: (visible) =>
      context.commit("Toggle wallpaper title", (project) => ({
        ...project,
        design: {
          ...project.design,
          wallpaperTitle: { ...project.design.wallpaperTitle, visible },
          templateModified:
            project.design.baseTemplateId !== null ||
            project.design.templateModified,
        },
      })),
    setWallpaperLabel(label, value) {
      context.commit("Change wallpaper label", (project) => ({
        ...project,
        design: {
          ...project.design,
          labels: { ...project.design.labels, [label]: value },
          templateModified:
            project.design.baseTemplateId !== null ||
            project.design.templateModified,
        },
      }));
    },
  };
}
