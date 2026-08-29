"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  LoaderCircle,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PageShell } from "@/components/shell/page-shell";
import { PageReveal } from "@/components/shared/page-reveal";
import { IssueNotice } from "@/components/shared/issue-notice";
import { LocalPrivacyNote } from "@/components/shared/local-privacy-note";
import { Button } from "@/components/ui/button";
import { MeetingFields, meetingSummary } from "@/features/classes/class-editor";
import {
  parsePortalWorkbook,
  PortalImportError,
  validatePortalFile,
  type PendingPortalImport,
  type PortalImportWarning,
} from "@/domain/import";
import {
  detectConflicts,
  type Meeting,
  type ScheduleDay,
  type Subject,
} from "@/domain/schedule";
import { useScheduleBudStoreApi } from "@/state/react";
import { ensureCreationProject } from "./project-policy";

const DAY_NAMES: Record<ScheduleDay, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

function displayReviewTime(time: string): string {
  const [hourValue, minute] = time.split(":").map(Number);
  const hour = hourValue! % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${hourValue! < 12 ? "AM" : "PM"}`;
}

function studentFileError(error: unknown): string {
  if (error instanceof PortalImportError) {
    return error.code === "missing-headers"
      ? `This workbook is missing required Portal columns: ${error.details.join(", ")}.`
      : "This workbook does not contain schedule rows.";
  }
  return "We couldn't read this workbook. Download a fresh XLSX schedule from the AdZU Portal and try again.";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function WorkbookFileCard({
  file,
  status,
}: {
  file: File;
  status: "reading" | "ready" | "selected";
}) {
  const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border border-brand/20 bg-accent/35 p-3 text-left">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface-elevated text-brand shadow-sm ring-1 ring-border">
        {status === "reading" ? (
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        ) : status === "ready" ? (
          <CheckCircle2 aria-hidden="true" className="size-5 text-success" />
        ) : (
          <FileSpreadsheet aria-hidden="true" className="size-5" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-sm font-semibold"
          title={file.name}
        >
          {file.name}
        </span>
        <span className="mt-0.5 block text-xs text-text-muted">
          {extension} {extension === "XLSX" ? "workbook" : "file"} ·{" "}
          {formatFileSize(file.size)}
        </span>
        <span
          className="mt-1 block text-xs font-medium text-brand"
          role="status"
        >
          {status === "reading"
            ? "Reading classes…"
            : status === "ready"
              ? "File received and ready to review"
              : "File selected"}
        </span>
      </span>
    </div>
  );
}

export type PortalWarningSummary = {
  key: string;
  subjectId: string | null;
  subjectCode: string;
  count: number;
  explanation: string;
};

export function summarizePortalWarnings(
  warnings: readonly PortalImportWarning[],
  subjects: readonly Subject[] = [],
): PortalWarningSummary[] {
  const subjectForRow = (rowNumber: number) =>
    subjects.find((subject) =>
      [
        ...(subject.importMetadata?.sourceRows ?? []),
        ...subject.meetings.flatMap(
          (meeting) => meeting.importMetadata?.sourceRows ?? [],
        ),
      ].includes(rowNumber),
    );
  const groups = new Map<
    string,
    { subject: Subject | null; warnings: PortalImportWarning[] }
  >();

  warnings.forEach((warning) => {
    const subject =
      warning.code === "missing-subject"
        ? null
        : (subjectForRow(warning.rowNumber) ?? null);
    const key = subject?.id ?? "unidentified-class";
    const group = groups.get(key) ?? { subject, warnings: [] };
    group.warnings.push(warning);
    groups.set(key, group);
  });

  return [...groups.entries()].map(([key, group]) => {
    const countRows = (code: PortalImportWarning["code"]) =>
      new Set(
        group.warnings
          .filter((warning) => warning.code === code)
          .map((warning) => warning.rowNumber),
      ).size;
    const invalidDays = countRows("invalid-day");
    const invalidTimes = countRows("invalid-time");
    const skippedRows = countRows("missing-subject");
    const explanations: string[] = [];

    if (invalidDays > 0)
      explanations.push(
        `${invalidDays === 1 ? "A meeting has" : `${invalidDays} meetings have`} no valid day. Add the correct day before designing when possible.`,
      );
    if (invalidTimes > 0)
      explanations.push(
        `${invalidTimes === 1 ? "A meeting has" : `${invalidTimes} meetings have`} an invalid time. The imported value is preserved for review.`,
      );
    if (skippedRows > 0)
      explanations.push(
        `${skippedRows === 1 ? "An import row was" : `${skippedRows} import rows were`} skipped because no subject code was supplied. No schedule data was guessed.`,
      );

    return {
      key,
      subjectId: group.subject?.id ?? null,
      subjectCode: group.subject?.code || "Unidentified class",
      count: group.warnings.length,
      explanation: explanations.join(" "),
    };
  });
}

export function actionablePortalWarnings(
  pending: PendingPortalImport,
): PortalImportWarning[] {
  const excludedRows = new Set(
    pending.subjects
      .filter((subject) => !subject.enabled)
      .flatMap((subject) => [
        ...(subject.importMetadata?.sourceRows ?? []),
        ...subject.meetings.flatMap(
          (meeting) => meeting.importMetadata?.sourceRows ?? [],
        ),
      ]),
  );
  return pending.warnings.filter(
    (warning) =>
      warning.code === "missing-subject" ||
      !excludedRows.has(warning.rowNumber),
  );
}

export function PendingPortalReview({
  pending,
  sourceFile,
  onChange,
  onCancel,
  onConfirm,
}: {
  pending: PendingPortalImport;
  sourceFile?: File | null;
  onChange(value: PendingPortalImport): void;
  onCancel(): void;
  onConfirm(): void;
}) {
  const meetingCount = pending.subjects.reduce(
    (count, subject) => count + subject.meetings.length,
    0,
  );
  const actionableWarnings = actionablePortalWarnings(pending);
  const warningSummaries = summarizePortalWarnings(
    actionableWarnings,
    pending.subjects,
  );
  const conflicts = detectConflicts(pending.subjects);
  const reviewIssueCount = actionableWarnings.length + conflicts.length;
  const warnedSubjectIds = new Set([
    ...warningSummaries.flatMap((summary) =>
      summary.subjectId ? [summary.subjectId] : [],
    ),
    ...conflicts.flatMap((conflict) => [
      conflict.leftSubjectId,
      conflict.rightSubjectId,
    ]),
  ]);
  const subjectCodeForWarning = (warning: PortalImportWarning) =>
    pending.subjects.find((subject) =>
      [
        ...(subject.importMetadata?.sourceRows ?? []),
        ...subject.meetings.flatMap(
          (meeting) => meeting.importMetadata?.sourceRows ?? [],
        ),
      ].includes(warning.rowNumber),
    )?.code ?? "Unidentified class";
  const hasMissingCode = pending.subjects.some(
    (subject) => subject.code.trim().length === 0,
  );
  const updateSubject = (subjectId: string, updates: Partial<Subject>) =>
    onChange({
      ...pending,
      subjects: pending.subjects.map((subject) =>
        subject.id === subjectId ? { ...subject, ...updates } : subject,
      ),
    });
  const updateMeeting = (
    subjectId: string,
    meetingId: string,
    updates: Partial<Meeting>,
  ) =>
    onChange({
      ...pending,
      subjects: pending.subjects.map((subject) =>
        subject.id !== subjectId
          ? subject
          : {
              ...subject,
              meetings: subject.meetings.map((meeting) =>
                meeting.id === meetingId ? { ...meeting, ...updates } : meeting,
              ),
            },
      ),
    });
  const toggleDay = (
    subjectId: string,
    meetingId: string,
    day: ScheduleDay,
  ) => {
    const meeting = pending.subjects
      .find((subject) => subject.id === subjectId)
      ?.meetings.find((item) => item.id === meetingId);
    if (!meeting) return;
    updateMeeting(subjectId, meetingId, {
      days: meeting.days.includes(day)
        ? meeting.days.filter((value) => value !== day)
        : [...meeting.days, day],
    });
  };
  return (
    <section aria-labelledby="portal-review-title">
      <div className="mb-6 border-b border-border pb-5">
        <p className="text-sm font-semibold text-brand">Ready to review</p>
        <h2 id="portal-review-title" className="mt-1 sb-page-title">
          Check the imported classes.
        </h2>
        <p className="mt-3 text-text-secondary">
          {pending.subjects.length} subjects · {meetingCount} meetings ·{" "}
          {reviewIssueCount} {reviewIssueCount === 1 ? "warning" : "warnings"}
        </p>
        {sourceFile ? (
          <div className="mt-4">
            <WorkbookFileCard file={sourceFile} status="ready" />
          </div>
        ) : null}
      </div>
      {reviewIssueCount > 0 ? (
        <div className="mb-6">
          <IssueNotice title="Some imported details need review.">
            <ul className="divide-y divide-warning/20">
              {warningSummaries.map((summary) => (
                <li key={summary.key} className="py-2 first:pt-0 last:pb-0">
                  <strong className="font-semibold text-destructive">
                    {summary.subjectCode} needs review.
                  </strong>{" "}
                  {summary.explanation}
                </li>
              ))}
              {conflicts.map((conflict) => (
                <li
                  key={`${conflict.leftMeetingId}-${conflict.rightMeetingId}-${conflict.day}`}
                  className="py-2 first:pt-0 last:pb-0"
                >
                  <strong className="font-semibold text-destructive">
                    {conflict.leftSubjectCode} and {conflict.rightSubjectCode}{" "}
                    overlap.
                  </strong>{" "}
                  {DAY_NAMES[conflict.day]},{" "}
                  {displayReviewTime(conflict.overlapStart)}–
                  {displayReviewTime(conflict.overlapEnd)}. Review both meeting
                  times.
                </li>
              ))}
            </ul>
            {actionableWarnings.length > 0 ? (
              <details className="mt-3 border-t border-warning/20 pt-3">
                <summary className="cursor-pointer font-semibold text-foreground">
                  Show details
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                  {actionableWarnings.map((warning, index) => (
                    <li key={`${warning.rowNumber}-${warning.code}-${index}`}>
                      <strong className="font-semibold text-destructive">
                        {subjectCodeForWarning(warning)}:
                      </strong>{" "}
                      {warning.message}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </IssueNotice>
        </div>
      ) : null}
      <div className="divide-y divide-border border-y border-border">
        {pending.subjects.map((subject) => {
          const needsReview = warnedSubjectIds.has(subject.id);
          return (
            <article
              key={subject.id}
              aria-label={
                needsReview ? `${subject.code} needs review` : undefined
              }
              className={`px-4 py-4 sm:py-5 ${needsReview ? "border-l-4 border-destructive bg-destructive/5" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`font-heading font-bold ${needsReview ? "text-destructive" : ""}`}
                    >
                      {subject.code}
                    </h3>
                    {needsReview ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[0.6875rem] font-bold text-destructive">
                        Needs review
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-text-muted">
                    {subject.enabled
                      ? subject.meetings.map(meetingSummary).join(" · ")
                      : "Not included in schedule"}
                  </p>
                </div>
                <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-sm px-2 text-xs font-semibold text-text-secondary transition-colors duration-150 hover:bg-muted/70 motion-reduce:transition-none">
                  <input
                    type="checkbox"
                    className="sb-check"
                    checked={subject.enabled}
                    onChange={(event) =>
                      updateSubject(subject.id, {
                        enabled: event.target.checked,
                      })
                    }
                  />
                  Include in schedule
                </label>
              </div>
              <details className="mt-4">
                <summary className="min-h-11 cursor-pointer rounded-sm py-3 text-sm font-semibold text-brand transition-colors duration-150 hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">
                  Edit subject and meetings
                </summary>
                <div className="mt-5 space-y-5 rounded-md bg-card p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="sb-label">Code</span>
                      <input
                        className="sb-control"
                        required
                        aria-invalid={!subject.code.trim() || undefined}
                        value={subject.code}
                        onChange={(event) =>
                          updateSubject(subject.id, {
                            code: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="sb-label">Units</span>
                      <input
                        className="sb-control"
                        type="number"
                        min="0"
                        step="0.5"
                        value={subject.units}
                        onChange={(event) =>
                          updateSubject(subject.id, {
                            units: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </label>
                  </div>
                  {subject.meetings.map((meeting) => (
                    <MeetingFields
                      key={meeting.id}
                      meeting={meeting}
                      showValidation={subject.enabled}
                      onChange={(updates) =>
                        updateMeeting(subject.id, meeting.id, updates)
                      }
                      onToggleDay={(day) =>
                        toggleDay(subject.id, meeting.id, day)
                      }
                    />
                  ))}
                </div>
              </details>
            </article>
          );
        })}
      </div>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" size="lg" onClick={onCancel}>
          Cancel import
        </Button>
        <Button size="lg" disabled={hasMissingCode} onClick={onConfirm}>
          Confirm import <ArrowRight aria-hidden="true" />
        </Button>
      </div>
      {hasMissingCode ? (
        <p role="alert" className="mt-3 text-right text-sm text-warning">
          Every imported subject needs a code before it can be confirmed.
        </p>
      ) : null}
    </section>
  );
}

export function PortalCreation() {
  const store = useScheduleBudStoreApi();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingPortalImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  const parseFile = async (file: File) => {
    setError(null);
    setSelectedFile(file);
    const validation = validatePortalFile(file);
    if (validation.length > 0) {
      setError(validation.join(" "));
      return;
    }
    setParsing(true);
    try {
      const bytes = await file.arrayBuffer();
      const parsed = parsePortalWorkbook(bytes, {
        idFactory: (kind) => `${kind}-${crypto.randomUUID()}`,
      });
      setPending(parsed);
    } catch (caught) {
      if (process.env.NODE_ENV === "development") console.error(caught);
      setError(studentFileError(caught));
    } finally {
      setParsing(false);
    }
  };
  const confirm = () => {
    if (!pending) return;
    ensureCreationProject(store, "Portal schedule");
    const schoolYear = pending.metadata.schoolYears[0] ?? null;
    store.getState().replaceSchedule(pending.subjects, {
      source: "portal",
      term: { schoolYear, semester: null },
      curriculum: null,
    });
    router.push("/review");
  };

  return (
    <PageShell width={pending ? "standard" : "narrow"}>
      <PageReveal>
        <Link
          href="/create"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-brand"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Creation methods
        </Link>
        {pending ? (
          <PendingPortalReview
            pending={pending}
            sourceFile={selectedFile}
            onChange={setPending}
            onCancel={() => {
              setPending(null);
              setSelectedFile(null);
              setError(null);
            }}
            onConfirm={confirm}
          />
        ) : (
          <>
            <header className="mb-8">
              <p className="mb-2 font-mono text-xs font-bold tracking-[0.14em] text-brand uppercase">
                Portal import
              </p>
              <h1 className="sb-page-title">Import your Portal schedule.</h1>
              <p className="mt-3 text-text-secondary">
                Choose the XLSX schedule downloaded from your AdZU Portal
                account.
              </p>
            </header>
            <div
              onDragEnter={(event) => {
                event.preventDefault();
                dragDepth.current += 1;
                setDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                dragDepth.current = Math.max(0, dragDepth.current - 1);
                if (dragDepth.current === 0) setDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                dragDepth.current = 0;
                setDragging(false);
                const file = event.dataTransfer.files[0];
                if (file) void parseFile(file);
              }}
              data-dragging={dragging}
              aria-label="XLSX upload drop zone"
              className="sb-dropzone flex min-h-64 flex-col items-center justify-center rounded-lg px-6 py-10 text-center"
            >
              <span className="sb-dropzone-icon mb-4 flex size-12 items-center justify-center rounded-md bg-accent text-brand">
                <FileSpreadsheet aria-hidden="true" className="size-6" />
              </span>
              <h2 className="font-heading text-lg font-bold">
                {dragging ? "Release to import" : "Drop your XLSX here"}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {dragging
                  ? "We’ll check the workbook before adding any classes"
                  : "or choose it from your device"}
              </p>
              <input
                ref={inputRef}
                className="sr-only"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void parseFile(file);
                }}
              />
              <Button
                type="button"
                className="mt-5"
                disabled={parsing}
                onClick={() => inputRef.current?.click()}
              >
                {parsing ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                ) : (
                  <Upload aria-hidden="true" />
                )}
                {parsing ? "Reading workbook…" : "Choose XLSX file"}
              </Button>
              <p className="mt-4 text-xs text-text-muted">
                XLSX only · Maximum 5 MB
              </p>
            </div>
            {selectedFile ? (
              <div className="mt-4">
                <WorkbookFileCard
                  file={selectedFile}
                  status={parsing ? "reading" : "selected"}
                />
              </div>
            ) : null}
            {error ? (
              <div className="mt-5" role="alert">
                <IssueNotice title="We couldn't use that file.">
                  <p>{error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => inputRef.current?.click()}
                  >
                    <RotateCcw aria-hidden="true" /> Choose another file
                  </Button>
                </IssueNotice>
              </div>
            ) : null}
            <div className="mt-6">
              <LocalPrivacyNote />
            </div>
          </>
        )}
      </PageReveal>
    </PageShell>
  );
}
