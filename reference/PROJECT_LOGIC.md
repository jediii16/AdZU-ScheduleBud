# AdZU ScheduleBud: Complete Project Logic

## Project context

AdZU ScheduleBud is a browser-only schedule-processing application for Ateneo de Zamboanga University students. Its main responsibility is to transform several possible schedule sources into one canonical data model, validate that model, calculate a weekly timetable, preserve the workspace locally, and export it as a wallpaper-sized PNG or PDF.

There is no backend, account system, database server, or cloud synchronization. Everything happens on the user's device.

The overall process is:

```text
Portal XLSX / Curriculum / Custom entry
                  ↓
        Canonical subject model
                  ↓
      Meeting validation + conflicts
                  ↓
       Week and timetable calculation
                  ↓
      Design/canvas configuration
                  ↓
         PNG or PDF generation
```

## 1. Canonical data model

Regardless of how a schedule is created, the application converts it into this conceptual structure:

```js
Subject {
  id
  code
  name
  units
  section
  enabled
  isCustom
  importMetadata
  meetings: Meeting[]
}

Meeting {
  id
  days: ["Mon", "Thu"]
  startTime: "08:00"
  endTime: "09:30"
  room
  professor
}
```

This is the central architectural decision in the project. A curriculum subject, imported portal class, or manually created class becomes the same kind of subject. Validation, conflict detection, schedule calculation, persistence, duplication, and export therefore do not need separate implementations for every source.

A subject can contain multiple meetings. For example, one subject may contain a Monday/Thursday lecture, a Wednesday laboratory, and a separate Saturday session.

## 2. Schedule creation paths

### 2.1 Curriculum-based creation

The project contains a static new-curriculum dataset with only the information needed for scheduling:

- Program
- Year level
- Semester
- Subject code
- Subject name
- Units

The selection logic derives which years and semesters are available by examining dataset keys in the form:

```text
courseId-yearId-semesterId
```

When a semester is selected:

1. The matching curriculum array is loaded.
2. Every subject receives a deterministic ID.
3. Every subject is normalized into the canonical subject model.
4. A default meeting is created for each subject.
5. Subjects are enabled by default.
6. Regular subjects can be disabled and irregular/custom subjects can be added.

Changing a parent selection clears dependent state:

- Changing the course clears the selected year, semester, and subjects.
- Changing the year clears the selected semester and subjects.
- Changing the semester replaces the subject list with the selected curriculum term.

### 2.2 Portal XLSX import

Portal import is completely local. Workbook bytes are read inside the browser and are never uploaded.

The selected file must:

- End in `.xlsx`.
- Be no larger than 5 MB.
- Contain the required first-row headers:
  - `Current Subject`
  - `Section`
  - `Day`
  - `Time`
  - `Room`
  - `Instructor`
  - `School Year`
- It may optionally contain `Session`.

The workbook reader reads the first worksheet and passes its rows to the portal parser.

The parser performs the following operations:

1. Normalizes headers by removing spaces and punctuation and converting them to lowercase.
2. Supports aliases such as `Days` for `Day` and `Professor` for `Instructor`.
3. Rejects the workbook if a required column is absent.
4. Removes completely blank data rows.
5. Skips rows with no subject code while producing a warning.
6. Groups rows by subject code and section.
7. Converts repeated rows in one group into multiple meetings for the same subject.
8. Preserves rooms, instructors, raw times, session values, and original row numbers as import metadata.

Subject identity resolution follows this priority order:

1. A matching subject from the currently selected curriculum term.
2. A globally unambiguous curriculum match with the same code, name, and units.
3. One of seven temporary legacy compatibility records.
4. A custom subject using the imported code as its name and zero units.

Importing is transactional from the application's perspective. Parsing creates a pending review result but does not immediately change the saved workspace. The existing workspace is replaced only after explicit confirmation.

After confirmation:

- Existing subjects are replaced atomically.
- The application moves to schedule verification.
- Most design settings return to their defaults.
- The imported school-year value becomes the term label when one is available.

### 2.3 Custom creation

Starting from scratch creates one normalized subject:

```text
Code: CUSTOM
Name: Untitled class
Units: 0
One default meeting
```

Additional subjects and meetings use the same store operations as imported and curriculum subjects.

## 3. Portal day and time parsing

Portal days are decoded longest-token-first.

Supported tokens include:

```text
M   → Monday
T   → Tuesday
W   → Wednesday
TH  → Thursday
F   → Friday
S   → Saturday
SAT → Saturday
```

Separators such as spaces, commas, slashes, semicolons, pipes, and hyphens are removed before decoding.

Examples:

```text
MTH → Monday + Thursday
TF  → Tuesday + Friday
SAT → Saturday
```

Longest-token-first decoding ensures that `TH` is recognized before `T`, and `SAT` before `S`. Unknown characters are not silently interpreted as days; they produce an import warning.

Portal times must follow a 12-hour range such as:

```text
8:05 AM - 9:30 AM
```

The parser:

- Converts the range to 24-hour `HH:mm` values.
- Preserves the exact minutes.
- Rejects malformed values.
- Rejects an end time equal to or earlier than the start time.
- Rejects imported meetings outside 7:00 AM to 9:00 PM.

An invalid imported row is still retained. It becomes an intentionally incomplete meeting with no selected days and an invalid equal start/end time, while retaining its room and instructor. This allows the user to repair the class instead of silently losing it.

## 4. Subject and meeting operations

The central store provides controlled operations instead of allowing application code to mutate saved objects directly.

Subject operations include:

- Enable or disable a subject.
- Edit its code, name, section, and units.
- Add a custom subject.
- Remove a subject.
- Duplicate a subject.

Duplicating a subject creates:

- A new subject ID.
- New IDs for every copied meeting.
- Independent day arrays.
- A `duplicatedFrom` reference in import metadata when applicable.

Consequently, editing a duplicate does not modify the original subject or its meetings.

Meeting operations include:

- Add a meeting.
- Edit days, times, room, and professor.
- Toggle an individual day.
- Duplicate a meeting.
- Remove a meeting.

The final meeting belonging to a subject cannot be removed. This preserves the invariant that every subject has at least one editable meeting.

## 5. Meeting validation

A meeting is complete only when:

- It has at least one selected day.
- Its start time is valid.
- Its end time is valid.
- Its end time is later than its start time.

Room and professor are optional.

Incomplete meetings remain in the workspace so they can be fixed, but they are excluded from timetable occurrence and positioning calculations.

The normal meeting editor provides five-minute time choices from 7:00 AM through 9:00 PM.

## 6. Conflict detection

Conflict detection first expands every complete meeting into one entry for every actual day.

For example:

```text
Meeting: Mon + Thu, 08:00–09:00
```

becomes:

```text
Monday, 08:00–09:00
Thursday, 08:00–09:00
```

The algorithm compares every pair of expanded entries. Two entries conflict when:

- They occur on the same day.
- They are not the same meeting.
- Their time intervals have a positive intersection.

The shared interval is calculated as:

```js
overlapStart = Math.max(left.start, right.start);
overlapEnd = Math.min(left.end, right.end);
```

A conflict exists when:

```js
overlapStart < overlapEnd;
```

Back-to-back meetings such as 9:00–10:00 and 10:00–11:00 are therefore valid and do not conflict.

Disabled subjects and incomplete meetings are ignored during conflict detection.

Every conflict records:

- Both subject IDs and codes.
- Both meeting IDs.
- The conflicting day.
- The exact shared start and end time.

## 7. Warning and acknowledgement behavior

Warnings are intentionally implemented as soft gates.

During verification:

- A subject is complete only if every meeting belonging to it is complete.
- Conflicts and incomplete subjects are counted.
- Attempting to continue for the first time exposes the warning acknowledgement state.
- Attempting to continue again allows the user to proceed despite the warnings.

During export:

- Export is initially blocked when an enabled subject is incomplete or a conflict exists.
- The user can explicitly acknowledge the warning.
- Export then becomes available without forcing the underlying data to be corrected.

This protects against accidental bad exports while still allowing legitimate irregular or unfinished schedules to be saved deliberately.

## 8. Week interpretation

There are two logical week modes.

Full-week mode expands meetings into six independent columns:

```text
Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
```

Compact-week mode uses AdZU-style groups:

```text
M/TH, T/F, W, S
```

Compact mode only collapses exact pairs:

- Exactly Monday and Thursday becomes one `M/TH` occurrence.
- Exactly Tuesday and Friday becomes one `T/F` occurrence.

It does not invent paired meetings. A Monday-only meeting remains explicitly Monday-only inside the `M/TH` group. Other irregular combinations are split according to their actual days and marked as irregular.

Incomplete and disabled meetings are excluded. Empty display days can optionally be hidden without changing the underlying subject or occurrence data.

## 9. Time range calculation

The schedule derives its visible time range from complete meetings.

The automatic calculation:

1. Finds the earliest start time.
2. Finds the latest end time.
3. Rounds the start down to the previous hour.
4. Rounds the end up to the next hour.
5. Clamps the automatic result between 7:00 AM and 9:00 PM.

When no complete meetings exist, the default range is:

```text
7:00 AM–6:00 PM
```

A valid manual start and end range overrides the automatic range. An invalid manual range safely falls back to the automatic calculation.

## 10. Overlapping timetable placement

For time-positioned schedules, classes are placed proportionally according to their start and end times.

For each displayed day or compact-week group:

1. Entries are sorted by start time and then end time.
2. Entries that have already finished are removed from the active set.
3. Each new entry receives the first unused horizontal column number.
4. Connected overlap clusters are identified.
5. Every entry in a cluster receives the cluster's maximum column count.
6. Each entry's width becomes `100 / columnCount`.

Overlapping classes are therefore placed side by side instead of covering one another.

Vertical position is calculated from the number of minutes between the meeting's start and the visible schedule start. Meeting height is calculated from duration. A minimum block height prevents very short meetings from becoming unusably small.

## 11. Renderer-independent schedule logic

The meaning of the schedule is separated from its renderer. The project provides five schedule interpretations:

- Grid: a time-positioned weekly timetable.
- Minimal: a chronological list grouped by day.
- Cards: class entries grouped by day.
- Planner: a structured weekly agenda.
- Photo: a schedule combined with up to two saved photos.

All renderers receive the same:

- Enabled subjects.
- Schedule details.
- Resolved design configuration.
- Logical output canvas.

They reuse the same week occurrences, conflict keys, chronological ordering, time formatting, and subject color rules. An unknown renderer ID safely falls back to Grid.

The live schedule representation and exported file use the same renderer. This prevents export logic from interpreting the schedule differently from the saved configuration.

## 12. Design configuration as data

The schedule's customization is stored as a serializable configuration object rather than being encoded directly into individual schedule records.

It includes values such as:

- Layout and week interpretation.
- Clock format.
- Density and field visibility.
- Subject color assignment.
- Selected template.
- Background configuration.
- Canvas preset and dimensions.
- Schedule vertical position.
- Manual time range.
- Uploaded image asset IDs.
- Photo crop transforms.

The design resolver converts this configuration into one normalized design result. Invalid or obsolete configuration IDs fall back to safe defaults.

Subject colors support:

- Automatic palette cycling.
- One color for all subjects.
- Per-subject custom colors.

Templates apply complete configurations atomically. If a template-controlled property is manually changed afterward, the saved `templateId` is cleared because the resulting configuration is now custom.

Resetting the design restores default design properties while preserving canonical schedule content and the selected canvas.

## 13. Canvas and compatibility rules

Logical canvas presets include:

- Phone
- Tablet
- Laptop
- Desktop
- Square
- Custom

Custom dimensions are clamped between 320 and 2400 pixels. Orientation swaps width and height when necessary.

Safe-area information is calculated according to the target canvas. These guides are preview-only metadata and are excluded from exports.

Some configuration combinations are corrected automatically to keep schedule content readable:

- Phone canvases are locked to portrait.
- Laptop and desktop canvases are locked to landscape.
- Tablet and custom canvases can change orientation.
- Grid and Planner are unavailable on restricted phone/tablet portrait canvases.
- Detailed density is restricted in portrait.
- Large text imposes stronger density and visible-field limits.
- Instructor and other crowded fields may be disabled in restricted combinations.
- An incompatible layout falls back to Cards.

Schedule vertical placement supports:

- Top
- Center
- Balanced device-aware positioning
- A custom percentage

Custom vertical percentages are clamped from 0 to 100.

## 14. Image storage

Uploaded images are not stored directly inside the main persisted workspace because binary blobs would make it large and unreliable.

Instead:

1. The selected file is validated as an image.
2. A record containing its ID, metadata, and binary blob is stored in IndexedDB.
3. Only the generated asset ID is stored in the schedule workspace.
4. When the image is needed, its record is retrieved.
5. A temporary browser object URL is created.
6. The URL is revoked when it is no longer needed.

Replacing or explicitly removing an image deletes the previous IndexedDB record.

Photo transforms are stored independently for two curated photo slots. Each transform contains:

```js
{
  x: 50,
  y: 50,
  zoom: 100
}
```

Horizontal and vertical positions are clamped from 0 to 100. Zoom is clamped from 100 to 250. Missing or malformed transforms return to a centered, unstretched crop.

A current cleanup limitation is that replacing or resetting the entire workspace can clear an image ID without necessarily deleting the associated IndexedDB record, potentially leaving an orphaned local asset.

## 15. Local persistence and migration

The main workspace is persisted under the local storage key:

```text
adzu-schedule-studio
```

The current workspace schema version is 13.

Persisted information includes:

- Current workflow stage.
- Curriculum selections.
- Subjects and meetings.
- Schedule configuration.
- The mobile edit/preview preference.
- The application theme.

The landing/studio-entry flag is intentionally not persisted. A fresh visit begins outside the studio while the saved schedule remains available.

Migration logic:

- Rejects state from an unsupported future schema version.
- Rejects malformed state without a subjects array.
- Converts the previous single `schedule` field into a `meetings` array.
- Regenerates missing IDs.
- Normalizes meeting days and fields.
- Adds missing configuration defaults.
- Clamps invalid stage and schedule-position values.
- Preserves imported metadata where possible.

A full workspace reset returns schedule data to its initial state while retaining the currently selected application theme.

## 16. Export pipeline

Before capturing the schedule, the export process waits for:

- Document fonts.
- Image element decoding.
- Images referenced through CSS backgrounds.

The logical schedule canvas is captured at:

- Standard quality: 2× scale.
- High resolution: 3× scale.

The primary capture path attempts a DOM-to-canvas conversion. iOS and Safari use the fallback capture path directly, and other browsers fall back to it if the primary method fails.

A cloned export tree is prepared by:

- Removing export-excluded elements such as safe-area guides.
- Removing preview-only scaling.
- Disabling browser-dependent backdrop filters.
- Replacing glass and pattern surfaces with stable export-safe equivalents.

PNG export creates an in-memory PNG URL and triggers a local download.

PDF export:

1. Uses the same rendered schedule image.
2. Creates one PDF page.
3. Uses the logical canvas dimensions rather than a standard paper size.
4. Chooses portrait or landscape from the canvas dimensions.
5. Fills the entire page with the generated schedule image.

The resulting PDF is therefore a canvas-sized, raster-backed, single-page document.

An export lock ignores repeated export requests while a capture is already running.

Filename rules are:

- Desktop PNG: `adzu-schedule.png`
- Other canvas PNGs: `adzu-schedule-{device}.png`
- PDF with a recognized academic year: `adzu-schedule-{startYear}-{endYear}.pdf`

## 17. Privacy and system boundaries

The project's privacy model is straightforward:

- Workbook parsing happens locally.
- Schedule state is stored locally.
- Images are stored locally in IndexedDB.
- Export happens locally.
- Uploaded bytes are not sent to a server.
- There is no authentication.
- There is no remote backup.
- There is no cross-device synchronization.
- Clearing the browser's site data can erase the workspace and saved image assets.

## 18. Important behavioral guarantees

The core logic is designed around several invariants:

- Every schedule source becomes the same subject-and-meetings model.
- Every subject retains at least one meeting.
- Duplicated subjects and meetings receive independent identities.
- Imported data does not replace the workspace until confirmation.
- Invalid imported rows remain repairable instead of being discarded.
- Disabled and incomplete meetings do not affect timetable calculations.
- Back-to-back meetings are not conflicts.
- Compact-week mode never invents paired meetings.
- The same schedule interpretation is used for preview and export.
- Unsupported persisted state falls back to safe defaults.
- Warnings require deliberate acknowledgement but are not permanent blockers.

## 19. Current verification status

The complete automated test suite currently reports:

```text
195 tests passed
1 test failed
```

The one failure is a stale landing-page content assertion expecting the exact text:

```text
Upload → Customize → Download
```

That text is no longer present in the current landing content. The failure is not in curriculum loading, portal import, meeting validation, conflict detection, persistence, schedule calculation, rendering, image storage, or export logic. The other 24 test files pass.
