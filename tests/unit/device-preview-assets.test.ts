import { describe, expect, it } from "vitest";

import { DEVICE_PRESET_IDS } from "@/data/devices/registry";
import type { DeviceVariant } from "@/domain/device/types";
import type { RenderModel } from "@/domain/render";
import {
  deviceArtworkToneForModel,
  devicePreviewAssetSourceEntries,
} from "@/renderer/konva/editor-overlay/device-preview-assets";
import {
  DEVICE_CHROME_OPACITY,
  IPHONE_TIME_DATE_OPACITY,
} from "@/renderer/konva/editor-overlay/preview-environment";
import { nextSplitPreviewCount } from "@/renderer/konva/editor-overlay/photo-overlay";

function previewVariant(
  presetId: string,
  mode: DeviceVariant["preview"]["mode"],
): Pick<DeviceVariant, "presetId" | "preview"> {
  return {
    presetId,
    preview: {
      mode,
      showSafeAreas: false,
      showWarnings: true,
      enableSnapping: true,
      guideAssetId: null,
    },
  };
}

describe("device preview assets", () => {
  it("cycles the Split placeholder preview from one through four photos", () => {
    expect(nextSplitPreviewCount(1)).toBe(2);
    expect(nextSplitPreviewCount(2)).toBe(3);
    expect(nextSplitPreviewCount(3)).toBe(4);
    expect(nextSplitPreviewCount(4)).toBe(1);
  });

  it("keeps the iPhone time and date subtler than the other device chrome", () => {
    expect(IPHONE_TIME_DATE_OPACITY).toBeLessThan(DEVICE_CHROME_OPACITY);
  });

  it("loads only the active device artwork", () => {
    expect(
      devicePreviewAssetSourceEntries(
        previewVariant(DEVICE_PRESET_IDS.iphone, "lock-screen"),
        "dark",
      ),
    ).toContainEqual([
      "iphone-status-bar",
      "/devices/iphone/dynamic-island-dark.svg",
    ]);
    expect(
      devicePreviewAssetSourceEntries(
        previewVariant(DEVICE_PRESET_IDS.iphone, "lock-screen"),
        "dark",
      ).map(([id]) => id),
    ).toEqual([
      "iphone-status-bar",
      "iphone-date",
      "iphone-clock",
      "iphone-actions",
      "iphone-home-indicator",
    ]);
    expect(
      devicePreviewAssetSourceEntries(
        previewVariant(DEVICE_PRESET_IDS.android, "lock-screen"),
      ),
    ).toEqual([["android-lock-screen", "/devices/android/lock-screen.svg"]]);
    expect(
      devicePreviewAssetSourceEntries(
        previewVariant("desktop-1920x1080", "windows-desktop"),
        "dark",
      ),
    ).toEqual([["windows-taskbar", "/devices/windows/taskbar-light.svg"]]);
  });

  it("does not load device artwork in wallpaper-only mode", () => {
    expect(
      devicePreviewAssetSourceEntries(
        previewVariant(DEVICE_PRESET_IDS.iphone, "clean"),
      ),
    ).toEqual([]);
  });

  it("selects contrasting artwork from the wallpaper background", () => {
    const modelWithBackground = (fill: string) =>
      ({
        layers: [
          {
            id: "background",
            nodes: [
              {
                id: "wallpaper-background",
                kind: "rect",
                geometry: { x: 0, y: 0, width: 100, height: 100 },
                fill,
              },
            ],
          },
        ],
      }) as unknown as Pick<RenderModel, "layers">;

    expect(deviceArtworkToneForModel(modelWithBackground("#F7F8FA"))).toBe(
      "dark",
    );
    expect(deviceArtworkToneForModel(modelWithBackground("#101827"))).toBe(
      "light",
    );
  });
});
