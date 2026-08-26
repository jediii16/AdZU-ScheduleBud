import { describe, expect, it } from "vitest";

import { selectActiveProject } from "@/state";
import { createTestStore } from "./helpers";

describe("Photo Hero project state", () => {
  it("persists only an asset reference and selects the Hero composition", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    store.getState().setLayout("photo");
    store.getState().setHeroPhoto("photo-local-1");
    const project = selectActiveProject(store.getState())!;
    expect(project.design).toMatchObject({
      layoutId: "photo",
      photoComposition: "hero",
    });
    expect(project.assetReferences.photoAssetIds).toEqual(["photo-local-1"]);
    expect(JSON.stringify(project)).not.toMatch(/Blob|data:image|arrayBuffer/);
  });

  it("keeps crops independent and resets only the active target", () => {
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
    store.getState().setHeroPhoto("photo-local-1");
    store.getState().setPhotoTransform(phone, "photo-local-1", {
      position: { x: 0.2, y: 0.8 },
      scale: 1.4,
      rotation: 0,
    });
    store.getState().setPhotoTransform(desktop, "photo-local-1", {
      position: { x: 0.7, y: 0.3 },
      scale: 2,
      rotation: 0,
    });
    store.getState().clearPhotoTransform(phone, "photo-local-1");
    const variants = selectActiveProject(store.getState())!.deviceVariants;
    expect(variants.find((item) => item.id === phone)?.photoTransforms).toEqual(
      {},
    );
    expect(
      variants.find((item) => item.id === desktop)?.photoTransforms[
        "photo-local-1"
      ],
    ).toMatchObject({ position: { x: 0.7, y: 0.3 }, scale: 2 });
  });

  it("resets stale transforms for every target when replacing the photo", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const phone = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
    })!;
    store.getState().setHeroPhoto("first");
    store.getState().setPhotoTransform(phone, "first", {
      position: { x: 0, y: 1 },
      scale: 2,
      rotation: 0,
    });
    store.getState().setHeroPhoto("second");
    const project = selectActiveProject(store.getState())!;
    expect(project.assetReferences.photoAssetIds).toEqual(["second"]);
    expect(project.deviceVariants[0]!.photoTransforms).toEqual({});
  });
});
