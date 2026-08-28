"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type RefObject } from "react";
import { Copy, Layers, RotateCcw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  emojiCategories,
  type EmojiCategoryId,
} from "@/data/emojis/catalog";
import { availableLayouts } from "@/data/layouts/registry";
import { availableThemes } from "@/data/themes/registry";
import {
  stickerById,
  stickerCatalog,
  stickerCategories,
} from "@/data/stickers/catalog";
import type { LayoutId, ThemeId } from "@/domain/design/types";
import type { AvailablePhotoComposition } from "@/domain/render/photo-crop";
import { resolveWallpaperTheme } from "@/domain/render/themes/registry";
import {
  supportsOrientationSwitch,
  type DeviceVariant,
  type VisibleFields,
} from "@/domain/device/types";
import type { ProjectDesign } from "@/domain/project";
import type { StickerInstance, StickerLayer } from "@/domain/stickers/types";
import type { LayoutDetailCapabilities } from "@/domain/render";
import { StoreSubjectList } from "@/features/classes/class-editor";

export function ClassesStudioPanel() {
  return (
    <section aria-labelledby="studio-classes-heading">
      <div className="mb-5 border-b border-border pb-4">
        <h2 id="studio-classes-heading" className="sb-section-title">
          Classes
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Included classes appear on the wallpaper. Excluded classes stay in
          your project.
        </p>
      </div>
      <StoreSubjectList emptyMessage="No classes are available yet." />
    </section>
  );
}

const FIELD_LABELS: Record<keyof VisibleFields, string> = {
  time: "Time",
  room: "Room",
  professor: "Professor",
  section: "Section",
};

const INSPECTOR_FIELD_ORDER: readonly (keyof VisibleFields)[] = [
  "time",
  "room",
  "professor",
  "section",
];

type InspectorPhoto = {
  id: string;
  filename: string;
  caption: string;
};

const PHOTO_COMPOSITIONS: readonly AvailablePhotoComposition[] = [
  "hero",
  "split",
  "polaroid",
];

function StickerThumbnail({
  stickerId,
  size = 48,
}: {
  stickerId: string;
  size?: number;
}) {
  const sticker = stickerById.get(stickerId);
  if (!sticker) return <span className="size-10 bg-muted" />;
  const scale = Math.min(size / sticker.crop.width, size / sticker.crop.height);
  return (
    <span
      aria-hidden="true"
      className="relative block shrink-0 overflow-hidden rounded-sm bg-muted/50"
      style={{ width: size, height: size }}
    >
      <Image
        unoptimized
        src={sticker.src}
        alt=""
        width={sticker.intrinsic.width}
        height={sticker.intrinsic.height}
        className="absolute max-w-none"
        style={{
          width: sticker.intrinsic.width * scale,
          height: sticker.intrinsic.height * scale,
          left:
            (size - sticker.crop.width * scale) / 2 - sticker.crop.x * scale,
          top:
            (size - sticker.crop.height * scale) / 2 - sticker.crop.y * scale,
        }}
      />
    </span>
  );
}

function StickerInspectorSection({
  stickers,
  selectedId,
  onAdd,
  onSelect,
  onDelete,
  onDuplicate,
  onReset,
  onLayer,
  onStack,
}: {
  stickers: readonly StickerInstance[];
  selectedId: string | null;
  onAdd(stickerId: string): void;
  onSelect(instanceId: string): void;
  onDelete(instanceId: string): void;
  onDuplicate(instanceId: string): void;
  onReset(instanceId: string): void;
  onLayer(instanceId: string, layer: StickerLayer): void;
  onStack(instanceId: string, direction: "forward" | "backward"): void;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(stickerCategories[0] ?? "");
  const [emojiCategory, setEmojiCategory] = useState<EmojiCategoryId>(
    emojiCategories[0]?.id ?? "",
  );
  const [visibleLimit, setVisibleLimit] = useState(60);
  const selected = stickers.find((item) => item.instanceId === selectedId);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      stickerCatalog.filter(
        (item) =>
          item.category === category &&
          (category !== "Emojis" || item.subcategory === emojiCategory) &&
          (!normalizedQuery ||
            [
              item.label,
              item.category,
              item.subcategory ?? "",
              ...(item.keywords ?? []),
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)),
      ),
    [category, emojiCategory, normalizedQuery],
  );
  const visibleStickers = filtered.slice(0, visibleLimit);
  return (
    <section
      className="sb-inspector-major-section"
      aria-labelledby="stickers-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id="stickers-heading" className="sb-inspector-heading">
          Stickers
        </h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setLibraryOpen((open) => !open)}
        >
          {libraryOpen ? "Close" : "Add sticker"}
        </Button>
      </div>
      <div className="sb-inspector-children">
        {libraryOpen ? (
          <div className="mb-4 border-b border-border pb-4">
            <label className="relative block">
              <Search
                aria-hidden="true"
                className="absolute top-2.5 left-2.5 size-4 text-text-muted"
              />
              <span className="sr-only">Search stickers</span>
              <input
                className="sb-control pl-8"
                value={query}
                placeholder="Search stickers"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleLimit(60);
                }}
              />
            </label>
            <div
              className="mt-2 flex flex-wrap gap-1"
              role="tablist"
              aria-label="Sticker category"
            >
              {stickerCategories.map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={category === item ? "default" : "ghost"}
                  role="tab"
                  aria-selected={category === item}
                  onClick={() => {
                    setCategory(item);
                    setVisibleLimit(60);
                  }}
                >
                  {item}
                </Button>
              ))}
            </div>
            {category === "Emojis" ? (
              <div
                className="mt-2 flex flex-wrap gap-1 border-t border-border pt-2"
                role="tablist"
                aria-label="Emoji category"
              >
                {emojiCategories.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    size="sm"
                    variant={emojiCategory === item.id ? "secondary" : "ghost"}
                    role="tab"
                    aria-selected={emojiCategory === item.id}
                    onClick={() => {
                      setEmojiCategory(item.id);
                      setVisibleLimit(60);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            ) : null}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {visibleStickers.map((definition) => (
                <button
                  key={definition.id}
                  type="button"
                  className="min-w-0 rounded-sm border border-border p-2 text-center text-[11px] font-medium text-text-secondary transition-colors hover:border-brand/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                  aria-label={`Add ${definition.label}`}
                  onClick={() => onAdd(definition.id)}
                >
                  <span className="mx-auto mb-1 block w-fit">
                    <StickerThumbnail stickerId={definition.id} />
                  </span>
                  <span className="line-clamp-2">{definition.label}</span>
                </button>
              ))}
            </div>
            {visibleLimit < filtered.length ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-3 w-full"
                onClick={() => setVisibleLimit((limit) => limit + 60)}
              >
                Show more ({filtered.length - visibleLimit} remaining)
              </Button>
            ) : null}
          </div>
        ) : null}
        {stickers.length === 0 ? (
          <p className="text-xs leading-5 text-text-muted">
            No stickers on this device yet.
          </p>
        ) : (
          <ol className="space-y-1" aria-label="Stickers on this device">
            {[...stickers]
              .sort((left, right) => right.order - left.order)
              .map((instance) => {
                const definition = stickerById.get(instance.stickerId);
                const isSelected = instance.instanceId === selectedId;
                return (
                  <li key={instance.instanceId}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      className={`flex w-full items-center gap-2 rounded-sm border px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${isSelected ? "border-brand/40 bg-accent" : "border-transparent hover:bg-muted"}`}
                      onClick={() => onSelect(instance.instanceId)}
                    >
                      <StickerThumbnail
                        stickerId={instance.stickerId}
                        size={36}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">
                          {definition?.label ?? "Unknown sticker"}
                        </span>
                        <span className="block text-[11px] text-text-muted">
                          {instance.layer === "in-front"
                            ? "In front"
                            : "Behind schedule"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
          </ol>
        )}
        {selected ? (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div
              role="radiogroup"
              aria-label="Sticker layer"
              className="grid grid-cols-2 rounded-sm border border-border bg-muted/40 p-1"
            >
              {(
                [
                  ["behind-schedule", "Behind schedule"],
                  ["in-front", "In front"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected.layer === value}
                  className={`min-h-9 rounded-sm px-2 text-xs font-semibold ${selected.layer === value ? "bg-surface-elevated text-brand ring-1 ring-inset ring-brand/20" : "text-text-secondary hover:bg-surface"}`}
                  onClick={() => onLayer(selected.instanceId, value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onStack(selected.instanceId, "forward")}
              >
                <Layers aria-hidden="true" />
                Bring forward
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onStack(selected.instanceId, "backward")}
              >
                <Layers aria-hidden="true" />
                Send backward
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onDuplicate(selected.instanceId)}
              >
                <Copy aria-hidden="true" />
                Duplicate
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onReset(selected.instanceId)}
              >
                <RotateCcw aria-hidden="true" />
                Reset
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => onDelete(selected.instanceId)}
            >
              <Trash2 aria-hidden="true" />
              Delete sticker
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PhotoCompositionControl({
  composition,
  onComposition,
}: {
  composition: AvailablePhotoComposition;
  onComposition(value: AvailablePhotoComposition): void;
}) {
  return (
    <div>
      <span className="sb-inspector-field-label">Composition</span>
      <div
        role="radiogroup"
        aria-label="Photo composition"
        className="grid grid-cols-3 rounded-sm border border-border bg-muted/40 p-1"
      >
        {PHOTO_COMPOSITIONS.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={composition === value}
            className={`min-h-9 min-w-0 rounded-sm px-1 text-xs font-semibold capitalize transition-colors ${composition === value ? "bg-surface-elevated text-brand ring-1 ring-inset ring-brand/20" : "text-text-secondary hover:bg-surface hover:text-foreground"}`}
            onClick={() => onComposition(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function PhotoInspectorSection({
  photos,
  composition,
  activePhotoId,
  adjusting,
  zoom,
  onFile,
  onComposition,
  onAdjust,
  onRemove,
  onZoomStart,
  onZoom,
  onZoomEnd,
  onReset,
  onDone,
  onMove,
  onCaption,
}: {
  photos: readonly InspectorPhoto[];
  composition: AvailablePhotoComposition;
  activePhotoId: string | null;
  adjusting: boolean;
  zoom: number;
  onFile(file: File, intent: "replace-primary" | "append"): Promise<void>;
  onComposition(value: AvailablePhotoComposition): void;
  onAdjust(assetId: string): void;
  onRemove(assetId: string): void;
  onZoomStart(): void;
  onZoom(value: number): void;
  onZoomEnd(): void;
  onReset(): void;
  onDone(): void;
  onMove(assetId: string, direction: "up" | "down"): void;
  onCaption(assetId: string, caption: string): void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileIntent = useRef<"replace-primary" | "append">("replace-primary");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const receiveFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      await onFile(file, fileIntent.current);
    } catch (reason) {
      console.error("ScheduleBud photo selection failed", reason);
      setError("We couldn't read this photo. Choose a PNG, JPG, or WebP file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };
  const chooseFile = (intent: "replace-primary" | "append") => {
    fileIntent.current = intent;
    inputRef.current?.click();
  };
  const selectedPhoto =
    photos.find((photo) => photo.id === activePhotoId) ?? photos[0];
  const atLimit = photos.length >= 4;
  return (
    <section
      className="sb-inspector-major-section"
      aria-labelledby="photo-heading"
    >
      <h3 id="photo-heading" className="sb-inspector-heading">
        Photo
      </h3>
      <div className="sb-inspector-children">
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label="Choose Photo"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void receiveFile(file);
          }}
        />
        <div className="space-y-4">
          <PhotoCompositionControl
            composition={composition}
            onComposition={onComposition}
          />
          {photos.length === 0 ? (
            <div>
              <p className="mb-3 text-xs leading-5 text-text-muted">
                {composition === "polaroid"
                  ? "Previewing 4 empty frames · Add 1–4 photos"
                  : composition === "split"
                    ? "Add 1–4 photos to build the Split mosaic"
                    : "Previewing an empty photo frame"}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => chooseFile("replace-primary")}
              >
                {busy ? "Adding…" : "Add photo"}
              </Button>
              <p className="mt-2 text-xs leading-5 text-text-muted">
                PNG, JPG or WebP
                <br />
                Stays on this device
              </p>
            </div>
          ) : adjusting && selectedPhoto ? (
            <div className="space-y-3">
              <p
                className="truncate text-sm font-semibold"
                title={selectedPhoto.filename}
              >
                {selectedPhoto.filename}
              </p>
              <p className="text-xs text-text-muted">
                Drag the photo to reposition
              </p>
              <label className="block">
                <span className="mb-1 flex justify-between text-xs font-semibold text-text-secondary">
                  <span>Zoom</span>
                  <span className="font-mono">{zoom.toFixed(1)}×</span>
                </span>
                <input
                  aria-label="Photo zoom"
                  className="w-full accent-[var(--brand)]"
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onPointerDown={onZoomStart}
                  onPointerUp={onZoomEnd}
                  onKeyDown={onZoomStart}
                  onKeyUp={onZoomEnd}
                  onChange={(event) => onZoom(Number(event.target.value))}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={onReset}
                >
                  Reset crop
                </Button>
                <Button type="button" size="sm" onClick={onDone}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {composition === "polaroid" || composition === "split" ? (
                <div className="space-y-3">
                  <p className="sb-inspector-field-label">Photos</p>
                  <p className="text-xs text-text-muted">
                    {photos.length} of 4 photos
                    {composition === "polaroid" ? " · Looks best with 3–4" : ""}
                  </p>
                  <ol className="space-y-3">
                    {photos.map((photo, index) => (
                      <li
                        key={photo.id}
                        className="border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <p
                          className="truncate text-sm font-semibold"
                          title={photo.filename}
                        >
                          {index + 1}. {photo.filename}
                        </p>
                        {composition === "polaroid" ? (
                          <label className="mt-2 block">
                            <span className="text-xs font-medium text-text-secondary">
                              Caption (optional)
                            </span>
                            <input
                              key={`${photo.id}-${photo.caption}`}
                              className="sb-control mt-1"
                              defaultValue={photo.caption}
                              maxLength={40}
                              onBlur={(event) =>
                                onCaption(photo.id, event.target.value)
                              }
                            />
                          </label>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onAdjust(photo.id)}
                          >
                            Adjust
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label={`Move photo ${index + 1} up`}
                            disabled={index === 0}
                            onClick={() => onMove(photo.id, "up")}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label={`Move photo ${index + 1} down`}
                            disabled={index === photos.length - 1}
                            onClick={() => onMove(photo.id, "down")}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemove(photo.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || atLimit}
                    onClick={() => chooseFile("append")}
                  >
                    {busy ? "Adding…" : "+ Add photo"}
                  </Button>
                  {atLimit ? (
                    <p className="text-xs text-text-muted">Maximum 4 photos</p>
                  ) : null}
                </div>
              ) : (
                <div>
                  <p
                    className="truncate text-sm font-semibold"
                    title={photos[0]!.filename}
                  >
                    {photos[0]!.filename}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onAdjust(photos[0]!.id)}
                    >
                      Adjust
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => chooseFile("replace-primary")}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(photos[0]!.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-xs leading-5 text-warning">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function DesignStudioPanel({
  design,
  visibleFields,
  activeLayout,
  detailCapabilities,
  onTheme,
  onLayout,
  onTitleVisible,
  onTitleText,
  onField,
  onDayVisibility,
  photos = [],
  activePhotoId = null,
  photoComposition = "hero",
  photoAdjusting = false,
  photoZoom = 1,
  onPhotoFile = async () => {},
  onPhotoComposition = () => {},
  onPhotoAdjust = () => {},
  onPhotoRemove = () => {},
  onPhotoZoomStart = () => {},
  onPhotoZoom = () => {},
  onPhotoZoomEnd = () => {},
  onPhotoReset = () => {},
  onPhotoDone = () => {},
  onPhotoMove = () => {},
  onPhotoCaption = () => {},
  stickers = [],
  selectedStickerId = null,
  onStickerAdd = () => {},
  onStickerSelect = () => {},
  onStickerDelete = () => {},
  onStickerDuplicate = () => {},
  onStickerReset = () => {},
  onStickerLayer = () => {},
  onStickerStack = () => {},
}: {
  design: ProjectDesign;
  visibleFields: VisibleFields;
  activeLayout: LayoutId;
  detailCapabilities: LayoutDetailCapabilities;
  onTheme?(value: ThemeId): void;
  onLayout(value: LayoutId): void;
  onTitleVisible(value: boolean): void;
  onTitleText(value: string): void;
  onField(field: keyof VisibleFields, value: boolean): void;
  onDayVisibility(value: ProjectDesign["dayVisibility"]): void;
  photos?: readonly InspectorPhoto[];
  activePhotoId?: string | null;
  photoComposition?: AvailablePhotoComposition;
  photoAdjusting?: boolean;
  photoZoom?: number;
  onPhotoFile?(file: File, intent: "replace-primary" | "append"): Promise<void>;
  onPhotoComposition?(value: AvailablePhotoComposition): void;
  onPhotoAdjust?(assetId: string): void;
  onPhotoRemove?(assetId: string): void;
  onPhotoZoomStart?(): void;
  onPhotoZoom?(value: number): void;
  onPhotoZoomEnd?(): void;
  onPhotoReset?(): void;
  onPhotoDone?(): void;
  onPhotoMove?(assetId: string, direction: "up" | "down"): void;
  onPhotoCaption?(assetId: string, caption: string): void;
  stickers?: readonly StickerInstance[];
  selectedStickerId?: string | null;
  onStickerAdd?(stickerId: string): void;
  onStickerSelect?(instanceId: string): void;
  onStickerDelete?(instanceId: string): void;
  onStickerDuplicate?(instanceId: string): void;
  onStickerReset?(instanceId: string): void;
  onStickerLayer?(instanceId: string, layer: StickerLayer): void;
  onStickerStack?(instanceId: string, direction: "forward" | "backward"): void;
}) {
  const subjectPalette = resolveWallpaperTheme(
    design.themeId,
    activeLayout,
  ).subjectPalette;
  const activeTheme = availableThemes.find(
    (theme) => theme.id === design.themeId,
  );
  return (
    <section aria-labelledby="studio-design-heading">
      <div className="pb-3">
        <h2 id="studio-design-heading" className="sb-section-title">
          Design
        </h2>
      </div>
      <section className="sb-inspector-major-section">
        <h3 className="sb-inspector-heading">Theme</h3>
        <div
          role="radiogroup"
          aria-label="Wallpaper theme"
          className="sb-inspector-children grid grid-cols-3 rounded-sm border border-border bg-muted/40 p-1"
        >
          {availableThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={design.themeId === theme.id}
              title={theme.description}
              className={`min-h-12 min-w-0 cursor-pointer rounded-sm px-2 py-1.5 text-left text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30 motion-reduce:transition-none ${design.themeId === theme.id ? "bg-surface-elevated text-brand ring-1 ring-inset ring-brand/20" : "text-text-secondary hover:bg-surface hover:text-foreground active:bg-muted"}`}
              onClick={() => onTheme?.(theme.id)}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 overflow-hidden rounded-full border border-border"
                >
                  <span
                    className="h-full flex-1"
                    style={{ backgroundColor: theme.previewColors.foreground }}
                  />
                  <span
                    className="h-full flex-1"
                    style={{ backgroundColor: theme.previewColors.accent }}
                  />
                </span>
                <span>{theme.name}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="sb-inspector-children mt-2 text-xs leading-5 text-text-muted">
          {activeTheme?.description}
        </p>
      </section>
      <section className="sb-inspector-major-section">
        <h3 className="sb-inspector-heading">Layout</h3>
        <div
          role="radiogroup"
          aria-label="Schedule layout"
          className="sb-inspector-children grid grid-cols-5 rounded-sm border border-border bg-muted/40 p-1"
        >
          {availableLayouts.map((layout) => (
            <button
              key={layout.id}
              type="button"
              role="radio"
              aria-checked={activeLayout === layout.id}
              className={`min-h-10 min-w-0 cursor-pointer rounded-sm px-1 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30 motion-reduce:transition-none ${activeLayout === layout.id ? "bg-surface-elevated text-brand ring-1 ring-inset ring-brand/20" : "text-text-secondary hover:bg-surface hover:text-foreground active:bg-muted"}`}
              onClick={() => onLayout(layout.id)}
            >
              {layout.name}
            </button>
          ))}
        </div>
      </section>
      <StickerInspectorSection
        stickers={stickers}
        selectedId={selectedStickerId}
        onAdd={onStickerAdd}
        onSelect={onStickerSelect}
        onDelete={onStickerDelete}
        onDuplicate={onStickerDuplicate}
        onReset={onStickerReset}
        onLayer={onStickerLayer}
        onStack={onStickerStack}
      />
      {activeLayout === "photo" ? (
        <PhotoInspectorSection
          photos={photos}
          composition={photoComposition}
          activePhotoId={activePhotoId}
          adjusting={photoAdjusting}
          zoom={photoZoom}
          onFile={onPhotoFile}
          onComposition={onPhotoComposition}
          onAdjust={onPhotoAdjust}
          onRemove={onPhotoRemove}
          onZoomStart={onPhotoZoomStart}
          onZoom={onPhotoZoom}
          onZoomEnd={onPhotoZoomEnd}
          onReset={onPhotoReset}
          onDone={onPhotoDone}
          onMove={onPhotoMove}
          onCaption={onPhotoCaption}
        />
      ) : null}
      <section className="sb-inspector-major-section">
        <h3 className="sb-inspector-heading">Wallpaper title</h3>
        <div className="sb-inspector-children space-y-3">
          <label className="sb-setting-row">
            <span className="font-medium">Show title</span>
            <Switch
              aria-label="Show title"
              checked={design.wallpaperTitle.visible}
              onChange={(event) => onTitleVisible(event.target.checked)}
            />
          </label>
          {design.wallpaperTitle.visible ? (
            <label>
              <span className="sb-inspector-field-label">Title</span>
              <input
                key={design.wallpaperTitle.text}
                className="sb-control"
                defaultValue={design.wallpaperTitle.text}
                maxLength={100}
                onBlur={(event) => onTitleText(event.target.value)}
              />
            </label>
          ) : null}
        </div>
      </section>
      <section className="sb-inspector-major-section">
        <h3 className="sb-inspector-heading">Days</h3>
        <div className="sb-inspector-children">
          <label className="sb-setting-row">
            <span className="font-medium">Hide days without classes</span>
            <Switch
              aria-label="Hide days without classes"
              checked={design.dayVisibility === "scheduled-only"}
              onChange={(event) =>
                onDayVisibility(
                  event.target.checked ? "scheduled-only" : "full-week",
                )
              }
            />
          </label>
        </div>
      </section>
      <section
        className="sb-inspector-major-section"
        role="group"
        aria-label="Class details"
      >
        <h3 className="sb-inspector-heading">Class details</h3>
        <div className="sb-inspector-children">
          <div className="flex min-h-11 items-center justify-between gap-3 px-2 py-2 text-sm">
            <span className="font-medium">Subject code</span>
            <span className="text-xs font-medium text-text-muted">
              Always shown
            </span>
          </div>
          {INSPECTOR_FIELD_ORDER.map((field) => {
            const available = detailCapabilities.fields[field] === "available";
            return available ? (
              <label key={field} className="sb-setting-row">
                <span>{FIELD_LABELS[field]}</span>
                <input
                  className="sb-check"
                  type="checkbox"
                  checked={visibleFields[field]}
                  onChange={(event) => onField(field, event.target.checked)}
                />
              </label>
            ) : (
              <div
                key={field}
                aria-disabled="true"
                aria-label={`${FIELD_LABELS[field]}. Available on larger Grid devices.`}
                className="flex min-h-11 items-center justify-between gap-3 px-2 py-2 text-sm"
              >
                <span className="font-medium">{FIELD_LABELS[field]}</span>
                <span className="max-w-36 text-right text-xs leading-4 text-text-muted">
                  Larger Grid devices only
                </span>
              </div>
            );
          })}
        </div>
      </section>
      {activeLayout === "cards" || activeLayout === "grid" ? (
        <div className="sb-inspector-major-section">
          <p className="sb-inspector-heading">Subject palette</p>
          <div
            aria-label={`${activeTheme?.name ?? "Clean Slate"} subject palette`}
            className="sb-inspector-children flex gap-2"
          >
            {subjectPalette.map((color) => (
              <span
                key={color}
                className="size-7 rounded-sm border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function DeviceStudioPanel({
  targetLabel,
  variant,
  onChangeTarget,
  onPosition,
  onPositionStart,
  onPositionEnd,
  onReset,
  onSnapping,
  onPreviewMode,
  onSafeAreas,
  onWarnings,
  onOrientation,
  guideOpacity,
  onGuideOpacity,
  onRemoveGuide,
  targetTriggerRef,
}: {
  targetLabel: string;
  variant: DeviceVariant;
  onChangeTarget(): void;
  onPosition(position: { x: number; y: number }): void;
  onPositionStart(): void;
  onPositionEnd(): void;
  onReset(): void;
  onSnapping(enabled: boolean): void;
  onPreviewMode(mode: DeviceVariant["preview"]["mode"]): void;
  onSafeAreas(enabled: boolean): void;
  onWarnings(enabled: boolean): void;
  onOrientation(): void;
  guideOpacity: number;
  onGuideOpacity(value: number): void;
  onRemoveGuide(): void;
  targetTriggerRef?: RefObject<HTMLButtonElement | null>;
}) {
  const previewOptions =
    variant.category === "phone"
      ? ([
          ["clean", "Wallpaper"],
          ["lock-screen", "Lock screen"],
          ["home-screen", "Home screen"],
        ] as const)
      : variant.category === "tablet"
        ? ([
            ["clean", "Wallpaper"],
            ["tablet-interface", "Lock / home"],
          ] as const)
        : variant.category === "square"
          ? ([["clean", "Wallpaper"]] as const)
          : ([
              ["clean", "Wallpaper"],
              ["windows-desktop", "Windows"],
              ["macos-desktop", "macOS"],
            ] as const);
  const canSwitchOrientation = supportsOrientationSwitch(variant.category);
  return (
    <section aria-labelledby="studio-device-heading">
      <div className="pb-3">
        <h2 id="studio-device-heading" className="sb-section-title">
          Device
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose a device. ScheduleBud remembers its position.
        </p>
      </div>
      <section className="sb-inspector-major-section">
        <h3 className="sb-inspector-heading">Current device</h3>
        <div className="sb-inspector-children">
          <p className="font-semibold">{targetLabel}</p>
          <p className="mt-1 font-mono text-xs text-text-muted">
            {variant.dimensions.width} × {variant.dimensions.height} ·{" "}
            {variant.orientation}
          </p>
          <div className="mt-3 flex flex-nowrap gap-2">
            <Button
              ref={targetTriggerRef}
              type="button"
              size="sm"
              variant="outline"
              onClick={onChangeTarget}
            >
              Change device
            </Button>
            {canSwitchOrientation ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onOrientation}
              >
                Switch orientation
              </Button>
            ) : null}
          </div>
        </div>
      </section>
      <section className="sb-inspector-major-section">
        <h3 className="sb-inspector-heading">Preview</h3>
        <div className="sb-inspector-children">
          <div className="flex flex-wrap gap-2">
            {previewOptions.map(([mode, label]) => (
              <Button
                key={mode}
                size="sm"
                variant={variant.preview.mode === mode ? "default" : "outline"}
                onClick={() => onPreviewMode(mode)}
              >
                {label}
              </Button>
            ))}
            {variant.preview.guideAssetId ? (
              <Button
                size="sm"
                variant={
                  variant.preview.mode === "uploaded-guide"
                    ? "default"
                    : "outline"
                }
                onClick={() => onPreviewMode("uploaded-guide")}
              >
                My screen
              </Button>
            ) : null}
          </div>
          {variant.preview.mode === "uploaded-guide" ? (
            <label className="mt-3 block text-xs font-semibold text-text-secondary">
              Guide opacity
              <input
                aria-label="Guide opacity"
                className="mt-1 w-full accent-[var(--brand)]"
                type="range"
                min="15"
                max="65"
                value={Math.round(guideOpacity * 100)}
                onChange={(event) =>
                  onGuideOpacity(Number(event.target.value) / 100)
                }
              />
            </label>
          ) : null}
        </div>
      </section>
      <section className="sb-inspector-major-section">
        <h3 className="sb-inspector-heading">Guides</h3>
        <div className="sb-inspector-children">
          <div className="space-y-0.5">
            {(
              [
                ["Show safe areas", variant.preview.showSafeAreas, onSafeAreas],
                [
                  "Warn about overlap",
                  variant.preview.showWarnings,
                  onWarnings,
                ],
                ["Snap to guides", variant.preview.enableSnapping, onSnapping],
              ] as const
            ).map(([label, checked, change]) => (
              <label key={label} className="sb-setting-row">
                <span className="font-medium">{label}</span>
                <Switch
                  aria-label={label}
                  checked={checked}
                  onChange={(event) => change(event.target.checked)}
                />
              </label>
            ))}
          </div>
          {variant.preview.guideAssetId ? (
            <Button
              className="mt-3"
              size="sm"
              variant="ghost"
              onClick={onRemoveGuide}
            >
              Remove screen guide
            </Button>
          ) : null}
        </div>
      </section>
      <section className="sb-inspector-major-section">
        <h3 className="sb-inspector-heading">Schedule position</h3>
        <div className="sb-inspector-children space-y-4">
          {(["x", "y"] as const).map((axis) => (
            <label key={axis} className="block">
              <span className="mb-1 flex justify-between text-xs font-semibold text-text-secondary">
                <span>{axis === "x" ? "Horizontal" : "Vertical"}</span>
                <span className="font-mono">
                  {Math.round(variant.schedulePosition[axis] * 100)}%
                </span>
              </span>
              <input
                aria-label={`${axis === "x" ? "Horizontal" : "Vertical"} schedule position`}
                className="w-full accent-[var(--brand)]"
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(variant.schedulePosition[axis] * 100)}
                onPointerDown={onPositionStart}
                onPointerUp={onPositionEnd}
                onChange={(event) =>
                  onPosition({
                    ...variant.schedulePosition,
                    [axis]: Number(event.target.value) / 100,
                  })
                }
              />
            </label>
          ))}
          <Button type="button" variant="outline" onClick={onReset}>
            Reset to balanced
          </Button>
        </div>
      </section>
    </section>
  );
}
