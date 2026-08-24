"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";

import { scheduleBudStore } from "./store";
import type { ScheduleBudState } from "./types";

const StoreContext =
  createContext<StoreApi<ScheduleBudState>>(scheduleBudStore);
const HydrationContext = createContext(true);

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
  const hydrationPromise = useRef<Promise<unknown> | null>(null);

  useEffect(() => {
    if (!hydrate) return;
    let current = true;
    hydrationPromise.current ??= store.getState().loadProjects();
    void hydrationPromise.current
      .catch(() => undefined)
      .finally(() => current && setReady(true));
    return () => {
      current = false;
    };
  }, [hydrate, store]);

  return (
    <StoreContext.Provider value={store}>
      <HydrationContext.Provider value={ready}>
        {ready ? (
          children
        ) : (
          <div
            role="status"
            className="flex min-h-screen items-center justify-center text-sm font-medium text-text-muted"
          >
            Loading ScheduleBud…
          </div>
        )}
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
