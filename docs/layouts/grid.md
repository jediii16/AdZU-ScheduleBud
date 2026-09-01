# Clean Slate Grid layout

## Design intent

Grid is ScheduleBud's temporal layout. Cards emphasizes the classes belonging to each day, and Minimal reduces visual furniture; Grid shows when meetings occur and how long they last. It keeps Clean Slate's neutral background, dark editorial typography, blue accents, and pastel subject palette without resembling a spreadsheet or registrar system.

Grid is a layout, not a theme or template. It uses the same canonical schedule, Clean Slate tokens, device variants, normalized position, shared RenderModel, React Konva scene, and exact PNG exporter as Cards and Minimal.

## Temporal geometry

The pure builder in `src/domain/render/grid-layout.ts` expands enabled, complete full-week occurrences. Canonical start minutes determine block Y and duration determines block height. No minimum visual block height changes those ratios. A 09:30 meeting starts halfway between the 09:00 and 10:00 guides, and a two-hour meeting is exactly twice the height of a one-hour meeting at the same scale.

The automatic range rounds the earliest start down and latest end up to whole hours, clamped to the shared 07:00–23:00 domain. Ranges shorter than six hours expand deterministically around the actual meetings, shifting at a supported boundary when needed. The existing 07:00–18:00 fallback remains in effect when no renderable meeting exists.

## Axis and structural lines

Each temporal band has a left time gutter, a weekday header row, and a minute-accurate day grid. Major-hour guides are quiet blue-gray lines; half-hour lines are not drawn. Axis labels use compact forms such as `8 AM`. Phone ranges longer than eight hours label every second hour while retaining every hourly guide; AM/PM appears at the first visible label and at the noon transition instead of being repeated on every line.

Day columns use only very light internal dividers. There is no outer table rectangle and no boxed hour/day cells. Wide targets spell weekday names in full; Phone and Square use compact weekday abbreviations.

## Class blocks and information degradation

Meeting blocks use resolved Clean Slate subject fills and a slightly stronger same-family edge. Explicit per-subject and single colors are respected. Rounding is restrained by target family, padding reduces for physically short blocks, and blocks have no shadow.

Subject code is always emitted. A typed layout-capability resolver combines layout, target family/orientation, and actual block geometry before drawing details. On Tablet and larger Grid targets, optional information is admitted in this order after project and device visibility settings are merged:

1. subject code;
2. time;
3. room;
4. section;
5. professor.

Professor is therefore the first detail removed under pressure. Section requires more horizontal room than the room alone. Lower-priority strings use deterministic Konva-compatible fitting and ellipsis; the builder never expands a meeting block or falsifies its duration to fit text.

Phone Portrait intentionally has a narrower contract: Room, Time, and Professor are available, while Section remains reserved for larger Grid targets. Its resolved defaults are Room on and Time off because position and height already communicate time; Professor follows the project's existing visibility preference. These Phone Grid preferences are stored per device variant and layout, so changing them does not rewrite Cards, Minimal, or larger-target Grid preferences. Ordinary class blocks can show code, Room, and Professor; roomy blocks may also add an explicitly enabled Time. Constrained or overlapping blocks progressively remove details while retaining the complete subject code. Phone Grid never renders an ellipsized time or room value. Professor names may wrap to two lines; when the complete name still cannot fit, the field is omitted instead of ellipsized.

The Design inspector exposes these limitations explicitly rather than silently ignoring project settings. Long codes first try the preferred size, then a modest reduction, then tighter one-line fitting. A controlled two-line split is the final fallback. Subject codes are never ellipsized.

## Overlaps

Grid reuses `calculateOverlapLayout()`. Connected overlap clusters share the day width by their computed columns with a small internal gutter. Two- and three-way overlaps therefore remain side-by-side, while back-to-back meetings retain full width. Narrow overlap blocks pass through the same information-degradation rules, and every block remains within its day-column bounds.

## Day visibility

`scheduled-only` removes empty day columns and recomputes width. `full-week` intentionally restores Monday through Saturday headers and columns without fake “No class” blocks. Disabled subjects and incomplete or disabled meetings cannot reveal a day.

## Target compositions

Phone Portrait always uses one full-week temporal band. Five active days therefore produce five columns and six active days produce six columns. It uses compact weekday abbreviations, narrow margins and time gutter, and tight block padding so the timetable occupies a substantial usable width at 1080×2400.

Normal Tablet Portrait presets also use one full-week temporal band. Full weekday names are retained while they fit comfortably and degrade deterministically to abbreviations when the resolved day width is constrained. A custom Tablet Portrait target falls back to split bands only when its resolved day width would be less than 180 target pixels.

Square, and only the constrained custom-tablet fallback, use these split-band rules with one shared time range and minute scale:

- six days: 3 + 3;
- five days: 3 + 2 centered;
- four days: 2 + 2;
- three days: 3;
- two days: 2 centered;
- one day: centered.

Square uses compact outer, title, header, and band spacing so enabling the title does not consume the metadata line of ordinary class blocks.

Tablet Landscape preserves one full band when the actual target leaves at least 250 target pixels per day after margins and the time axis. Its existing deterministic fallback remains for unusually narrow custom landscape targets. Laptop/Desktop use one full band. Sparse wide schedules cap each day at 320 target pixels and center the whole temporal composition instead of stretching a few columns across the canvas.

Band height is derived from target space, band count, and the resolved time span. All bands use the same pixels-per-minute value. Compact ranges remain composed rather than filling the entire wallpaper, while long ranges clamp inside the available target height.

## Typography and positioning

Grid owns target-specific typography independently of Cards and Minimal. The 1080×2400 Phone direction uses a 62 px title, 30 px day labels, 24 px axis labels, 29 px subject codes, and progressively smaller optional details. Desktop uses a restrained 50 px title and 21 px subject codes. Typography scale remains an input, but individual long values do not shrink the whole target scale.

Grid-specific Reset to balanced defaults are:

- Phone: `(0.50, 0.40)`;
- Tablet portrait: `(0.50, 0.40)`;
- Tablet landscape: `(0.50, 0.42)`;
- Laptop/Desktop: `(0.50, 0.46)`;
- Square: `(0.50, 0.43)`.

Existing customized positions are never changed by selecting Grid. Hiding the title removes its complete geometry. The title, axes, bands, headers, guides, and blocks move as one schedule object.

## Preview, safe areas, and export

The Grid builder returns the same `ScheduleRenderResult` contract used by the other layouts. Its full compact bounds feed the existing selection overlay, center/safe-area snapping, and collision detection. Preview guides, safe areas, OS environments, screen guides, warnings, and selection outlines remain separate editor overlays.

Preview and export draw the same typed Grid RenderModel through `ScheduleScene`. Export stays at pixel ratio 1 and the exact selected target dimensions; preview zoom has no effect on geometry or PNG output.

The optional per-layout detail override was added to `DeviceVariant` without a project schema-version bump. Existing persisted variants omit the property and continue to validate; Zod treats it as optional, and the resolver supplies Phone Grid defaults until the student makes an explicit choice.
