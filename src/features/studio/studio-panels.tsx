"use client";

import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { availableLayouts } from "@/data/layouts/registry";
import type { LayoutId } from "@/domain/design/types";
import {
  supportsOrientationSwitch,
  type DeviceVariant,
  type VisibleFields,
} from "@/domain/device/types";
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

const INSPECTOR_FIELD_ORDER: readonly (keyof VisibleFields)[] = [
  "time",
  "room",
  "professor",
  "section",
];

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
    <section aria-labelledby="studio-design-heading">
      <div className="pb-3">
        <h2 id="studio-design-heading" className="sb-section-title">
          Design
        </h2>
        <dl className="mt-3">
          <div>
            <dt className="text-xs font-semibold text-text-muted">Theme</dt>
            <dd className="mt-1 text-sm font-semibold">Clean Slate</dd>
          </div>
        </dl>
      </div>
      <section className="sb-inspector-major-section">
        <h3 className="sb-inspector-heading">Layout</h3>
        <div
          role="radiogroup"
          aria-label="Schedule layout"
          className="sb-inspector-children grid grid-cols-3 rounded-sm border border-border bg-muted/40 p-1"
        >
          {availableLayouts.map((layout) => (
            <button
              key={layout.id}
              type="button"
              role="radio"
              aria-checked={activeLayout === layout.id}
              className={`min-h-10 cursor-pointer rounded-sm px-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30 motion-reduce:transition-none ${activeLayout === layout.id ? "bg-surface-elevated text-brand ring-1 ring-inset ring-brand/20" : "text-text-secondary hover:bg-surface hover:text-foreground active:bg-muted"}`}
              onClick={() => onLayout(layout.id)}
            >
              {layout.name}
            </button>
          ))}
        </div>
      </section>
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
      {activeLayout !== "minimal" ? (
        <div className="sb-inspector-major-section">
          <p className="sb-inspector-heading">Subject palette</p>
          <div
            aria-label="Clean Slate subject palette"
            className="sb-inspector-children flex gap-2"
          >
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
