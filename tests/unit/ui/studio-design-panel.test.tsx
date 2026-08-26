import { fireEvent, render, screen } from "@testing-library/react";
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
    const onComposition = vi.fn();
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        onPhotoComposition={onComposition}
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
    expect(screen.getByRole("radio", { name: "hero" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "split" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "polaroid" })).toBeVisible();
    fireEvent.click(screen.getByRole("radio", { name: "split" }));
    expect(onComposition).toHaveBeenCalledWith("split");
    expect(screen.getByText("Previewing an empty photo frame")).toBeVisible();
    expect(screen.getByLabelText("Choose Photo")).toHaveAttribute(
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
        photos={[{ id: "internal-asset-id", filename, caption: "" }]}
        activePhotoId="internal-asset-id"
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
    expect(screen.getByLabelText("Photo composition")).toBeVisible();
    expect(screen.queryByText("internal-asset-id")).toBeNull();
  });

  it("explains the default four-frame Polaroid placeholder", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photoComposition="polaroid"
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Previewing 4 empty frames · Add 1–4 photos"),
    ).toBeVisible();
    expect(screen.getByRole("radio", { name: "polaroid" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("offers Hero, Split, and Polaroid in the compact Photo composition control", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onComposition = vi.fn();
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photos={[
          { id: "asset-id", filename: "semester-photo.jpg", caption: "" },
        ]}
        activePhotoId="asset-id"
        photoComposition="hero"
        onPhotoComposition={onComposition}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    const hero = screen.getByRole("radio", { name: "hero" });
    const split = screen.getByRole("radio", { name: "split" });
    const polaroid = screen.getByRole("radio", { name: "polaroid" });
    expect(hero).toHaveAttribute("aria-checked", "true");
    expect(split).toHaveAttribute("aria-checked", "false");
    expect(polaroid).toHaveAttribute("aria-checked", "false");
    fireEvent.click(split);
    expect(onComposition).toHaveBeenCalledWith("split");
  });

  it("manages a compact ordered four-photo Polaroid collection", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onMove = vi.fn();
    const onCaption = vi.fn();
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photos={[
          { id: "one", filename: "one.jpg", caption: "first week" },
          { id: "two", filename: "two.jpg", caption: "" },
          { id: "three", filename: "three.jpg", caption: "" },
          { id: "four", filename: "four.jpg", caption: "" },
        ]}
        activePhotoId="one"
        photoComposition="polaroid"
        onPhotoMove={onMove}
        onPhotoCaption={onCaption}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    expect(screen.getByText("Maximum 4 photos")).toBeVisible();
    expect(
      screen.getByText("4 of 4 photos · Looks best with 3–4"),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "+ Add photo" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Move photo 2 up" }));
    expect(onMove).toHaveBeenCalledWith("two", "up");
    const caption = screen.getAllByLabelText("Caption (optional)")[0]!;
    fireEvent.change(caption, { target: { value: "semester memories" } });
    fireEvent.blur(caption);
    expect(onCaption).toHaveBeenCalledWith("one", "semester memories");
  });

  it("presents one to four Polaroid photos as valid", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photos={[
          { id: "one", filename: "one.jpg", caption: "" },
          { id: "two", filename: "two.jpg", caption: "" },
        ]}
        activePhotoId="one"
        photoComposition="polaroid"
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    expect(
      screen.getByText("2 of 4 photos · Looks best with 3–4"),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "+ Add photo" })).toBeEnabled();
  });
});
