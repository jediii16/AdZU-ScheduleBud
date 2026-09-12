# AdZU ScheduleBud 2.0

AdZU ScheduleBud is a local-first schedule wallpaper generator for Ateneo de Zamboanga University students. It turns a Portal export, curriculum selection, or manually entered classes into a customizable wallpaper for phones, tablets, laptops, desktops, and square displays.

Schedule data, imported files, photos, and generated assets stay in the browser. The application has no account system, backend, remote database, or synchronization service.

## Features

- Import a schedule from an `.xlsx` workbook, a `.pdf` schedule table, or text copied from a student portal (maximum file size: 5 MB).
- Start from the bundled current AdZU curriculum or enter classes manually.
- Review incomplete meetings, schedule conflicts, and import warnings before designing.
- Include, exclude, duplicate, edit, and remove subjects without losing the canonical schedule structure.
- Design with Cards, Minimal, Grid, Planner, and Photo layouts.
- Choose from 12 built-in themes or create a custom palette.
- Customize typography, subject colors, visible class details, schedule sizing, backgrounds, photos, and stickers.
- Use solid, gradient, patterned, emoji, or uploaded-image backgrounds.
- Target preset or custom phone, tablet, laptop, desktop, and square dimensions, or infer dimensions from a screenshot with Match My Screen.
- Preview conservative device safe areas and OS chrome without including those guides in the exported image.
- Reposition the schedule and editable visual elements directly on the canvas, with undo and redo.
- Autosave multiple projects locally with browser IndexedDB.
- Export the full wallpaper, schedule-only layer, or background-only layer as an exact-size PNG.
- Export every configured device size together as a ZIP archive.

## Tech stack

| Area             | Technology                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| Application      | Next.js 16 App Router, React 19, TypeScript 5.9                         |
| Styling and UI   | Tailwind CSS 4, Base UI, shadcn, Lucide React, Motion                   |
| State            | Zustand 5 with domain-specific slices and in-memory undo/redo history   |
| Persistence      | Dexie 4 over IndexedDB                                                  |
| Validation       | Zod 4                                                                   |
| Canvas rendering | Konva 10 and React Konva 19                                             |
| Imports          | SheetJS for XLSX, PDF.js for PDF, custom parsers for pasted Portal text |
| Export           | Konva PNG rendering, fflate ZIP generation                              |
| Testing          | Vitest, Testing Library, jsdom, fake-indexeddb, Playwright              |
| Tooling          | ESLint 9, Prettier 3, npm                                               |

## Requirements

- [Node.js](https://nodejs.org/) 20.9 or newer
- npm (the repository includes `package-lock.json`)
- A modern browser with IndexedDB, Canvas, Web Workers, and Blob download support

Chromium is the automated end-to-end test target.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables or external services are required for local development.

For a production build:

```bash
npm run build
npm start
```

## Available scripts

| Command                | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start the Next.js development server.       |
| `npm run build`        | Create a production build.                  |
| `npm start`            | Serve the production build.                 |
| `npm run lint`         | Lint the repository with ESLint.            |
| `npm run typecheck`    | Run TypeScript without emitting files.      |
| `npm test`             | Run unit and integration tests once.        |
| `npm run test:watch`   | Run Vitest in watch mode.                   |
| `npm run test:e2e`     | Run Playwright end-to-end and visual tests. |
| `npm run format`       | Format supported files with Prettier.       |
| `npm run format:check` | Check formatting without changing files.    |

Install the Playwright Chromium binary before the first end-to-end test run if it is not already present:

```bash
npx playwright install chromium
npm run test:e2e
```

A useful full local verification pass is:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Application flow

| Route                   | Purpose                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| `/`                     | Landing page and local project library.                                      |
| `/create`               | Choose an import or creation method.                                         |
| `/create/portal`        | Import PDF/XLSX files or pasted Portal text, then review parsed classes.     |
| `/create/curriculum`    | Select a program, year level, and supplied term from the bundled curriculum. |
| `/create/manual`        | Build a schedule manually.                                                   |
| `/create/manual?edit=1` | Edit the active project's classes.                                           |
| `/review`               | Review meetings, incomplete entries, conflicts, and warnings.                |
| `/studio`               | Customize device targets and wallpaper design, then export.                  |

All three creation paths normalize into the same schedule domain before review and rendering.

## Architecture

```text
PDF / XLSX / pasted text / curriculum / manual entry
                            |
                    canonical schedule
                            |
              validation and occurrences
                            |
            project design + device variant
                            |
                    plain RenderModel
                            |
                 shared Konva renderer
                   /               \
             scaled preview     exact PNG export
```

The main boundaries are:

- `src/app` — thin Next.js route entries and global styles.
- `src/features` — creation, review, Studio, and export application behavior.
- `src/domain` — framework-independent schedule, import, project, device, render, and sticker logic.
- `src/state` — the composed Zustand store, selectors, history, and React provider.
- `src/storage` — Dexie database definitions, repositories, autosave, and binary assets.
- `src/renderer/konva` — shared preview/export scene and editor-only overlays.
- `src/data` — validated curriculum data and registries for devices, layouts, themes, typography, emojis, and stickers.
- `public` — brand, device-preview, theme, and Fluent Emoji assets.
- `tests` — unit, integration, Playwright, fixture, and visual-regression coverage.
- `scripts` — reproducible curriculum and emoji data-generation utilities.

Domain code produces target-pixel geometry without depending on React, Zustand, or Konva. Preview scaling is only a view transform; exact-size export uses the same render model. Safe-area guides, selections, handles, and other editor overlays are structurally separate from exportable layers.

## Local data and privacy

ScheduleBud is browser-only and local-first:

- Projects are stored in IndexedDB through Dexie.
- Project JSON and binary assets are stored separately.
- Uploaded photos are exportable project assets; uploaded screen guides are preview-only.
- PDF, XLSX, pasted text, screenshots, and photos are processed locally and are not uploaded by this application.
- Autosave is debounced and serialized so a slower old write cannot overwrite a newer project state.
- Undo/redo history and temporary editor state live only in memory.
- Clearing site data or browser storage removes locally saved ScheduleBud projects. There is currently no cloud backup or cross-device sync.

## Import and export notes

Portal parsing expects a recognizable schedule table and supports common aliases for subject code, section, day, time/schedule, room, instructor, units, and school year. Invalid or incomplete meetings are retained for repair when possible instead of being silently discarded. Portal imports are authoritative and do not need to match the bundled curriculum.

The renderer exports at the selected device's exact pixel dimensions. Preview zoom does not affect the PNG. Export can include the complete wallpaper, only the schedule layer, or only the background/design layers. Multi-device export packages one PNG per configured variant into a ZIP file.

## Project model and persistence

The persisted `ScheduleProject` schema stores project metadata, canonical subjects and meetings, shared design settings, independent device variants, and references to binary assets. Derived information—such as conflicts, occurrences, layout geometry, safe-area collisions, and render models—is recalculated and is not persisted.

Each device variant keeps its own dimensions, orientation, layout overrides, schedule position, photo transforms, and preview preferences. Meaningful project changes enter a bounded in-memory history and the autosave queue; preview-only selections, zoom, pan, and active drag state do not.

## Data maintenance

Normalize the checked-in current curriculum source into one validated JSON file per program:

```bash
node scripts/normalize-curriculum.mjs
```

Refresh the emoji catalog metadata from the checked-in Unicode source:

```bash
node scripts/enrich-emoji-catalog.mjs
```

Import a fresh Microsoft Fluent Emoji checkout and record its source commit:

```bash
node scripts/import-fluent-emoji-assets.mjs <path-to-fluentui-emoji> <commit-sha>
```

See [`src/data/emojis/README.md`](src/data/emojis/README.md) before replacing the emoji assets.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — domain boundaries and design decisions.
- [`docs/creation-and-review.md`](docs/creation-and-review.md) — creation routes and review behavior.
- [`docs/state-and-persistence.md`](docs/state-and-persistence.md) — persisted state, Dexie, autosave, and history contracts.
- [`docs/studio-rendering.md`](docs/studio-rendering.md) — renderer, preview, and export architecture.
- [`docs/devices-and-safe-areas.md`](docs/devices-and-safe-areas.md) — device variants and editor-only guides.
- [`docs/layouts/`](docs/layouts/) — layout-specific geometry notes.
- [`docs/source-data-report.md`](docs/source-data-report.md) — curriculum and sanitized Portal fixture provenance.

## Current boundaries

- Data is stored per browser and device; there is no authentication, cloud sync, or collaboration.
- PNG is the image export format; multi-device exports are packaged as ZIP files.
- Safe areas are conservative generic guides, not a comprehensive model-specific device database.
- Imported schedules still require user review because portal formats and malformed rows can vary.
- Automated browser coverage currently targets Chromium.

## Asset licensing

The bundled Fluent Emoji Color SVG artwork comes from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) and is distributed under the MIT License; its license is included at [`public/emojis/fluent/LICENSE.txt`](public/emojis/fluent/LICENSE.txt). The Unicode emoji data license is included at [`source-data/unicode/LICENSE.txt`](source-data/unicode/LICENSE.txt).

This repository does not currently include a top-level license for the ScheduleBud source code.
