# Studio rendering architecture

## Scope

The production renderer supports the Clean Slate theme with three real layouts: Cards, Minimal, and Grid. It supports Phone, Tablet, Laptop, Desktop, Square, preset, custom, and matched-screen target dimensions. Additional layouts/themes, Photo mode, templates, PDF, transparent/background-only export, and arbitrary freeform editing remain deferred.

## Shared pipeline

```text
active ScheduleProject
        ↓
enabled, complete full-week occurrences
        ↓
resolved ProjectDesign + active DeviceVariant
        ↓
available typed layout registry
        ↓
Cards, Minimal, or Grid pure layout builder
        ↓
ScheduleRenderResult
  ├── exact RenderModel
  ├── schedule bounds + position range
  └── separate EditorOverlayModel
        ↓
shared React Konva ScheduleScene
  ├── scaled preview Stage + editor-only overlays
  └── exact-size export Stage
```

`buildScheduleRenderModel()` is the single layout-selection boundary. It resolves a valid variant override or the shared project layout and delegates to the Cards, Minimal, or Grid pure builder. Planned/unavailable layout IDs fall back safely to Cards rather than invoking unfinished geometry. Konva components receive resolved nodes and never calculate schedule layout or read Zustand.

The shared `ScheduleRenderResult` exposes only the exact `RenderModel`, separate overlay metadata, compact schedule bounds, and normalized-position range required by the editor. Layout-specific results may additionally expose day/class plans and typography for deterministic tests.

## Layout selection and state

The Design inspector exposes a compact keyboard-accessible Cards/Minimal/Grid radio group backed by the typed layout registry. Switching layouts changes only `ProjectDesign.layoutId`, produces one history/autosave commit, and is immediately reflected by preview and export. Undo/redo can move among the three layouts without changing academic data, target variants, title, fields, subject colors, or day visibility.

Each `DeviceVariant.schedulePosition` remains authoritative and is not reset on layout change. Every builder resolves that normalized point against its own current compact bounds, so content stays clamped inside the target even when layout dimensions differ. Reset to balanced is layout-aware: Cards retains Phase 4.1 defaults, Minimal uses [its documented optical defaults](layouts/minimal.md), and Grid uses [target-specific temporal defaults](layouts/grid.md).

## Theme/layout separation

Clean Slate owns its off-white background, foreground hierarchy, blue accent, border color, font identities, and subject palette. Cards owns filled-card geometry and its information layout. Minimal owns unfilled typographic blocks, weekday-rule treatments, subject markers, target packing, and spacing. Grid owns temporal axes, minute geometry, target-aware band composition, overlap subdivision, and geometry-aware information tiers. Phone and normal Tablet Portrait Grid variants use one full-week band; Square and deterministically constrained custom tablets may split. A typed capability resolver also makes Professor and Section explicitly unavailable on Phone Grid while preserving Room and Time. Theme data contains no target coordinates, and no layout owns editor behavior.

Both builders consume canonical full-week occurrences, so disabled subjects, disabled meetings, and incomplete meetings never render or keep a day visible. `dayVisibility` controls whether empty weekday headings are removed/reflowed or intentionally retained; it does not change compact-week semantics.

## Preview, guides, and safe areas

All geometry remains in target pixels. Preview fit and editor zoom apply only to the Stage view transform. The same smart-guide resolver uses display-space acquisition/release thresholds for Cards, Minimal, and Grid schedule bounds, including canvas-center and safe-area anchors. One drag remains one history transaction.

OS preview environments, uploaded screen guides, safe/caution/blocked zones, warnings, selection bounds, guide lines, and crosshairs are drawn only after `ScheduleScene` in the preview Stage. The hidden export Stage contains only `ScheduleScene`, so no editor overlay or private screen-guide asset can enter a PNG.

## Exact PNG export

Export waits for RenderModel fonts and captures the exact-size shared Konva scene at pixel ratio 1. Preview zoom never changes output. Phone, Tablet, Laptop, Desktop, Square, preset, custom, and matched-screen variants export at their selected width and height for Cards, Minimal, and Grid. There is no DOM capture or layout-specific export implementation.

## Current limitations

- Clean Slate is the only available theme.
- Cards, Minimal, and Grid are the only available layouts.
- Image nodes and Photo composition are not used.
- PNG is the only export format.
- Safe areas are conservative generic editor guides, not an exhaustive device database.
- Schedule-group movement is the only direct artboard manipulation.
