# Studio rendering vertical slice

## Scope

Phase 4 implements one production rendering path: the Clean Slate theme with the Cards layout. It supports a generic portrait Phone target at 1080 × 2400 and a Full HD Desktop target at 1920 × 1080. Other layouts, themes, target categories, safe-area previews, photos, PDF, and device-model presets remain deferred.

## Studio structure

The desktop Studio uses a compact top bar, a narrow Classes/Design/Device tool rail, a central artboard workspace, and a contextual right inspector. The top bar exposes project identity, undo/redo, autosave state, and PNG export. Workspace controls show the selected target and provide Fit, zoom in, and zoom out.

At tablet and mobile browser widths, the permanent side columns disappear. The artboard remains the primary surface, the three tools move to safe-area-aware bottom navigation, and the selected inspector appears as a bounded bottom/right overlay. This is an editor adaptation only; the selected wallpaper target remains independent from the browser viewport.

## RenderModel pipeline

```text
active ScheduleProject
        ↓
enabled, complete full-week occurrences
        ↓
resolved ProjectDesign + active DeviceVariant
        ↓
Clean Slate visual tokens + Cards geometry builder
        ↓
CardsRenderResult
  ├── exact RenderModel
  ├── schedule bounds
  └── separate EditorOverlayModel
        ↓
shared React Konva ScheduleScene
  ├── scaled preview Stage
  └── exact-size export Stage
```

`buildCardsRenderModel()` is pure TypeScript. It resolves every canvas, title, day heading, card, text, and line coordinate before Konva receives the model. It uses canonical occurrences, so disabled subjects, disabled meetings, and incomplete meetings never become wallpaper nodes. Code-only subjects render their code once per real occurrence and never synthesize a duplicate friendly name.

## Cards compositions

Phone packs active days into compact two-column rows: six days use 2+2+2, five use 2+2+1, four use 2+2, three use 2+1, two use 2, and one uses a centered wider section. A final singleton is centered rather than paired with an invisible slot. Each row takes the height of its taller day section, and the next row follows after a fixed intentional gap. The schedule therefore remains one content-sized composition instead of occupying equal fractions of the wallpaper height.

Desktop builds one balanced column per visible day. Five scheduled days create five real columns; full-week mode restores Saturday as an intentional empty heading without a fake card. A maximum day-column width prevents one or two days from stretching excessively, and the complete grid remains centered as a movable block.

`ProjectDesign.dayVisibility` is independent from compact/full occurrence interpretation. Clean Slate Cards defaults to `scheduled-only`; only days with occurrences from enabled subjects and complete enabled meetings are active. The Design inspector exposes this as “Hide days without classes.”

Phone and Desktop use independent target-pixel typography scales. Phone uses an approximately 80 px title, 40 px day headings, 38 px codes, 30 px names, and 26–28 px meeting details. Desktop remains editorial at smaller target-pixel sizes. Cards resolve code, optional name, time, room/section, and optional professor as distinct hierarchy levels. A code-only subject omits the name node and its spacing entirely.

Wallpaper-title geometry belongs to the Cards builder, not the theme. A visible nonblank title reserves a measured layout region. Hiding it removes the title node and moves the day grid upward, reclaiming the space.

## Clean Slate responsibilities

Clean Slate supplies only visual identity: off-white background, white surfaces, dark and muted text colors, line colors, a blue day accent, and a restrained subject palette. It contains no Cards geometry or editor behavior. The current export layers use `background` and `schedule`; scenery, photos, and foreground remain valid empty layers.

## Preview, positioning, and overlays

All model geometry stays in target pixels. The preview Stage applies a view-only scale derived from the available workspace and temporary editor zoom. Fit resets zoom to 100% of the calculated fit; zoom is not persisted and creates no history.

The schedule bounds are drawn by a separate editor layer. While actively dragging, the editor can snap the compact group to the vertical canvas center, horizontal canvas center, or both. The 8 px acquisition and 14 px release thresholds are defined in preview/display pixels and converted by preview scale, so zoom does not alter the feel. Thin ScheduleBud-blue lines and a small center crosshair exist only in the preview overlay and disappear on drag end. “Snap to guides” defaults on and can be disabled per device variant.

Dragging begins one history transaction, updates normalized target-specific X/Y coordinates while moving, and commits one history/autosave entry on release. Guide intermediates are temporary editor state and never create history or persistence work. The Device inspector exposes equivalent keyboard-accessible sliders and a balanced reset. Phone and Desktop variants retain independent positions.

After the compact reflow, balanced defaults are `{ x: 0.5, y: 0.42 }` for Phone and `{ x: 0.5, y: 0.45 }` for Desktop. Both are horizontally centered; the slight upward optical placement leaves breathing room below the composition without forcing mathematical center.

No selection or guide node enters any export layer. The export Stage renders only `ScheduleScene`, while the preview Stage adds the editor overlay afterward.

## PNG export

Export waits for all font IDs referenced by the RenderModel, then captures the exact-size Konva export Stage at pixel ratio 1. Preview scale and zoom are absent from this Stage. Phone downloads as `adzu-schedule-phone.png` at exactly 1080 × 2400; Desktop downloads as `adzu-schedule-desktop.png` at exactly 1920 × 1080.

An export coordinator rejects concurrent requests and always unlocks after success or failure. Failures leave project state untouched and provide a student-facing retry message while retaining console diagnostics. Enabled schedule issues reuse the existing two-step warning acknowledgement before export. The implementation contains no DOM screenshot, `html2canvas`, or DOM-to-image fallback.

## Current limitations

- Clean Slate and Cards are fixed read-only context in this phase.
- Only Phone and Desktop target selection is exposed.
- Image render nodes are not used because Photo mode is deferred.
- Lock-screen, desktop chrome, safe areas, Match My Screen, and device databases are deferred.
- PNG is the only export format.
- Schedule positioning is the only direct artboard manipulation.
