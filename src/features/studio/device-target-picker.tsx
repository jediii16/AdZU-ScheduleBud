"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import { Check, ImageUp, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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

function formatImageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DeviceTargetPicker({
  open,
  variants,
  activeVariantId,
  returnFocusRef,
  onClose,
  onPreset,
  onCustom,
  onMatched,
}: {
  open: boolean;
  variants: readonly DeviceVariant[];
  activeVariantId: string;
  returnFocusRef?: RefObject<HTMLElement | null>;
  onClose(): void;
  onPreset(preset: DevicePreset): void;
  onCustom(category: DeviceCategory, width: number, height: number): void;
  onMatched(
    image: InspectedImage,
    category: DeviceCategory,
    saveGuide: boolean,
  ): Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<DeviceCategory>("phone");
  const [matchMode, setMatchMode] = useState(false);
  const [custom, setCustom] = useState({ width: "1080", height: "2400" });
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<InspectedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [draggingImage, setDraggingImage] = useState(false);
  const dragDepth = useRef(0);
  const [matchCategory, setMatchCategory] = useState<DeviceCategory>("phone");
  const [saveGuide, setSaveGuide] = useState(false);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

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
    onCustom(category, parsed.data.width, parsed.data.height);
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
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const nextPreviewUrl = URL.createObjectURL(inspected.blob);
      previewUrlRef.current = nextPreviewUrl;
      setPreviewUrl(nextPreviewUrl);
      setImage(inspected);
      setMatchCategory(
        match.recommendedCategory ?? match.candidates[0] ?? "phone",
      );
      setError(null);
    } catch (reason) {
      console.error("ScheduleBud screen inspection failed", reason);
      setImage(null);
      setError("We couldn't read this image. Choose a PNG, JPG, or WebP file.");
    }
  };

  const clearImage = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 min-h-dvh bg-foreground/25 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          finalFocus={returnFocusRef}
          className="fixed right-0 bottom-0 left-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-md border-t border-border bg-surface-elevated p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl outline-none transition-[transform,opacity] duration-150 data-ending-style:translate-y-3 data-ending-style:opacity-0 data-starting-style:translate-y-3 data-starting-style:opacity-0 motion-reduce:transition-none md:top-1/2 md:right-auto md:bottom-auto md:left-1/2 md:max-h-[88dvh] md:w-[min(42rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md md:border"
        >
          <header className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <p className="sb-label">Device</p>
              <Dialog.Title className="sb-section-title">
                Choose a device
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-text-secondary">
                ScheduleBud remembers your composition for each device size.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close device picker"
              className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
            >
              <X aria-hidden="true" />
            </Dialog.Close>
          </header>

          {!matchMode ? (
            <>
              <div className="grid gap-6 py-5 md:grid-cols-[1fr_0.8fr]">
                <section>
                  <h3 className="sb-inspector-heading">Devices</h3>
                  <div className="mt-2 divide-y divide-border border-y border-border">
                    {devicePresetRegistry.map((preset) => {
                      const current = variants.some(
                        (variant) =>
                          variant.id === activeVariantId &&
                          variant.presetId === preset.id,
                      );
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          aria-current={current ? "true" : undefined}
                          className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 px-2 py-2 text-left transition-colors duration-150 hover:bg-muted/70 active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none"
                          onClick={() => {
                            onPreset(preset);
                            onClose();
                          }}
                        >
                          <span className="font-semibold">
                            {preset.displayName}
                          </span>
                          <span className="flex items-center gap-2 font-mono text-xs text-text-muted">
                            {preset.width} × {preset.height}
                            {current ? (
                              <Check
                                aria-hidden="true"
                                className="size-4 text-brand"
                              />
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
                <section>
                  <h3 className="sb-inspector-heading">Custom size</h3>
                  <label className="mt-2 block">
                    <span className="text-xs font-semibold text-text-secondary">
                      Screen type
                    </span>
                    <select
                      aria-label="Custom screen type"
                      className="sb-control"
                      value={category}
                      onChange={(event) =>
                        setCategory(event.target.value as DeviceCategory)
                      }
                    >
                      {deviceCategoryRegistry.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label>
                      <span className="text-xs font-semibold text-text-secondary">
                        Width
                      </span>
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
                      <span className="text-xs font-semibold text-text-secondary">
                        Height
                      </span>
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
                  <Button
                    className="mt-3"
                    variant="outline"
                    onClick={commitCustom}
                  >
                    Use custom size
                  </Button>
                </section>
              </div>

              <section className="border-t border-border pt-4">
                <p className="text-sm font-semibold">Or match a screen</p>
                <p className="mt-1 text-xs text-text-muted">
                  Read exact dimensions from a screenshot without uploading it.
                </p>
                <Button
                  className="mt-3"
                  variant="outline"
                  onClick={() => setMatchMode(true)}
                >
                  <ImageUp aria-hidden="true" />
                  Match My Screen
                </Button>
              </section>
            </>
          ) : (
            <section className="space-y-4 py-5">
              <div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setMatchMode(false)}
                >
                  Back to device types
                </Button>
                <h3 className="mt-3 font-semibold">
                  Use a screenshot from your device
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  PNG, JPG, or WebP. Your screenshot stays on this device.
                </p>
                <input
                  ref={fileInputRef}
                  id="screen-guide-file"
                  aria-label="Screen screenshot"
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void inspect(file);
                  }}
                />
                {!image ? (
                  <div
                    aria-label="Screen screenshot drop zone"
                    data-dragging={draggingImage}
                    className="sb-dropzone mt-4 flex min-h-40 flex-col items-center justify-center rounded-md px-5 py-6 text-center"
                    onDragEnter={(event) => {
                      event.preventDefault();
                      dragDepth.current += 1;
                      setDraggingImage(true);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "copy";
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      dragDepth.current = Math.max(0, dragDepth.current - 1);
                      if (dragDepth.current === 0) setDraggingImage(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      dragDepth.current = 0;
                      setDraggingImage(false);
                      const file = event.dataTransfer.files[0];
                      if (file) void inspect(file);
                    }}
                  >
                    <span className="sb-dropzone-icon mb-2 flex size-11 items-center justify-center rounded-md bg-accent text-brand">
                      {draggingImage ? (
                        <UploadCloud aria-hidden="true" className="size-5" />
                      ) : (
                        <ImageUp aria-hidden="true" className="size-5" />
                      )}
                    </span>
                    <p className="text-sm font-semibold">
                      {draggingImage
                        ? "Release to read this screenshot"
                        : "Drop a screenshot here"}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      PNG, JPG, or WebP · Processed locally
                    </p>
                    <Button
                      className="mt-3"
                      variant="outline"
                      aria-label="Upload screenshot"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose screenshot
                    </Button>
                  </div>
                ) : null}
              </div>

              {image ? (
                <div className="rounded-md border border-border bg-card p-3 shadow-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted ring-1 ring-inset ring-border-muted">
                      {previewUrl ? (
                        <Image
                          unoptimized
                          src={previewUrl}
                          alt="Screenshot preview"
                          width={80}
                          height={80}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageUp aria-hidden="true" className="size-6" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {image.filename ?? "Screen screenshot"}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {image.mimeType.split("/")[1]?.toUpperCase()} ·{" "}
                        {formatImageSize(image.blob.size)}
                      </p>
                      <p className="font-mono text-xs text-text-muted">
                        {image.width} × {image.height}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-success">
                        <Check aria-hidden="true" className="size-3" /> Ready
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1 border-t border-border-muted pt-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button
                      aria-label="Remove screenshot"
                      size="icon-lg"
                      variant="ghost"
                      onClick={clearImage}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                  <label className="sb-setting-row mt-3 px-0 hover:bg-transparent">
                    <span>
                      <span className="block font-semibold">
                        Use as preview guide
                      </span>
                      <span className="mt-0.5 block text-xs font-normal text-text-muted">
                        Never included in exports.
                      </span>
                    </span>
                    <Switch
                      aria-label="Use as preview guide"
                      checked={saveGuide}
                      onChange={(event) => setSaveGuide(event.target.checked)}
                    />
                  </label>
                </div>
              ) : null}

              {image ? (
                <>
                  <label>
                    <span className="sb-label">Screen type</span>
                    <select
                      aria-label="Screen category"
                      className="sb-control"
                      value={matchCategory}
                      onChange={(event) =>
                        setMatchCategory(event.target.value as DeviceCategory)
                      }
                    >
                      {deviceCategoryRegistry.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
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
                </>
              ) : null}
            </section>
          )}

          {error ? (
            <p
              role="alert"
              className="mt-4 border-t border-warning/40 pt-3 text-sm text-warning"
            >
              {error}
            </p>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
