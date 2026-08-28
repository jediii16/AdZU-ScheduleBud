import { afterEach, describe, expect, it, vi } from "vitest";

import type { RenderModel } from "@/domain/render";
import {
  loadRenderModelThemeAssets,
  themeAssetLoadSignature,
  themeAssetSourceEntries,
} from "@/renderer/konva/theme-asset-loading";

function model(source: string): RenderModel {
  const first = {
    id: "theme-one",
    kind: "image" as const,
    geometry: { x: 0, y: 0, width: 100, height: 100 },
    assetId: "theme:one",
    source,
    fit: "contain" as const,
  };
  return {
    width: 1000,
    height: 1000,
    layers: [
      { id: "background", nodes: [] },
      { id: "scenery", nodes: [first] },
      { id: "photos", nodes: [] },
      { id: "schedule", nodes: [] },
      {
        id: "foreground",
        nodes: [{ ...first, id: "theme-two", assetId: "theme:two" }],
      },
    ],
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("static theme asset loading", () => {
  it("uses a stable signature for equivalent RenderModel instances", () => {
    expect(themeAssetLoadSignature(model("/themes/test/stable.svg"))).toBe(
      themeAssetLoadSignature(model("/themes/test/stable.svg")),
    );
    expect(themeAssetLoadSignature(model("/themes/test/stable.svg"))).not.toBe(
      themeAssetLoadSignature(model("/themes/test/changed.svg")),
    );
  });

  it("discovers RenderModel sources and decodes each static SVG source once", async () => {
    let instances = 0;
    class FakeImage {
      decoding = "auto";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      naturalWidth = 1920;
      naturalHeight = 1080;
      width = 1920;
      height = 1080;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
      constructor() {
        instances += 1;
      }
    }
    vi.stubGlobal("Image", FakeImage);
    const renderModel = model("/themes/test/cached.svg");

    expect(themeAssetSourceEntries(renderModel)).toEqual([
      ["theme:one", "/themes/test/cached.svg"],
      ["theme:two", "/themes/test/cached.svg"],
    ]);
    const first = await loadRenderModelThemeAssets(renderModel);
    const second = await loadRenderModelThemeAssets(renderModel);

    expect([...first.keys()]).toEqual(["theme:one", "theme:two"]);
    expect([...second.keys()]).toEqual(["theme:one", "theme:two"]);
    expect(instances).toBe(1);
  });

  it("warns once and safely omits an asset that cannot load", async () => {
    class FailingImage {
      decoding = "auto";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal("Image", FailingImage);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const renderModel = model("/themes/test/missing.svg");

    expect(await loadRenderModelThemeAssets(renderModel)).toEqual(new Map());
    expect(await loadRenderModelThemeAssets(renderModel)).toEqual(new Map());
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
