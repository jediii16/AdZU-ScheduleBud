# Creation and review flow

## Routes

| Route                   | Purpose                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `/`                     | Product introduction or restrained returning-project state.                                 |
| `/create`               | Select Portal, curriculum, or manual creation.                                              |
| `/create/portal`        | Local XLSX selection, parsing, repair, and confirmation.                                    |
| `/create/curriculum`    | Current-program, supplied-year, and supplied-term selection.                                |
| `/create/manual`        | Manual class entry and common class editing.                                                |
| `/create/manual?edit=1` | Edit the active project without starting another project.                                   |
| `/review`               | Chronological schedule review, incomplete meetings, conflicts, and warning acknowledgement. |
| `/studio`               | Phase 3 handoff placeholder only; no renderer or artboard.                                  |

## Project creation policy

Opening a creation route does not mutate project storage. Portal and curriculum drafts remain local to their route until explicit confirmation; manual entry creates or reuses a project only when the first class is added.

An active empty project is safe to reuse. If the active project already contains classes, starting a new Portal, curriculum, or manual flow creates a separate project. Further manual classes stay in the project created by that same flow. Editing from Review uses the explicit `edit=1` route and updates the active project. This prevents harmless navigation from creating records and prevents a new schedule from overwriting unrelated saved work.

## Portal flow

The file control and drag target accept `.xlsx` files up to 5 MB. Browser bytes go directly through SheetJS, the workbook adapter, and the Portal parser. Files are never uploaded, and Portal import never reads or resolves against the curriculum dataset.

Validation and parser exceptions are mapped to short student-facing messages. Missing columns are named; otherwise malformed workbooks suggest downloading a fresh Portal file. Development builds retain console diagnostics.

Parsing produces a local `PendingPortalImport`. The review lists subject/meeting totals, every subject, and every meeting. Warnings cover only workbook or schedule data and are aggregated by affected meeting or skipped row; the original row-specific metadata remains available under **Show details**. Invalid meetings remain editable. A workbook that supplies only a subject code produces a code-only subject with a blank friendly name and neutral zero-unit representation, without a warning. Each imported subject starts included and has an **Include in schedule** control. Exclusion preserves the complete pending subject and its imported metadata; confirmation carries it into the project with `enabled: false`. Cancel discards only the pending object. Confirm creates/reuses a safe project and atomically replaces its schedule through the validated store action.

## Curriculum flow

Only normalized current curriculum programs are imported. Desktop uses a searchable Base UI combobox; mobile uses a searchable full-width dialog picker. Year and semester controls are revealed in sequence and derived from the selected program’s real terms, so absent combinations cannot appear. Explicitly empty supplied terms display an explanation and cannot fabricate subjects.

Confirming a populated term creates canonical subjects with authoritative code, name, and units. Each subject receives one intentionally incomplete meeting. Days, times, section, room, and professor remain student-entered. Subjects can be included or excluded, edited, duplicated, or permanently removed through controlled store actions.

## Manual flow

The form groups subject identity separately from meetings. Day checkboxes are keyboard-accessible, time inputs use five-minute steps and the supported 07:00–21:00 boundary, and optional room/professor fields are clearly marked. Multiple draft meetings can be added before a class is committed. Incomplete meetings are allowed and remain repairable.

The class list separates **Included** and **Not included** rows with expandable editing. It supports inclusion changes, subject edits, meeting edits, additional meetings, duplication, and the distinct **Remove from project** action while preserving the last-meeting invariant. Inclusion changes and permanent removal enter undo history and autosave; exclusion retains the subject and allows later re-enabling.

## Common review

Review expands complete enabled meetings into actual days, groups Monday through Saturday, and sorts by exact start minute. It is an application review view, not a wallpaper renderer.

The summary reports included subjects, included meetings, and actionable issues. Disabled subjects are retained in the project but create no incomplete warnings, occurrences, conflicts, or timetable influence and do not appear in the chronological schedule. Incomplete enabled meetings are named and excluded from chronological placement. Conflicts list both subject codes, actual day, and exact shared interval. Back-to-back meetings remain valid.

Issues are warning-colored rather than destructive and link back to relevant class editing. When issues exist, `Fix issues` is the primary action. `Continue anyway` reveals a second explicit acknowledgement before opening the `/studio` placeholder. A valid schedule shows `Start designing` and proceeds immediately.

## Responsive and accessibility behavior

Layouts are single-column on mobile, with touch-sized controls, stacked actions, wrapping day controls, and no fixed-width review table. Desktop uses bounded content widths and two columns only where scanning benefits. Sticky review actions remain reachable and reserve `env(safe-area-inset-bottom)` spacing.

Pages use semantic headings, labeled controls, field-associated errors, native keyboard behavior, visible focus rings, text and icons for warnings, a normal file picker alongside drag/drop, polite autosave announcements, and reduced-motion-aware page transitions.

## Deliberate refinements

- The initial specification allowed a new project at route entry; Phase 3 defers creation until the first meaningful commit to avoid empty records.
- Curriculum selection uses the already-installed Base UI primitives: an anchored searchable combobox on desktop and a bottom-aligned dialog picker on mobile.
- Subject editing is shared through `/create/manual?edit=1` instead of duplicating a full editor inside Review.
- The only motion is a short page-content reveal that disables itself for reduced motion and automated tests.
- Native time fields were retained after responsive review. Their browser-provided keyboard/mobile behavior is paired with `min`, `max`, and `step=300`; canonical validation continues to keep incomplete or externally malformed times repairable.
