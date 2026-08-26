import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Blob as NodeBlob } from "node:buffer";

import { createBlankProject } from "@/domain/project";
import { ScheduleBudDatabase } from "@/storage/dexie";
import {
  collectReferencedAssetIds,
  findUnreferencedAssets,
  inspectTemporaryImage,
  savePhoto,
  saveScreenGuide,
  replaceScreenGuide,
  removeScreenGuide,
} from "@/storage/assets";
import {
  DexieApplicationMetadataRepository,
  DexieAssetRepository,
  DexieProjectRepository,
} from "@/storage/repositories";
import type { StoredAsset } from "@/storage/types";
import { visualScheduleProject } from "../fixtures/visual/schedules";

const NOW = "2026-08-24T00:00:00.000Z";
let database: ScheduleBudDatabase;
let projects: DexieProjectRepository;
let assets: DexieAssetRepository;

beforeEach(() => {
  database = new ScheduleBudDatabase(`schedulebud-test-${crypto.randomUUID()}`);
  projects = new DexieProjectRepository(database);
  assets = new DexieAssetRepository(database);
});

afterEach(async () => database.delete());

describe("Dexie repositories", () => {
  it("writes, validates, lists, reads, and deletes multiple projects", async () => {
    const first = createBlankProject({ id: "one", now: NOW, title: "One" });
    const second = createBlankProject({
      id: "two",
      now: "2026-08-24T00:00:01.000Z",
      title: "Two",
    });
    await projects.write(first);
    await projects.write(second);
    expect(await projects.read("one")).toEqual({
      status: "found",
      project: first,
    });
    expect(
      (await projects.list()).projects.map((project) => project.id),
    ).toEqual(["two", "one"]);
    await projects.delete("one");
    expect(await projects.read("one")).toEqual({ status: "not-found" });
  });

  it("returns typed failures for malformed and unsupported stored records", async () => {
    await database.projects.put({
      id: "bad",
      updatedAt: NOW,
      payload: { schemaVersion: 1, id: "bad" },
    });
    await database.projects.put({
      id: "future",
      updatedAt: NOW,
      payload: { schemaVersion: 99 },
    });
    expect(await projects.read("bad")).toMatchObject({
      status: "invalid",
      id: "bad",
    });
    expect(await projects.read("future")).toEqual({
      status: "unsupported-version",
      id: "future",
      schemaVersion: 99,
    });
    expect((await projects.list()).failures).toHaveLength(2);
  });

  it("loads pre-removal projects without losing schedule, design, device, or asset data", async () => {
    const current = visualScheduleProject();
    const oldPayload = {
      ...current,
      schedule: current.schedule.map((subject) => ({
        ...subject,
        name: `Obsolete name for ${subject.code}`,
      })),
      design: {
        ...current.design,
        visibleFields: {
          ...current.design.visibleFields,
          subjectCode: false,
          subjectName: true,
        },
      },
      deviceVariants: current.deviceVariants.map((variant, index) => ({
        ...variant,
        visibleFieldsOverride:
          index === 0 ? { room: false, subjectName: true } : null,
      })),
      assetReferences: {
        photoAssetIds: ["photo-preserved"],
        screenGuideAssetIds: ["guide-preserved"],
      },
    };
    await database.projects.put({
      id: current.id,
      updatedAt: current.updatedAt,
      payload: oldPayload,
    });

    const result = await projects.read(current.id);
    expect(result.status).toBe("found");
    if (result.status !== "found") return;
    expect(result.project.schemaVersion).toBe(1);
    expect(result.project.schedule).toHaveLength(current.schedule.length);
    expect(result.project.schedule[0]).toMatchObject({
      code: "CS.412",
      meetings: current.schedule[0]!.meetings,
    });
    expect(
      result.project.schedule.every((subject) => !("name" in subject)),
    ).toBe(true);
    expect(result.project.design).toMatchObject({
      layoutId: current.design.layoutId,
      wallpaperTitle: current.design.wallpaperTitle,
    });
    expect(result.project.design.visibleFields).toEqual(
      current.design.visibleFields,
    );
    expect(
      result.project.deviceVariants.map((variant) => variant.schedulePosition),
    ).toEqual(
      current.deviceVariants.map((variant) => variant.schedulePosition),
    );
    expect(result.project.deviceVariants[0]?.visibleFieldsOverride).toEqual({
      room: false,
    });
    expect(result.project.activeDeviceVariantId).toBe(
      current.activeDeviceVariantId,
    );
    expect(result.project.assetReferences).toEqual(oldPayload.assetReferences);
  });

  it("stores binary assets separately and looks them up by project", async () => {
    const photo: StoredAsset = {
      id: "photo-1",
      projectId: "one",
      kind: "photo",
      blob: new NodeBlob(["photo"], { type: "image/png" }),
      mimeType: "image/png",
      width: 800,
      height: 600,
      createdAt: NOW,
      filename: "fictional.png",
    };
    const guide: StoredAsset = {
      ...photo,
      id: "guide-1",
      kind: "screen-guide",
      filename: "guide.png",
    };
    const other: StoredAsset = { ...photo, id: "photo-2", projectId: "two" };
    await assets.write(photo);
    await assets.write(guide);
    await assets.write(other);
    expect(
      (await assets.listByProject("one")).map((asset) => asset.kind).sort(),
    ).toEqual(["photo", "screen-guide"]);
    expect(await (await assets.read("photo-1"))?.blob.text()).toBe("photo");
    await assets.deleteByProject("one");
    expect(await assets.listByProject("one")).toEqual([]);
    expect(await assets.read("photo-2")).toBeDefined();
  });

  it("persists the active project pointer independently", async () => {
    const metadata = new DexieApplicationMetadataRepository(database);
    expect(await metadata.readActiveProjectId()).toBeNull();
    await metadata.writeActiveProjectId("one");
    expect(await metadata.readActiveProjectId()).toBe("one");
    await metadata.writeActiveProjectId(null);
    expect(await metadata.readActiveProjectId()).toBeNull();
  });
});

describe("asset lifecycle helpers", () => {
  it("finds only project-owned assets that are no longer referenced", () => {
    const base = createBlankProject({ id: "one", now: NOW });
    const project = {
      ...base,
      assetReferences: { photoAssetIds: ["used"], screenGuideAssetIds: [] },
    };
    const make = (id: string, projectId = "one"): StoredAsset => ({
      id,
      projectId,
      kind: "photo",
      blob: new NodeBlob([id]),
      mimeType: "image/png",
      width: 10,
      height: 10,
      createdAt: NOW,
    });
    expect([...collectReferencedAssetIds(project)]).toEqual(["used"]);
    expect(
      findUnreferencedAssets(project, [
        make("used"),
        make("unused"),
        make("other", "two"),
      ]).map((asset) => asset.id),
    ).toEqual(["unused"]);
  });

  it("inspects a screenshot in memory and saves it only when explicitly requested", async () => {
    let closed = false;
    const blob = new NodeBlob(["guide"], { type: "image/png" });
    const inspected = await inspectTemporaryImage(
      blob,
      async () => ({
        width: 1206,
        height: 2622,
        close: () => {
          closed = true;
        },
      }),
      "screen.png",
    );
    expect(inspected).toMatchObject({
      width: 1206,
      height: 2622,
      filename: "screen.png",
    });
    expect(closed).toBe(true);
    expect(await assets.listByProject("one")).toEqual([]);
    await saveScreenGuide(assets, {
      ...inspected,
      id: "guide",
      projectId: "one",
      createdAt: NOW,
    });
    expect(await assets.read("guide")).toMatchObject({
      kind: "screen-guide",
      projectId: "one",
    });
  });

  it("stores original Hero photo bytes as an exportable local photo asset", async () => {
    const blob = new NodeBlob(["original-photo"], { type: "image/webp" });
    await savePhoto(assets, {
      blob,
      mimeType: "image/webp",
      width: 2400,
      height: 1600,
      filename: "campus.webp",
      id: "hero-photo",
      projectId: "one",
      createdAt: NOW,
    });
    const stored = await assets.read("hero-photo");
    expect(stored).toMatchObject({
      kind: "photo",
      filename: "campus.webp",
      width: 2400,
      height: 1600,
    });
    expect(await stored?.blob.text()).toBe("original-photo");
  });

  it("replaces and removes only screen-guide assets", async () => {
    const first = await saveScreenGuide(assets, {
      blob: new NodeBlob(["first"], { type: "image/png" }),
      mimeType: "image/png",
      width: 1080,
      height: 2400,
      id: "guide-first",
      projectId: "one",
      createdAt: NOW,
    });
    await replaceScreenGuide(
      assets,
      {
        blob: new NodeBlob(["second"], { type: "image/jpeg" }),
        mimeType: "image/jpeg",
        width: 1920,
        height: 1080,
        id: "guide-second",
        projectId: "one",
        createdAt: NOW,
      },
      first.id,
    );
    expect(await assets.read("guide-first")).toBeUndefined();
    expect(await assets.read("guide-second")).toMatchObject({
      kind: "screen-guide",
    });
    await removeScreenGuide(assets, "guide-second");
    expect(await assets.read("guide-second")).toBeUndefined();
  });

  it("accepts supported guide image types and rejects unrelated files before decoding", async () => {
    for (const mimeType of ["image/png", "image/jpeg", "image/webp"]) {
      const inspected = await inspectTemporaryImage(
        new NodeBlob([mimeType], { type: mimeType }),
        async () => ({ width: 800, height: 600, close() {} }),
      );
      expect(inspected.mimeType).toBe(mimeType);
    }
    await expect(
      inspectTemporaryImage(
        new NodeBlob(["no"], { type: "text/plain" }),
        async () => ({ width: 1, height: 1, close() {} }),
      ),
    ).rejects.toThrow("PNG, JPEG, or WebP");
  });
});
