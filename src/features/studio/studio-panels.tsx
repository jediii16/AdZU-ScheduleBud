"use client";

import { Button } from "@/components/ui/button";
import { availableLayouts } from "@/data/layouts/registry";
import type { LayoutId } from "@/domain/design/types";
import type { DeviceVariant, VisibleFields } from "@/domain/device/types";
import type { ProjectDesign } from "@/domain/project";
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

export function DesignStudioPanel({
  design,
  visibleFields,
  activeLayout,
  detailCapabilities,
  onLayout,
  onTitleVisible,
  onTitleText,
  onField,
  onDayVisibility,
}: {
  design: ProjectDesign;
  visibleFields: VisibleFields;
  activeLayout: LayoutId;
  detailCapabilities: LayoutDetailCapabilities;
  onLayout(value: LayoutId): void;
  onTitleVisible(value: boolean): void;
  onTitleText(value: string): void;
  onField(field: keyof VisibleFields, value: boolean): void;
  onDayVisibility(value: ProjectDesign["dayVisibility"]): void;
}) {
  return (
    <section aria-labelledby="studio-design-heading" className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 id="studio-design-heading" className="sb-section-title">
          Design
        </h2>
        <dl className="mt-3 text-sm">
          <div>
            <dt className="text-text-muted">Theme</dt>
            <dd className="font-semibold">Clean Slate</dd>
          </div>
        </dl>
      </div>
      <fieldset>
        <legend className="sb-label">Layout</legend>
        <div
          role="radiogroup"
          aria-label="Schedule layout"
          className="grid grid-cols-3 border border-border bg-muted/40 p-1"
        >
          {availableLayouts.map((layout) => (
            <button
              key={layout.id}
              type="button"
              role="radio"
              aria-checked={activeLayout === layout.id}
              className={`min-h-10 rounded-sm px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${activeLayout === layout.id ? "bg-surface-elevated text-brand shadow-sm" : "text-text-secondary hover:bg-surface"}`}
              onClick={() => onLayout(layout.id)}
            >
              {layout.name}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="sb-label">Wallpaper title</legend>
        <label className="flex min-h-10 items-center justify-between gap-3 border-y border-border py-2 text-sm font-semibold">
          Show title
          <input
            type="checkbox"
            checked={design.wallpaperTitle.visible}
            onChange={(event) => onTitleVisible(event.target.checked)}
          />
        </label>
        <label>
          <span className="sb-label">Title text</span>
          <input
            key={design.wallpaperTitle.text}
            className="sb-control"
            defaultValue={design.wallpaperTitle.text}
            maxLength={100}
            disabled={!design.wallpaperTitle.visible}
            onBlur={(event) => onTitleText(event.target.value)}
          />
        </label>
      </fieldset>
      <fieldset>
        <legend className="sb-label">Days</legend>
        <label className="flex min-h-10 items-center justify-between gap-3 border-y border-border py-2 text-sm font-semibold">
          Hide days without classes
          <input
            type="checkbox"
            checked={design.dayVisibility === "scheduled-only"}
            onChange={(event) =>
              onDayVisibility(
                event.target.checked ? "scheduled-only" : "full-week",
              )
            }
          />
        </label>
      </fieldset>
      <fieldset>
        <legend className="sb-label">Visible class details</legend>
        <div className="divide-y divide-border border-y border-border">
          {activeLayout === "grid" ? (
            <div className="flex min-h-12 items-center justify-between gap-3 py-2 text-sm">
              <span className="font-semibold">Subject code</span>
              <span className="text-xs font-medium text-text-muted">
                Always shown
              </span>
            </div>
          ) : null}
          {detailCapabilities.fieldOrder.map((field) => {
            const available = detailCapabilities.fields[field] === "available";
            return available ? (
              <label
                key={field}
                className="flex min-h-10 items-center justify-between gap-3 py-2 text-sm"
              >
                {FIELD_LABELS[field]}
                <input
                  type="checkbox"
                  checked={visibleFields[field]}
                  onChange={(event) => onField(field, event.target.checked)}
                />
              </label>
            ) : (
              <div
                key={field}
                aria-disabled="true"
                className="flex min-h-12 items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="font-semibold">{FIELD_LABELS[field]}</span>
                <span className="max-w-32 text-right text-xs leading-4 text-text-muted">
                  Available on larger Grid targets
                </span>
              </div>
            );
          })}
        </div>
      </fieldset>
      <div>
        <p className="sb-label">Subject palette</p>
        <div aria-label="Clean Slate subject palette" className="flex gap-2">
          {[
            "#DCEAF5",
            "#E4EEE8",
            "#F3E8DD",
            "#E9E4F2",
            "#F1E5E8",
            "#E3EDF0",
          ].map((color) => (
            <span
              key={color}
              className="size-7 rounded-sm border border-border"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
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
  return (
    <section aria-labelledby="studio-device-heading" className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 id="studio-device-heading" className="sb-section-title">
          Device
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose the wallpaper target. Each target keeps its own position.
        </p>
      </div>
      <fieldset>
        <legend className="sb-label">Target</legend>
        <p className="font-semibold">{targetLabel}</p>
        <p className="mt-1 font-mono text-xs text-text-muted">
          {variant.dimensions.width} × {variant.dimensions.height} ·{" "}
          {variant.orientation}
        </p>
        <div className="mt-3 flex gap-2">
          <Button type="button" variant="outline" onClick={onChangeTarget}>
            Change target
          </Button>
          <Button type="button" variant="ghost" onClick={onOrientation}>
            Switch orientation
          </Button>
        </div>
      </fieldset>
      <fieldset>
        <legend className="sb-label">Preview</legend>
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
      </fieldset>
      <fieldset>
        <legend className="sb-label">Guides</legend>
        <div className="divide-y divide-border border-y border-border">
          {(
            [
              ["Show safe areas", variant.preview.showSafeAreas, onSafeAreas],
              ["Warn about overlap", variant.preview.showWarnings, onWarnings],
              ["Snap to guides", variant.preview.enableSnapping, onSnapping],
            ] as const
          ).map(([label, checked, change]) => (
            <label
              key={label}
              className="flex min-h-10 items-center justify-between gap-3 py-2 text-sm font-semibold"
            >
              {label}
              <input
                type="checkbox"
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
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="sb-label">Schedule position</legend>
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
      </fieldset>
    </section>
  );
}
