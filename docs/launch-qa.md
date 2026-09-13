# Phase 8Q launch QA

Date: 2026-09-13

## Areas checked

- Home, templates, all three creation routes, pasted schedule import, workbook import, review gates, and reopening a saved project.
- Studio Classes, Design, Device, undo/redo, exact-device switching, custom/matched targets, safe areas, photos/backgrounds/stickers, and PNG/ZIP export.
- Local persistence across refresh, project reopening, exact-device changes, and an IndexedDB-backed background image.
- Desktop, narrow desktop, tablet, and mobile layouts; keyboard shortcuts, inspector/device dialogs, named controls, focusable actions, and horizontal overflow.
- Static theme/device/sticker assets, typography loading, browser/server errors, TypeScript, ESLint, unit/integration tests, focused Playwright flows, and production build.

## Important issues found and fixed

- **P1 — last-second edits could be lost on refresh.** Debounced IndexedDB autosave now flushes when an edited field loses focus and at page lifecycle boundaries. It does not flush on every click. A regression test covers immediate title refresh, immediate device refresh, background-asset refresh, and reopening the project.
- **P1 — unreadable local records failed silently.** Invalid/newer saved records show a quiet, dismissible notice within Home's “Your schedules,” never over Studio. Storage-open errors remain visible globally. Records are left untouched, and a dismissed record notice stays dismissed until the set of unreadable records changes.
- **P1 — compact phone Grid hid an unavailable field without explanation.** The Section row now explains that it is available on larger Grid devices; the control remains absent where it cannot render.
- Removed routine autosave status copy and its full-editor subscription; save failures remain visible. Removed the unintended generic clock/date overlay from iPad previews.
- Updated stale device-picker and sticker-catalog assertions to match the current preset-per-device and template-sticker implementation.

## Status

- Creation/review, project reopen, device-specific state, undo/redo, responsive shells, and representative export paths passed automated and browser checks.
- Phone/Desktop PNG dimensions, schedule/background content export, and multi-size ZIP behavior passed focused end-to-end checks. Uploaded image state and per-device background crops survive switching and reload.
- No page errors or missing launch assets were found. Development logs contain a Konva advisory about six canvas layers; tested interactions and exports remained responsive and correct.

## Known limitations / final manual checks

- **Phase 8R production follow-up:** the immediate-title-refresh test passed in development but failed against `next start`. The blur/unload flush is not a guarantee of completed IndexedDB persistence. See `production-launch.md`; this remains a launch blocker pending a reliable fix.

- There is no representative Portal PDF fixture in the repository. PDF extraction has focused unit coverage and the live upload/error UI was inspected, but a real current Portal PDF should be imported manually before launch.
- Projects and uploaded assets intentionally remain local to the current browser. Clearing site data or using ephemeral/private storage can remove them.
- The exhaustive visual-snapshot matrix was not regenerated in this phase. Perform final visual review on target devices, especially custom fonts, long real schedules, uploaded photos, lock-screen overlays, and downloaded wallpapers.
- This QA pass is not final launch approval; complete the manual checklist in the Phase 8Q handoff.
