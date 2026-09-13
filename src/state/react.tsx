"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";

import { scheduleBudStore } from "./store";
import type { ScheduleBudState } from "./types";
import type { ProjectListResult } from "@/storage/types";
import { AppLoading } from "@/components/shared/app-loading";

const StoreContext =
  createContext<StoreApi<ScheduleBudState>>(scheduleBudStore);
const HydrationContext = createContext(true);
const DISMISSED_PROJECT_WARNING_KEY =
  "schedulebud.dismissed-project-load-warning";

type HydrationWarning = {
  message: string;
  signature: string | null;
};

const ProjectLoadNoticeContext = createContext<{
  message: string | null;
  dismiss(): void;
}>({ message: null, dismiss() {} });

function projectWarningSignature(result: ProjectListResult): string {
  return result.failures
    .map((failure) => `${failure.status}:${failure.id}`)
    .sort()
    .join("|");
}

function warningWasDismissed(signature: string): boolean {
  try {
    return (
      window.localStorage.getItem(DISMISSED_PROJECT_WARNING_KEY) === signature
    );
  } catch {
    return false;
  }
}

function rememberDismissedWarning(signature: string): void {
  try {
    window.localStorage.setItem(DISMISSED_PROJECT_WARNING_KEY, signature);
  } catch {
    // The warning still dismisses for this page when localStorage is unavailable.
  }
}

export function ScheduleBudProvider({
  children,
  store = scheduleBudStore,
  hydrate = true,
}: {
  children: ReactNode;
  store?: StoreApi<ScheduleBudState>;
  hydrate?: boolean;
}) {
  const [ready, setReady] = useState(!hydrate);
  const [hydrationWarning, setHydrationWarning] =
    useState<HydrationWarning | null>(null);
  const hydrationPromise = useRef<Promise<ProjectListResult> | null>(null);
  const dismissWarning = useCallback(() => {
    if (hydrationWarning?.signature)
      rememberDismissedWarning(hydrationWarning.signature);
    setHydrationWarning(null);
  }, [hydrationWarning]);
  const projectLoadNotice = useMemo(
    () => ({
      message: hydrationWarning?.signature ? hydrationWarning.message : null,
      dismiss: dismissWarning,
    }),
    [hydrationWarning, dismissWarning],
  );

  useEffect(() => {
    if (!hydrate) return;
    let current = true;
    hydrationPromise.current ??= store.getState().loadProjects();
    void hydrationPromise.current
      .then((result) => {
        if (current && result.failures.length > 0) {
          const signature = projectWarningSignature(result);
          if (!warningWasDismissed(signature))
            setHydrationWarning({
              message: `${result.failures.length === 1 ? "A saved schedule couldn't" : `${result.failures.length} saved schedules couldn't`} be opened. ScheduleBud left ${result.failures.length === 1 ? "it" : "them"} untouched.`,
              signature,
            });
        }
      })
      .catch(() => {
        if (current)
          setHydrationWarning({
            message:
              "ScheduleBud couldn't open local storage. Your saved schedules were not changed. Reload or check this browser's storage permissions.",
            signature: null,
          });
      })
      .finally(() => current && setReady(true));
    return () => {
      current = false;
    };
  }, [hydrate, store]);

  useEffect(() => {
    if (!hydrate) return;
    const flush = () => void store.getState().flushAutosave();
    const flushAfterInteraction = () => queueMicrotask(flush);
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("focusout", flushAfterInteraction);
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flushWhenHidden);
    return () => {
      document.removeEventListener("focusout", flushAfterInteraction);
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flushWhenHidden);
    };
  }, [hydrate, store]);

  return (
    <StoreContext.Provider value={store}>
      <HydrationContext.Provider value={ready}>
        <ProjectLoadNoticeContext.Provider value={projectLoadNotice}>
          {ready ? (
            <>
              {hydrationWarning && !hydrationWarning.signature ? (
                <div
                  role="alert"
                  className="fixed right-3 bottom-20 left-3 z-[100] mx-auto max-w-2xl rounded-md border border-warning/40 bg-surface-elevated p-4 pr-20 text-sm leading-6 text-foreground shadow-xl sm:bottom-3 sm:left-auto sm:w-[30rem]"
                >
                  {hydrationWarning.message}
                  <button
                    type="button"
                    className="absolute top-3 right-3 min-h-9 rounded-sm px-2 text-xs font-semibold text-text-secondary hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    onClick={dismissWarning}
                  >
                    Dismiss
                  </button>
                </div>
              ) : null}
              {children}
            </>
          ) : (
            <AppLoading />
          )}
        </ProjectLoadNoticeContext.Provider>
      </HydrationContext.Provider>
    </StoreContext.Provider>
  );
}

export function useScheduleBudStoreApi(): StoreApi<ScheduleBudState> {
  return useContext(StoreContext);
}

export function useScheduleBudStore<T>(
  selector: (state: ScheduleBudState) => T,
): T {
  return useStore(useScheduleBudStoreApi(), selector);
}

export function useScheduleBudReady(): boolean {
  return useContext(HydrationContext);
}

export function useProjectLoadNotice() {
  return useContext(ProjectLoadNoticeContext);
}
