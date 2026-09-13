import userEvent from "@testing-library/user-event";
import { HomeExperience } from "@/features/creation/home-experience";
import { PortalCreation } from "@/features/creation/portal-creation";
import { CurriculumCreation } from "@/features/creation/curriculum-creation";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreatePage from "@/app/create/page";
import { ManualCreation } from "@/features/creation/manual-creation";
import { ScheduleReview } from "@/features/classes/schedule-review";
import { ScheduleBudProvider } from "@/state/react";
import { createTestStore } from "../state/helpers";
import { visualScheduleProject } from "../../fixtures/visual/schedules";
import { resolveCreationTemplate } from "@/features/creation/template-handoff";
import {
  TEMPLATE_REGISTRY,
  getTemplateById,
} from "@/domain/templates/registry";

const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));
beforeEach(() => {
  push.mockClear();
  replace.mockClear();
});

describe("template creation handoff", () => {
  it("shows the beta template collection with visual previews and creation links", () => {
    const { store } = createTestStore();
    render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <HomeExperience />
      </ScheduleBudProvider>,
    );
    const section = screen.getByRole("region", { name: "Templates" });
    for (const template of TEMPLATE_REGISTRY) {
      expect(
        within(section).getByRole("heading", { name: template.name }),
      ).toBeVisible();
      expect(
        within(section).getByRole("img", {
          name: `${template.name} preview`,
        }),
      ).toBeVisible();
      expect(
        within(section).getByRole("link", {
          name: `Use template: ${template.name}`,
        }),
      ).toHaveAttribute("href", `/create?template=${template.id}`);
    }
    expect(within(section).getAllByRole("link")).toHaveLength(12);
    expect(store.getState().activeProjectId).toBeNull();
  });

  it("keeps the indicator and ID through Portal parsing and confirmation without early application", async () => {
    const { store } = createTestStore();
    render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <PortalCreation templateId="crimson-focus" />
      </ScheduleBudProvider>,
    );
    expect(screen.getByText("Crimson Focus")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Schedule text"), {
      target: {
        value:
          "Subject Sec Units Schedule Room Faculty JDN503 Property Law 2A-JDN-ONSITE 4.00 Mon 05:30 PM - 09:30 PM No Room No Instructor",
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Import pasted schedule" }),
    );
    await screen.findByRole("heading", { name: "JDN503" });
    expect(screen.getByText("Crimson Focus")).toBeVisible();
    expect(store.getState().activeProjectId).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Confirm import/i }));
    expect(push).toHaveBeenCalledWith("/review?template=crimson-focus");
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]!.design
        .themeId,
    ).toBe("clean-slate");
    await store.getState().flushAutosave();
  });

  it("keeps the indicator and ID through curriculum selection without early application", async () => {
    const user = userEvent.setup();
    const { store } = createTestStore();
    render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <CurriculumCreation templateId="azul-scholar" />
      </ScheduleBudProvider>,
    );
    expect(screen.getByText("Azul Scholar")).toBeVisible();
    await user.type(
      screen.getByRole("combobox", { name: "Program" }),
      "computer science",
    );
    await user.click(screen.getByRole("option", { name: /BS CS/i }));
    await user.click(screen.getByRole("button", { name: "Year 1" }));
    await user.click(screen.getByRole("button", { name: "Semester 1" }));
    await user.click(screen.getByRole("button", { name: /Use this term/i }));
    expect(screen.getByText("Azul Scholar")).toBeVisible();
    expect(
      screen
        .getAllByRole("link")
        .some(
          (link) =>
            link.getAttribute("href") === "/review?template=azul-scholar",
        ),
    ).toBe(true);
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]!.design
        .themeId,
    ).toBe("clean-slate");
    await store.getState().flushAutosave();
  });

  it("omits template context for unknown IDs", async () => {
    render(
      await CreatePage({
        searchParams: Promise.resolve({ template: "removed-template" }),
      }),
    );
    expect(screen.queryByText(/Starting with/)).toBeNull();
    expect(
      screen.getByRole("link", { name: /Enter manually/ }),
    ).toHaveAttribute("href", "/create/manual");
  });

  it("carries selection from method chooser into manual review and edit links", async () => {
    const chooser = render(
      await CreatePage({
        searchParams: Promise.resolve({ template: "azul-scholar" }),
      }),
    );
    expect(
      screen.getByRole("link", { name: /Enter manually/ }),
    ).toHaveAttribute("href", "/create/manual?template=azul-scholar");
    expect(
      screen.getByRole("link", { name: /Use curriculum/ }),
    ).toHaveAttribute("href", "/create/curriculum?template=azul-scholar");
    expect(
      screen.getByRole("link", { name: /Import your schedule/ }),
    ).toHaveAttribute("href", "/create/portal?template=azul-scholar");
    expect(screen.getByText("Azul Scholar")).toBeVisible();
    chooser.unmount();
    const { store } = createTestStore();
    const id = store.getState().createProject();
    const fixture = { ...visualScheduleProject(), id };
    store.setState({ projectsById: { [id]: fixture } });
    const manual = render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <ManualCreation editingExisting templateId="azul-scholar" />
      </ScheduleBudProvider>,
    );
    expect(
      screen
        .getAllByRole("link")
        .some(
          (link) =>
            link.getAttribute("href") === "/review?template=azul-scholar",
        ),
    ).toBe(true);
    expect(screen.getByText("Azul Scholar")).toBeVisible();
    manual.unmount();
    render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <ScheduleReview templateId="azul-scholar" />
      </ScheduleBudProvider>,
    );
    expect(screen.getByText("Azul Scholar")).toBeVisible();
    expect(screen.getByRole("link", { name: /Edit classes/ })).toHaveAttribute(
      "href",
      "/create/manual?edit=1&template=azul-scholar",
    );
    await store.getState().flushAutosave();
  });

  it.each([...TEMPLATE_REGISTRY.map((template) => template.id), "unknown"])(
    "finalizes %s once before Studio with student schedule intact",
    async (templateId) => {
      const { store } = createTestStore();
      const id = store.getState().createProject("Student schedule");
      const fixture = { ...visualScheduleProject(), id };
      store.setState({
        projectsById: { [id]: fixture },
        history: { past: [], future: [], transaction: null },
      });
      render(
        <ScheduleBudProvider store={store} hydrate={false}>
          <ScheduleReview templateId={resolveCreationTemplate(templateId)} />
        </ScheduleBudProvider>,
      );
      const button =
        screen.queryByRole("button", { name: /Start designing/ }) ??
        screen.getByRole("button", { name: /Continue anyway/ });
      fireEvent.click(button);
      const confirm = screen.queryByRole("button", { name: /I understand/ });
      if (confirm) fireEvent.click(confirm);
      fireEvent.click(button);
      const result = store.getState().projectsById[id]!;
      expect(result.schedule).toEqual(fixture.schedule);
      expect(result.metadata).toEqual(fixture.metadata);
      if (templateId === "unknown") {
        expect(result.design).toEqual(fixture.design);
        expect(store.getState().history.past).toHaveLength(0);
        expect(push).toHaveBeenCalledWith("/studio");
      } else {
        expect(result.design.themeId).toBe(
          getTemplateById(templateId)!.recipe.design.themeId,
        );
        expect(store.getState().history.past).toHaveLength(1);
        expect(replace).toHaveBeenCalledExactlyOnceWith("/studio");
      }
      await store.getState().flushAutosave();
    },
  );
});
