import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DesignStudioPanel } from "@/features/studio/studio-panels";
import { resolveLayoutDetailCapabilities } from "@/domain/render";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

describe("layout design inspector", () => {
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
    expect(planner).toHaveClass("min-w-0", "px-1");
    expect(screen.queryByLabelText("Clean Slate subject palette")).toBeNull();
  });

  it("selects Photo, shows its local asset action, and hides Subject Palette", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    expect(screen.getByRole("radio", { name: "Photo" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("button", { name: "Add photo" })).toBeVisible();
    expect(screen.getByLabelText("Choose Hero photo")).toHaveAttribute(
      "accept",
      "image/png,image/jpeg,image/webp",
    );
    expect(screen.queryByLabelText("Clean Slate subject palette")).toBeNull();
  });

  it("preserves the original Photo filename and shows the adjust helper", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const filename = "917c2a09-de4d-4d5e-b474-c068d2d3e069.jpg";
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photo={{ id: "internal-asset-id", filename }}
        photoAdjusting
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    expect(screen.getByText(filename)).toHaveAttribute("title", filename);
    expect(screen.getByText("Drag the photo to reposition")).toBeVisible();
    expect(screen.queryByText("internal-asset-id")).toBeNull();
  });
});
