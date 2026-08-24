import type { Rect } from "@/domain/render/types";
import type { DeviceVariant } from "./types";

export type SafeAreaKind = "clear" | "caution" | "blocked";
export type SafeAreaZone = Rect & {
  id: string;
  kind: SafeAreaKind;
  label: string;
};
export type SafeAreaModel = { zones: readonly SafeAreaZone[] };
export type SafeAreaCollision = {
  status: SafeAreaKind;
  zones: readonly SafeAreaZone[];
};

const zone = (
  variant: DeviceVariant,
  id: string,
  kind: SafeAreaKind,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
): SafeAreaZone => ({
  id,
  kind,
  label,
  x: x * variant.dimensions.width,
  y: y * variant.dimensions.height,
  width: width * variant.dimensions.width,
  height: height * variant.dimensions.height,
});

export function resolveSafeAreaModel(variant: DeviceVariant): SafeAreaModel {
  if (
    variant.preview.mode === "clean" ||
    variant.preview.mode === "uploaded-guide"
  )
    return { zones: [] };
  if (variant.category === "phone")
    return {
      zones: [
        zone(variant, "phone-top", "blocked", "System area", 0, 0, 1, 0.07),
        zone(
          variant,
          "phone-clock",
          "caution",
          "Clock and widgets",
          0.08,
          0.08,
          0.84,
          0.22,
        ),
        zone(
          variant,
          "phone-clear",
          "clear",
          "Recommended schedule area",
          0.07,
          0.31,
          0.86,
          0.52,
        ),
        zone(
          variant,
          "phone-bottom",
          "caution",
          "System actions",
          0,
          0.86,
          1,
          0.14,
        ),
      ],
    };
  if (variant.category === "tablet")
    return {
      zones: [
        zone(variant, "tablet-top", "caution", "Status area", 0, 0, 1, 0.06),
        zone(
          variant,
          "tablet-clear",
          "clear",
          "Recommended schedule area",
          0.05,
          0.1,
          0.9,
          0.78,
        ),
        zone(
          variant,
          "tablet-dock",
          "caution",
          "Dock or navigation",
          0.15,
          0.9,
          0.7,
          0.1,
        ),
      ],
    };
  if (variant.preview.mode === "macos-desktop")
    return {
      zones: [
        zone(variant, "mac-menu", "caution", "Menu bar", 0, 0, 1, 0.045),
        zone(
          variant,
          "mac-clear",
          "clear",
          "Recommended schedule area",
          0.04,
          0.07,
          0.87,
          0.78,
        ),
        zone(variant, "mac-dock", "caution", "Dock", 0.2, 0.88, 0.6, 0.12),
      ],
    };
  return {
    zones: [
      zone(
        variant,
        "windows-icons",
        "caution",
        "Desktop icons",
        0,
        0,
        0.14,
        0.92,
      ),
      zone(
        variant,
        "windows-clear",
        "clear",
        "Recommended schedule area",
        0.16,
        0.05,
        0.81,
        0.83,
      ),
      zone(variant, "windows-taskbar", "blocked", "Taskbar", 0, 0.93, 1, 0.07),
    ],
  };
}

function intersects(left: Rect, right: Rect): boolean {
  return (
    left.x < right.x + right.width &&
    left.x + left.width > right.x &&
    left.y < right.y + right.height &&
    left.y + left.height > right.y
  );
}

export function detectSafeAreaCollision(
  bounds: Rect,
  model: SafeAreaModel,
): SafeAreaCollision {
  const hits = model.zones.filter(
    (item) => item.kind !== "clear" && intersects(bounds, item),
  );
  return {
    status: hits.some((item) => item.kind === "blocked")
      ? "blocked"
      : hits.length > 0
        ? "caution"
        : "clear",
    zones: hits,
  };
}

export function safeAreaSnapAnchors(
  model: SafeAreaModel,
  bounds: Pick<Rect, "width" | "height">,
) {
  const clear = model.zones.find((item) => item.kind === "clear");
  if (!clear) return { x: [] as number[], y: [] as number[] };
  return {
    x: [clear.x, clear.x + clear.width - bounds.width],
    y: [clear.y, clear.y + clear.height - bounds.height],
  };
}
