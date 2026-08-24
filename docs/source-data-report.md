# Source data inspection report

## Materials inspected

- `reference/PROJECT_LOGIC.md` — read completely as the product behavior specification.
- `source-data/curriculum/courses.js` — the only curriculum source file found.
- `source-fixtures/portal/my-real-portal-schedule.xlsx` — the only Portal workbook found; inspected locally and excluded by `.gitignore`.
- `source-assets/brand` and the theme subdirectories — present but empty at inspection time.

No source material was modified or copied into public assets.

## Current curriculum findings

The source module declares course metadata, year labels, semester labels, separate current/new and old subject maps, honors-system compatibility helpers, and lookup functions. ScheduleBud reads only `SUBJECTS_BY_COURSE_YEAR_NEW`.

Current/new data statistics:

- 32 declared programs;
- 365 explicitly supplied program/year/semester keys;
- 332 populated terms and 33 explicitly empty terms;
- 1,939 subject rows;
- no malformed subject rows (all have string code/name and numeric units);
- no exact duplicate subject rows within a term;
- no current-map program IDs missing from course metadata and no course metadata IDs wholly absent from the current map.

Nineteen of the theoretical 384 four-year/three-term combinations are not supplied. They were not invented: `bsn-stem-1-3`, `bsn-stem-3-3`, `bsn-stem-4-3`, `bsn-nonstem-3-3`, `bsn-nonstem-4-3`, `bscs-4-3`, `bsit-4-3`, `bsnmca-4-3`, `aeet-2-3`, all AEET third- and fourth-year terms, `bsbiomed-4-3`, `bscpe-4-3`, `bsece-4-3`, and `bsac-nonabm-4-3`.

The source uses an additional `countForGPA` field on 128 current subject rows. It is intentionally omitted from the normalized ScheduleBud data because GPA calculation is outside this product's domain.

Forty-two subject codes have more than one supplied name and/or unit definition across programs and terms. Many are punctuation or wording variants, while some are materially different courses or unit values. Examples include `ENG.132`, `ENG.321`, `MAT 106`, `THESIS1`, `FINACC1`, and `ACCAPS 1`. The normalizer preserves every term's supplied values. This ambiguity matters only inside the separate curriculum creation flow: Portal import deliberately performs no curriculum lookup because an enrolled Portal schedule is authoritative and may legitimately contain codes outside the static dataset.

Normalized output is under `src/data/curriculum/programs`, one JSON file per program, with deterministic IDs inherited from the supplied current program IDs. `src/data/curriculum/schema.ts` provides Zod validation and development-time error messages.

## Portal workbook findings

The real workbook contains one worksheet named `Sheet1`. Its used range is eight rows by eight columns, with the header on row 1 and seven nonblank data rows.

Exact relevant headers, in order:

1. `Current Subject`
2. `Section`
3. `Day`
4. `Time`
5. `Session`
6. `Room`
7. `Instructor`
8. `School Year`

`Session` cells are numeric in the supplied workbook. The other populated fields are strings. Representative verified day formats are `MTH`, `TF`, and `W`. Verified time formatting uses 12-hour clock values with exact minutes, uppercase meridiem, spaces, and a hyphen separator. The workbook includes morning-only, morning-to-afternoon, and afternoon-only ranges.

The supplied workbook has blank values in Day, Room, and Instructor in at least one row. It also contains one structurally useful invalid meeting with a blank day and an equal, out-of-supported-hours range. That confirms malformed meetings must be retained for repair. No repeated subject/section group appears in this small workbook, so multiple-meeting behavior comes from the product specification rather than an invented claim about this file.

This report intentionally excludes subject codes, instructor names, rooms, school-year values, and exact real meeting times from the sensitive workbook.

## Sanitized fixtures

The following fictional workbooks were generated under `tests/fixtures/portal` with the verified sheet/header/cell-type structure:

- `portal-normal.xlsx` — valid `MTH`, `TF`, and `W` rows with exact-minute ranges;
- `portal-multiple-meetings.xlsx` — repeated subject/section rows that must group into independent meetings, plus `SAT`;
- `portal-edge-cases.xlsx` — blank day/optional fields, equal out-of-hours time, unknown day token, alias-friendly separators, a missing subject code, and a blank row.

All names, subjects, rooms, and academic years in these fixtures are fictional. The fixtures contain no copied personal student information or real schedule values.

The automated integration suite reads only these three sanitized fixture paths. It exercises XLSX bytes through SheetJS, the first-worksheet adapter, row parsing, grouping, numeric session metadata, repair warnings, blank-row removal, and missing-subject handling; it has no dependency on the private source workbook.
