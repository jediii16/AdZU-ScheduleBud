import {
  createBlankProject,
  scheduleProjectSchema,
  type ScheduleProject,
} from "@/domain/project";
import { duplicateSubject } from "@/domain/schedule/normalization";
import { collectReferencedAssetIds } from "@/storage/assets";
import type { StoredAsset } from "@/storage/types";
import type { ProjectSlice, StoreContext } from "../types";

function rewriteAssetIds(
  project: ScheduleProject,
  replacements: ReadonlyMap<string, string>,
): ScheduleProject {
  const replace = (id: string) => replacements.get(id) ?? id;
  return scheduleProjectSchema.parse({
    ...project,
    assetReferences: {
      photoAssetIds: project.assetReferences.photoAssetIds.map(replace),
      screenGuideAssetIds:
        project.assetReferences.screenGuideAssetIds.map(replace),
    },
    design: {
      ...project.design,
      background:
        project.design.background.kind === "asset"
          ? {
              ...project.design.background,
              assetId: replace(project.design.background.assetId),
            }
          : project.design.background,
    },
    deviceVariants: project.deviceVariants.map((variant) => ({
      ...variant,
      preview: {
        ...variant.preview,
        guideAssetId: variant.preview.guideAssetId
          ? replace(variant.preview.guideAssetId)
          : null,
      },
      photoTransforms: Object.fromEntries(
        Object.entries(variant.photoTransforms).map(([id, transform]) => [
          replace(id),
          transform,
        ]),
      ),
    })),
  });
}

export function createProjectSlice(context: StoreContext): ProjectSlice {
  return {
    projectsById: {},
    activeProjectId: null,
    async loadProjects() {
      const result = await context.dependencies.projects.list();
      const storedActiveId =
        await context.dependencies.applicationMetadata.readActiveProjectId();
      const projectsById = Object.fromEntries(
        result.projects.map((project) => [project.id, project]),
      );
      const activeProjectId =
        storedActiveId && projectsById[storedActiveId]
          ? storedActiveId
          : (result.projects[0]?.id ?? null);
      context.set({
        projectsById,
        activeProjectId,
        history: { past: [], future: [], transaction: null },
        autosave: { status: "idle", lastSavedAt: null, error: null },
      });
      return result;
    },
    createProject(title) {
      const id = context.dependencies.idFactory!("project");
      const project = createBlankProject({
        id,
        now: context.dependencies.now!(),
        ...(title ? { title } : {}),
      });
      context.set((state) => ({
        projectsById: { ...state.projectsById, [id]: project },
        activeProjectId: id,
        history: { past: [], future: [], transaction: null },
      }));
      void context.dependencies.applicationMetadata.writeActiveProjectId(id);
      context.enqueueAutosave(project);
      return id;
    },
    async duplicateProject(projectId) {
      const sourceId = projectId ?? context.get().activeProjectId;
      const source = sourceId
        ? context.get().projectsById[sourceId]
        : undefined;
      if (!source) return null;
      const id = context.dependencies.idFactory!("project");
      const now = context.dependencies.now!();
      const schedule = source.schedule.map((subject) =>
        duplicateSubject(subject, (kind) =>
          context.dependencies.idFactory!(kind),
        ),
      );
      const variants = source.deviceVariants.map((variant) => ({
        ...variant,
        id: context.dependencies.idFactory!("device-variant"),
      }));
      const activeIndex = source.deviceVariants.findIndex(
        (variant) => variant.id === source.activeDeviceVariantId,
      );
      let duplicate = scheduleProjectSchema.parse({
        ...source,
        id,
        schedule,
        deviceVariants: variants,
        activeDeviceVariantId:
          activeIndex >= 0 ? (variants[activeIndex]?.id ?? null) : null,
        metadata: {
          ...source.metadata,
          title: `${source.metadata.title} copy`,
        },
        createdAt: now,
        updatedAt: now,
      });

      const replacements = new Map<string, string>();
      const copiedAssets: StoredAsset[] = [];
      const referencedAssets = collectReferencedAssetIds(source);
      for (const asset of await context.dependencies.assets.listByProject(
        source.id,
      )) {
        if (!referencedAssets.has(asset.id)) continue;
        const assetId = context.dependencies.idFactory!("asset");
        replacements.set(asset.id, assetId);
        copiedAssets.push({
          ...asset,
          id: assetId,
          projectId: id,
          createdAt: now,
        });
      }
      duplicate = rewriteAssetIds(duplicate, replacements);
      for (const asset of copiedAssets)
        await context.dependencies.assets.write(asset);
      await context.dependencies.projects.write(duplicate);
      await context.dependencies.applicationMetadata.writeActiveProjectId(id);
      context.set((state) => ({
        projectsById: { ...state.projectsById, [id]: duplicate },
        activeProjectId: id,
        history: { past: [], future: [], transaction: null },
        autosave: { status: "saved", lastSavedAt: now, error: null },
      }));
      return id;
    },
    renameProject(title) {
      const normalized = title.trim();
      if (!normalized) return;
      context.commit("Rename project", (project) => ({
        ...project,
        metadata: { ...project.metadata, title: normalized },
      }));
    },
    async deleteProject(projectId) {
      const id = projectId ?? context.get().activeProjectId;
      if (!id || !context.get().projectsById[id]) return;
      context.cancelAutosave(id);
      await context.dependencies.projects.delete(id);
      await context.dependencies.assets.deleteByProject(id);
      const projectsById = { ...context.get().projectsById };
      delete projectsById[id];
      const activeProjectId =
        context.get().activeProjectId === id
          ? (Object.keys(projectsById)[0] ?? null)
          : context.get().activeProjectId;
      await context.dependencies.applicationMetadata.writeActiveProjectId(
        activeProjectId,
      );
      context.set({
        projectsById,
        activeProjectId,
        history: { past: [], future: [], transaction: null },
      });
    },
    setActiveProject(projectId) {
      if (projectId !== null && !context.get().projectsById[projectId]) return;
      context.set({
        activeProjectId: projectId,
        history: { past: [], future: [], transaction: null },
      });
      void context.dependencies.applicationMetadata.writeActiveProjectId(
        projectId,
      );
    },
    resetProject() {
      context.commit("Reset project", (project) => {
        const blank = createBlankProject({
          id: project.id,
          now: context.dependencies.now!(),
          title: project.metadata.title,
        });
        return { ...blank, createdAt: project.createdAt };
      });
    },
  };
}
