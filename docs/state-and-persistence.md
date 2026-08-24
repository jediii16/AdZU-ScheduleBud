# State and persistence contracts

## Persisted project

`ScheduleProject` schema version 1 is the portable JSON document for one schedule. It stores:

- identity, source/term/curriculum metadata, and creation/update timestamps;
- canonical schedule-domain subjects and meetings directly;
- shared project design, template provenance, wallpaper title, and optional labels;
- independent device variants and the selected variant ID;
- photo and screen-guide asset IDs, never Blob data.

`ProjectDesign` uses stable IDs for themes, variants, layouts, photo compositions, and fonts. Only Clean Slate is currently selectable. Applying a template keeps `baseTemplateId` and sets `templateModified` to false. Later template-controlled edits retain that ID and set `templateModified` to true.

Cards day visibility is persistent design intent and defaults to `scheduled-only`. Per-device “Snap to guides” is a preview preference; transient alignment-guide visibility and drag state remain editor-only and are never persisted or added to history. Only the final normalized schedule position is committed.

A device variant owns semantic category, exact dimensions, dimension provenance, orientation, composition, normalized schedule position, small design overrides, photo transforms, and preview preferences. Preview mode, safe areas, warnings, snapping, and guide IDs are structurally separate from export design.

## State boundaries

| Area                                                        | Persisted      | History | Notes                                                  |
| ----------------------------------------------------------- | -------------- | ------- | ------------------------------------------------------ |
| Project metadata                                            | Yes            | Yes     | Rename/reset are meaningful commits.                   |
| Subjects and meetings                                       | Yes            | Yes     | Uses canonical domain types and safe actions.          |
| Shared design                                               | Yes            | Yes     | Template provenance is preserved.                      |
| Device composition and photo crop                           | Yes            | Yes     | Positions are normalized; drag uses transactions.      |
| Preview mode/guides/safe-area preferences                   | Yes            | No      | Preview-only and excluded from export by construction. |
| Active device variant                                       | Yes            | No      | Selection does not destroy any variant.                |
| Editor selection, inspector, zoom, pan, drag flag           | No             | No      | Session/UI state only.                                 |
| Conflicts, occurrences, ranges, overlap layout, RenderModel | No             | No      | Recomputed by pure selectors/builders.                 |
| Undo/redo stacks and active transaction                     | No             | N/A     | Bounded in-memory state.                               |
| Asset Blob data                                             | Separate table | No      | Project JSON holds IDs only.                           |

The store exposes explicit slice actions instead of a public generic mutation operation. Domain invariants therefore remain enforced: subjects get a default meeting, the last meeting cannot be removed, and duplicates receive independent IDs.

## Dexie and repositories

Database version 1 has:

- `projects`: `id`, `updatedAt`, and a validated JSON payload;
- `assets`: `id`, `projectId`, kind, Blob, MIME type, dimensions, timestamp, and optional filename;
- `applicationMetadata`: typed preferences such as the active project ID.

`ProjectRepository`, `AssetRepository`, and `ApplicationMetadataRepository` hide Dexie tables from state and future UI. Every project write validates and JSON-round-trips the record. Every read enters the migration pipeline and returns a typed result rather than throwing corrupt content into application state.

Photos and screen guides are different asset kinds. A screen guide can be attached only as preview metadata and is never exportable content. Image-dimension inspection is session-only; `saveScreenGuide()` is an explicit second operation. Reference utilities identify safe garbage-collection candidates. Project deletion cancels pending autosave, deletes the project record, then deletes all assets owned by that project.

## Autosave and history

Persistent mutations update in-memory state immediately, mark autosave idle/dirty, and replace the project’s pending snapshot. After the debounce, writes enter one serialized promise queue. This ordering guarantees latest-write-wins behavior even when an earlier IndexedDB request is slow. Successful writes expose `saved` and `lastSavedAt`; failures expose `error` without rolling back working state.

History keeps 50 meaningful `{before, after}` project commits. A new edit clears redo. Undo and redo restore project content, refresh `updatedAt`, and enqueue autosave. `beginHistoryTransaction()` captures the starting project; intermediate changes update only memory; `commitHistoryTransaction()` records and persists one final result; cancellation restores the starting snapshot.

History, autosave coordinators, repository instances, and all editor state are outside serialized `ScheduleProject` JSON.

Phase 5 required no project-version increment: schema 1 already supports all five semantic categories, three dimension sources, multiple variants per category, preview modes, and guide asset references. New targets receive stable variant IDs; existing Phone/Desktop IDs, positions, and preferences are not rewritten.

## Migration boundary

`migrateProject()` is the single entry for persisted documents. Schema 1 is validated directly. Unknown versions are reported as unsupported, leaving room for ordered future migrations. `detectLegacyWorkspace()` recognizes legacy schema 13, while `migrateLegacyWorkspaceToV2()` explicitly declines conversion until an authoritative serialized legacy shape exists.
