import { afterEach, describe, expect, it, vi } from "vitest";

import { createBlankProject } from "@/domain/project";
import { resolveAlignmentSnap } from "@/domain/render";
import {
  selectActiveDeviceVariant,
  selectActiveProject,
  selectSubjectById,
} from "@/state/selectors";
import { HISTORY_LIMIT } from "@/state/slices/history-slice";
import {
  createTestStore,
  MemoryMetadataRepository,
  MemoryProjectRepository,
} from "./helpers";

afterEach(() => vi.useRealTimers());

describe("project and schedule slices", () => {
  it("atomically replaces a confirmed creation draft with source metadata", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const subjectId = store.getState().addSubject({ code: "DRAFT" })!;
    const subject = store
      .getState()
      .projectsById[store.getState().activeProjectId!]!.schedule.find(
        (item) => item.id === subjectId,
      )!;
    const historyBefore = store.getState().history.past.length;
    store.getState().replaceSchedule([subject], {
      source: "portal",
      term: { schoolYear: "2099-2100", semester: null },
      curriculum: null,
    });
    const project =
      store.getState().projectsById[store.getState().activeProjectId!];
    expect(project?.metadata).toMatchObject({
      source: "portal",
      term: { schoolYear: "2099-2100" },
      curriculum: null,
    });
    expect(store.getState().history.past).toHaveLength(historyBefore + 1);
  });

  it("creates, renames, switches, duplicates, and deletes independent projects", async () => {
    const { store, projects, assets } = createTestStore();
    const first = store.getState().createProject("First");
    const subjectId = store.getState().addSubject({ code: "FIC 101" })!;
    const duplicate = await store.getState().duplicateProject(first);
    expect(duplicate).not.toBe(first);
    expect(store.getState().projectsById[duplicate!]?.schedule[0]?.id).not.toBe(
      subjectId,
    );
    store.getState().renameProject("Second copy");
    expect(selectActiveProject(store.getState())?.metadata.title).toBe(
      "Second copy",
    );
    store.getState().setActiveProject(first);
    expect(selectSubjectById(subjectId)(store.getState())?.code).toBe(
      "FIC 101",
    );
    await store.getState().deleteProject(first);
    expect(store.getState().projectsById[first]).toBeUndefined();
    expect(await projects.read(first)).toEqual({ status: "not-found" });
    expect(await assets.listByProject(first)).toEqual([]);
  });

  it("loads multiple projects and honors the stored active pointer", async () => {
    const projects = new MemoryProjectRepository();
    const metadata = new MemoryMetadataRepository();
    const one = createBlankProject({
      id: "one",
      now: "2026-08-24T00:00:00.000Z",
    });
    const two = createBlankProject({
      id: "two",
      now: "2026-08-24T00:00:01.000Z",
    });
    projects.records.set(one.id, one);
    projects.records.set(two.id, two);
    metadata.activeProjectId = two.id;
    const { store } = createTestStore({
      projects,
      applicationMetadata: metadata,
    });
    await store.getState().loadProjects();
    expect(Object.keys(store.getState().projectsById)).toHaveLength(2);
    expect(store.getState().activeProjectId).toBe("two");
  });

  it("preserves subject and meeting invariants through controlled actions", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const subjectId = store.getState().addSubject({ code: "CUSTOM" })!;
    const subject = selectSubjectById(subjectId)(store.getState())!;
    expect(subject.meetings).toHaveLength(1);
    store.getState().removeMeeting(subjectId, subject.meetings[0]!.id);
    expect(
      selectSubjectById(subjectId)(store.getState())?.meetings,
    ).toHaveLength(1);
    const meetingId = store
      .getState()
      .addMeeting(subjectId, { days: ["Mon"] })!;
    store.getState().toggleMeetingDay(subjectId, meetingId, "Thu");
    expect(
      selectSubjectById(subjectId)(store.getState())?.meetings.find(
        (meeting) => meeting.id === meetingId,
      )?.days,
    ).toEqual(["Mon", "Thu"]);
    const copiedMeeting = store
      .getState()
      .duplicateMeeting(subjectId, meetingId)!;
    expect(copiedMeeting).not.toBe(meetingId);
    const copiedSubject = store.getState().duplicateSubject(subjectId)!;
    expect(copiedSubject).not.toBe(subjectId);
  });
});

describe("design and device slices", () => {
  it("switches layouts as one undoable, redoable autosaved project change", async () => {
    const { store, projects } = createTestStore();
    store.getState().createProject();
    await store.getState().flushAutosave();
    const historyBefore = store.getState().history.past.length;
    store.getState().setLayout("minimal");
    expect(selectActiveProject(store.getState())?.design.layoutId).toBe(
      "minimal",
    );
    expect(store.getState().history.past).toHaveLength(historyBefore + 1);
    await store.getState().flushAutosave();
    const saved = await projects.read(store.getState().activeProjectId!);
    expect(
      saved.status === "found" ? saved.project.design.layoutId : null,
    ).toBe("minimal");
    store.getState().undo();
    expect(selectActiveProject(store.getState())?.design.layoutId).toBe(
      "cards",
    );
    store.getState().redo();
    expect(selectActiveProject(store.getState())?.design.layoutId).toBe(
      "minimal",
    );
  });

  it("switches themes as one undoable, redoable autosaved change without touching composition state", async () => {
    const { store, projects } = createTestStore();
    store.getState().createProject();
    const variantId = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
    })!;
    store.getState().setLayout("photo");
    store.getState().setPhotoComposition("split");
    store.getState().addPhoto("photo-one");
    store.getState().addPhoto("photo-two");
    store.getState().setPhotoCaption("photo-one", "Keep this caption");
    store.getState().setPhotoTransform(variantId, "hero", "photo-one", {
      position: { x: 0.2, y: 0.3 },
      scale: 1.2,
      rotation: 0,
    });
    store.getState().setPhotoTransform(variantId, "split", "photo-one", {
      position: { x: 0.4, y: 0.5 },
      scale: 1.3,
      rotation: 0,
    });
    store.getState().setPhotoTransform(variantId, "polaroid", "photo-one", {
      position: { x: 0.6, y: 0.7 },
      scale: 1.1,
      rotation: 0,
    });
    store.getState().setSchedulePosition(variantId, { x: 0.31, y: 0.67 });
    await store.getState().flushAutosave();

    const before = structuredClone(selectActiveProject(store.getState())!);
    const historyBefore = store.getState().history.past.length;
    store.getState().setTheme("adzu-classic");
    store.getState().setTheme("midnight");
    store.getState().setTheme("matcha-study");
    store.getState().setTheme("girlfriends-choice");
    const themed = selectActiveProject(store.getState())!;

    expect(themed.design.themeId).toBe("girlfriends-choice");
    expect(store.getState().history.past).toHaveLength(historyBefore + 4);
    expect({
      ...themed,
      design: { ...themed.design, themeId: "clean-slate" },
    }).toEqual({
      ...before,
      updatedAt: themed.updatedAt,
    });

    await store.getState().flushAutosave();
    const saved = await projects.read(themed.id);
    expect(saved.status === "found" ? saved.project.design.themeId : null).toBe(
      "girlfriends-choice",
    );
    store.getState().undo();
    expect(selectActiveProject(store.getState())?.design.themeId).toBe(
      "matcha-study",
    );
    store.getState().redo();
    expect(selectActiveProject(store.getState())?.design.themeId).toBe(
      "girlfriends-choice",
    );
    store.getState().setTheme("clean-slate");
    const restored = selectActiveProject(store.getState())!;
    expect({
      ...restored,
      design: { ...restored.design, themeId: "clean-slate" },
    }).toEqual({
      ...before,
      updatedAt: restored.updatedAt,
    });
  });

  it("preserves template provenance and marks controlled edits as modified", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const current = selectActiveProject(store.getState())!.design;
    const {
      baseTemplateId: _base,
      templateModified: _modified,
      ...templateDesign
    } = current;
    void _base;
    void _modified;
    store.getState().applyTemplateMetadata("clean-cards", {
      ...templateDesign,
      density: "compact",
    });
    expect(selectActiveProject(store.getState())?.design).toMatchObject({
      baseTemplateId: "clean-cards",
      templateModified: false,
      density: "compact",
    });
    store.getState().setLayout("minimal");
    expect(selectActiveProject(store.getState())?.design).toMatchObject({
      baseTemplateId: "clean-cards",
      templateModified: true,
      layoutId: "minimal",
    });
    store.getState().setWallpaperTitle("");
    store.getState().setWallpaperTitleVisible(false);
    store
      .getState()
      .setWallpaperLabel("semester", { visible: true, text: "First Semester" });
    expect(selectActiveProject(store.getState())?.design).toMatchObject({
      wallpaperTitle: { visible: false, text: "" },
      labels: { semester: { visible: true, text: "First Semester" } },
    });
  });

  it("stores visibility only for optional class details", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    store.getState().setVisibleField("professor", false);
    expect(
      selectActiveProject(store.getState())?.design.visibleFields,
    ).toMatchObject({
      time: true,
      room: true,
      professor: false,
      section: true,
    });
  });

  it("stores Phone Grid detail preferences per variant and layout", async () => {
    const { store, projects } = createTestStore();
    store.getState().createProject();
    const phoneId = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
    })!;
    store.getState().setVisibleField("time", false);
    const historyBefore = store.getState().history.past.length;
    store.getState().setLayoutVisibleField(phoneId, "grid", "time", true);
    expect(
      selectActiveProject(store.getState())?.deviceVariants[0]
        ?.layoutVisibleFieldsOverride,
    ).toEqual({ grid: { time: true } });
    expect(
      selectActiveProject(store.getState())?.design.visibleFields.time,
    ).toBe(false);
    expect(store.getState().history.past).toHaveLength(historyBefore + 1);
    await store.getState().flushAutosave();
    const saved = await projects.read(store.getState().activeProjectId!);
    expect(
      saved.status === "found"
        ? saved.project.deviceVariants[0]?.layoutVisibleFieldsOverride
        : null,
    ).toEqual({ grid: { time: true } });
    store.getState().undo();
    expect(
      selectActiveProject(store.getState())?.deviceVariants[0]
        ?.layoutVisibleFieldsOverride,
    ).toBeUndefined();
  });

  it("keeps variants independent, clamps positions, and preserves semantic category", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const phone = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1440, height: 3200 },
    })!;
    store.getState().setSchedulePosition(phone, { x: -1, y: 2 });
    const tablet = store.getState().createDeviceVariant({
      category: "tablet",
      dimensions: { width: 2048, height: 2732 },
    })!;
    store.getState().setSchedulePosition(tablet, { x: 0.25, y: 0.75 });
    store
      .getState()
      .setCanvasDimensions(tablet, { width: 2000, height: 3000 }, "custom");
    store.getState().setActiveDeviceVariant(phone);
    const project = selectActiveProject(store.getState())!;
    expect(
      selectActiveDeviceVariant(store.getState())?.schedulePosition,
    ).toEqual({ x: 0, y: 1 });
    expect(
      project.deviceVariants.find((variant) => variant.id === tablet),
    ).toMatchObject({
      category: "tablet",
      dimensions: { width: 2000, height: 3000 },
      schedulePosition: { x: 0.25, y: 0.75 },
    });
  });

  it("changes orientation only for Phone and Tablet variants", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const phone = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
    })!;
    const desktop = store.getState().createDeviceVariant({
      category: "desktop",
      dimensions: { width: 1920, height: 1080 },
    })!;

    store.getState().setDeviceOrientation(phone, "landscape");
    store.getState().setDeviceOrientation(desktop, "portrait");

    const variants = selectActiveProject(store.getState())!.deviceVariants;
    expect(variants.find((variant) => variant.id === phone)).toMatchObject({
      dimensions: { width: 2400, height: 1080 },
      orientation: "landscape",
    });
    expect(variants.find((variant) => variant.id === desktop)).toMatchObject({
      dimensions: { width: 1920, height: 1080 },
      orientation: "landscape",
    });
  });
});

describe("autosave and history", () => {
  it("debounces rapid updates and persists only the latest snapshot", async () => {
    vi.useFakeTimers();
    const projects = new MemoryProjectRepository();
    const { store } = createTestStore({ projects, autosaveDebounceMs: 25 });
    store.getState().createProject();
    store.getState().renameProject("A");
    store.getState().renameProject("B");
    store.getState().renameProject("Latest");
    expect(projects.writes).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(25);
    await store.getState().flushAutosave();
    expect(projects.writes).toHaveLength(1);
    expect(projects.writes[0]?.metadata.title).toBe("Latest");
    expect(store.getState().autosave.status).toBe("saved");
  });

  it("serializes an in-flight write before a newer snapshot", async () => {
    vi.useFakeTimers();
    let release: (() => void) | undefined;
    class DelayedRepository extends MemoryProjectRepository {
      delayNext = false;
      override async write(
        project: Parameters<MemoryProjectRepository["write"]>[0],
      ) {
        if (this.delayNext) {
          this.delayNext = false;
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        }
        await super.write(project);
      }
    }
    const projects = new DelayedRepository();
    const { store } = createTestStore({ projects, autosaveDebounceMs: 20 });
    store.getState().createProject();
    await store.getState().flushAutosave();
    projects.writes = [];
    projects.delayNext = true;
    store.getState().renameProject("Older in flight");
    await vi.advanceTimersByTimeAsync(20);
    store.getState().renameProject("Newest state");
    await vi.advanceTimersByTimeAsync(20);
    release?.();
    await store.getState().flushAutosave();
    expect(projects.writes.map((project) => project.metadata.title)).toEqual([
      "Older in flight",
      "Newest state",
    ]);
    expect(
      await projects.read(store.getState().activeProjectId!),
    ).toMatchObject({
      status: "found",
      project: { metadata: { title: "Newest state" } },
    });
  });

  it("retains state on failure and recovers on a later mutation", async () => {
    const projects = new MemoryProjectRepository();
    const { store } = createTestStore({ projects });
    store.getState().createProject();
    await store.getState().flushAutosave();
    projects.failNextWrite = true;
    store.getState().renameProject("Unsaved but safe");
    await store.getState().flushAutosave();
    expect(store.getState().autosave).toMatchObject({
      status: "error",
      error: "IndexedDB unavailable",
    });
    expect(selectActiveProject(store.getState())?.metadata.title).toBe(
      "Unsaved but safe",
    );
    store.getState().renameProject("Recovered");
    await store.getState().flushAutosave();
    expect(store.getState().autosave.status).toBe("saved");
    expect(projects.writes.at(-1)?.metadata.title).toBe("Recovered");
  });

  it("cancels pending autosave before project deletion", async () => {
    vi.useFakeTimers();
    const projects = new MemoryProjectRepository();
    const { store } = createTestStore({ projects, autosaveDebounceMs: 25 });
    const id = store.getState().createProject();
    store.getState().renameProject("Must stay deleted");
    await store.getState().deleteProject(id);
    await vi.advanceTimersByTimeAsync(25);
    await store.getState().flushAutosave();
    expect(await projects.read(id)).toEqual({ status: "not-found" });
  });

  it("supports undo/redo, clears redo after a new edit, and autosaves undo", async () => {
    const projects = new MemoryProjectRepository();
    const { store } = createTestStore({ projects });
    store.getState().createProject();
    await store.getState().flushAutosave();
    store.getState().renameProject("Changed");
    store.getState().undo();
    await store.getState().flushAutosave();
    expect(selectActiveProject(store.getState())?.metadata.title).toBe(
      "Untitled schedule",
    );
    expect(projects.writes.at(-1)?.metadata.title).toBe("Untitled schedule");
    store.getState().redo();
    expect(selectActiveProject(store.getState())?.metadata.title).toBe(
      "Changed",
    );
    store.getState().undo();
    store.getState().setWallpaperTitle("New branch");
    expect(store.getState().history.future).toEqual([]);
  });

  it("keeps exclusion separate from undoable, autosaved removal", async () => {
    const projects = new MemoryProjectRepository();
    const { store } = createTestStore({ projects });
    store.getState().createProject();
    const subjectId = store.getState().addSubject({ code: "THESIS1" })!;

    store.getState().setSubjectEnabled(subjectId, false);
    expect(selectSubjectById(subjectId)(store.getState())).toMatchObject({
      enabled: false,
    });
    store.getState().setSubjectEnabled(subjectId, true);
    expect(selectSubjectById(subjectId)(store.getState())).toMatchObject({
      enabled: true,
    });

    const historyBeforeRemoval = store.getState().history.past.length;
    store.getState().removeSubject(subjectId);
    expect(selectSubjectById(subjectId)(store.getState())).toBeUndefined();
    expect(store.getState().history.past).toHaveLength(
      historyBeforeRemoval + 1,
    );
    await store.getState().flushAutosave();
    expect(projects.writes.at(-1)?.schedule).toEqual([]);

    store.getState().undo();
    expect(selectSubjectById(subjectId)(store.getState())).toMatchObject({
      code: "THESIS1",
      enabled: true,
    });
    await store.getState().flushAutosave();
    expect(projects.writes.at(-1)?.schedule[0]).toMatchObject({
      id: subjectId,
      code: "THESIS1",
    });
    store.getState().redo();
    expect(selectSubjectById(subjectId)(store.getState())).toBeUndefined();
  });

  it("bounds history and ignores temporary editor or preview-only changes", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    for (let index = 0; index < HISTORY_LIMIT + 8; index += 1)
      store.getState().renameProject(`Project ${index}`);
    expect(store.getState().history.past).toHaveLength(HISTORY_LIMIT);
    const before = store.getState().history.past.length;
    store.getState().setPreviewViewport(2, { x: 10, y: 20 });
    const variant = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1206, height: 2622 },
    })!;
    const afterVariant = store.getState().history.past.length;
    store.getState().setShowSafeAreas(variant, true);
    expect(store.getState().history.past.length).toBe(afterVariant);
    expect(before).toBe(HISTORY_LIMIT);
  });

  it("groups drag intermediates into one transaction", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const variant = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1206, height: 2622 },
    })!;
    const before = store.getState().history.past.length;
    store.getState().beginHistoryTransaction("Move schedule");
    store.getState().setSchedulePosition(variant, { x: 0.4, y: 0.4 });
    store.getState().setSchedulePosition(variant, { x: 0.6, y: 0.6 });
    store.getState().setSchedulePosition(variant, { x: 0.8, y: 0.7 });
    expect(store.getState().history.past).toHaveLength(before);
    store.getState().commitHistoryTransaction();
    expect(store.getState().history.past).toHaveLength(before + 1);
    expect(
      selectActiveDeviceVariant(store.getState())?.schedulePosition,
    ).toEqual({ x: 0.8, y: 0.7 });
    store.getState().undo();
    expect(
      selectActiveDeviceVariant(store.getState())?.schedulePosition,
    ).toEqual({ x: 0.5, y: 0.5 });
  });

  it("preserves multiple custom variants in the same semantic category", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const first = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
      schedulePosition: { x: 0.2, y: 0.3 },
    })!;
    const second = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1170, height: 2532 },
      schedulePosition: { x: 0.7, y: 0.6 },
    })!;
    store.getState().setActiveDeviceVariant(first);
    expect(
      selectActiveDeviceVariant(store.getState())?.schedulePosition,
    ).toEqual({ x: 0.2, y: 0.3 });
    store.getState().setActiveDeviceVariant(second);
    expect(
      selectActiveDeviceVariant(store.getState())?.schedulePosition,
    ).toEqual({ x: 0.7, y: 0.6 });
    expect(
      selectActiveProject(store.getState())?.deviceVariants.filter(
        (variant) => variant.category === "phone",
      ),
    ).toHaveLength(2);
  });

  it("keeps a snapped drag and its guide intermediates in one history transaction", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const variant = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
      schedulePosition: { x: 0.2, y: 0.2 },
    })!;
    const before = store.getState().history.past.length;
    store.getState().beginHistoryTransaction("Move schedule");
    const snap = resolveAlignmentSnap({
      proposedOrigin: { x: 342, y: 1048 },
      scheduleSize: { width: 400, height: 300 },
      canvasSize: { width: 1080, height: 2400 },
      positionRange: { minX: 50, maxX: 630, minY: 50, maxY: 2050 },
      previewScale: 0.25,
      enabled: true,
    });
    store.getState().setAlignmentGuides(snap.guides);
    store.getState().setSchedulePosition(variant, { x: 0.5, y: 0.5 });
    store.getState().setAlignmentGuides({
      verticalCenter: false,
      horizontalCenter: false,
    });
    store.getState().commitHistoryTransaction();
    expect(store.getState().history.past).toHaveLength(before + 1);
    expect(store.getState().editor.alignmentGuides).toEqual({
      verticalCenter: false,
      horizontalCenter: false,
    });
  });
});
