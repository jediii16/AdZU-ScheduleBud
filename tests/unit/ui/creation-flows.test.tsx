import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import CreatePage from "@/app/create/page";
import { HomeExperience } from "@/features/creation/home-experience";
import { ManualCreation } from "@/features/creation/manual-creation";
import { CurriculumCreation } from "@/features/creation/curriculum-creation";
import {
  PendingPortalReview,
  PortalCreation,
  actionablePortalWarnings,
  summarizePortalWarnings,
} from "@/features/creation/portal-creation";
import { normalizeSubject } from "@/domain/schedule/normalization";
import { ScheduleBudProvider } from "@/state/react";
import { createTestStore } from "../state/helpers";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

function renderWithStore(ui: ReactNode) {
  const result = createTestStore({ autosaveDebounceMs: 1 });
  render(
    <ScheduleBudProvider store={result.store} hydrate={false}>
      {ui}
    </ScheduleBudProvider>,
  );
  return result;
}

function fixtureFile(name: string): File {
  const bytes = readFileSync(resolve("tests/fixtures/portal", name));
  const copy = Uint8Array.from(bytes);
  const file = new File([copy], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => copy.buffer,
  });
  return file;
}

beforeEach(() => push.mockClear());

describe("landing and creation entry", () => {
  it("shows the primary creation CTA and all creation routes", () => {
    renderWithStore(<HomeExperience />);
    expect(
      screen.getByRole("heading", {
        name: /Your class schedule, made for your screen/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Create my schedule/i }),
    ).toHaveAttribute("href", "/create");
    const { container } = render(<CreatePage />);
    expect(
      within(container).getByRole("link", {
        name: "ScheduleBud for AdZU students",
      }),
    ).toHaveAttribute("href", "/");
    expect(
      container.querySelector('img[src*="schedulebud-logo-on-light.svg"]'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Import from AdZU Portal/i }),
    ).toHaveAttribute("href", "/create/portal");
    expect(
      screen.getByRole("link", { name: /Use curriculum/i }),
    ).toHaveAttribute("href", "/create/curriculum");
    expect(
      screen.getByRole("link", { name: /Enter manually/i }),
    ).toHaveAttribute("href", "/create/manual");
  });

  it("shows a returning project and keeps start-new separate", () => {
    const { store } = createTestStore();
    store.getState().createProject("My semester");
    store.getState().addSubject({ code: "FIC 101" });
    render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <HomeExperience />
      </ScheduleBudProvider>,
    );
    expect(screen.getByText("Welcome back.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "My semester" })).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Continue editing/i }),
    ).toHaveAttribute("href", "/review");
    expect(
      screen.getByRole("link", { name: /Start a new schedule/i }),
    ).toHaveAttribute("href", "/create");
  });
});

describe("manual creation", () => {
  it("adds a subject with multiple meetings and supported time controls", async () => {
    const user = userEvent.setup();
    const { store, projects } = renderWithStore(<ManualCreation />);
    expect(screen.getByLabelText("Subject code")).toBeRequired();
    await user.type(screen.getByLabelText("Subject code"), "CS 201");
    await user.click(screen.getByRole("checkbox", { name: "Mon" }));
    const startTime = screen.getByLabelText("Start time");
    const endTime = screen.getByLabelText("End time");
    expect(startTime).toHaveAttribute("min", "07:00");
    expect(startTime).toHaveAttribute("max", "20:55");
    expect(startTime).toHaveAttribute("step", "300");
    expect(endTime).toHaveAttribute("min", "07:05");
    expect(endTime).toHaveAttribute("max", "21:00");
    expect(endTime).toHaveAttribute("step", "300");
    fireEvent.change(startTime, {
      target: { value: "08:00" },
    });
    fireEvent.change(endTime, {
      target: { value: "09:30" },
    });
    await user.click(
      screen.getByRole("button", { name: /Add another meeting/i }),
    );
    expect(screen.getAllByLabelText("Start time")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Add class" }));
    const project =
      store.getState().projectsById[store.getState().activeProjectId!];
    expect(project?.schedule[0]).toMatchObject({
      code: "CS 201",
      meetings: [
        { days: ["Mon"], startTime: "08:00", endTime: "09:30" },
        { days: [] },
      ],
    });
    expect(screen.getByText("CS 201")).toBeVisible();
    await user.type(screen.getAllByLabelText("Subject code")[0]!, "HIST 12");
    await user.click(screen.getByRole("button", { name: "Add class" }));
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]
        ?.schedule,
    ).toHaveLength(2);
    await store.getState().flushAutosave();
    expect(await projects.read(project!.id)).toMatchObject({
      status: "found",
      project: { schedule: [{ code: "CS 201" }, { code: "HIST 12" }] },
    });
  });

  it("does not create a project or subject without a code", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<ManualCreation />);
    await user.click(screen.getByRole("button", { name: "Add class" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Add a subject code");
    expect(store.getState().activeProjectId).toBeNull();
  });

  it("edits and removes classes through controlled store actions", async () => {
    const user = userEvent.setup();
    const { store } = createTestStore();
    store.getState().createProject();
    store.getState().addSubject({ code: "OLD" });
    render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <ManualCreation editingExisting />
      </ScheduleBudProvider>,
    );
    await user.click(screen.getByText("Edit class"));
    const existingClass = screen.getByText("OLD").closest("article")!;
    const code = within(existingClass).getByLabelText("Subject code");
    await user.clear(code);
    await user.type(code, "NEW");
    fireEvent.blur(code);
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]
        ?.schedule[0]?.code,
    ).toBe("NEW");
    await user.clear(code);
    fireEvent.blur(code);
    expect(code).toHaveValue("NEW");
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]
        ?.schedule[0]?.code,
    ).toBe("NEW");
    await user.click(screen.getByRole("checkbox", { name: "Included" }));
    expect(screen.getByText(/Not included · 1/i)).toBeVisible();
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]
        ?.schedule[0],
    ).toMatchObject({ code: "NEW", enabled: false });
    await user.click(
      screen.getByRole("checkbox", { name: "Include in schedule" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Remove from project" }),
    );
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]
        ?.schedule,
    ).toEqual([]);
  });
});

describe("curriculum creation", () => {
  it("derives supplied years/terms, loads subjects, and allows meeting entry", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<CurriculumCreation />);
    await user.type(
      screen.getByRole("combobox", { name: "Program" }),
      "computer science",
    );
    await user.click(screen.getByRole("option", { name: /BS CS/i }));
    expect(screen.getByRole("combobox", { name: "Program" })).toHaveValue(
      "BS CS — Bachelor of Science in Computer Science",
    );
    await user.click(screen.getByRole("button", { name: "Year 1" }));
    await user.click(screen.getByRole("button", { name: "Semester 1" }));
    expect(screen.getByText("COMPINTRO")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Use this term/i }));
    const project =
      store.getState().projectsById[store.getState().activeProjectId!];
    expect(project?.schedule).toHaveLength(7);
    expect(project?.metadata.curriculum).toMatchObject({
      programId: "bscs",
      yearLevel: 1,
      semesterId: "1",
    });
    const firstClass = screen.getByText("COMPINTRO").closest("article")!;
    await user.click(within(firstClass).getByText("Edit class"));
    await user.click(within(firstClass).getByRole("checkbox", { name: "Mon" }));
    fireEvent.change(within(firstClass).getByLabelText("Start time"), {
      target: { value: "08:00" },
    });
    fireEvent.change(within(firstClass).getByLabelText("End time"), {
      target: { value: "09:00" },
    });
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]
        ?.schedule[0]?.meetings[0],
    ).toMatchObject({ days: ["Mon"], startTime: "08:00", endTime: "09:00" });
  });
});

describe("Portal creation", () => {
  it("groups repeated warning categories while preserving detailed rows", () => {
    const summaries = summarizePortalWarnings([
      { code: "invalid-day", message: "Unknown X", rowNumber: 4 },
      { code: "invalid-day", message: "Unknown Y", rowNumber: 4 },
      { code: "invalid-time", message: "Bad time", rowNumber: 5 },
      { code: "missing-subject", message: "No code", rowNumber: 6 },
    ]);
    expect(summaries).toMatchObject([
      { category: "missing-day", count: 1 },
      { category: "invalid-time", count: 1 },
      { category: "skipped-row", count: 1 },
    ]);
  });

  it("rejects invalid extensions and oversize files with student-facing feedback", async () => {
    const user = userEvent.setup();
    renderWithStore(<PortalCreation />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const invalid = new File(["not xlsx"], "schedule.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(input, { target: { files: [invalid] } });
    expect(await screen.findByText(/must be .xlsx/i)).toBeVisible();
    const oversize = new File(["x"], "schedule.xlsx");
    Object.defineProperty(oversize, "size", { value: 5 * 1024 * 1024 + 1 });
    fireEvent.change(input, { target: { files: [oversize] } });
    expect(await screen.findByText(/5 MB or smaller/i)).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: /Choose another file/i }),
    );
  });

  it("keeps parsed XLSX pending until confirmation and cancel leaves state untouched", async () => {
    const { store } = renderWithStore(<PortalCreation />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [fixtureFile("portal-normal.xlsx")] },
    });
    expect(
      await screen.findByRole("heading", {
        name: "Check the imported classes.",
      }),
    ).toBeVisible();
    expect(store.getState().activeProjectId).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cancel import" }));
    expect(store.getState().activeProjectId).toBeNull();
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [fixtureFile("portal-normal.xlsx")] },
    });
    await screen.findByRole("heading", { name: "Check the imported classes." });
    fireEvent.click(
      screen.getAllByRole("checkbox", { name: "Include in schedule" })[0]!,
    );
    fireEvent.click(screen.getByRole("button", { name: /Confirm import/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/review"));
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]?.metadata
        .source,
    ).toBe("portal");
    const schedule =
      store.getState().projectsById[store.getState().activeProjectId!]
        ?.schedule ?? [];
    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule[0]).toMatchObject({
      enabled: false,
      units: 0,
      importMetadata: { source: "portal", sourceRows: [2] },
    });
    store.getState().setSubjectEnabled(schedule[0]!.id, true);
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]
        ?.schedule[0]?.enabled,
    ).toBe(true);
  });

  it("requires every pending imported subject to retain a code", async () => {
    renderWithStore(<PortalCreation />);
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [fixtureFile("portal-normal.xlsx")] },
    });
    await screen.findByRole("heading", { name: "Check the imported classes." });
    const firstSubject = screen
      .getByRole("heading", { name: "FIC.101" })
      .closest("article")!;
    fireEvent.click(
      within(firstSubject).getByText("Edit subject and meetings"),
    );
    const code = within(firstSubject).getByLabelText("Code");
    fireEvent.change(code, { target: { value: "" } });
    expect(
      screen.getByRole("button", { name: /Confirm import/i }),
    ).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /Every imported subject needs a code/i,
    );
    fireEvent.change(code, { target: { value: "FIC.101" } });
    expect(
      screen.getByRole("button", { name: /Confirm import/i }),
    ).toBeEnabled();
  });

  it("shows malformed workbook feedback without technical exceptions", async () => {
    renderWithStore(<PortalCreation />);
    const bad = new File([new Uint8Array([1, 2, 3])], "bad.xlsx");
    Object.defineProperty(bad, "arrayBuffer", {
      value: async () => new Uint8Array([1, 2, 3]).buffer,
    });
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [bad] },
    });
    expect(
      await screen.findByText(
        /missing required Portal columns|couldn't read this workbook/i,
      ),
    ).toBeVisible();
  });

  it("keeps genuine meeting warnings detailed and editable", () => {
    const subject = normalizeSubject(
      {
        code: "OPEN.101",
        units: 0,
        importMetadata: { source: "portal", sourceRows: [2] },
      },
      (kind) => `${kind}-1`,
    );
    const pending = {
      kind: "pending-portal-import" as const,
      subjects: [subject],
      warnings: [
        { code: "invalid-time" as const, message: "Bad time", rowNumber: 2 },
      ],
      metadata: { schoolYears: [], sourceRowCount: 1 },
    };
    render(
      <PendingPortalReview
        pending={pending}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText(/1 meeting has an invalid time/i)).toBeVisible();
    expect(screen.getByText(/Bad time/i)).not.toBeVisible();
    fireEvent.click(screen.getByText("Show details"));
    expect(screen.getByText(/Bad time/i)).toBeVisible();
    fireEvent.click(screen.getByText("Edit subject and meetings"));
    expect(screen.getByLabelText("Start time")).toBeVisible();
  });

  it("makes excluded pending subjects non-actionable without discarding warnings", () => {
    const subject = normalizeSubject(
      {
        code: "THESIS1",
        units: 0,
        importMetadata: { source: "portal", sourceRows: [2] },
      },
      (kind) => `${kind}-custom`,
    );
    const pending = {
      kind: "pending-portal-import" as const,
      subjects: [subject],
      warnings: [
        { code: "invalid-day" as const, message: "No day", rowNumber: 2 },
      ],
      metadata: { schoolYears: [], sourceRowCount: 1 },
    };
    const onChange = vi.fn();
    const view = render(
      <PendingPortalReview
        pending={pending}
        onChange={onChange}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(actionablePortalWarnings(pending)).toHaveLength(1);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Include in schedule" }),
    );
    const changed = onChange.mock.calls[0]![0];
    expect(changed.subjects[0]).toMatchObject({ enabled: false });
    expect(changed.warnings).toEqual(pending.warnings);
    expect(actionablePortalWarnings(changed)).toEqual([]);
    view.rerender(
      <PendingPortalReview
        pending={changed}
        onChange={onChange}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText("Not included in schedule")).toBeVisible();
    expect(screen.queryByText(/meeting needs review/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/This meeting needs valid days and a time/i),
    ).not.toBeInTheDocument();
  });
});
