"use client";

import { Button } from "@/components/ui/button";
import {
  STUDIO_TARGETS,
  type StudioTargetId,
} from "@/data/devices/studio-targets";
import type { DeviceVariant, VisibleFields } from "@/domain/device/types";
import type { ProjectDesign } from "@/domain/project";
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
  subjectCode: "Subject code",
  subjectName: "Subject name",
  time: "Time",
  room: "Room",
  professor: "Professor",
  section: "Section",
};

export function DesignStudioPanel({
  design,
  onTitleVisible,
  onTitleText,
  onField,
  onDayVisibility,
}: {
  design: ProjectDesign;
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
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-text-muted">Theme</dt>
            <dd className="font-semibold">Clean Slate</dd>
          </div>
          <div>
            <dt className="text-text-muted">Layout</dt>
            <dd className="font-semibold">Cards</dd>
          </div>
        </dl>
      </div>
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
          {(Object.keys(FIELD_LABELS) as (keyof VisibleFields)[]).map(
            (field) => (
              <label
                key={field}
                className="flex min-h-10 items-center justify-between gap-3 py-2 text-sm"
              >
                {FIELD_LABELS[field]}
                <input
                  type="checkbox"
                  checked={design.visibleFields[field]}
                  onChange={(event) => onField(field, event.target.checked)}
                />
              </label>
            ),
          )}
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
  targetId,
  variant,
  onTarget,
  onPosition,
  onPositionStart,
  onPositionEnd,
  onReset,
  onSnapping,
}: {
  targetId: StudioTargetId;
  variant: DeviceVariant;
  onTarget(id: StudioTargetId): void;
  onPosition(position: { x: number; y: number }): void;
  onPositionStart(): void;
  onPositionEnd(): void;
  onReset(): void;
  onSnapping(enabled: boolean): void;
}) {
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
        <div className="grid grid-cols-2 gap-2">
          {STUDIO_TARGETS.map((target) => (
            <Button
              key={target.id}
              type="button"
              variant={targetId === target.id ? "default" : "outline"}
              onClick={() => onTarget(target.id)}
            >
              {target.label}
            </Button>
          ))}
        </div>
        <p className="mt-3 font-mono text-xs text-text-muted">
          {variant.dimensions.width} × {variant.dimensions.height} ·{" "}
          {variant.orientation}
        </p>
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
      <label className="flex min-h-10 items-center justify-between gap-3 border-y border-border py-2 text-sm font-semibold">
        Snap to guides
        <input
          type="checkbox"
          checked={variant.preview.enableSnapping}
          onChange={(event) => onSnapping(event.target.checked)}
        />
      </label>
    </section>
  );
}
