import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ScheduleBudProvider } from "@/state/react";
import { AppHeader } from "@/components/shell/app-header";
import { HomeExperience } from "@/features/creation/home-experience";
import type { ProjectListResult } from "@/storage/types";
import { createTestStore, MemoryProjectRepository } from "../state/helpers";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("ScheduleBudProvider persistence hardening", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("warns without deleting records when a saved schedule cannot be opened", async () => {
    class PartialRepository extends MemoryProjectRepository {
      override async list(): Promise<ProjectListResult> {
        return {
          projects: [],
          failures: [{ status: "invalid", id: "damaged", reason: "Invalid" }],
        };
      }
    }
    const { store } = createTestStore({ projects: new PartialRepository() });

    render(
      <ScheduleBudProvider store={store}>
        <HomeExperience />
      </ScheduleBudProvider>,
    );

    const library = await screen.findByRole("region", {
      name: "Your schedules",
    });
    expect(within(library).getByRole("note")).toHaveTextContent(
      "A saved schedule couldn't be opened. ScheduleBud left it untouched.",
    );
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("note")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("remembers a dismissed warning while the unreadable records are unchanged", async () => {
    class PartialRepository extends MemoryProjectRepository {
      override async list(): Promise<ProjectListResult> {
        return {
          projects: [],
          failures: [
            { status: "invalid", id: "older-record", reason: "Invalid" },
          ],
        };
      }
    }
    const { store } = createTestStore({ projects: new PartialRepository() });
    const first = render(
      <ScheduleBudProvider store={store}>
        <HomeExperience />
      </ScheduleBudProvider>,
    );

    await screen.findByRole("note");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    first.unmount();

    render(
      <ScheduleBudProvider store={store}>
        <HomeExperience />
      </ScheduleBudProvider>,
    );
    await screen.findByRole("heading", { level: 1 });

    expect(screen.queryByRole("note")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does not overlay other pages when a saved record cannot be opened", async () => {
    class PartialRepository extends MemoryProjectRepository {
      override async list(): Promise<ProjectListResult> {
        return {
          projects: [],
          failures: [{ status: "invalid", id: "damaged", reason: "Invalid" }],
        };
      }
    }
    const { store } = createTestStore({ projects: new PartialRepository() });
    render(
      <ScheduleBudProvider store={store}>
        <p>Studio ready</p>
      </ScheduleBudProvider>,
    );

    await screen.findByText("Studio ready");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
  });

  it("warns when browser storage cannot be opened", async () => {
    class UnavailableRepository extends MemoryProjectRepository {
      override async list(): Promise<ProjectListResult> {
        throw new Error("IndexedDB unavailable");
      }
    }
    const { store } = createTestStore({
      projects: new UnavailableRepository(),
    });

    render(
      <ScheduleBudProvider store={store}>
        <p>Home ready</p>
      </ScheduleBudProvider>,
    );

    expect(await screen.findByText("Home ready")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "ScheduleBud couldn't open local storage",
    );
  });

  it("keeps routine autosave activity silent while reporting failures", () => {
    const { store } = createTestStore();
    render(
      <ScheduleBudProvider hydrate={false} store={store}>
        <AppHeader />
      </ScheduleBudProvider>,
    );

    act(() => {
      store.setState({
        autosave: { status: "saving", lastSavedAt: null, error: null },
      });
    });
    expect(screen.queryByText("Saving…")).toBeNull();

    act(() => {
      store.setState({
        autosave: {
          status: "error",
          lastSavedAt: null,
          error: "Browser storage is full.",
        },
      });
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Browser storage is full.",
    );
  });

  it("flushes pending autosave work when the page is hidden", async () => {
    const { store } = createTestStore();
    const flush = vi.spyOn(store.getState(), "flushAutosave");

    render(
      <ScheduleBudProvider store={store}>
        <p>Home ready</p>
      </ScheduleBudProvider>,
    );
    expect(await screen.findByText("Home ready")).toBeVisible();

    fireEvent(window, new Event("pagehide"));

    expect(flush).toHaveBeenCalledOnce();
  });

  it("flushes after leaving an edited field without flushing every click", async () => {
    const { store } = createTestStore();
    const flush = vi.spyOn(store.getState(), "flushAutosave");

    render(
      <ScheduleBudProvider store={store}>
        <button type="button">Save setting</button>
        <input aria-label="Project title" />
      </ScheduleBudProvider>,
    );
    await screen.findByRole("button", { name: "Save setting" });

    fireEvent.click(screen.getByRole("button", { name: "Save setting" }));
    fireEvent.focusOut(screen.getByLabelText("Project title"));
    await Promise.resolve();

    expect(flush).toHaveBeenCalledOnce();
  });
});
