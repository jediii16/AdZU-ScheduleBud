import type { DeviceVariant } from "@/domain/device/types";
import { DEVICE_PRESET_IDS } from "@/data/devices/registry";
import type { RenderModel } from "@/domain/render";
import type { RenderAssetSourceEntry } from "../theme-asset-loading";

export type DeviceArtworkTone = "light" | "dark";

const ANDROID_LOCK_SCREEN_ASSETS = [
  ["android-lock-screen", "/devices/android/lock-screen.svg"],
] as const satisfies readonly RenderAssetSourceEntry[];

const IPHONE_LOCK_SCREEN_ASSETS: Record<
  DeviceArtworkTone,
  readonly RenderAssetSourceEntry[]
> = {
  light: [
    ["iphone-status-bar", "/devices/iphone/dynamic-island-light.svg"],
    ["iphone-date", "/devices/iphone/date-light.svg"],
    ["iphone-clock", "/devices/iphone/clock-light.svg"],
    ["iphone-actions", "/devices/iphone/bottom-actions.svg"],
    ["iphone-home-indicator", "/devices/iphone/home-indicator-light.svg"],
  ],
  dark: [
    ["iphone-status-bar", "/devices/iphone/dynamic-island-dark.svg"],
    ["iphone-date", "/devices/iphone/date-dark.svg"],
    ["iphone-clock", "/devices/iphone/clock-dark.svg"],
    ["iphone-actions", "/devices/iphone/bottom-actions.svg"],
    ["iphone-home-indicator", "/devices/iphone/home-indicator-dark.svg"],
  ],
};

const WINDOWS_DESKTOP_ASSETS: Record<
  DeviceArtworkTone,
  readonly RenderAssetSourceEntry[]
> = {
  light: [["windows-taskbar", "/devices/windows/taskbar-dark.svg"]],
  dark: [["windows-taskbar", "/devices/windows/taskbar-light.svg"]],
};

const NO_DEVICE_ASSETS: readonly RenderAssetSourceEntry[] = [];

function colorLuminance(color: string): number | null {
  const value = color.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  const [red, green, blue] = [0, 2, 4].map((index) =>
    Number.parseInt(value.slice(index, index + 2), 16),
  );
  return (0.2126 * red! + 0.7152 * green! + 0.0722 * blue!) / 255;
}

export function deviceArtworkToneForModel(
  model: Pick<RenderModel, "layers">,
): DeviceArtworkTone {
  const background = model.layers[0].nodes.find(
    (node) =>
      node.kind === "rect" && node.id.startsWith("wallpaper-background"),
  );
  if (!background || background.kind !== "rect") return "light";
  const colors = background.fill
    ? [background.fill]
    : background.pattern
      ? [background.pattern.backgroundColor]
      : background.linearGradient
        ? [
            background.linearGradient.colorStops[1],
            background.linearGradient.colorStops[3],
          ]
        : [];
  const luminances = colors
    .map(colorLuminance)
    .filter((value): value is number => value !== null);
  if (luminances.length === 0) return "light";
  const average =
    luminances.reduce((total, value) => total + value, 0) / luminances.length;
  return average < 0.5 ? "light" : "dark";
}

export function devicePreviewAssetSourceEntries(
  variant: Pick<DeviceVariant, "presetId" | "preview">,
  tone: DeviceArtworkTone = "light",
): readonly RenderAssetSourceEntry[] {
  if (variant.preview.mode === "lock-screen") {
    if (variant.presetId === DEVICE_PRESET_IDS.iphone)
      return IPHONE_LOCK_SCREEN_ASSETS[tone];
    if (variant.presetId === DEVICE_PRESET_IDS.android)
      return ANDROID_LOCK_SCREEN_ASSETS;
  }
  if (
    variant.preview.mode === "windows-desktop" ||
    variant.preview.mode === "desktop"
  )
    return WINDOWS_DESKTOP_ASSETS[tone];
  return NO_DEVICE_ASSETS;
}
