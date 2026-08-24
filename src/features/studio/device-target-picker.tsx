"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deviceCategoryRegistry,
  devicePresetRegistry,
  type DevicePreset,
} from "@/data/devices/registry";
import {
  deviceDimensionsSchema,
  inferScreenMatch,
  type DeviceCategory,
  type DeviceVariant,
} from "@/domain/device/types";
import { inspectTemporaryImage, type InspectedImage } from "@/storage/assets";

export function DeviceTargetPicker({
  open,
  variants,
  onClose,
  onSwitch,
  onPreset,
  onCustom,
  onMatched,
}: {
  open: boolean;
  variants: readonly DeviceVariant[];
  onClose(): void;
  onSwitch(id: string): void;
  onPreset(preset: DevicePreset): void;
  onCustom(category: DeviceCategory, width: number, height: number): void;
  onMatched(
    image: InspectedImage,
    category: DeviceCategory,
    saveGuide: boolean,
  ): Promise<void>;
}) {
  const [section, setSection] = useState<DeviceCategory | "match">("phone");
  const [custom, setCustom] = useState({ width: "1080", height: "2400" });
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<InspectedImage | null>(null);
  const [matchCategory, setMatchCategory] = useState<DeviceCategory>("phone");
  const [saveGuide, setSaveGuide] = useState(false);
  if (!open) return null;
  const commitCustom = () => {
    const parsed = deviceDimensionsSchema.safeParse({
      width: Number(custom.width),
      height: Number(custom.height),
    });
    if (!parsed.success) {
      setError(
        "Use whole-number dimensions from 320–5120 px, up to 16 million pixels total.",
      );
      return;
    }
    setError(null);
    onCustom(
      section === "match" ? matchCategory : section,
      parsed.data.width,
      parsed.data.height,
    );
    onClose();
  };
  const inspect = async (file: File) => {
    try {
      const inspected = await inspectTemporaryImage(file, undefined, file.name);
      if (!deviceDimensionsSchema.safeParse(inspected).success) {
        setError(
          "This screenshot is outside the supported 320–5120 px and 16-million-pixel canvas limits.",
        );
        setImage(null);
        return;
      }
      const match = inferScreenMatch(inspected.width, inspected.height);
      setImage(inspected);
      setMatchCategory(
        match.recommendedCategory ?? match.candidates[0] ?? "phone",
      );
      setError(null);
    } catch (reason) {
      console.error("ScheduleBud screen inspection failed", reason);
      setError(
        reason instanceof Error
          ? reason.message
          : "We couldn't read this image.",
      );
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/25 md:items-center md:justify-center"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="target-picker-title"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-md bg-surface-elevated p-5 shadow-xl md:max-w-2xl md:rounded-md"
      >
        <header className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <p className="sb-label">Wallpaper target</p>
            <h2 id="target-picker-title" className="sb-section-title">
              Change target
            </h2>
          </div>
          <Button
            aria-label="Close target picker"
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </header>
        {variants.length > 0 ? (
          <div className="border-b border-border py-4">
            <p className="sb-label">Saved targets</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <Button
                  key={variant.id}
                  variant="outline"
                  onClick={() => {
                    onSwitch(variant.id);
                    onClose();
                  }}
                >
                  {variant.category} · {variant.dimensions.width} ×{" "}
                  {variant.dimensions.height}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
        <div
          className="flex gap-1 overflow-x-auto border-b border-border py-4"
          role="tablist"
          aria-label="Target category"
        >
          {deviceCategoryRegistry.map((category) => (
            <Button
              key={category.id}
              role="tab"
              aria-selected={section === category.id}
              variant={section === category.id ? "default" : "ghost"}
              onClick={() => setSection(category.id)}
            >
              {category.label}
            </Button>
          ))}
          <Button
            role="tab"
            aria-selected={section === "match"}
            variant={section === "match" ? "default" : "ghost"}
            onClick={() => setSection("match")}
          >
            Match My Screen
          </Button>
        </div>
        {section === "match" ? (
          <div className="space-y-4 py-5">
            <div className="border-y border-border py-4">
              <p className="font-semibold">
                Use a screenshot from your target screen
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Your screenshot stays on this device. PNG, JPEG, or WebP.
              </p>
              <input
                aria-label="Screen screenshot"
                className="mt-3 block w-full text-sm"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void inspect(file);
                }}
              />
            </div>
            {image ? (
              <div className="space-y-4">
                <p className="font-mono text-sm font-semibold">
                  {image.width} × {image.height}
                </p>
                <label>
                  <span className="sb-label">What kind of screen is this?</span>
                  <select
                    aria-label="Screen category"
                    className="sb-control"
                    value={matchCategory}
                    onChange={(event) =>
                      setMatchCategory(event.target.value as DeviceCategory)
                    }
                  >
                    {deviceCategoryRegistry.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-h-11 items-center justify-between border-y border-border py-2 text-sm font-semibold">
                  Use as preview guide
                  <input
                    type="checkbox"
                    checked={saveGuide}
                    onChange={(event) => setSaveGuide(event.target.checked)}
                  />
                </label>
                <Button
                  onClick={() =>
                    void onMatched(image, matchCategory, saveGuide).then(
                      onClose,
                    )
                  }
                >
                  Use screenshot dimensions
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 py-5 md:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="sb-label">Recommended presets</p>
              <div className="divide-y divide-border border-y border-border">
                {devicePresetRegistry
                  .filter((preset) => preset.category === section)
                  .map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="flex min-h-14 w-full items-center justify-between gap-3 py-2 text-left"
                      onClick={() => {
                        onPreset(preset);
                        onClose();
                      }}
                    >
                      <span className="font-semibold">
                        {preset.displayName}
                      </span>
                      <span className="font-mono text-xs text-text-muted">
                        {preset.width} × {preset.height}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <p className="sb-label">Custom dimensions</p>
              <div className="grid grid-cols-2 gap-2">
                <label>
                  <span className="text-xs text-text-secondary">Width</span>
                  <input
                    aria-label="Custom width"
                    className="sb-control"
                    inputMode="numeric"
                    value={custom.width}
                    onChange={(event) =>
                      setCustom((value) => ({
                        ...value,
                        width: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span className="text-xs text-text-secondary">Height</span>
                  <input
                    aria-label="Custom height"
                    className="sb-control"
                    inputMode="numeric"
                    value={custom.height}
                    onChange={(event) =>
                      setCustom((value) => ({
                        ...value,
                        height: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <Button className="mt-3" variant="outline" onClick={commitCustom}>
                Create custom {section}
              </Button>
            </div>
          </div>
        )}
        {error ? (
          <p
            role="alert"
            className="border-t border-warning/40 pt-3 text-sm text-warning"
          >
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
