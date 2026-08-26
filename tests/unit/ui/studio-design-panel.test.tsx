import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DesignStudioPanel } from "@/features/studio/studio-panels";
import { resolveLayoutDetailCapabilities } from "@/domain/render";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

describe("Planner design inspector", () => {
  it("keeps Planner in the compact selector and hides Subject Palette", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "planner" }}
        visibleFields={project.design.visibleFields}
        activeLayout="planner"
        detailCapabilities={resolveLayoutDetailCapabilities("planner", variant)}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    const planner = screen.getByRole("radio", { name: "Planner" });
    expect(planner).toHaveAttribute("aria-checked", "true");
    expect(planner).toHaveClass("min-w-0", "px-1.5");
    expect(screen.queryByLabelText("Clean Slate subject palette")).toBeNull();
  });
});
