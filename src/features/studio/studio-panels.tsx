"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  ArrowRight as DirectionArrow,
  Check,
  ChevronDown,
  Copy,
  Layers,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  emojiById,
  emojiCatalog,
  emojiCategories,
  type EmojiCategoryId,
} from "@/data/emojis/catalog";
import { normalizeEmojiSearch, searchEmojiCatalog } from "@/data/emojis/search";
import { availableLayouts } from "@/data/layouts/registry";
import {
  resolveLayoutStyleId,
  stylesForLayout,
} from "@/data/layout-styles/registry";
import { availableThemes } from "@/data/themes/registry";
import {
  resolveTypographyPreset,
  typographyPresets,
  type TypographyPresetId,
} from "@/data/typography/registry";
import {
  stickerById,
  stickerCatalog,
  stickerCategories,
} from "@/data/stickers/catalog";
import type { LayoutId, LayoutStyleId, ThemeId } from "@/domain/design/types";
import type { AvailablePhotoComposition } from "@/domain/render/photo-crop";
import {
  createCustomPalette,
  resolveWallpaperTheme,
} from "@/domain/render/themes/registry";
import {
  supportsOrientationSwitch,
  type DeviceVariant,
  type VisibleFields,
} from "@/domain/device/types";
import type {
  BackgroundDesign,
  BackgroundPattern,
  CustomPalette,
  CustomPaletteColorRole,
  ProjectDesign,
} from "@/domain/project";
import type { StickerInstance, StickerLayer } from "@/domain/stickers/types";
import {
  createDefaultBackgroundPattern,
  type LayoutDetailCapabilities,
} from "@/domain/render";
import { StoreSubjectList } from "@/features/classes/class-editor";
import { fontRegistry } from "@/lib/font-registry";

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
  const normalizedQuery = normalizeEmojiSearch(query);
  const filtered = useMemo(() => {
    if (category === "Emojis" && normalizedQuery) {
      return searchEmojiCatalog(normalizedQuery).flatMap(({ emoji }) => {
        const sticker = stickerById.get(emoji.id);
        return sticker ? [sticker] : [];
      });
    }
    return stickerCatalog.filter(
      (item) =>
        item.category === category &&
        (category !== "Emojis" || item.subcategory === emojiCategory) &&
        (!normalizedQuery ||
          normalizeEmojiSearch(
            [item.label, item.category, ...(item.keywords ?? [])].join(" "),
          ).includes(normalizedQuery)),
    );
  }, [category, emojiCategory, normalizedQuery]);
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
                placeholder="Search names, keywords, or ideas"
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
            {category === "Emojis" && normalizedQuery ? (
              <p className="mt-2 text-xs text-text-muted" role="status">
                Searching all emoji categories and metadata
              </p>
            ) : category === "Emojis" ? (
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

function StyleInspectorSection({
  design,
  layout,
  composition,
  onStyle,
}: {
  design: ProjectDesign;
  layout: LayoutId;
  composition?: AvailablePhotoComposition;
  onStyle?: ((styleId: LayoutStyleId) => void) | undefined;
}) {
  const styles = stylesForLayout(layout, composition);
  if (styles.length <= 1) return null;
  const activeStyle = resolveLayoutStyleId(
    layout,
    design.layoutStyles,
    composition,
  );
  return (
    <section className="sb-inspector-major-section">
      <h3 className="sb-inspector-heading">Style</h3>
      <div
        role="radiogroup"
        aria-label={`${layout} layout style`}
        className="sb-inspector-children grid grid-cols-2 rounded-sm border border-border bg-muted/40 p-1"
      >
        {styles.map((style) => (
          <button
            key={style.id}
            type="button"
            role="radio"
            aria-checked={activeStyle === style.id}
            title={style.description}
            className={`min-h-10 min-w-0 cursor-pointer rounded-sm px-2 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30 motion-reduce:transition-none ${activeStyle === style.id ? "bg-surface-elevated text-brand ring-1 ring-inset ring-brand/20" : "text-text-secondary hover:bg-surface hover:text-foreground active:bg-muted"}`}
            onClick={() => onStyle?.(style.id)}
          >
            {style.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function TypographyInspectorSection({
  value,
  onChange,
}: {
  value: TypographyPresetId;
  onChange?(value: TypographyPresetId): void;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const selected = resolveTypographyPreset(value);
  return (
    <section className="sb-inspector-major-section">
      <h3 className="sb-inspector-heading">Typography</h3>
      <details
        ref={detailsRef}
        className="sb-inspector-children group relative"
      >
        <summary className="sb-control flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
          <span>{selected.label}</span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-180"
          />
        </summary>
        <div
          role="radiogroup"
          aria-label="Wallpaper typography"
          className="z-20 mt-2 max-h-96 overflow-y-auto rounded-md border border-border bg-surface-elevated p-1 shadow-lg sm:absolute sm:left-0 sm:right-0"
        >
          {typographyPresets.map((preset) => {
            const title = fontRegistry[preset.titleFont];
            const schedule = fontRegistry[preset.scheduleFont];
            const checked = preset.id === value;
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={checked}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-sm px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30 ${checked ? "bg-brand/8 text-brand" : "hover:bg-muted"}`}
                onClick={() => {
                  onChange?.(preset.id);
                  detailsRef.current?.removeAttribute("open");
                }}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {preset.label}
                  </span>
                  <span className="block text-xs text-text-muted">
                    {preset.description}
                  </span>
                  <span
                    className="mt-1 flex items-baseline gap-2 overflow-hidden whitespace-nowrap"
                    aria-hidden="true"
                  >
                    <span
                      style={{
                        fontFamily: `var(${title.cssVariable})`,
                        fontWeight: preset.titleWeight,
                      }}
                      className="text-base"
                    >
                      Weekly
                    </span>
                    <span
                      style={{ fontFamily: `var(${schedule.cssVariable})` }}
                      className="truncate text-xs"
                    >
                      CS.412 · 8:00 AM
                    </span>
                  </span>
                  {preset.baseline ? (
                    <span className="block text-[11px] text-text-muted">
                      Nunito Sans title · Geist schedule
                    </span>
                  ) : null}
                </span>
                <Check
                  aria-hidden="true"
                  className={`size-4 shrink-0 ${checked ? "opacity-100" : "opacity-0"}`}
                />
              </button>
            );
          })}
        </div>
      </details>
    </section>
  );
}

const CUSTOM_PALETTE_ROLES = [
  ["canvas", "Canvas"],
  ["primary", "Primary"],
  ["secondary", "Secondary"],
  ["accent", "Accent"],
  ["surface", "Surface"],
  ["border", "Border"],
] as const satisfies readonly [CustomPaletteColorRole, string][];
const OPAQUE_HEX_PATTERN = /^#[0-9A-F]{6}$/;
const PICKER_PREVIEW_INTERVAL_MS = 50;

function ColorInputRow({
  id,
  label,
  value,
  onColor,
  onPickerPreview,
  onPickerStart,
  onPickerEnd,
}: {
  id: string;
  label: string;
  value: string;
  onColor?(color: string): void;
  onPickerPreview?(color: string): void;
  onPickerStart?(): void;
  onPickerEnd?(color: string | null): void;
}) {
  const pickerInput = useRef<HTMLInputElement>(null);
  const picking = useRef(false);
  const pendingPickerColor = useRef<string | null>(null);
  const latestPickerColor = useRef<string | null>(null);
  const pickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!picking.current && pickerInput.current)
      pickerInput.current.value = value;
  }, [value]);
  useEffect(
    () => () => {
      if (pickerTimer.current !== null) clearTimeout(pickerTimer.current);
    },
    [],
  );
  const flushPickerColor = (browserColor?: string) => {
    if (pickerTimer.current !== null) {
      clearTimeout(pickerTimer.current);
      pickerTimer.current = null;
    }
    const color =
      latestPickerColor.current === null
        ? null
        : (browserColor ?? latestPickerColor.current);
    pendingPickerColor.current = null;
    latestPickerColor.current = null;
    return color;
  };
  return (
    <div className="grid grid-cols-[minmax(5rem,1fr)_2rem_6.8rem] items-center gap-2">
      <label className="text-xs font-medium" htmlFor={`${id}-hex`}>
        {label}
      </label>
      <input
        aria-label={`${label} color picker`}
        className="size-8 cursor-pointer rounded-sm border border-border bg-transparent p-0.5"
        defaultValue={value}
        ref={pickerInput}
        type="color"
        onFocus={() => {
          picking.current = true;
          onPickerStart?.();
        }}
        onInput={(event) => {
          pendingPickerColor.current = event.currentTarget.value;
          latestPickerColor.current = event.currentTarget.value;
          if (pickerTimer.current !== null) return;
          pickerTimer.current = setTimeout(() => {
            pickerTimer.current = null;
            const color = pendingPickerColor.current;
            pendingPickerColor.current = null;
            if (color !== null) onPickerPreview?.(color);
          }, PICKER_PREVIEW_INTERVAL_MS);
        }}
        onBlur={(event) => {
          const color = flushPickerColor(event.currentTarget.value);
          picking.current = false;
          if (color !== null) onPickerPreview?.(color);
          onPickerEnd?.(color);
        }}
      />
      <input
        key={`${id}-${value}`}
        id={`${id}-hex`}
        aria-label={`${label} HEX`}
        aria-invalid="false"
        className="sb-control min-h-9 px-2 py-1 font-mono text-xs uppercase"
        defaultValue={value}
        inputMode="text"
        maxLength={7}
        spellCheck={false}
        onChange={(event) => {
          const next = event.target.value.toUpperCase();
          event.target.value = next;
          const valid = OPAQUE_HEX_PATTERN.test(next);
          event.currentTarget.setAttribute("aria-invalid", String(!valid));
          if (valid) onColor?.(next);
        }}
        onBlur={(event) => {
          if (!OPAQUE_HEX_PATTERN.test(event.currentTarget.value)) {
            event.currentTarget.value = value;
            event.currentTarget.setAttribute("aria-invalid", "false");
          }
        }}
      />
    </div>
  );
}

function ColorPaletteInspectorSection({
  design,
  onTheme,
  onColor,
  onPickerPreview,
  onPickerStart,
  onPickerEnd,
  onReset,
}: {
  design: ProjectDesign;
  onTheme?(value: ThemeId): void;
  onColor?(role: CustomPaletteColorRole, color: string): void;
  onPickerPreview?(role: CustomPaletteColorRole, color: string): void;
  onPickerStart?(): void;
  onPickerEnd?(role: CustomPaletteColorRole, color: string | null): void;
  onReset?(): void;
}) {
  const baseId =
    design.themeId === "custom"
      ? (design.customPalette?.basedOnPaletteId ?? "clean-slate")
      : design.themeId;
  const baseTheme = availableThemes.find((theme) => theme.id === baseId)!;
  const editablePalette: CustomPalette =
    design.themeId === "custom" && design.customPalette
      ? design.customPalette
      : createCustomPalette(baseId);
  const customPreview = design.customPalette;
  return (
    <section className="sb-inspector-major-section">
      <h3 className="sb-inspector-heading">Color Palette</h3>
      <div
        role="radiogroup"
        aria-label="Color palette"
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
        <button
          type="button"
          role="radio"
          aria-checked={design.themeId === "custom"}
          className={`min-h-12 min-w-0 cursor-pointer rounded-sm px-2 py-1.5 text-left text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30 motion-reduce:transition-none ${design.themeId === "custom" ? "bg-surface-elevated text-brand ring-1 ring-inset ring-brand/20" : "text-text-secondary hover:bg-surface hover:text-foreground active:bg-muted"}`}
          onClick={() => onTheme?.("custom")}
        >
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex size-5 shrink-0 overflow-hidden rounded-full border border-border bg-muted"
            >
              {customPreview ? (
                <>
                  <span
                    className="h-full flex-1"
                    style={{ backgroundColor: customPreview.primary }}
                  />
                  <span
                    className="h-full flex-1"
                    style={{ backgroundColor: customPreview.accent }}
                  />
                </>
              ) : null}
            </span>
            <span>Custom</span>
          </span>
        </button>
      </div>
      <div className="sb-inspector-children mt-2 text-xs leading-5 text-text-muted">
        {design.themeId === "custom" ? (
          <>
            <p className="font-semibold text-foreground">Custom</p>
            <p>Based on {baseTheme.name}</p>
          </>
        ) : (
          <p>{baseTheme.description}</p>
        )}
      </div>
      <details className="sb-inspector-children group mt-3">
        <summary className="sb-control flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
          <span>Customize palette</span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="mt-2 space-y-2 rounded-sm border border-border bg-muted/25 p-2">
          {CUSTOM_PALETTE_ROLES.map(([role, label]) => (
            <ColorInputRow
              key={role}
              id={`palette-${role}`}
              label={label}
              value={editablePalette[role]}
              {...(onColor
                ? { onColor: (color: string) => onColor(role, color) }
                : {})}
              {...(onPickerPreview
                ? {
                    onPickerPreview: (color: string) =>
                      onPickerPreview(role, color),
                  }
                : {})}
              {...(onPickerStart ? { onPickerStart } : {})}
              {...(onPickerEnd
                ? {
                    onPickerEnd: (color: string | null) =>
                      onPickerEnd(role, color),
                  }
                : {})}
            />
          ))}
          {design.themeId === "custom" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 w-full"
              onClick={onReset}
            >
              Reset to {baseTheme.name}
            </Button>
          ) : null}
        </div>
      </details>
    </section>
  );
}

const BACKGROUND_MODE_LABELS = {
  palette: "Palette",
  solid: "Solid",
  gradient: "Gradient",
  pattern: "Pattern",
  image: "Image",
} as const;
const PATTERN_LABELS = {
  dots: "Dots",
  grid: "Grid",
  checker: "Checker",
  diagonal: "Diagonal",
  emoji: "Emoji",
} as const;
const GRADIENT_DIRECTIONS = [
  [0, "To right", "Left to right"],
  [45, "To bottom-right", "Top left to bottom right"],
  [90, "To bottom", "Top to bottom"],
  [135, "To bottom-left", "Top right to bottom left"],
  [180, "To left", "Right to left"],
  [225, "To top-left", "Bottom right to top left"],
  [270, "To top", "Bottom to top"],
  [315, "To top-right", "Bottom left to top right"],
] as const;

const GRADIENT_DIRECTION_POSITIONS = {
  0: { gridColumn: 3, gridRow: 2 },
  45: { gridColumn: 3, gridRow: 3 },
  90: { gridColumn: 2, gridRow: 3 },
  135: { gridColumn: 1, gridRow: 3 },
  180: { gridColumn: 1, gridRow: 2 },
  225: { gridColumn: 1, gridRow: 1 },
  270: { gridColumn: 2, gridRow: 1 },
  315: { gridColumn: 3, gridRow: 1 },
} as const;

function GradientDirectionControl({
  gradient,
  onChange,
}: {
  gradient: NonNullable<BackgroundDesign["gradient"]>;
  onChange(
    direction: NonNullable<BackgroundDesign["gradient"]>["direction"],
  ): void;
}) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = GRADIENT_DIRECTIONS.findIndex(
    ([angle]) => angle === gradient.direction,
  );
  const selected = GRADIENT_DIRECTIONS[selectedIndex]!;
  const selectIndex = (index: number) => {
    const wrapped =
      (index + GRADIENT_DIRECTIONS.length) % GRADIENT_DIRECTIONS.length;
    const direction = GRADIENT_DIRECTIONS[wrapped]![0];
    onChange(direction);
    buttonRefs.current[wrapped]?.focus();
  };
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/25 p-2.5">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">Direction</p>
        <p className="mt-0.5 max-w-28 text-[11px] leading-4 text-text-muted">
          {selected[1]}
        </p>
      </div>
      <div
        className="grid shrink-0 grid-cols-[repeat(3,2rem)] grid-rows-[repeat(3,2rem)] gap-1"
        role="radiogroup"
        aria-label="Gradient direction"
      >
        <span
          aria-hidden="true"
          className="m-1 rounded-full border border-white/80 shadow-sm ring-1 ring-border"
          style={{
            gridColumn: 2,
            gridRow: 2,
            background: `linear-gradient(${gradient.direction + 90}deg, ${gradient.color1}, ${gradient.color2})`,
          }}
        />
        {GRADIENT_DIRECTIONS.map(([angle, , label], index) => {
          const checked = gradient.direction === angle;
          return (
            <button
              key={angle}
              ref={(button) => {
                buttonRefs.current[index] = button;
              }}
              type="button"
              role="radio"
              aria-label={label}
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              title={label}
              style={GRADIENT_DIRECTION_POSITIONS[angle]}
              className={`flex size-8 items-center justify-center rounded-md border text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-1 active:scale-95 motion-reduce:transition-none ${checked ? "border-brand/40 bg-accent text-brand shadow-sm ring-1 ring-brand/10" : "border-border bg-surface-elevated text-text-secondary hover:border-brand/35 hover:bg-accent hover:text-brand"}`}
              onKeyDown={(event) => {
                const nextIndex =
                  event.key === "ArrowRight" || event.key === "ArrowDown"
                    ? selectedIndex + 1
                    : event.key === "ArrowLeft" || event.key === "ArrowUp"
                      ? selectedIndex - 1
                      : event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? GRADIENT_DIRECTIONS.length - 1
                          : null;
                if (nextIndex === null) return;
                event.preventDefault();
                selectIndex(nextIndex);
              }}
              onClick={() => onChange(angle)}
            >
              <DirectionArrow
                aria-hidden="true"
                className="size-[1.125rem]"
                strokeWidth={2.15}
                style={{ transform: `rotate(${angle}deg)` }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RangeRow({
  label,
  value,
  min,
  max,
  step,
  formatValue,
  onStart,
  onValue,
  onEnd,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  formatValue?(value: number): string;
  onStart?(): void;
  onValue(value: number): void;
  onEnd?(): void;
}) {
  return (
    <label className="grid grid-cols-[5.5rem_1fr_3.2rem] items-center gap-2 text-xs">
      <span className="font-medium">{label}</span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={onStart}
        onKeyDown={(event) => {
          if (!event.repeat) onStart?.();
        }}
        onInput={(event) => onValue(Number(event.currentTarget.value))}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
        onKeyUp={onEnd}
      />
      <output className="text-right font-mono text-[11px] text-text-muted">
        {formatValue
          ? formatValue(value)
          : Math.round(value * (max <= 1 ? 100 : 1))}
      </output>
    </label>
  );
}

function PatternChoicePreview({
  type,
  pattern,
  theme,
}: {
  type: BackgroundPattern["type"];
  pattern: BackgroundPattern;
  theme: ReturnType<typeof resolveWallpaperTheme>;
}) {
  const preview =
    pattern.type === type
      ? pattern
      : createDefaultBackgroundPattern(type, theme);
  const common = { backgroundColor: preview.backgroundColor };
  if (preview.type === "emoji") {
    const emoji = emojiById.get(preview.emojiId) ?? emojiCatalog[0]!;
    return (
      <span
        aria-hidden="true"
        data-testid={`pattern-preview-${type}`}
        className="flex h-6 w-full items-center justify-around overflow-hidden rounded-[3px] border border-black/10"
        style={common}
      >
        {[0, 1, 2].map((index) => (
          <Image
            key={index}
            unoptimized
            src={emoji.src}
            alt=""
            width={14}
            height={14}
            className={index === 1 ? "-translate-y-1" : "translate-y-1"}
          />
        ))}
      </span>
    );
  }
  const color = preview.color;
  const backgroundImage =
    preview.type === "dots"
      ? `radial-gradient(circle, ${color} 1.5px, transparent 1.7px)`
      : preview.type === "grid"
        ? `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`
        : preview.type === "checker"
          ? `conic-gradient(${color} 25%, transparent 0 50%, ${color} 0 75%, transparent 0)`
          : `repeating-linear-gradient(135deg, transparent 0 5px, ${color} 5px 7px, transparent 7px 12px)`;
  const backgroundSize =
    preview.type === "dots"
      ? "8px 8px"
      : preview.type === "grid"
        ? "9px 9px"
        : preview.type === "checker"
          ? "10px 10px"
          : undefined;
  return (
    <span
      aria-hidden="true"
      data-testid={`pattern-preview-${type}`}
      className="block h-6 w-full rounded-[3px] border border-black/10"
      style={{ ...common, backgroundImage, backgroundSize }}
    />
  );
}

function BackgroundEmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange(emojiId: string): void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EmojiCategoryId>(
    emojiCategories[0]?.id ?? "",
  );
  const normalized = normalizeEmojiSearch(query);
  const visible = useMemo(
    () =>
      (normalized
        ? searchEmojiCatalog(normalized).map(({ emoji }) => emoji)
        : emojiCatalog.filter((emoji) => emoji.category === category)
      ).slice(0, 60),
    [category, normalized],
  );
  const selected = emojiById.get(value) ?? emojiCatalog[0]!;
  return (
    <div>
      <button
        type="button"
        className="sb-control flex items-center justify-between gap-3 text-left text-xs font-semibold"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Image unoptimized src={selected.src} alt="" width={28} height={28} />
          <span className="truncate">{selected.label}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="mt-2 rounded-sm border border-border bg-muted/25 p-2">
          <label className="relative block">
            <Search
              aria-hidden="true"
              className="absolute top-2.5 left-2.5 size-4 text-text-muted"
            />
            <span className="sr-only">Search emojis</span>
            <input
              className="sb-control pl-8"
              value={query}
              placeholder="Search emojis"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {!normalized ? (
            <div
              className="mt-2 flex flex-wrap gap-1"
              role="tablist"
              aria-label="Emoji category"
            >
              {emojiCategories.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={category === item.id ? "secondary" : "ghost"}
                  role="tab"
                  aria-selected={category === item.id}
                  onClick={() => setCategory(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          ) : null}
          <div className="mt-2 grid grid-cols-6 gap-1">
            {visible.map((emoji) => (
              <button
                key={emoji.id}
                type="button"
                aria-label={emoji.label}
                aria-pressed={emoji.id === selected.id}
                title={emoji.label}
                className={`flex aspect-square items-center justify-center rounded-sm border p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${emoji.id === selected.id ? "border-brand bg-accent" : "border-transparent hover:bg-muted"}`}
                onClick={() => {
                  onChange(emoji.id);
                  setOpen(false);
                }}
              >
                <Image
                  unoptimized
                  src={emoji.src}
                  alt=""
                  width={28}
                  height={28}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BackgroundInspectorSection({
  design,
  activeLayout,
  imageFilename,
  imageAdjusting,
  imageZoom,
  onMode,
  onBackground,
  onImageFile,
  onImageAdjust,
  onImageRemove,
  onImageZoom,
  onImageCenter,
  onImageReset,
  onImageDone,
  onGestureStart,
  onGestureEnd,
}: {
  design: ProjectDesign;
  activeLayout: LayoutId;
  imageFilename?: string | undefined;
  imageAdjusting: boolean;
  imageZoom: number;
  onMode(mode: BackgroundDesign["mode"]): void;
  onBackground(background: BackgroundDesign): void;
  onImageFile(file: File): Promise<void>;
  onImageAdjust(): void;
  onImageRemove(): void;
  onImageZoom(scale: number): void;
  onImageCenter(): void;
  onImageReset(): void;
  onImageDone(): void;
  onGestureStart(): void;
  onGestureEnd(): void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const background = design.background;
  const theme = resolveWallpaperTheme(
    design.themeId,
    activeLayout,
    design.customPalette,
  );
  const update = (patch: Partial<BackgroundDesign>) =>
    onBackground({ ...background, ...patch });
  const colorProps = {
    onPickerStart: onGestureStart,
    onPickerEnd: (color: string | null) => {
      if (color) onGestureEnd();
      else onGestureEnd();
    },
  };
  const chooseFile = async (file: File) => {
    setFileError(null);
    try {
      await onImageFile(file);
    } catch (error) {
      setFileError(
        error instanceof Error ? error.message : "Could not use this image.",
      );
    }
  };
  const resetActiveMode = () => {
    if (background.mode === "solid")
      onBackground({ ...background, solid: { color: theme.background } });
    else if (background.mode === "gradient")
      onBackground({
        ...background,
        gradient: {
          color1: theme.background,
          color2: theme.surface,
          direction: 135,
        },
      });
    else if (background.mode === "pattern")
      onBackground({
        ...background,
        pattern: createDefaultBackgroundPattern(
          background.pattern?.type ?? "dots",
          theme,
        ),
      });
    else if (background.mode === "image" && background.image) {
      onBackground({
        ...background,
        image: {
          ...background.image,
          overlay: "none",
          overlayIntensity: 0,
        },
      });
      onImageReset();
    }
  };
  return (
    <section className="sb-inspector-major-section">
      <h3 className="sb-inspector-heading">Background</h3>
      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label="Choose background image"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void chooseFile(file);
          event.currentTarget.value = "";
        }}
      />
      <div
        role="radiogroup"
        aria-label="Background mode"
        className="sb-inspector-children grid grid-cols-5 rounded-sm border border-border bg-muted/40 p-1"
      >
        {Object.entries(BACKGROUND_MODE_LABELS).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={background.mode === mode}
            className={`min-h-9 min-w-0 rounded-sm px-1 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30 ${background.mode === mode ? "bg-surface-elevated text-brand ring-1 ring-inset ring-brand/20" : "text-text-secondary hover:bg-surface"}`}
            onClick={() => {
              if (mode === "image" && !background.image)
                fileInput.current?.click();
              else onMode(mode as BackgroundDesign["mode"]);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {background.mode !== "palette" ? (
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label={`Reset ${BACKGROUND_MODE_LABELS[background.mode]} background`}
            onClick={resetActiveMode}
          >
            <RotateCcw aria-hidden="true" />
            Reset
          </Button>
        </div>
      ) : null}
      <div className="sb-inspector-children mt-3 space-y-3">
        {background.mode === "palette" ? (
          <p className="text-xs leading-5 text-text-muted">
            Uses{" "}
            {design.themeId === "custom"
              ? "Custom"
              : (availableThemes.find((item) => item.id === design.themeId)
                  ?.name ?? "current")}{" "}
            canvas
          </p>
        ) : background.mode === "solid" && background.solid ? (
          <ColorInputRow
            id="background-solid"
            label="Solid color"
            value={background.solid.color}
            onColor={(color) =>
              update({ solid: { ...background.solid!, color } })
            }
            onPickerPreview={(color) =>
              update({ solid: { ...background.solid!, color } })
            }
            {...colorProps}
          />
        ) : background.mode === "gradient" && background.gradient ? (
          <>
            {(["color1", "color2"] as const).map((key, index) => (
              <ColorInputRow
                key={key}
                id={`background-gradient-${key}`}
                label={`Color ${index + 1}`}
                value={background.gradient![key]}
                onColor={(color) =>
                  update({
                    gradient: { ...background.gradient!, [key]: color },
                  })
                }
                onPickerPreview={(color) =>
                  update({
                    gradient: { ...background.gradient!, [key]: color },
                  })
                }
                {...colorProps}
              />
            ))}
            <GradientDirectionControl
              gradient={background.gradient}
              onChange={(direction) =>
                update({
                  gradient: { ...background.gradient!, direction },
                })
              }
            />
          </>
        ) : background.mode === "pattern" && background.pattern ? (
          <>
            <div>
              <p className="mb-1 text-xs font-medium">Pattern</p>
              <div className="grid grid-cols-5 gap-1" role="radiogroup">
                {Object.entries(PATTERN_LABELS).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={background.pattern!.type === type}
                    className={`flex min-h-14 min-w-0 flex-col items-center gap-1 rounded-sm border p-1 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${background.pattern!.type === type ? "border-brand bg-accent text-brand" : "border-border hover:bg-muted"}`}
                    onClick={() =>
                      update({
                        pattern: createDefaultBackgroundPattern(
                          type as BackgroundPattern["type"],
                          theme,
                        ),
                      })
                    }
                  >
                    <PatternChoicePreview
                      type={type as BackgroundPattern["type"]}
                      pattern={background.pattern!}
                      theme={theme}
                    />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <ColorInputRow
              id="background-pattern-base"
              label="Background"
              value={background.pattern.backgroundColor}
              onColor={(color) =>
                update({
                  pattern: { ...background.pattern!, backgroundColor: color },
                })
              }
              onPickerPreview={(color) =>
                update({
                  pattern: { ...background.pattern!, backgroundColor: color },
                })
              }
              {...colorProps}
            />
            {background.pattern.type !== "emoji" ? (
              <ColorInputRow
                id="background-pattern-color"
                label={
                  background.pattern.type === "dots"
                    ? "Dot color"
                    : background.pattern.type === "grid"
                      ? "Line color"
                      : background.pattern.type === "diagonal"
                        ? "Stripe color"
                        : "Color 2"
                }
                value={background.pattern.color}
                onColor={(color) =>
                  update({
                    pattern: {
                      ...background.pattern!,
                      color,
                    } as BackgroundPattern,
                  })
                }
                onPickerPreview={(color) =>
                  update({
                    pattern: {
                      ...background.pattern!,
                      color,
                    } as BackgroundPattern,
                  })
                }
                {...colorProps}
              />
            ) : (
              <BackgroundEmojiPicker
                value={background.pattern.emojiId}
                onChange={(emojiId) =>
                  update({
                    pattern: {
                      ...background.pattern!,
                      emojiId,
                    } as BackgroundPattern,
                  })
                }
              />
            )}
            {background.pattern.type === "dots" ? (
              <>
                <RangeRow
                  label="Dot size"
                  value={background.pattern.size}
                  min={0.003}
                  max={0.04}
                  step={0.001}
                  onStart={onGestureStart}
                  onValue={(size) =>
                    update({
                      pattern: {
                        ...background.pattern!,
                        size,
                      } as BackgroundPattern,
                    })
                  }
                  onEnd={onGestureEnd}
                />
                <RangeRow
                  label="Spacing"
                  value={background.pattern.spacing}
                  min={0.02}
                  max={0.12}
                  step={0.002}
                  onStart={onGestureStart}
                  onValue={(spacing) =>
                    update({
                      pattern: {
                        ...background.pattern!,
                        spacing,
                      } as BackgroundPattern,
                    })
                  }
                  onEnd={onGestureEnd}
                />
                <label className="sb-setting-row">
                  <span>Offset rows</span>
                  <Switch
                    aria-label="Offset dot rows"
                    checked={background.pattern.offset}
                    onChange={(event) =>
                      update({
                        pattern: {
                          ...background.pattern!,
                          offset: event.target.checked,
                        } as BackgroundPattern,
                      })
                    }
                  />
                </label>
              </>
            ) : background.pattern.type === "grid" ? (
              <>
                <RangeRow
                  label="Spacing"
                  value={background.pattern.spacing}
                  min={0.02}
                  max={0.12}
                  step={0.002}
                  onStart={onGestureStart}
                  onValue={(spacing) =>
                    update({
                      pattern: {
                        ...background.pattern!,
                        spacing,
                      } as BackgroundPattern,
                    })
                  }
                  onEnd={onGestureEnd}
                />
                <RangeRow
                  label="Line weight"
                  value={background.pattern.lineWeight}
                  min={0.0005}
                  max={0.008}
                  step={0.0005}
                  onStart={onGestureStart}
                  onValue={(lineWeight) =>
                    update({
                      pattern: {
                        ...background.pattern!,
                        lineWeight,
                      } as BackgroundPattern,
                    })
                  }
                  onEnd={onGestureEnd}
                />
              </>
            ) : background.pattern.type === "checker" ? (
              <RangeRow
                label="Cell size"
                value={background.pattern.cellSize}
                min={0.015}
                max={0.12}
                step={0.0025}
                onStart={onGestureStart}
                onValue={(cellSize) =>
                  update({
                    pattern: {
                      ...background.pattern!,
                      cellSize,
                    } as BackgroundPattern,
                  })
                }
                onEnd={onGestureEnd}
              />
            ) : background.pattern.type === "diagonal" ? (
              <>
                <RangeRow
                  label="Stripe width"
                  value={background.pattern.stripeWidth}
                  min={0.002}
                  max={0.04}
                  step={0.001}
                  onStart={onGestureStart}
                  onValue={(stripeWidth) =>
                    update({
                      pattern: {
                        ...background.pattern!,
                        stripeWidth,
                      } as BackgroundPattern,
                    })
                  }
                  onEnd={onGestureEnd}
                />
                <RangeRow
                  label="Spacing"
                  value={background.pattern.spacing}
                  min={0.02}
                  max={0.14}
                  step={0.002}
                  onStart={onGestureStart}
                  onValue={(spacing) =>
                    update({
                      pattern: {
                        ...background.pattern!,
                        spacing,
                      } as BackgroundPattern,
                    })
                  }
                  onEnd={onGestureEnd}
                />
                <div
                  className="grid grid-cols-2 gap-1"
                  role="radiogroup"
                  aria-label="Stripe direction"
                >
                  {([45, 135] as const).map((angle) => (
                    <button
                      key={angle}
                      type="button"
                      role="radio"
                      aria-checked={
                        background.pattern!.type === "diagonal" &&
                        background.pattern!.angle === angle
                      }
                      className="sb-control min-h-9 text-xs"
                      onClick={() =>
                        update({
                          pattern: {
                            ...background.pattern!,
                            angle,
                          } as BackgroundPattern,
                        })
                      }
                    >
                      {angle === 45 ? "↗ Rising" : "↘ Falling"}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <RangeRow
                  label="Size"
                  value={background.pattern.size}
                  min={0.025}
                  max={0.12}
                  step={0.0025}
                  onStart={onGestureStart}
                  onValue={(size) =>
                    update({
                      pattern: {
                        ...background.pattern!,
                        size,
                      } as BackgroundPattern,
                    })
                  }
                  onEnd={onGestureEnd}
                />
                <RangeRow
                  label="Spacing"
                  value={background.pattern.spacing}
                  min={0.055}
                  max={0.2}
                  step={0.005}
                  onStart={onGestureStart}
                  onValue={(spacing) =>
                    update({
                      pattern: {
                        ...background.pattern!,
                        spacing,
                      } as BackgroundPattern,
                    })
                  }
                  onEnd={onGestureEnd}
                />
                <RangeRow
                  label="Rotation"
                  value={background.pattern.rotation}
                  min={-180}
                  max={180}
                  step={5}
                  onStart={onGestureStart}
                  onValue={(rotation) =>
                    update({
                      pattern: {
                        ...background.pattern!,
                        rotation,
                      } as BackgroundPattern,
                    })
                  }
                  onEnd={onGestureEnd}
                />
                <div
                  className="grid grid-cols-2 gap-1"
                  role="radiogroup"
                  aria-label="Emoji layout"
                >
                  {(["grid", "offset"] as const).map((layout) => (
                    <button
                      key={layout}
                      type="button"
                      role="radio"
                      aria-checked={
                        background.pattern!.type === "emoji" &&
                        background.pattern!.layout === layout
                      }
                      className="sb-control min-h-9 text-xs capitalize"
                      onClick={() =>
                        update({
                          pattern: {
                            ...background.pattern!,
                            layout,
                          } as BackgroundPattern,
                        })
                      }
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </>
            )}
            <RangeRow
              label="Opacity"
              value={background.pattern.opacity}
              min={0.05}
              max={1}
              step={0.05}
              onStart={onGestureStart}
              onValue={(opacity) =>
                update({
                  pattern: {
                    ...background.pattern!,
                    opacity,
                  } as BackgroundPattern,
                })
              }
              onEnd={onGestureEnd}
            />
          </>
        ) : background.mode === "image" && background.image ? (
          <>
            <div className="rounded-sm border border-border bg-muted/25 p-2">
              <p className="truncate text-xs font-semibold">
                {imageFilename ?? "Loading image…"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInput.current?.click()}
                >
                  Change image
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onImageAdjust}
                >
                  Adjust background
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={onImageRemove}
                >
                  Remove image
                </Button>
              </div>
            </div>
            {imageAdjusting ? (
              <div className="space-y-2 rounded-sm border border-brand/25 bg-accent/40 p-2">
                <div>
                  <p className="text-xs font-semibold text-brand">
                    Adjusting background
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-text-muted">
                    Drag the artboard to reposition. Press Escape or Done to
                    finish.
                  </p>
                </div>
                <RangeRow
                  label="Zoom"
                  value={imageZoom}
                  min={1}
                  max={4}
                  step={0.05}
                  formatValue={(value) => `${Math.round(value * 100)}%`}
                  onStart={onGestureStart}
                  onValue={onImageZoom}
                  onEnd={onGestureEnd}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onImageCenter}
                  >
                    Center image
                  </Button>
                  <Button type="button" size="sm" onClick={onImageDone}>
                    Done
                  </Button>
                </div>
              </div>
            ) : null}
            <div>
              <p className="mb-1 text-xs font-medium">Overlay</p>
              <div className="grid grid-cols-3 gap-1" role="radiogroup">
                {(["none", "light", "dark"] as const).map((overlay) => (
                  <button
                    key={overlay}
                    type="button"
                    role="radio"
                    aria-checked={background.image!.overlay === overlay}
                    className="sb-control min-h-9 text-xs capitalize"
                    onClick={() =>
                      update({
                        image: {
                          ...background.image!,
                          overlay,
                          overlayIntensity:
                            overlay !== "none" &&
                            background.image!.overlayIntensity === 0
                              ? 0.25
                              : background.image!.overlayIntensity,
                        },
                      })
                    }
                  >
                    {overlay}
                  </button>
                ))}
              </div>
            </div>
            {background.image.overlay !== "none" ? (
              <RangeRow
                label="Intensity"
                value={background.image.overlayIntensity}
                min={0}
                max={0.6}
                step={0.05}
                onStart={onGestureStart}
                onValue={(overlayIntensity) =>
                  update({ image: { ...background.image!, overlayIntensity } })
                }
                onEnd={onGestureEnd}
              />
            ) : null}
          </>
        ) : null}
        {fileError ? (
          <p role="alert" className="text-xs text-destructive">
            {fileError}
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
  onCustomPaletteColor,
  onCustomPalettePickerPreview,
  onCustomPalettePickerStart,
  onCustomPalettePickerEnd,
  onResetCustomPalette,
  backgroundImageFilename,
  backgroundImageAdjusting = false,
  backgroundImageZoom = 1,
  onBackgroundMode = () => {},
  onBackground = () => {},
  onBackgroundImageFile = async () => {},
  onBackgroundImageAdjust = () => {},
  onBackgroundImageRemove = () => {},
  onBackgroundImageZoom = () => {},
  onBackgroundImageCenter = () => {},
  onBackgroundImageReset = () => {},
  onBackgroundImageDone = () => {},
  onBackgroundGestureStart = () => {},
  onBackgroundGestureEnd = () => {},
  onLayout,
  onStyle,
  onTypography,
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
  onCustomPaletteColor?(role: CustomPaletteColorRole, color: string): void;
  onCustomPalettePickerPreview?(
    role: CustomPaletteColorRole,
    color: string,
  ): void;
  onCustomPalettePickerStart?(): void;
  onCustomPalettePickerEnd?(
    role: CustomPaletteColorRole,
    color: string | null,
  ): void;
  onResetCustomPalette?(): void;
  backgroundImageFilename?: string | undefined;
  backgroundImageAdjusting?: boolean;
  backgroundImageZoom?: number;
  onBackgroundMode?(mode: BackgroundDesign["mode"]): void;
  onBackground?(background: BackgroundDesign): void;
  onBackgroundImageFile?(file: File): Promise<void>;
  onBackgroundImageAdjust?(): void;
  onBackgroundImageRemove?(): void;
  onBackgroundImageZoom?(scale: number): void;
  onBackgroundImageCenter?(): void;
  onBackgroundImageReset?(): void;
  onBackgroundImageDone?(): void;
  onBackgroundGestureStart?(): void;
  onBackgroundGestureEnd?(): void;
  onLayout(value: LayoutId): void;
  onStyle?(value: LayoutStyleId): void;
  onTypography?(value: TypographyPresetId): void;
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
    design.customPalette,
  ).subjectPalette;
  const subjectPaletteTheme = availableThemes.find(
    (theme) =>
      theme.id ===
      (design.themeId === "custom"
        ? design.customPalette?.basedOnPaletteId
        : design.themeId),
  );
  return (
    <section aria-labelledby="studio-design-heading">
      <div className="pb-3">
        <h2 id="studio-design-heading" className="sb-section-title">
          Design
        </h2>
      </div>
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
      {activeLayout !== "photo" ? (
        <StyleInspectorSection
          design={design}
          layout={activeLayout}
          onStyle={onStyle}
        />
      ) : null}
      {activeLayout === "photo" ? (
        <>
          <section className="sb-inspector-major-section">
            <h3 className="sb-inspector-heading">Composition</h3>
            <div className="sb-inspector-children">
              <PhotoCompositionControl
                composition={photoComposition}
                onComposition={onPhotoComposition}
              />
            </div>
          </section>
          <StyleInspectorSection
            design={design}
            layout="photo"
            composition={photoComposition}
            onStyle={onStyle}
          />
        </>
      ) : null}
      <ColorPaletteInspectorSection
        design={design}
        {...(onTheme ? { onTheme } : {})}
        {...(onCustomPaletteColor ? { onColor: onCustomPaletteColor } : {})}
        {...(onCustomPalettePickerPreview
          ? { onPickerPreview: onCustomPalettePickerPreview }
          : {})}
        {...(onCustomPalettePickerStart
          ? { onPickerStart: onCustomPalettePickerStart }
          : {})}
        {...(onCustomPalettePickerEnd
          ? { onPickerEnd: onCustomPalettePickerEnd }
          : {})}
        {...(onResetCustomPalette ? { onReset: onResetCustomPalette } : {})}
      />
      <BackgroundInspectorSection
        design={design}
        activeLayout={activeLayout}
        imageFilename={backgroundImageFilename}
        imageAdjusting={backgroundImageAdjusting}
        imageZoom={backgroundImageZoom}
        onMode={onBackgroundMode}
        onBackground={onBackground}
        onImageFile={onBackgroundImageFile}
        onImageAdjust={onBackgroundImageAdjust}
        onImageRemove={onBackgroundImageRemove}
        onImageZoom={onBackgroundImageZoom}
        onImageCenter={onBackgroundImageCenter}
        onImageReset={onBackgroundImageReset}
        onImageDone={onBackgroundImageDone}
        onGestureStart={onBackgroundGestureStart}
        onGestureEnd={onBackgroundGestureEnd}
      />
      <TypographyInspectorSection
        value={design.typography.presetId}
        {...(onTypography ? { onChange: onTypography } : {})}
      />
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
            aria-label={`${subjectPaletteTheme?.name ?? "Clean Slate"} subject palette`}
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
      {activeLayout === "photo" ? (
        <PhotoInspectorSection
          photos={photos}
          composition={photoComposition}
          activePhotoId={activePhotoId}
          adjusting={photoAdjusting}
          zoom={photoZoom}
          onFile={onPhotoFile}
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
