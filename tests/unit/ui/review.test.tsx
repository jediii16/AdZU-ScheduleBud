import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ScheduleReview } from "@/features/classes/schedule-review";
import { ScheduleBudProvider } from "@/state/react";
import { createTestStore } from "../state/helpers";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
beforeEach(() => push.mockClear());

function reviewStore() {
  const { store } = createTestStore();
  store.getState().createProject();
  return store;
}

describe("schedule review", () => {
  it("groups complete meetings chronologically by actual day", () => {
    const store = reviewStore();
    store.getState().addSubject({
      code: "LATE",
      name: "Later",
      meetings: [{ days: ["Mon"], startTime: "10:00", endTime: "11:00" }],
    });
    store.getState().addSubject({
      code: "EARLY",
      name: "Earlier",
      meetings: [
        { days: ["Mon", "Thu"], startTime: "08:00", endTime: "09:00" },
      ],
    });
    render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <ScheduleReview />
      </ScheduleBudProvider>,
    );
    const monday = screen.getByRole("heading", {
      name: "Monday",
    }).parentElement!;
    expect(monday.textContent?.indexOf("EARLY")).toBeLessThan(
      monday.textContent?.indexOf("LATE") ?? 0,
    );
    expect(
      screen.getByRole("heading", { name: "Thursday" }).parentElement,
    ).toHaveTextContent("EARLY");
  });

  it("shows incomplete and conflict issues with exact overlap", async () => {
    const user = userEvent.setup();
    const store = reviewStore();
    store.getState().addSubject({
      code: "ONE",
      name: "One",
      meetings: [{ days: ["Tue"], startTime: "09:00", endTime: "10:30" }],
    });
    store.getState().addSubject({
      code: "TWO",
      name: "Two",
      meetings: [{ days: ["Tue"], startTime: "10:00", endTime: "11:00" }],
    });
    store.getState().addSubject({ code: "OPEN", name: "Incomplete" });
    render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <ScheduleReview />
      </ScheduleBudProvider>,
    );
    expect(screen.getByText(/ONE and TWO overlap/i)).toBeVisible();
    expect(screen.getByText(/10:00 AM–10:30 AM/i)).toBeVisible();
    expect(screen.getByText(/OPEN has an incomplete meeting/i)).toBeVisible();
    expect(screen.getByRole("link", { name: "Fix class" })).toHaveAttribute(
      "href",
      expect.stringContaining("/create/manual?edit=1#subject-"),
    );
    expect(screen.getByRole("link", { name: "Review classes" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Start designing/i }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue anyway" }));
    expect(
      screen.getByRole("button", { name: "I understand — continue" }),
    ).toBeVisible();
    expect(push).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", { name: "I understand — continue" }),
    );
    expect(push).toHaveBeenCalledWith("/studio");
  });

  it("does not flag back-to-back meetings and starts designing directly", async () => {
    const user = userEvent.setup();
    const store = reviewStore();
    store.getState().addSubject({
      code: "ONE",
      name: "One",
      meetings: [{ days: ["Wed"], startTime: "09:00", endTime: "10:00" }],
    });
    store.getState().addSubject({
      code: "TWO",
      name: "Two",
      meetings: [{ days: ["Wed"], startTime: "10:00", endTime: "11:00" }],
    });
    render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <ScheduleReview />
      </ScheduleBudProvider>,
    );
    expect(screen.getByText(/0 issues/i)).toBeVisible();
    expect(screen.queryByText(/overlap/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Start designing/i }));
    expect(push).toHaveBeenCalledWith("/studio");
  });

  it("omits disabled classes from issues and the occurrence list", () => {
    const store = reviewStore();
    const disabledId = store.getState().addSubject({
      code: "THESIS1",
      name: "Thesis I",
      enabled: false,
      meetings: [{ days: [], startTime: "", endTime: "" }],
    })!;
    store.getState().addSubject({
      code: "VISIBLE",
      name: "Visible class",
      meetings: [{ days: ["Fri"], startTime: "13:00", endTime: "14:00" }],
    });
    render(
      <ScheduleBudProvider store={store} hydrate={false}>
        <ScheduleReview />
      </ScheduleBudProvider>,
    );
    expect(screen.getByText(/1 subject · 1 meeting · 0 issues/i)).toBeVisible();
    expect(screen.queryByText("THESIS1")).not.toBeInTheDocument();
    expect(screen.getByText("VISIBLE")).toBeVisible();
    expect(
      store
        .getState()
        .projectsById[store.getState().activeProjectId!]?.schedule.find(
          (subject) => subject.id === disabledId,
        ),
    ).toMatchObject({ enabled: false });
  });
});
