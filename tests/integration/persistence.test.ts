import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Blob as NodeBlob } from "node:buffer";

import { createBlankProject } from "@/domain/project";
import { ScheduleBudDatabase } from "@/storage/dexie";
import {
  collectReferencedAssetIds,
  findUnreferencedAssets,
  inspectTemporaryImage,
  saveScreenGuide,
} from "@/storage/assets";
import {
  DexieApplicationMetadataRepository,
  DexieAssetRepository,
  DexieProjectRepository,
} from "@/storage/repositories";
import type { StoredAsset } from "@/storage/types";

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
});
