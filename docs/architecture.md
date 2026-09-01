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

`src/domain/schedule` contains pure TypeScript and has no React, Next.js, Zustand, Konva, or styling dependencies. All creation paths normalize to `Subject[]`. A nonblank subject code is required and is the sole class identifier; the canonical model has no subject-name field. A subject owns one or more `Meeting` records. Meetings contain day codes and exact `HH:mm` times; optional room and professor fields remain strings. Import metadata is traceable but renderer-independent.

The domain preserves these invariants:

- a subject always retains at least one meeting;
- incomplete meetings remain editable but do not create occurrences;
- disabled subjects and meetings do not affect layout or conflicts;
- `Subject.enabled` is the single inclusion contract across Portal, curriculum, and manual creation; disabled subjects remain stored and editable but are ignored by completeness, occurrences, conflicts, timetable bounds, review placement, and future rendering;
- duplicate operations create independent subject IDs, meeting IDs, and day arrays;
- back-to-back intervals do not conflict;
- compact week collapses only exact Monday/Thursday and Tuesday/Friday pairs;
- warning acknowledgement is a soft gate;
- meeting completeness, automatic ranges, manual ranges, overlap layout, and import parsing share exported 07:00–23:00 bounds;
- exact-minute times at 07:00 and 23:00 are valid, while canonical meetings outside those bounds remain editable but are excluded from occurrences;
- automatic time ranges round outward within the supported bounds and fall back to 07:00–18:00 when no complete in-domain meeting exists;
- overlap columns are calculated before rendering.

## Project and state boundaries

`src/domain/project` defines schema version 1 of `ScheduleProject`. It contains metadata, the canonical `Subject[]` schedule, shared `ProjectDesign`, independent device variants, asset IDs, and ISO timestamps. Project title is local-library metadata; wallpaper title and optional semester, school-year, program, and section labels are independent display controls. Cards day visibility (`scheduled-only` or `full-week`) is a typed design choice separate from occurrence week interpretation. A blank project has no invented subjects and an explicit no-device-yet state.

One Zustand vanilla store is composed from project, schedule, design, device, editor, and history slice creators. Project/schedule/design/device data is persistent. Editor zoom, pan, selections, inspector state, and drag state are temporary. Calculated conflicts, occurrences, time ranges, overlap columns, resolved themes, render models, and safe-area collision results are never persisted. Focused selectors expose active/project/subject/design/device views without requiring whole-store subscriptions.

Every meaningful project mutation passes through a Zod-validated commit boundary. History stores at most 50 before/after project snapshots in memory. A transaction keeps drag intermediates out of history and persistence, then records and autosaves one final commit. Undo and redo restore content with a fresh `updatedAt` and trigger autosave. Preview-only device preferences are persisted but intentionally do not create history entries.

## Renderer boundary

`src/domain/render` defines a plain `RenderModel` containing the exact target width, height, an ordered five-layer tuple, and resolved node geometry. `RenderNode` is a discriminated union of rectangle, text, image, and line nodes. Text nodes expose typed font IDs, typography, wrapping, and alignment; image nodes require stable asset IDs and typed fit/crop data; lines use point arrays instead of rectangle geometry. A central resolver selects the registered Cards, Minimal, or Grid pure builder from the project and active variant, returning one shared schedule-result contract. React Konva components only draw that result; they do not run schedule layout algorithms or read Zustand.

Export layers are background, scenery, photos, schedule, and foreground. `EditorOverlayModel` is separate. The preview and exact-size PNG export use the same RenderModel and React Konva scene; only the preview adds the separate selection/drag layer and view scale. Phone exports at 1080 × 2400 and Desktop at 1920 × 1080, independent of preview zoom. PDF remains deferred.

## Persistence and binary assets

Dexie database version 1 has `projects`, `assets`, and `applicationMetadata` tables. Typed repositories are the only state-facing storage boundary. Project reads validate or migrate before returning a discriminated `found | not-found | invalid | unsupported-version` result; corrupt records do not enter the store. The application-metadata table keeps the active project pointer separately, so the database supports multiple projects now.

Project records contain JSON-portable asset IDs only. `StoredAsset` rows own Blob data and distinguish exportable `photo` assets from non-exportable `screen-guide` assets. Temporary screenshot inspection reads dimensions in memory; saving a guide is a separate explicit API. Reference collection and unreferenced-asset detection support safe cleanup, while project deletion removes all project-owned assets and cancels pending writes first.

Autosave uses a 350 ms default debounce and a serialized write queue. Rapid changes replace the pending snapshot for that project, so an older write cannot finish after a newer write. Status is exposed as `idle | saving | saved | error`, with the last saved time and error message. A failure leaves the in-memory project untouched and retains a retryable pending snapshot; a later mutation can recover.

`migrateProject()` validates schema 1 and returns typed failures for other versions. Zod object parsing strips unrecognized properties, so previously saved schema-1 records safely lose the former subject-name and subject-identifier-visibility keys on read while preserving codes, meetings, positions, design details, device variants, asset references, inclusion state, and import metadata. This backward-compatible normalization does not require a schema-version bump. The legacy boundary detects schema 13 but returns an explicit unsupported result because the exact old serialized workspace is not specified sufficiently for a safe conversion.

## Curriculum format

`src/data/curriculum/programs` contains one JSON file per supplied program. Only `SUBJECTS_BY_COURSE_YEAR_NEW` was normalized. Each program preserves its supplied ID, program name, abbreviation, supplied term keys, subject codes, and units. Subject names are intentionally omitted because ScheduleBud identifies classes exclusively by code. Missing terms are omitted rather than invented, while explicitly supplied empty terms remain present.

`src/data/curriculum/schema.ts` validates every file with Zod and adds cross-record checks for duplicate program IDs and duplicate terms. `src/data/curriculum/index.ts` exposes the validated registry. Curriculum records remain separate from React.

The source-only `countForGPA` field is not copied because ScheduleBud scheduling has no GPA behavior; authoritative scheduling fields are preserved unchanged. The normalization script is reproducible and never reads the old curriculum map.

## Portal import pipeline

The browser receives workbook bytes and parses the first worksheet locally with SheetJS CE. The worker boundary is prepared at `src/workers/portal-xlsx.worker.ts`. The parser normalizes punctuation/case in headers, supports documented aliases, validates required columns, removes blank rows, groups by subject code and section, and creates one meeting per repeated row.

Day parsing uses longest-token-first decoding. Time parsing preserves minutes and validates positive 12-hour ranges within 7:00 AM–11:00 PM. Invalid rows become incomplete meetings with their room, professor, raw time, session, school year, and source row metadata intact. Rows with no subject code cannot be grouped; they are skipped only with a row-specific warning.

Parsing returns a discriminated `pending-portal-import` result and has no store or curriculum dependency. Portal rows are authoritative for the student's enrolled schedule: the parser never looks up subject codes in the static curriculum, never infers units, and never emits curriculum-match warnings. Imported subjects store the Portal code and neutral `0` units; there is no subject-name field or missing-name warning. Every pending subject starts included and can be excluded before confirmation without losing its rows, meetings, or import metadata. A later confirmation action replaces schedule state atomically, preserving excluded subjects with `enabled: false`.

## Layout, theme, and template separation

A layout controls schedule structure. The typed registry marks `cards`, `minimal`, and `grid` available; `planner` and `photo` remain planned metadata and cannot be selected. Grid consumes exact canonical minutes, resolves a clamped whole-hour range with a deterministic six-hour minimum, subdivides actual overlaps, and uses target-aware temporal bands without changing the shared schedule model. A theme is data-driven visual identity: palette, stable font IDs, and stable asset IDs. Subject code is unconditional; the only optional class-detail fields are time, room, professor, and section. A template will apply a curated combination of layout, theme variant, density, optional detail fields, week mode, palette, background, typography, positioning defaults, photo composition, and device recommendations. See the [Minimal](layouts/minimal.md) and [Grid](layouts/grid.md) specifications for their target-aware geometry and theme boundaries.

Only Clean Slate is marked available in the initial theme registry. Other named themes are planned metadata and share an original abstract placeholder; they are not implemented renderers. No third-party artwork is included. Pixel Grove remains a planned original theme.

## Device variants

Shared design intent lives once per project, while composition is stored per semantic phone, tablet, laptop, desktop, or square variant. Pixel dimensions have an independent `preset | custom | matched-screen` source, so every semantic category can use custom dimensions without becoming a generic “custom device.” Variant positions use clamped normalized X/Y coordinates. Layout, density, and optional-detail overrides remain target-specific rather than copying the full design. Switching targets selects a preserved variant rather than overwriting another variant. The device registry contains a deliberately small set of generic, model-neutral presets. Multiple variants may share one semantic category; verified named-device presets remain deferred.

Match My Screen derives dimensions and orientation from local image metadata. Exact squares can be recommended as square with high confidence; portrait and landscape screenshots return conservative candidate lists and require confirmation rather than using raw pixel thresholds. Optional preservation writes a separate Dexie `screen-guide`; otherwise the decoded file remains temporary. Generic OS environments, safe areas, collision results, and guides are editor-only and never enter the export model. See `docs/devices-and-safe-areas.md`.

## Creation and review application layer

Phase 3 routes are thin App Router entries over client feature components. A root provider hydrates the singleton local store before interactive children render, preventing creation actions from racing IndexedDB restoration. Tests inject isolated vanilla stores through the same provider.

Creation drafts do not enter Zustand prematurely. Portal uses `PendingPortalImport`; curriculum selection remains component state until a supplied term is confirmed; manual entry commits on the first added class. The shared deterministic policy reuses only an empty active project and otherwise creates a separate project. `replaceSchedule()` is the explicit validated atomic boundary for confirmed Portal and curriculum schedules. Exclusion uses the history-aware `setSubjectEnabled` action, while permanent removal uses the separate history-aware `removeSubject` action; both autosave like other meaningful project changes.

The common Review view calls the existing pure occurrence, validation, conflict, and warning-gate modules. It does not persist derived results and does not share code with a future wallpaper renderer. See `docs/creation-and-review.md` for route and interaction details.
