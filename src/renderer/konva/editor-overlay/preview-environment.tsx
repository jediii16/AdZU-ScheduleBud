"use client";

import { useEffect, useState } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Text } from "react-konva";
import type { DeviceVariant } from "@/domain/device/types";
import type { SafeAreaModel } from "@/domain/device/safe-areas";
import { DEVICE_PRESET_IDS } from "@/data/devices/registry";
import type { RenderAssetImages } from "../schedule-scene";
import { loadRenderAssetSources } from "../theme-asset-loading";
import {
  devicePreviewAssetSourceEntries,
  type DeviceArtworkTone,
} from "./device-preview-assets";

const COLORS = {
  clear: "rgba(38, 145, 91, 0.07)",
  caution: "rgba(190, 133, 30, 0.12)",
  blocked: "rgba(184, 65, 65, 0.13)",
};

const EMPTY_ASSETS: RenderAssetImages = new Map();
export const DEVICE_CHROME_OPACITY = 0.28;
export const IPHONE_TIME_DATE_OPACITY = 0.18;

function neutralChromeColor(tone: DeviceArtworkTone, opacity: number) {
  return tone === "light"
    ? `rgba(255,255,255,${opacity})`
    : `rgba(16,35,58,${opacity})`;
}

function useDevicePreviewAssets(
  variant: DeviceVariant,
  tone: DeviceArtworkTone,
) {
  const sources = devicePreviewAssetSourceEntries(variant, tone);
  const signature = JSON.stringify(sources);
  const [loaded, setLoaded] = useState<{
    signature: string;
    images: RenderAssetImages;
  }>({ signature: "", images: EMPTY_ASSETS });

  useEffect(() => {
    if (sources.length === 0) return;
    let active = true;
    void loadRenderAssetSources(sources).then((images) => {
      if (active) setLoaded({ signature, images });
    });
    return () => {
      active = false;
    };
  }, [signature, sources]);

  if (sources.length === 0)
    return { images: EMPTY_ASSETS, ready: true } as const;
  return {
    images: loaded.signature === signature ? loaded.images : EMPTY_ASSETS,
    ready: loaded.signature === signature,
  } as const;
}

function IPhoneLockScreenOverlay({
  images,
  width,
  height,
}: {
  images: RenderAssetImages;
  width: number;
  height: number;
}) {
  const xScale = width / 393;
  const yScale = height / 852;
  const statusBar = images.get("iphone-status-bar");
  const date = images.get("iphone-date");
  const clock = images.get("iphone-clock");
  const actions = images.get("iphone-actions");
  const homeIndicator = images.get("iphone-home-indicator");
  return (
    <Group>
      {statusBar ? (
        <KonvaImage
          image={statusBar}
          x={0}
          y={0}
          width={393 * xScale}
          height={59 * yScale}
          opacity={DEVICE_CHROME_OPACITY}
        />
      ) : null}
      {date ? (
        <KonvaImage
          image={date}
          x={111 * xScale}
          y={98 * yScale}
          width={171 * xScale}
          height={28 * yScale}
          opacity={IPHONE_TIME_DATE_OPACITY}
        />
      ) : null}
      {clock ? (
        <KonvaImage
          image={clock}
          x={49 * xScale}
          y={132 * yScale}
          width={295 * xScale}
          height={119 * yScale}
          opacity={IPHONE_TIME_DATE_OPACITY}
        />
      ) : null}
      {actions ? (
        <KonvaImage
          image={actions}
          x={46 * xScale}
          y={744 * yScale}
          width={301 * xScale}
          height={50 * yScale}
          opacity={DEVICE_CHROME_OPACITY}
        />
      ) : null}
      {homeIndicator ? (
        <KonvaImage
          image={homeIndicator}
          x={1.5 * xScale}
          y={818 * yScale}
          width={390 * xScale}
          height={34 * yScale}
          opacity={DEVICE_CHROME_OPACITY}
        />
      ) : null}
    </Group>
  );
}

function AndroidLockScreenOverlay({
  image,
  width,
  height,
}: {
  image: HTMLImageElement;
  width: number;
  height: number;
}) {
  const scale = Math.min(width / 428, height / 926);
  const imageWidth = 428 * scale;
  const imageHeight = 926 * scale;
  return (
    <KonvaImage
      image={image}
      x={(width - imageWidth) / 2}
      y={(height - imageHeight) / 2}
      width={imageWidth}
      height={imageHeight}
      opacity={DEVICE_CHROME_OPACITY}
    />
  );
}

export function PreviewEnvironmentOverlay({
  variant,
  safeAreas,
  showSafeAreas,
  guideImage,
  guideOpacity,
  previewScale,
  artworkTone,
}: {
  variant: DeviceVariant;
  safeAreas: SafeAreaModel;
  showSafeAreas: boolean;
  guideImage: HTMLImageElement | null;
  guideOpacity: number;
  previewScale: number;
  artworkTone: DeviceArtworkTone;
}) {
  const { width, height } = variant.dimensions;
  const { images: deviceImages, ready: deviceAssetsReady } =
    useDevicePreviewAssets(variant, artworkTone);
  const iphoneArtwork = deviceImages.has("iphone-clock");
  const androidArtwork = deviceImages.get("android-lock-screen");
  const windowsTaskbar = deviceImages.get("windows-taskbar");
  const usesIphoneArtwork = variant.presetId === DEVICE_PRESET_IDS.iphone;
  const usesAndroidArtwork = variant.presetId === DEVICE_PRESET_IDS.android;
  const taskbarHeight = Math.min(height * 0.08, (width * 49) / 1500);
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
      {variant.preview.mode === "lock-screen" &&
      deviceAssetsReady &&
      usesIphoneArtwork &&
      iphoneArtwork ? (
        <IPhoneLockScreenOverlay
          images={deviceImages}
          width={width}
          height={height}
        />
      ) : null}
      {variant.preview.mode === "lock-screen" &&
      deviceAssetsReady &&
      usesAndroidArtwork &&
      androidArtwork ? (
        <AndroidLockScreenOverlay
          image={androidArtwork}
          width={width}
          height={height}
        />
      ) : null}
      {variant.preview.mode === "lock-screen" &&
      deviceAssetsReady &&
      !iphoneArtwork &&
      !androidArtwork ? (
        <Text
          text={"12:30\nMonday, August 24"}
          x={0}
          y={height * 0.13}
          width={width}
          align="center"
          fontSize={Math.max(28, width * 0.055)}
          lineHeight={1.35}
          fill={neutralChromeColor(artworkTone, DEVICE_CHROME_OPACITY)}
          fontStyle="600"
        />
      ) : null}
      {variant.preview.mode === "home-screen" ? (
        <Rect
          x={width * 0.2}
          y={height * 0.92}
          width={width * 0.6}
          height={height * 0.045}
          cornerRadius={height * 0.02}
          fill={neutralChromeColor(artworkTone, 0.11)}
        />
      ) : null}
      {variant.preview.mode === "windows-desktop" ||
      variant.preview.mode === "desktop" ? (
        windowsTaskbar ? (
          <KonvaImage
            image={windowsTaskbar}
            x={0}
            y={height - taskbarHeight}
            width={width}
            height={taskbarHeight}
            opacity={DEVICE_CHROME_OPACITY}
          />
        ) : (
          <Rect
            x={0}
            y={height * 0.94}
            width={width}
            height={height * 0.06}
            fill={neutralChromeColor(artworkTone, 0.1)}
          />
        )
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
