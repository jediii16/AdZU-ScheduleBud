import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppLoading } from "@/components/shared/app-loading";

describe("ScheduleBud loading screen", () => {
  it("keeps decorative animation out of the loading announcement", () => {
    render(<AppLoading message="Preparing Studio…" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Preparing Studio…");
    expect(status.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("updates the real loading message and leaves immediately when ready", () => {
    const view = render(<AppLoading />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading ScheduleBud…",
    );
    view.rerender(<AppLoading message="Preparing Studio…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Preparing Studio…");
    view.rerender(<main>Schedule ready</main>);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("Schedule ready")).toBeVisible();
  });
});
