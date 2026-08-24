# AdZU ScheduleBud 2.0 architecture

## Scope and principles

This repository is a new application. `reference/PROJECT_LOGIC.md` is used only as a behavioral specification. ScheduleBud is browser-only and local-first: it has no authentication, backend, remote database, or synchronization service.

The architectural pipeline is:

```text
Portal XLSX / current curriculum / manual input
                    ↓
             canonical schedule
                    ↓
        validation and derived occurrences
                    ↓
       resolved design + device composition
                    ↓
             plain RenderModel
                    ↓
           React Konva scene drawing
              ├── scaled preview
              └── exact-size export
```

Preview scale is a view transform only. It must never enter geometry calculations. Exportable layers and editor overlays have separate types, so safe-area guides, OS chrome, handles, selections, warnings, pan, and zoom cannot enter an export scene accidentally.

## Canonical schedule domain

`src/domain/schedule` contains pure TypeScript and has no React, Next.js, Zustand, Konva, or styling dependencies. All creation paths normalize to `Subject[]`. A subject owns one or more `Meeting` records. Meetings contain day codes and exact `HH:mm` times; optional room and professor fields remain strings. Import metadata is traceable but renderer-independent.

The domain preserves these invariants:

- a subject always retains at least one meeting;
- incomplete meetings remain editable but do not create occurrences;
- disabled subjects and meetings do not affect layout or conflicts;
- duplicate operations create independent subject IDs, meeting IDs, and day arrays;
- back-to-back intervals do not conflict;
- compact week collapses only exact Monday/Thursday and Tuesday/Friday pairs;
- warning acknowledgement is a soft gate;
- meeting completeness, automatic ranges, manual ranges, overlap layout, and Portal parsing share exported 07:00–21:00 bounds;
- exact-minute times at 07:00 and 21:00 are valid, while canonical meetings outside those bounds remain editable but are excluded from occurrences;
- automatic time ranges round outward within the supported bounds and fall back to 07:00–18:00 when no complete in-domain meeting exists;
- overlap columns are calculated before rendering.

## Project and state boundaries

The Phase 3 project model will be a versioned `ScheduleProject` with metadata, canonical schedule data, shared design intent, per-device variants, asset references, and timestamps. The persistence API will be multi-project even while the initial UI emphasizes one active project.

Zustand will be composed from project, schedule, design, device, editor, and history slices. Project/schedule/design/device data is persistent. Editor zoom and pan, hover, tooltips, modal state, drag intermediates, calculated conflicts, resolved positions, render models, and safe-area collision results are derived or temporary and will not be persisted. The in-memory history will be bounded to about 50 meaningful commits; a completed drag is one commit.

## Renderer boundary

`src/domain/render` defines a plain `RenderModel` containing the exact target width, height, an ordered five-layer tuple, and resolved node geometry. `RenderNode` is a discriminated union of rectangle, text, image, and line nodes. Text nodes expose typed font IDs, typography, wrapping, and alignment; image nodes require stable asset IDs and typed fit/crop data; lines use point arrays instead of rectangle geometry. Future layout builders will construct this model from a validated project. React Konva components in `src/renderer/konva` will only draw it; they will not run core schedule layout algorithms or read the whole Zustand store.

Export layers are background, scenery, photos, schedule, and foreground. `EditorOverlayModel` is separate. PNG export will use the selected canvas dimensions exactly, independent of preview zoom. PDF export will reuse the same rendered wallpaper image on a matching-aspect page.

## Persistence and binary assets

Phase 3 will use Dexie. Project JSON and binary assets will be stored in separate tables. A project stores asset IDs, not blobs. Asset records will distinguish exportable user photos from non-exportable screen-guide screenshots. Dimension-detection screenshots remain session-only unless the student explicitly preserves them. Autosave status will reflect local writes only.

## Curriculum format

`src/data/curriculum/programs` contains one JSON file per supplied program. Only `SUBJECTS_BY_COURSE_YEAR_NEW` was normalized. Each program preserves its supplied ID, name, abbreviation, supplied term keys, subject codes, names, and units. Missing terms are omitted rather than invented, while explicitly supplied empty terms remain present.

`src/data/curriculum/schema.ts` validates every file with Zod and adds cross-record checks for duplicate program IDs and duplicate terms. `src/data/curriculum/index.ts` exposes the validated registry. Curriculum records remain separate from React.

The source-only `countForGPA` field is not copied because ScheduleBud scheduling has no GPA behavior; authoritative scheduling fields are preserved unchanged. The normalization script is reproducible and never reads the old curriculum map.

## Portal import pipeline

The browser receives workbook bytes and parses the first worksheet locally with SheetJS CE. The worker boundary is prepared at `src/workers/portal-xlsx.worker.ts`. The parser normalizes punctuation/case in headers, supports documented aliases, validates required columns, removes blank rows, groups by subject code and section, and creates one meeting per repeated row.

Day parsing uses longest-token-first decoding. Time parsing preserves minutes and validates positive 12-hour ranges within 7:00 AM–9:00 PM. Invalid rows become incomplete meetings with their room, professor, raw time, session, school year, and source row metadata intact. Rows with no subject code cannot be grouped; they are skipped only with a row-specific warning.

Parsing returns a discriminated `pending-portal-import` result and has no store dependency. A later confirmation action will replace schedule state atomically. Curriculum-aware resolution is injected through a discriminated `matched | ambiguous | unmatched` contract. A selected term can return a contextual `matched` result; a safe global match can identify its global scope. Ambiguous and unmatched results always remain zero-unit custom subjects, retain typed resolution metadata and optional candidates for review, and are never guessed.

## Layout, theme, and template separation

A layout controls schedule structure (`cards`, `minimal`, `grid`, `planner`, or `photo`). A theme is data-driven visual identity: palette, stable font IDs, and stable asset IDs. A template will apply a curated combination of layout, theme variant, density, visible fields, week mode, palette, background, typography, positioning defaults, photo composition, and device recommendations.

Only Clean Slate is marked available in the initial theme registry. Other named themes are planned metadata and share an original abstract placeholder; they are not implemented renderers. No third-party artwork is included. Pixel Grove remains a planned original theme.

## Device variants

Shared design intent will live once per project, while composition is stored per semantic phone, tablet, laptop, desktop, or square variant. Pixel dimensions have an independent `preset | custom` source, so every semantic category can use custom dimensions without becoming a generic “custom device.” Variant positions use normalized X/Y coordinates. Switching targets will select a variant rather than overwrite another variant. The device registry currently defines categories only; exact model presets are deferred until verified data is supplied.

Match My Screen derives dimensions and orientation from local image metadata. Exact squares can be recommended as square with high confidence; portrait and landscape screenshots return conservative candidate lists and require confirmation rather than using raw pixel thresholds. The optional screenshot remains an editor overlay, is never used for content-based model identification, and will never be exported.
