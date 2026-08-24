"use client";

import { Image as KonvaImage, Layer, Rect, Text } from "react-konva";
import type { DeviceVariant } from "@/domain/device/types";
import type { SafeAreaModel } from "@/domain/device/safe-areas";

const COLORS = {
  clear: "rgba(38, 145, 91, 0.07)",
  caution: "rgba(190, 133, 30, 0.12)",
  blocked: "rgba(184, 65, 65, 0.13)",
};

export function PreviewEnvironmentOverlay({
  variant,
  safeAreas,
  showSafeAreas,
  guideImage,
  guideOpacity,
  previewScale,
}: {
  variant: DeviceVariant;
  safeAreas: SafeAreaModel;
  showSafeAreas: boolean;
  guideImage: HTMLImageElement | null;
  guideOpacity: number;
  previewScale: number;
}) {
  const { width, height } = variant.dimensions;
  return (
    <Layer name="preview-environment" listening={false}>
      {variant.preview.mode === "uploaded-guide" && guideImage ? (
        <KonvaImage
          image={guideImage}
          x={0}
          y={0}
          width={width}
          height={height}
          opacity={guideOpacity}
        />
      ) : null}
      {variant.preview.mode === "lock-screen" ? (
        <Text
          text={"12:30\nMonday, August 24"}
          x={0}
          y={height * 0.13}
          width={width}
          align="center"
          fontSize={Math.max(28, width * 0.055)}
          lineHeight={1.35}
          fill="rgba(16,35,58,0.42)"
          fontStyle="600"
        />
      ) : null}
      {variant.preview.mode === "home-screen" ||
      variant.preview.mode === "tablet-interface" ? (
        <Rect
          x={width * 0.2}
          y={height * 0.92}
          width={width * 0.6}
          height={height * 0.045}
          cornerRadius={height * 0.02}
          fill="rgba(16,35,58,0.13)"
        />
      ) : null}
      {variant.preview.mode === "windows-desktop" ||
      variant.preview.mode === "desktop" ? (
        <Rect
          x={0}
          y={height * 0.94}
          width={width}
          height={height * 0.06}
          fill="rgba(16,35,58,0.16)"
        />
      ) : null}
      {variant.preview.mode === "macos-desktop" ? (
        <>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height * 0.035}
            fill="rgba(16,35,58,0.13)"
          />
          <Rect
            x={width * 0.27}
            y={height * 0.9}
            width={width * 0.46}
            height={height * 0.075}
            cornerRadius={height * 0.025}
            fill="rgba(16,35,58,0.13)"
          />
        </>
      ) : null}
      {showSafeAreas
        ? safeAreas.zones.map((area) => (
            <Rect
              key={area.id}
              x={area.x}
              y={area.y}
              width={area.width}
              height={area.height}
              fill={COLORS[area.kind]}
              stroke={
                area.kind === "clear"
                  ? "rgba(38,145,91,0.55)"
                  : area.kind === "blocked"
                    ? "rgba(184,65,65,0.58)"
                    : "rgba(190,133,30,0.58)"
              }
              strokeWidth={1 / previewScale}
              dash={[6 / previewScale, 5 / previewScale]}
            />
          ))
        : null}
    </Layer>
  );
}
