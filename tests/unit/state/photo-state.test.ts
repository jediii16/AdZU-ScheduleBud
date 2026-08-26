import { describe, expect, it } from "vitest";

import { selectActiveProject } from "@/state";
import { scheduleProjectSchema } from "@/domain/project";
import { visualScheduleProject } from "../../fixtures/visual/schedules";
import { createTestStore } from "./helpers";

describe("Photo composition project state", () => {
  it("persists only an asset reference and selects the Hero composition", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    store.getState().setLayout("photo");
    store.getState().setPrimaryPhoto("photo-local-1");
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
    store.getState().setPrimaryPhoto("photo-local-1");
    store.getState().setPhotoTransform(phone, "hero", "photo-local-1", {
      position: { x: 0.2, y: 0.8 },
      scale: 1.4,
      rotation: 0,
    });
    store.getState().setPhotoTransform(desktop, "hero", "photo-local-1", {
      position: { x: 0.7, y: 0.3 },
      scale: 2,
      rotation: 0,
    });
    store.getState().clearPhotoTransform(phone, "hero", "photo-local-1");
    const variants = selectActiveProject(store.getState())!.deviceVariants;
    expect(
      variants.find((item) => item.id === phone)?.photoTransforms.hero,
    ).toEqual({});
    expect(
      variants.find((item) => item.id === desktop)?.photoTransforms.hero[
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
    store.getState().setPrimaryPhoto("first");
    store.getState().setPhotoTransform(phone, "hero", "first", {
      position: { x: 0, y: 1 },
      scale: 2,
      rotation: 0,
    });
    store.getState().setPhotoComposition("split");
    store.getState().setPhotoTransform(phone, "split", "first", {
      position: { x: 1, y: 0 },
      scale: 1.5,
      rotation: 0,
    });
    store.getState().setPrimaryPhoto("second");
    const project = selectActiveProject(store.getState())!;
    expect(project.assetReferences.photoAssetIds).toEqual(["second"]);
    expect(project.design.photoComposition).toBe("split");
    expect(project.deviceVariants[0]!.photoTransforms).toEqual({
      hero: {},
      split: {},
      polaroid: {},
    });
  });

  it("keeps Hero and Split crops independent on the same target", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const phone = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
    })!;
    store.getState().setPrimaryPhoto("shared-photo");
    store.getState().setPhotoTransform(phone, "hero", "shared-photo", {
      position: { x: 0.2, y: 0.3 },
      scale: 1.4,
      rotation: 0,
    });
    store.getState().setPhotoComposition("split");
    store.getState().setPhotoTransform(phone, "split", "shared-photo", {
      position: { x: 0.8, y: 0.7 },
      scale: 2,
      rotation: 0,
    });
    store.getState().setPhotoComposition("hero");
    store.getState().setPhotoComposition("split");
    store.getState().clearPhotoTransform(phone, "split", "shared-photo");
    const project = selectActiveProject(store.getState())!;
    const transforms = project.deviceVariants[0]!.photoTransforms;
    expect(project.assetReferences.photoAssetIds).toEqual(["shared-photo"]);
    expect(project.design.photoComposition).toBe("split");
    expect(transforms.hero["shared-photo"]).toMatchObject({
      position: { x: 0.2, y: 0.3 },
      scale: 1.4,
    });
    expect(transforms.split["shared-photo"]).toBeUndefined();
  });

  it("migrates legacy flat transforms into Hero without changing the crop", () => {
    const project = visualScheduleProject();
    const transform = {
      position: { x: 0.25, y: 0.75 },
      scale: 1.8,
      rotation: 0,
    };
    const parsed = scheduleProjectSchema.parse({
      ...project,
      deviceVariants: project.deviceVariants.map((variant, index) => ({
        ...variant,
        photoTransforms: index === 0 ? { legacyPhoto: transform } : {},
      })),
    });
    expect(parsed.deviceVariants[0]!.photoTransforms).toEqual({
      hero: { legacyPhoto: transform },
      split: {},
      polaroid: {},
    });
  });

  it("accepts an ordered collection of four photos and rejects a fifth", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    store.getState().setPrimaryPhoto("one");
    expect(store.getState().addPhoto("two")).toBe(true);
    expect(store.getState().addPhoto("three")).toBe(true);
    expect(store.getState().addPhoto("four")).toBe(true);
    expect(store.getState().addPhoto("five")).toBe(false);
    expect(
      selectActiveProject(store.getState())!.assetReferences.photoAssetIds,
    ).toEqual(["one", "two", "three", "four"]);
  });

  it("persists per-photo captions and stable accessible reordering", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    store.getState().setPrimaryPhoto("one");
    store.getState().addPhoto("two");
    store.getState().addPhoto("three");
    store.getState().setPhotoCaption("two", "first week ♡");
    store.getState().movePhoto("three", "up");
    let project = selectActiveProject(store.getState())!;
    expect(project.assetReferences.photoAssetIds).toEqual([
      "one",
      "three",
      "two",
    ]);
    expect(project.design.photoCaptions).toEqual({ two: "first week ♡" });
    store.getState().removePhoto("three");
    project = selectActiveProject(store.getState())!;
    expect(project.assetReferences.photoAssetIds).toEqual(["one", "two"]);
    expect(project.design.photoCaptions).toEqual({ two: "first week ♡" });
  });

  it("keeps Polaroid crops independent per photo and device", () => {
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
    store.getState().setPrimaryPhoto("one");
    store.getState().addPhoto("two");
    store.getState().setPhotoTransform(phone, "polaroid", "one", {
      position: { x: 0.1, y: 0.2 },
      scale: 1.3,
      rotation: 0,
    });
    store.getState().setPhotoTransform(phone, "polaroid", "two", {
      position: { x: 0.8, y: 0.7 },
      scale: 2,
      rotation: 0,
    });
    store.getState().setPhotoTransform(desktop, "polaroid", "one", {
      position: { x: 0.5, y: 0.9 },
      scale: 1.6,
      rotation: 0,
    });
    const variants = selectActiveProject(store.getState())!.deviceVariants;
    expect(
      variants.find((variant) => variant.id === phone)?.photoTransforms
        .polaroid,
    ).toMatchObject({
      one: { position: { x: 0.1, y: 0.2 }, scale: 1.3 },
      two: { position: { x: 0.8, y: 0.7 }, scale: 2 },
    });
    expect(
      variants.find((variant) => variant.id === desktop)?.photoTransforms
        .polaroid.one,
    ).toMatchObject({ position: { x: 0.5, y: 0.9 }, scale: 1.6 });
  });
});
