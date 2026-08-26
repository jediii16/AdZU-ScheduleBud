# Clean Slate Minimal layout

## Design intent

Minimal is the second production schedule layout and is available only with the existing Clean Slate theme in Phase 6A. It treats the timetable as a lightly typeset wallpaper composition: no class cards, outer schedule panel, shadow, gradient, or decorative illustration is emitted. Whitespace, text hierarchy, and restrained neutral weekday rules provide structure.

Cards, Minimal, and Grid are registered layouts, not templates. Planner and Photo remain planned and unavailable. The Studio selector changes only `ProjectDesign.layoutId`; schedule data, theme, title, field visibility, subject colors, day visibility, target variants, and their normalized positions remain intact. The change is one autosaved history entry and supports undo/redo.

## Class hierarchy

Each renderable occurrence resolves in this order:

1. subject code (semibold primary identifier);
2. time;
3. room and section;
4. professor (lowest priority, one line with deterministic ellipsis).

Minimal is deliberately monochrome. It ignores single and per-subject palette colors and emits no marker, filled class surface, or separator between classes. With the marker removed, every class-detail line starts on the same day-content axis as its weekday heading and portrait rule.

Subject code is the sole class identifier and is always rendered. It is not part of the optional visibility model. Minimal has no secondary identifier node or related spacing. Only time, room, professor, and section can be hidden.

Disabled subjects and incomplete/disabled meetings are excluded by canonical occurrence expansion before Minimal layout begins. They cannot reveal a day or affect bounds.

## Day and row geometry

`dayVisibility` remains independent from compact/full occurrence interpretation. `scheduled-only` removes empty days and reflows the composition. `full-week` restores Monday through Saturday headings but emits no fake “No class” block.

Portrait headings place a short neutral rule beneath a dark weekday label. Wide landscape headings place the weekday beside a low-contrast neutral continuation rule. Subject blocks are separated only by content-driven whitespace. A row's height is the tallest day section in that row; the next row starts after that height plus an intentional gap. The title, all day sections, and all class blocks form one compact movable group.

### Phone portrait

Packing is deterministic: six days use 2+2+2, five use 2+2+1, four use 2+2, three use 2+1, two use 2, and one uses a centered wider section. An incomplete last row is centered without a phantom slot. Four to six days retain the established 952 px working width on the 1080 × 2400 reference target. One to three days use a 992 px working width, making paired sections 20 px wider per column, while a singleton may grow to 700 px. The 42 px paired gutter remains intact. A 235 px optical content measure centers the visible left-aligned typography inside each logical day section while keeping `schedulePosition.x = 0.5` mathematically authoritative. Five-day row gaps are 57 target px.

### Tablet portrait

Portrait Tablet normally uses two columns. It uses three only when the target aspect ratio is at least 0.7 and the resolved three-column day width remains at least 400 target px. This makes the generic 1536 × 2048 4:3 preset a readable three-column composition, while narrower 16:10 portrait targets retain two columns. Incomplete rows are centered.

### Tablet landscape

Physical readability takes priority over fitting every day into one mathematical row. Six days use 3+3, five use 3+2, four use 2+2, three use 3, two use 2, and one uses 1. Incomplete rows are centered. Day width is capped at 520 target px, using the additional width for legible class information rather than decorative gaps.

### Desktop and Laptop

Wide desktop/laptop targets use one column per visible day and center the entire grid. Sparse day columns remain capped at **350 target px**, so one-to-three-day compositions stay substantial without stretching absurdly. Five active days are capped at a centered **1600 target px** composition on the 1920 px reference canvas. Six readable columns remain valid. The dark weekday label sits beside a neutral continuation rule drawn at 60% of the previously available rule length.

### Square

Six days use 3+3, five use 3+2, four use 2+2, three use 3, two use 2, and one uses 1. Incomplete rows are centered and there are no blank slots.

## Target typography

Typography is resolved in target pixels and then multiplied by the existing project typography scale. It is not derived from the editor viewport.

| Role           | Phone 1080×2400 | Tablet portrait | Tablet landscape | Desktop 1920×1080 | Square 1080 |
| -------------- | --------------: | --------------: | ---------------: | ----------------: | ----------: |
| Title          |              64 |              86 |               68 |                54 |          54 |
| Day            |              36 |              41 |               34 |                28 |          27 |
| Code / primary |              34 |              37 |               31 |                25 |          23 |
| Time           |              27 |              30 |               24 |                19 |          18 |
| Room / section |              24 |              27 |               21 |                17 |          16 |
| Professor      |              24 |              26 |               20 |                16 |          15 |

Long professor and room/section values use a one-line fit with ellipsis. One long field never shrinks the entire layout. Minimal support text uses `#66758A`, modestly darker than the shared muted token while remaining subordinate to code and time. Minimal's monochrome tokens do not alter Cards or Grid.

## Title and balanced position

A visible, nonblank title is integrated into the compact group at a restrained scale. Hiding it removes both its node and its entire title block; the day grid begins at the group origin.

Minimal-specific Reset to balanced defaults are `{x: 0.5, y: 0.38}` for Phone, `{x: 0.5, y: 0.40}` for portrait Tablet, `{x: 0.5, y: 0.37}` for landscape Tablet, `{x: 0.5, y: 0.42}` for Laptop/Desktop, and `{x: 0.5, y: 0.44}` for Square. These are optical rather than mathematical centers and account for the larger wide-target blocks. New variants use the active layout's applicable default. Changing layouts does not reset a variant's stored position, and existing customized positions are never rewritten; normalized positioning automatically resolves against the active layout's content bounds.

## Renderer responsibility

`buildMinimalRenderModel()` is pure TypeScript. It resolves target family, active days, packing, text fitting, class height, row height, schedule bounds, and every text/line coordinate before React Konva draws anything. Clean Slate supplies neutral colors and font identities; Minimal owns structure and geometry, ignores the subject palette, and contains no target coordinates in theme data.

The central layout resolver selects Cards or Minimal and returns the shared `ScheduleRenderResult` contract. The existing preview and exact-size export stages render the same `RenderModel`. Smart center/safe-anchor snapping, safe-area collision, My Screen guides, selection bounds, and OS previews use the resolved Minimal group bounds but remain editor-only.
