import { createStore, type StoreApi } from "zustand/vanilla";

import { scheduleProjectSchema, type ScheduleProject } from "@/domain/project";
import { createPersistence } from "@/storage/persistence";
import { createDesignSlice } from "./slices/design-slice";
import { createDeviceSlice } from "./slices/device-slice";
import { createEditorSlice } from "./slices/editor-slice";
import { createHistorySlice, HISTORY_LIMIT } from "./slices/history-slice";
import { createProjectSlice } from "./slices/project-slice";
import { createScheduleSlice } from "./slices/schedule-slice";
import type {
  ScheduleBudState,
  StoreContext,
  StoreDependencies,
} from "./types";

const DEFAULT_AUTOSAVE_DEBOUNCE_MS = 350;

export function createScheduleBudStore(
  dependencies: StoreDependencies,
): StoreApi<ScheduleBudState> {
  const resolved = {
    ...dependencies,
    idFactory:
      dependencies.idFactory ?? ((kind) => `${kind}-${crypto.randomUUID()}`),
    now: dependencies.now ?? (() => new Date().toISOString()),
    autosaveDebounceMs:
      dependencies.autosaveDebounceMs ?? DEFAULT_AUTOSAVE_DEBOUNCE_MS,
  };

  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let latestRevision = 0;
  let saveQueue = Promise.resolve();
  const pending = new Map<
    string,
    { revision: number; project: ScheduleProject }
  >();

  const executePending = async (): Promise<void> => {
    if (pending.size === 0) return;
    const batch = [...pending.values()];
    pending.clear();
    store.setState({
      autosave: { ...store.getState().autosave, status: "saving", error: null },
    });
    try {
      for (const item of batch) await resolved.projects.write(item.project);
      const newestWritten = Math.max(...batch.map((item) => item.revision));
      if (newestWritten === latestRevision && pending.size === 0) {
        store.setState({
          autosave: {
            status: "saved",
            lastSavedAt: resolved.now(),
            error: null,
          },
        });
      }
    } catch (error) {
      for (const item of batch) {
        const newer = pending.get(item.project.id);
        if (!newer || newer.revision < item.revision)
          pending.set(item.project.id, item);
      }
      store.setState({
        autosave: {
          ...store.getState().autosave,
          status: "error",
          error:
            error instanceof Error ? error.message : "Couldn't save locally.",
        },
      });
    }
  };

  const requestFlush = (): Promise<void> => {
    saveQueue = saveQueue.then(executePending, executePending);
    return saveQueue;
  };

  const enqueueAutosave = (project: ScheduleProject): void => {
    latestRevision += 1;
    pending.set(project.id, {
      revision: latestRevision,
      project: structuredClone(project),
    });
    store.setState({
      autosave: { ...store.getState().autosave, status: "idle", error: null },
    });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = undefined;
      void requestFlush();
    }, resolved.autosaveDebounceMs);
  };

  const cancelAutosave = (projectId: string): void => {
    pending.delete(projectId);
  };

  const store = createStore<ScheduleBudState>((set, get) => {
    const context: StoreContext = {
      dependencies: resolved,
      get,
      set(partial) {
        set(partial);
      },
      enqueueAutosave,
      cancelAutosave,
      commit(label, mutate, options = {}) {
        const activeProjectId = get().activeProjectId;
        if (!activeProjectId) return null;
        const projectId = activeProjectId;
        const before = get().projectsById[projectId];
        if (!before) return null;
        const candidate = mutate(structuredClone(before));
        if (JSON.stringify(candidate) === JSON.stringify(before)) return null;
        const transaction = get().history.transaction;
        if (transaction?.projectId === projectId) {
          const intermediate = scheduleProjectSchema.parse(candidate);
          set((state) => ({
            projectsById: { ...state.projectsById, [projectId]: intermediate },
          }));
          return intermediate;
        }
        const after = scheduleProjectSchema.parse({
          ...candidate,
          updatedAt: resolved.now(),
        });
        const historyEnabled = options.history ?? true;
        set((state) => ({
          projectsById: { ...state.projectsById, [projectId]: after },
          ...(historyEnabled
            ? {
                history: {
                  past: [
                    ...state.history.past,
                    {
                      label,
                      projectId,
                      before: structuredClone(before),
                      after: structuredClone(after),
                    },
                  ].slice(-HISTORY_LIMIT),
                  future: [],
                  transaction: null,
                },
              }
            : {}),
        }));
        if (options.autosave ?? true) enqueueAutosave(after);
        return after;
      },
    };

    return {
      ...createProjectSlice(context),
      ...createScheduleSlice(context),
      ...createDesignSlice(context),
      ...createDeviceSlice(context),
      ...createEditorSlice(context),
      ...createHistorySlice(context),
      autosave: { status: "idle", lastSavedAt: null, error: null },
      async flushAutosave() {
        if (saveTimer) {
          clearTimeout(saveTimer);
          saveTimer = undefined;
        }
        await requestFlush();
      },
    };
  });

  return store;
}

const persistence = createPersistence();
export const scheduleBudStore = createScheduleBudStore({
  projects: persistence.projects,
  assets: persistence.assets,
  applicationMetadata: persistence.applicationMetadata,
});
