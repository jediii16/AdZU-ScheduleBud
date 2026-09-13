import { describe, expect, it, vi } from "vitest";
import { normalizeSubject } from "@/domain/schedule/normalization";
import type { ScheduleDay } from "@/domain/schedule/types";
import { buildScheduleRenderModel } from "@/domain/render/layout-resolver";
import { applyTemplateToProject } from "@/domain/templates/apply-template";
import {
  TEMPLATE_REGISTRY,
  getTemplateById,
  getTemplatesByDevice,
} from "@/domain/templates/registry";
import { templateRegistrySchema } from "@/domain/templates/schema";
import { scheduleProjectSchema } from "@/domain/project";
import { visualScheduleProject } from "../../fixtures/visual/schedules";
import { createTestStore } from "../state/helpers";
import {
  resolveCreationTemplate,
  withCreationTemplate,
} from "@/features/creation/template-handoff";

// Extend the representative fixture to six days with repeated lecture/lab meetings.
function denseProject() {
  const project = visualScheduleProject();
  let id = 0;
  const days: ScheduleDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  project.schedule.push(
    ...Array.from({ length: 3 }, (_, index) =>
      normalizeSubject(
        {
          code: `LAB ${index + 1}`,
          section: "B",
          meetings: [
            {
              days: [days[index]!, days[index + 3]!],
              startTime: "13:00",
              endTime: "14:30",
              room: "LAB 201",
              professor: "Prof. Santos",
            },
            {
              days: [days[index]!],
              startTime: "15:00",
              endTime: "16:00",
              room: "ROOM 302",
            },
          ],
          importMetadata: { source: "portal" },
        },
        (kind) => `dense-${kind}-${++id}`,
      ),
    ),
  );
  return project;
}

const azul = getTemplateById("azul-scholar")!;
const midnight = getTemplateById("midnight-cobalt")!;

describe("built-in templates", () => {
  it.each([azul, midnight])(
    "applies $id without changing student data or other targets",
    (template) => {
      const project = denseProject();
      project.design.wallpaperTitle.text = "My own title";
      project.metadata.title = "My 2nd Semester";
      const before = structuredClone(project);
      const result = applyTemplateToProject(project, template);
      expect(project).toEqual(before);
      expect(result.schedule).toEqual(before.schedule);
      expect(result.metadata).toEqual(before.metadata);
      expect(result.design.wallpaperTitle).toEqual({
        visible: true,
        text: "My own title",
      });
      const target = result.deviceVariants.find(
        (v) => v.id === result.activeDeviceVariantId,
      )!;
      expect(target.category).toBe(template.device.category);
      expect(target.schedulePosition).toEqual(template.recipe.schedulePosition);
      expect(target.scheduleSize).toEqual(template.recipe.scheduleSize);
      expect(result.deviceVariants).toHaveLength(project.deviceVariants.length);
      expect(result.deviceVariants.filter((v) => v.id !== target.id)).toEqual(
        project.deviceVariants.filter((v) => v.id !== target.id),
      );
      expect(result.design.layoutId).toBe("grid");
      expect(result.design.layoutStyles[result.design.layoutId]).toBe(
        "grid-outline",
      );
      expect(result.design.themeId).toBe(
        template === azul ? "adzu-classic" : "midnight",
      );
      expect(result.design.typography.presetId).toBe(
        template === azul ? "cormorant-source-sans" : "outfit-dm-sans",
      );
      expect(result.design.background.mode).toBe("gradient");
      expect(result.design.visibleFields).toEqual({
        time: false,
        room: true,
        professor: false,
        section: false,
      });
      expect(result.design.subjectColors).toEqual({
        mode: "automatic",
        singleColor: null,
        bySubjectId: {},
      });
      expect(target.stickers).toHaveLength(0);
      expect(scheduleProjectSchema.safeParse(result).success).toBe(true);
      expect(
        buildScheduleRenderModel(result, target).model.layers.length,
      ).toBeGreaterThan(0);
    },
  );

  it("creates missing targets and clears target overrides", () => {
    const project = visualScheduleProject();
    project.deviceVariants = project.deviceVariants.filter(
      (v) => v.category !== "phone",
    );
    project.activeDeviceVariantId = project.deviceVariants[0]!.id;
    const result = applyTemplateToProject(project, azul);
    expect(result.deviceVariants).toHaveLength(
      project.deviceVariants.length + 1,
    );
    const target = result.deviceVariants.at(-1)!;
    expect(target.presetId).toBe(azul.device.presetId);
    target.layoutOverride = "photo";
    target.visibleFieldsOverride = { time: false };
    target.layoutVisibleFieldsOverride = { planner: { room: false } };
    const again = applyTemplateToProject(result, azul);
    const reapplied = again.deviceVariants.at(-1)!;
    expect(reapplied.id).toBe(target.id);
    expect(reapplied.layoutOverride).toBeNull();
    expect(reapplied.visibleFieldsOverride).toBeNull();
    expect(reapplied.layoutVisibleFieldsOverride).toEqual({});
    expect(reapplied.stickers).toEqual([]);
    expect(
      applyTemplateToProject(again, midnight).deviceVariants.at(-1),
    ).toEqual(reapplied);
  });

  it("commits one undo/redo checkpoint and autosave without writing or deleting assets", async () => {
    const { store, assets, projects } = createTestStore();
    const id = store.getState().createProject("My schedule");
    const project = { ...visualScheduleProject(), id };
    project.design.background = {
      mode: "image",
      image: { assetId: "old-image", overlay: "none", overlayIntensity: 0 },
    };
    project.assetReferences.photoAssetIds = ["old-photo"];
    store.setState({
      projectsById: { [id]: project },
      history: { past: [], future: [], transaction: null },
    });
    const write = vi.spyOn(assets, "write");
    const remove = vi.spyOn(assets, "delete");
    store.getState().applyTemplate(azul.id);
    const applied = store.getState().projectsById[id]!;
    expect(store.getState().history.past).toHaveLength(1);
    expect(applied.assetReferences.photoAssetIds).toEqual([]);
    store.getState().undo();
    expect(store.getState().projectsById[id]!.design).toEqual(project.design);
    expect(store.getState().projectsById[id]!.deviceVariants).toEqual(
      project.deviceVariants,
    );
    expect(store.getState().projectsById[id]!.assetReferences).toEqual(
      project.assetReferences,
    );
    store.getState().redo();
    expect(store.getState().projectsById[id]!.design).toEqual(applied.design);
    expect(store.getState().projectsById[id]!.deviceVariants).toEqual(
      applied.deviceVariants,
    );
    await store.getState().flushAutosave();
    expect((await projects.read(id)).status).toBe("found");
    expect(write).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("ships seventeen distinct beta templates for phone wallpapers", () => {
    expect(TEMPLATE_REGISTRY).toHaveLength(17);
    expect(new Set(TEMPLATE_REGISTRY.map((template) => template.id)).size).toBe(
      17,
    );
    expect(
      TEMPLATE_REGISTRY.every(
        (template) =>
          template.presentation.tags.length >= 2 &&
          template.presentation.subjects.length >= 5 &&
          template.recipe.stickers.length === 0,
      ),
    ).toBe(true);
    expect(getTemplatesByDevice("phone")).toEqual(TEMPLATE_REGISTRY);
    expect(
      getTemplateById("tidal-mint")?.recipe.design.background,
    ).toMatchObject({ mode: "gradient", gradient: { type: "radial" } });
    expect(
      getTemplateById("prism-shift")?.recipe.design.background,
    ).toMatchObject({ mode: "gradient", gradient: { type: "conic" } });
    expect(
      getTemplateById("folded-ivory")?.recipe.design.background,
    ).toMatchObject({ mode: "pattern", pattern: { type: "crumpled" } });
  });

  it("carries only recognized IDs through query strings and anchors", () => {
    expect(resolveCreationTemplate("unknown")).toBeUndefined();
    expect(resolveCreationTemplate(["azul-scholar"])).toBeUndefined();
    expect(withCreationTemplate("/review", "unknown")).toBe("/review");
    expect(
      withCreationTemplate("/create/manual?edit=1#subject-1", azul.id),
    ).toBe("/create/manual?edit=1&template=azul-scholar#subject-1");
  });

  it("rejects malformed recipes and duplicate IDs", () => {
    expect(templateRegistrySchema.safeParse([azul, azul]).success).toBe(false);
    for (const mutate of [
      (t: typeof azul) => {
        t.recipe.design.layoutStyles.grid = "planner-paper" as never;
      },
      (t: typeof azul) => {
        t.recipe.design.typography.presetId = "unknown" as never;
      },
      (t: typeof azul) => {
        t.recipe.design.themeId = "unknown" as never;
      },
      (t: typeof azul) => {
        t.recipe.stickers.push({
          stickerId: "missing",
          xRatio: 0.5,
          yRatio: 0.5,
          widthRatio: 0.2,
          rotation: 0,
          layer: "in-front",
          order: 0,
        });
      },
      (t: typeof azul) => {
        t.device.presetId = "missing";
      },
      (t: typeof azul) => {
        t.recipe.schedulePosition.x = 2;
      },
      (t: typeof azul) => {
        t.recipe.design.background = { mode: "gradient" };
      },
    ]) {
      const malformed = structuredClone(azul);
      mutate(malformed);
      expect(templateRegistrySchema.safeParse([malformed]).success).toBe(false);
    }
    expect(
      templateRegistrySchema.safeParse([{ ...azul, schedule: [] }]).success,
    ).toBe(false);
  });
});
