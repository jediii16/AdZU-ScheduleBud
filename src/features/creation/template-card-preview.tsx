import type { CSSProperties } from "react";

import { resolveWallpaperTheme } from "@/domain/render/themes/registry";
import {
  mixGradientColors,
  resolveConicThirdColor,
  resolveGradientColorStops,
} from "@/domain/render/gradient";
import type { TemplateDefinition } from "@/domain/templates/schema";
import { resolveTypographyPreset } from "@/data/typography/registry";
import { fontRegistry } from "@/lib/font-registry";

const slotPatterns = [
  [0, 1, 3, 5, 7, 8, 10, 11, 14],
  [0, 2, 4, 6, 7, 9, 10, 12, 13],
  [1, 2, 3, 5, 6, 8, 9, 11, 14],
  [0, 1, 4, 5, 7, 9, 10, 13, 14],
] as const;

function previewSlots(
  template: TemplateDefinition,
): ReadonlyMap<number, string> {
  const variant =
    [...template.id].reduce(
      (sum, character) => sum + character.charCodeAt(0),
      0,
    ) % slotPatterns.length;
  const pattern = slotPatterns[variant]!;
  return new Map(
    pattern.map((slot, index) => [
      slot,
      template.presentation.subjects[
        index % template.presentation.subjects.length
      ]!,
    ]),
  );
}

function previewBackground(
  background: TemplateDefinition["recipe"]["design"]["background"],
  fallback: string,
): CSSProperties["background"] {
  if (background.mode === "solid") return background.solid?.color ?? fallback;
  if (background.mode === "gradient" && background.gradient) {
    const gradient = background.gradient;
    const center = `${gradient.center.x * 100}% ${gradient.center.y * 100}%`;
    const stops = resolveGradientColorStops(gradient);
    const cssStops = Array.from({ length: stops.length / 2 }, (_, index) => {
      const offset = stops[index * 2] as number;
      const color = stops[index * 2 + 1] as string;
      return `${color} ${Math.round(offset * 1000) / 10}%`;
    }).join(", ");
    if (gradient.type === "radial")
      return `radial-gradient(ellipse at ${center}, ${cssStops})`;
    if (gradient.type === "conic") {
      const softCenter = mixGradientColors(
        mixGradientColors(gradient.color1, gradient.color2, 0.5),
        resolveConicThirdColor(gradient),
        0.5,
      );
      return `radial-gradient(circle at ${center}, ${softCenter} 0 3%, ${softCenter}F2 6%, ${softCenter}00 24%), conic-gradient(from ${gradient.direction}deg at ${center}, ${cssStops})`;
    }
    return `linear-gradient(${gradient.direction + 90}deg, ${cssStops})`;
  }
  if (background.mode === "pattern" && background.pattern) {
    const pattern = background.pattern;
    const patternColor = `color-mix(in srgb, ${"color" in pattern ? pattern.color : "#000000"} ${pattern.opacity * 100}%, transparent)`;
    if (pattern.type === "dots")
      return `radial-gradient(circle, ${patternColor} 1px, transparent 1.5px), ${pattern.backgroundColor}`;
    if (pattern.type === "checker")
      return `linear-gradient(45deg, ${patternColor} 25%, transparent 25%, transparent 75%, ${patternColor} 75%), ${pattern.backgroundColor}`;
    if (pattern.type === "grid")
      return `linear-gradient(${patternColor} 1px, transparent 1px), linear-gradient(90deg, ${patternColor} 1px, transparent 1px), ${pattern.backgroundColor}`;
    if (pattern.type === "diagonal")
      return `repeating-linear-gradient(${pattern.angle}deg, ${pattern.backgroundColor} 0 10px, ${patternColor} 10px 12px)`;
    if (pattern.type === "crumpled")
      return `${pattern.backgroundColor} url('/textures/crumpled-paper.webp') center / cover`;
  }
  return fallback;
}

export function TemplateCardPreview({
  template,
}: {
  template: TemplateDefinition;
}) {
  const design = template.recipe.design;
  const theme = resolveWallpaperTheme(
    design.themeId,
    design.layoutId,
    design.customPalette,
  );
  const typography = resolveTypographyPreset(design.typography.presetId);
  const titleFont = `var(${fontRegistry[typography.titleFont].cssVariable})`;
  const scheduleFont = `var(${fontRegistry[typography.scheduleFont].cssVariable})`;
  const isDark = design.themeId === "midnight";
  const shapeClass =
    design.layoutId === "cards"
      ? "rounded-[5px]"
      : design.layoutId === "planner"
        ? "rounded-[2px]"
        : "rounded-[3px]";
  const slots = previewSlots(template);

  return (
    <div
      role="img"
      aria-label={`${template.name} preview`}
      className="relative flex h-full w-full flex-col overflow-hidden p-4 sm:p-5"
      style={{
        background: previewBackground(design.background, theme.background),
        backgroundSize:
          design.background.mode === "pattern" &&
          design.background.pattern?.type !== "crumpled"
            ? "16px 16px"
            : undefined,
        backgroundBlendMode:
          design.background.mode === "pattern" &&
          design.background.pattern?.type === "crumpled"
            ? "multiply"
            : undefined,
        color: theme.foreground,
      }}
    >
      <p
        aria-hidden="true"
        className="mb-3 text-[20px] leading-none"
        style={{
          fontFamily: titleFont,
          fontWeight: typography.titleWeight,
        }}
      >
        My Schedule
      </p>

      <div
        aria-hidden="true"
        className="flex min-h-0 flex-1 flex-col rounded-md border p-2 shadow-[0_8px_24px_-18px_rgba(0,0,0,.5)]"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          fontFamily: scheduleFont,
        }}
      >
        <div className="mb-1.5 grid grid-cols-5 gap-1">
          {["MON", "TUE", "WED", "THU", "FRI"].map((day) => (
            <span
              key={day}
              className="text-center text-[7px] leading-3 font-bold tracking-[0.04em] opacity-75"
            >
              {day}
            </span>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-5 grid-rows-3 gap-1">
          {Array.from({ length: 15 }, (_, index) => slots.get(index)).map(
            (label, index) =>
              label ? (
                <span
                  key={`${label}-${index}`}
                  className={`${shapeClass} flex min-h-0 items-center truncate px-1.5 text-[6px] leading-none font-bold tracking-[-0.02em]`}
                  style={{
                    backgroundColor:
                      theme.subjectPalette[index % theme.subjectPalette.length],
                    color: theme.foreground,
                  }}
                >
                  {label}
                </span>
              ) : (
                <span
                  key={`empty-${index}`}
                  aria-hidden="true"
                  className={`${shapeClass} border opacity-65`}
                  style={{
                    borderColor: theme.border,
                    backgroundColor: isDark ? "transparent" : theme.background,
                  }}
                />
              ),
          )}
        </div>
      </div>
    </div>
  );
}
