import type { HistorySlice, StoreContext } from "../types";

export const HISTORY_LIMIT = 50;

export function createHistorySlice(context: StoreContext): HistorySlice {
  return {
    history: { past: [], future: [], transaction: null },
    undo() {
      const entry = context.get().history.past.at(-1);
      if (!entry) return;
      const restored = {
        ...entry.before,
        updatedAt: context.dependencies.now!(),
      };
      context.set((state) => ({
        projectsById: { ...state.projectsById, [entry.projectId]: restored },
        history: {
          past: state.history.past.slice(0, -1),
          future: [...state.history.future, entry],
          transaction: null,
        },
      }));
      context.enqueueAutosave(restored);
    },
    redo() {
      const entry = context.get().history.future.at(-1);
      if (!entry) return;
      const restored = {
        ...entry.after,
        updatedAt: context.dependencies.now!(),
      };
      context.set((state) => ({
        projectsById: { ...state.projectsById, [entry.projectId]: restored },
        history: {
          past: [...state.history.past, entry].slice(-HISTORY_LIMIT),
          future: state.history.future.slice(0, -1),
          transaction: null,
        },
      }));
      context.enqueueAutosave(restored);
    },
    beginHistoryTransaction(label) {
      const id = context.get().activeProjectId;
      const project = id ? context.get().projectsById[id] : undefined;
      if (!project || context.get().history.transaction) return;
      context.set((state) => ({
        history: {
          ...state.history,
          transaction: {
            label,
            projectId: id!,
            before: structuredClone(project),
          },
        },
      }));
    },
    commitHistoryTransaction() {
      const transaction = context.get().history.transaction;
      const project = transaction
        ? context.get().projectsById[transaction.projectId]
        : undefined;
      if (!transaction || !project) return;
      if (JSON.stringify(transaction.before) === JSON.stringify(project)) {
        context.set((state) => ({
          history: { ...state.history, transaction: null },
        }));
        return;
      }
      const after = { ...project, updatedAt: context.dependencies.now!() };
      const entry = {
        label: transaction.label,
        projectId: transaction.projectId,
        before: transaction.before,
        after,
      };
      context.set((state) => ({
        projectsById: { ...state.projectsById, [transaction.projectId]: after },
        history: {
          past: [...state.history.past, entry].slice(-HISTORY_LIMIT),
          future: [],
          transaction: null,
        },
      }));
      context.enqueueAutosave(after);
    },
    cancelHistoryTransaction() {
      const transaction = context.get().history.transaction;
      if (!transaction) return;
      context.set((state) => ({
        projectsById: {
          ...state.projectsById,
          [transaction.projectId]: transaction.before,
        },
        history: { ...state.history, transaction: null },
      }));
    },
  };
}
