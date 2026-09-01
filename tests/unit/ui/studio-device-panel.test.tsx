import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DeviceStudioPanel,
  previewOptionsFor,
} from "@/features/studio/studio-panels";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

function renderDevicePanel() {
  const variant = visualScheduleProject().deviceVariants[0]!;
  const actions = {
    onChangeTarget: vi.fn(),
    onPosition: vi.fn(),
    onPositionStart: vi.fn(),
    onPositionEnd: vi.fn(),
    onSize: vi.fn(),
    onSizeStart: vi.fn(),
    onSizeEnd: vi.fn(),
    onAspectLock: vi.fn(),
    onResetSize: vi.fn(),
    onReset: vi.fn(),
    onSnapping: vi.fn(),
    onPreviewMode: vi.fn(),
    onSafeAreas: vi.fn(),
    onWarnings: vi.fn(),
    onOrientation: vi.fn(),
    onGuideOpacity: vi.fn(),
    onRemoveGuide: vi.fn(),
  };

  render(
    <DeviceStudioPanel
      targetLabel="Generic Phone"
      variant={variant}
      scheduleBounds={{ x: 120, y: 220, width: 840, height: 1480 }}
      scheduleSizeLimits={{
        minWidth: 320,
        maxWidth: 1000,
        minHeight: 480,
        maxHeight: 2200,
      }}
      guideOpacity={0.4}
      {...actions}
    />,
  );

  return { actions };
}

describe("device inspector", () => {
  it("exposes an alternate header preview only for supported devices", () => {
    const phone = visualScheduleProject().deviceVariants[0]!;
    expect(previewOptionsFor(phone)).toEqual([
      ["clean", "Wallpaper"],
      ["lock-screen", "Android lock screen"],
    ]);
    expect(
      previewOptionsFor({
        ...phone,
        category: "desktop",
        presetId: "desktop-1920x1080",
        dimensions: { width: 1920, height: 1080 },
        orientation: "landscape",
      }),
    ).toEqual([
      ["clean", "Wallpaper"],
      ["windows-desktop", "Windows desktop"],
    ]);
    expect(
      previewOptionsFor({
        ...phone,
        category: "square",
        presetId: "square-1080",
        dimensions: { width: 1080, height: 1080 },
        orientation: "square",
      }),
    ).toEqual([["clean", "Wallpaper"]]);
  });

  it("uses a compact three-group hierarchy with preview beside the target", () => {
    renderDevicePanel();

    const target = screen.getByRole("region", { name: "Target" });
    const schedule = screen.getByRole("region", { name: "Schedule" });
    const guides = screen.getByRole("region", { name: "Guides" });
    expect(
      target.compareDocumentPosition(schedule) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      schedule.compareDocumentPosition(guides) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(
      within(target).getByRole("heading", { level: 4, name: "Current device" }),
    ).toBeVisible();
    expect(
      within(target).getByRole("heading", { level: 4, name: "Preview" }),
    ).toBeVisible();
    expect(
      within(schedule).getByRole("heading", { level: 4, name: "Size" }),
    ).toBeVisible();
    expect(
      within(schedule).getByRole("heading", { level: 4, name: "Position" }),
    ).toBeVisible();
    expect(screen.queryByText(/ScheduleBud remembers/)).toBeNull();

    const wallpaper = within(target).getByRole("button", {
      name: "Wallpaper",
    });
    expect(wallpaper).toHaveAttribute("aria-pressed", "true");
    expect(
      within(target).getByRole("button", { name: /lock screen/i }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("preserves device, preview, geometry, and guide actions", () => {
    const { actions } = renderDevicePanel();

    fireEvent.click(screen.getByRole("button", { name: "Change device" }));
    fireEvent.click(screen.getByRole("button", { name: /lock screen/i }));
    fireEvent.change(screen.getByLabelText("Schedule width"), {
      target: { value: "720" },
    });
    fireEvent.click(screen.getByLabelText("Show safe areas"));
    fireEvent.change(screen.getByLabelText("Horizontal schedule position"), {
      target: { value: "64" },
    });

    expect(actions.onChangeTarget).toHaveBeenCalledOnce();
    expect(actions.onPreviewMode).toHaveBeenCalledWith("lock-screen");
    expect(actions.onSize).toHaveBeenCalledWith("width", 720);
    expect(actions.onSafeAreas).toHaveBeenCalledWith(true);
    expect(actions.onPosition).toHaveBeenCalledWith({ x: 0.64, y: 0.42 });
  });
});
