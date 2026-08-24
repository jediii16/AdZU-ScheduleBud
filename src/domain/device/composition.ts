import type { DeviceCategory, DeviceDimensions, Orientation } from "./types";
import { inferOrientation } from "./types";

export type TargetCompositionFamily =
  | "phonePortrait"
  | "tabletPortrait"
  | "tabletLandscape"
  | "desktopLandscape"
  | "square";

export function resolveTargetComposition(input: {
  category: DeviceCategory;
  dimensions: DeviceDimensions;
  orientation?: Orientation;
}): TargetCompositionFamily {
  const orientation = input.orientation ?? inferOrientation(input.dimensions);
  if (input.category === "square" || orientation === "square") return "square";
  if (input.category === "phone" && orientation === "portrait")
    return "phonePortrait";
  if (input.category === "tablet")
    return orientation === "portrait" ? "tabletPortrait" : "tabletLandscape";
  if (orientation === "portrait") return "tabletPortrait";
  return "desktopLandscape";
}
