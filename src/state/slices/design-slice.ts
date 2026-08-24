import type { DesignSlice, StoreContext } from "../types";
import { themeById } from "@/data/themes/registry";

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
    setLayout: (value) => edit("Change layout", "layoutId", value),
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
