import { describe, expect, it, vi } from "vitest";
import { strFromU8, unzipSync } from "fflate";

import type { RenderModel } from "@/domain/render";

import {
  PngExportCoordinator,
  createPngZip,
  photoExportBlockReason,
  preparePngExport,
  renderModelForExportContent,
  requiredRenderAssetIds,
  schedulebudPngFilename,
  schedulebudZipFilename,
  sanitizePngFilename,
  uniqueArchiveFilename,
} from "@/features/export/png-export";

function exportModel(width = 1920, height = 1080): RenderModel {
  return {
    width,
    height,
    layers: [
      {
        id: "background",
        nodes: [
          {
            id: "background-node",
            kind: "rect",
            geometry: { x: 0, y: 0, width, height },
            fill: "#fff",
          },
        ],
      },
      {
        id: "scenery",
        nodes: [
          {
            id: "scenery-node",
            kind: "rect",
            geometry: { x: 0, y: 0, width: 10, height: 10 },
          },
        ],
      },
      {
        id: "photos",
        nodes: [
          {
            id: "active-photo",
            kind: "image",
            geometry: { x: 0, y: 0, width, height },
            assetId: "photo:active",
            fit: "cover",
          },
        ],
      },
      {
        id: "schedule",
        nodes: [
          {
            id: "schedule-node",
            kind: "rect",
            geometry: { x: 20, y: 20, width: 100, height: 100 },
          },
        ],
      },
      {
        id: "foreground",
        nodes: [
          {
            id: "foreground-node",
            kind: "rect",
            geometry: { x: 0, y: 0, width: 10, height: 10 },
          },
        ],
      },
    ],
  };
}

describe("PNG export coordination", () => {
  it("requires one Photo and allows one to four Polaroid photos", () => {
    expect(photoExportBlockReason("photo", 0)).toMatch(/Add a photo/);
    expect(photoExportBlockReason("photo", 1, "hero")).toBeNull();
    expect(photoExportBlockReason("photo", 1, "split")).toBeNull();
    expect(photoExportBlockReason("photo", 1, "polaroid")).toBeNull();
    expect(photoExportBlockReason("photo", 2, "polaroid")).toBeNull();
    expect(photoExportBlockReason("photo", 3, "polaroid")).toBeNull();
    expect(photoExportBlockReason("photo", 4, "polaroid")).toBeNull();
    expect(photoExportBlockReason("photo", 5, "polaroid")).toMatch(
      /maximum of 4/,
    );
    expect(photoExportBlockReason("planner", 0)).toBeNull();
  });
  it("uses predictable sanitized filenames", () => {
    expect(sanitizePngFilename("My Semester / Phone")).toBe(
      "my-semester-phone.png",
    );
    expect(
      schedulebudPngFilename("  Portal   Schedule!!! ", "Desktop Full HD"),
    ).toBe("schedulebud-portal-schedule-desktop-full-hd.png");
    expect(schedulebudPngFilename("", "Square")).toBe(
      "schedulebud-square.png",
    );
    expect(schedulebudPngFilename("", "")).toBe(
      "schedulebud-wallpaper.png",
    );
    expect(schedulebudPngFilename("My schedule", "Phone", "schedule")).toBe(
      "schedulebud-my-schedule-phone-schedule.png",
    );
    expect(schedulebudPngFilename("My schedule", "Phone", "background")).toBe(
      "schedulebud-my-schedule-phone-background.png",
    );
    expect(schedulebudZipFilename("My schedule", "wallpaper")).toBe(
      "schedulebud-my-schedule-wallpapers-all-sizes.zip",
    );
    expect(schedulebudPngFilename("x".repeat(200), "Phone").length).toBeLessThan(
      130,
    );
  });

  it("filters full-size export layers without mutating the source model", () => {
    const source = exportModel();
    const schedule = renderModelForExportContent(source, "schedule");
    const background = renderModelForExportContent(source, "background");

    expect({ width: schedule.width, height: schedule.height }).toEqual({
      width: 1920,
      height: 1080,
    });
    expect(schedule.layers.flatMap((layer) => layer.nodes.map((node) => node.id))).toEqual([
      "schedule-node",
    ]);
    expect(background.layers.flatMap((layer) => layer.nodes.map((node) => node.id))).toEqual([
      "background-node",
      "scenery-node",
      "active-photo",
      "foreground-node",
    ]);
    expect(source.layers[2].nodes).toHaveLength(1);
    expect(source.layers[3].nodes).toHaveLength(1);
  });

  it("creates a local ZIP and keeps duplicate device filenames distinct", async () => {
    const used = new Set(["wallpaper.png", "wallpaper-2.png"]);
    expect(uniqueArchiveFilename("wallpaper.png", used)).toBe(
      "wallpaper-3.png",
    );
    const archive = await createPngZip(
      new Map([
        ["phone.png", new Blob(["phone"])],
        ["desktop.png", new Blob(["desktop"])],
      ]),
    );
    const files = unzipSync(new Uint8Array(await archive.arrayBuffer()));
    expect(Object.keys(files)).toEqual(["phone.png", "desktop.png"]);
    expect(strFromU8(files["phone.png"]!)).toBe("phone");
    expect(strFromU8(files["desktop.png"]!)).toBe("desktop");
  });

  it("prepares only assets used by the snapshotted RenderModel", async () => {
    const model = exportModel();
    const ensureFonts = vi.fn(async () => undefined);
    const resolveAssets = vi.fn(async (ids: readonly string[]) => {
      expect(ids).toEqual(["photo:active"]);
      return new Map([["photo:active", {} as HTMLImageElement]]);
    });

    const assets = await preparePngExport({
      model,
      availableAssets: new Map([["photo:unused", {} as HTMLImageElement]]),
      ensureFonts,
      resolveAssets,
    });

    expect(requiredRenderAssetIds(model)).toEqual(["photo:active"]);
    expect(ensureFonts).toHaveBeenCalledWith(model);
    expect(resolveAssets).toHaveBeenCalledTimes(1);
    expect([...assets.keys()]).toEqual(["photo:unused", "photo:active"]);
  });

  it.each([
    [1920, 1080],
    [1080, 2400],
    [1200, 1200],
    [1440, 3120],
  ])("accepts exact valid export dimensions %d × %d", async (width, height) => {
    await expect(
      preparePngExport({
        model: exportModel(width, height),
        availableAssets: new Map([
          ["photo:active", {} as HTMLImageElement],
        ]),
        ensureFonts: async () => undefined,
      }),
    ).resolves.toBeInstanceOf(Map);
  });

  it("reports font, asset, and dimension readiness failures", async () => {
    await expect(
      preparePngExport({
        model: exportModel(100, 100),
        ensureFonts: async () => undefined,
      }),
    ).rejects.toMatchObject({
      failure: "dimensions",
    });
    await expect(
      preparePngExport({
        model: exportModel(),
        ensureFonts: async () => {
          throw new Error("missing font");
        },
      }),
    ).rejects.toMatchObject({
      failure: "font",
    });
    await expect(
      preparePngExport({
        model: exportModel(),
        ensureFonts: async () => undefined,
        resolveAssets: async () => new Map(),
      }),
    ).rejects.toMatchObject({
      failure: "asset",
    });
  });

  it("locks repeated requests and recovers after an error", async () => {
    const coordinator = new PngExportCoordinator();
    let release: (() => void) | undefined;
    const first = coordinator.run(
      () =>
        new Promise<string>((resolve) => {
          release = () => resolve("done");
        }),
    );
    expect(coordinator.busy).toBe(true);
    expect(await coordinator.run(async () => "duplicate")).toBeNull();
    release?.();
    expect(await first).toBe("done");
    await expect(
      coordinator.run(async () => {
        throw new Error("canvas failed");
      }),
    ).rejects.toThrow("canvas failed");
    expect(coordinator.busy).toBe(false);
    expect(await coordinator.run(async () => "recovered")).toBe("recovered");
  });
});
