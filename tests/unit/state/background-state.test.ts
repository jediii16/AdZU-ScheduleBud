import { describe, expect, it } from "vitest";

import { selectActiveProject } from "@/state/selectors";
import { createTestStore } from "./helpers";

describe("background state", () => {
  it("changes modes independently and restores their configured values", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const variantId = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
    })!;
    store.getState().setTheme("matcha-study");
    store.getState().setTypography("playfair-inter");
    store.getState().addSticker(variantId, "capy-reading");
    const before = selectActiveProject(store.getState())!;

    store.getState().setBackgroundMode("gradient");
    const gradient = selectActiveProject(store.getState())!.design.background;
    store.getState().setBackground({
      ...gradient,
      gradient: {
        color1: "#112233",
        color2: "#445566",
        direction: 90,
      },
    });
    store.getState().setBackgroundMode("pattern");
    store.getState().setBackgroundMode("gradient");
    const after = selectActiveProject(store.getState())!;

    expect(after.design.background.gradient).toEqual({
      color1: "#112233",
      color2: "#445566",
      direction: 90,
    });
    expect(after.design.themeId).toBe("matcha-study");
    expect(after.design.typography).toEqual(before.design.typography);
    expect(after.design.subjectColors).toEqual(before.design.subjectColors);
    expect(after.deviceVariants[0]!.stickers).toEqual(
      before.deviceVariants[0]!.stickers,
    );
  });

  it("supports undo/redo and coalesces a continuous pattern edit", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    store.getState().setBackgroundMode("pattern");
    const historyBefore = store.getState().history.past.length;
    store.getState().beginHistoryTransaction("Adjust pattern");
    const background = selectActiveProject(store.getState())!.design.background;
    const pattern = background.pattern!;
    if (pattern.type !== "dots") throw new Error("Expected dots default");
    for (const size of [0.01, 0.012, 0.014])
      store.getState().setBackground({
        ...background,
        pattern: { ...pattern, size },
      });
    store.getState().commitHistoryTransaction();
    expect(store.getState().history.past).toHaveLength(historyBefore + 1);
    expect(
      selectActiveProject(store.getState())!.design.background.pattern,
    ).toMatchObject({ size: 0.014 });
    store.getState().undo();
    expect(
      selectActiveProject(store.getState())!.design.background.pattern,
    ).toMatchObject({ size: pattern.size });
    store.getState().redo();
    expect(
      selectActiveProject(store.getState())!.design.background.pattern,
    ).toMatchObject({ size: 0.014 });
  });

  it("isolates image transforms per device and removing the image returns to Palette", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const phone = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
    })!;
    const desktop = store.getState().createDeviceVariant({
      category: "desktop",
      dimensions: { width: 1920, height: 1080 },
    })!;
    store.getState().setBackgroundImage("asset-background");
    store.getState().setBackgroundImageTransform(phone, {
      position: { x: 0.15, y: 0.8 },
      scale: 2,
    });
    const project = selectActiveProject(store.getState())!;
    expect(
      project.deviceVariants.find((item) => item.id === phone)
        ?.backgroundImageTransform,
    ).toEqual({ position: { x: 0.15, y: 0.8 }, scale: 2 });
    expect(
      project.deviceVariants.find((item) => item.id === desktop)
        ?.backgroundImageTransform,
    ).toEqual({ position: { x: 0.5, y: 0.5 }, scale: 1 });
    expect(JSON.stringify(project)).toContain("asset-background");
    expect(JSON.stringify(project)).not.toContain("Blob");

    store.getState().setBackgroundImage(null);
    expect(selectActiveProject(store.getState())!.design.background.mode).toBe(
      "palette",
    );
  });
});
