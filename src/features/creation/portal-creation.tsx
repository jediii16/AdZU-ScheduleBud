"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
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
import type { Meeting, ScheduleDay, Subject } from "@/domain/schedule";
import { useScheduleBudStoreApi } from "@/state/react";
import { ensureCreationProject } from "./project-policy";

function studentFileError(error: unknown): string {
  if (error instanceof PortalImportError) {
    return error.code === "missing-headers"
      ? `This workbook is missing required Portal columns: ${error.details.join(", ")}.`
      : "This workbook does not contain schedule rows.";
  }
  return "We couldn't read this workbook. Download a fresh XLSX schedule from the AdZU Portal and try again.";
}

export type PortalWarningSummary = {
  category: "missing-day" | "invalid-time" | "skipped-row";
  count: number;
  title: string;
  explanation: string;
};

export function summarizePortalWarnings(
  warnings: readonly PortalImportWarning[],
): PortalWarningSummary[] {
  const countRows = (codes: readonly PortalImportWarning["code"][]) =>
    new Set(
      warnings
        .filter((warning) => codes.includes(warning.code))
        .map((warning) => warning.rowNumber),
    ).size;
  const counts = {
    missingDay: countRows(["invalid-day"]),
    invalidTime: countRows(["invalid-time"]),
    skippedRow: countRows(["missing-subject"]),
  };
  const summaries: PortalWarningSummary[] = [];
  if (counts.missingDay > 0)
    summaries.push({
      category: "missing-day",
      count: counts.missingDay,
      title: `${counts.missingDay} ${counts.missingDay === 1 ? "meeting has" : "meetings have"} no valid day.`,
      explanation: "Add the correct day before designing when possible.",
    });
  if (counts.invalidTime > 0)
    summaries.push({
      category: "invalid-time",
      count: counts.invalidTime,
      title: `${counts.invalidTime} ${counts.invalidTime === 1 ? "meeting has" : "meetings have"} an invalid time.`,
      explanation: "The imported value is preserved for review.",
    });
  if (counts.skippedRow > 0)
    summaries.push({
      category: "skipped-row",
      count: counts.skippedRow,
      title: `${counts.skippedRow} ${counts.skippedRow === 1 ? "row was" : "rows were"} skipped because no subject code was supplied.`,
      explanation: "No schedule data was guessed for those rows.",
    });
  return summaries;
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
  onChange,
  onCancel,
  onConfirm,
}: {
  pending: PendingPortalImport;
  onChange(value: PendingPortalImport): void;
  onCancel(): void;
  onConfirm(): void;
}) {
  const meetingCount = pending.subjects.reduce(
    (count, subject) => count + subject.meetings.length,
    0,
  );
  const actionableWarnings = actionablePortalWarnings(pending);
  const warningSummaries = summarizePortalWarnings(actionableWarnings);
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
          {actionableWarnings.length} warnings
        </p>
      </div>
      {actionableWarnings.length > 0 ? (
        <div className="mb-6">
          <IssueNotice title="Some imported details need review.">
            <ul className="divide-y divide-warning/20">
              {warningSummaries.map((summary) => (
                <li
                  key={summary.category}
                  className="py-2 first:pt-0 last:pb-0"
                >
                  <strong className="font-semibold text-foreground">
                    {summary.title}
                  </strong>{" "}
                  {summary.explanation}
                </li>
              ))}
            </ul>
            <details className="mt-3 border-t border-warning/20 pt-3">
              <summary className="cursor-pointer font-semibold text-foreground">
                Show details
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                {actionableWarnings.map((warning, index) => (
                  <li key={`${warning.rowNumber}-${warning.code}-${index}`}>
                    Row {warning.rowNumber}: {warning.message}
                  </li>
                ))}
              </ul>
            </details>
          </IssueNotice>
        </div>
      ) : null}
      <div className="divide-y divide-border border-y border-border">
        {pending.subjects.map((subject) => (
          <article key={subject.id} className="py-4 sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-heading font-bold">{subject.code}</h3>
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
        ))}
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
  const [filename, setFilename] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const parseFile = async (file: File) => {
    setError(null);
    const validation = validatePortalFile(file);
    if (validation.length > 0) {
      setError(validation.join(" "));
      return;
    }
    try {
      const bytes = await file.arrayBuffer();
      const parsed = parsePortalWorkbook(bytes, {
        idFactory: (kind) => `${kind}-${crypto.randomUUID()}`,
      });
      setFilename(file.name);
      setPending(parsed);
    } catch (caught) {
      if (process.env.NODE_ENV === "development") console.error(caught);
      setError(studentFileError(caught));
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
            onChange={setPending}
            onCancel={() => {
              setPending(null);
              setFilename(null);
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
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files[0];
                if (file) void parseFile(file);
              }}
              className={`flex min-h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${dragging ? "border-brand bg-accent" : "border-input bg-card"}`}
            >
              <span className="mb-4 flex size-12 items-center justify-center rounded-md bg-accent text-brand">
                <FileSpreadsheet aria-hidden="true" className="size-6" />
              </span>
              <h2 className="font-heading text-lg font-bold">
                Drop your XLSX here
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                or choose it from your device
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
                onClick={() => inputRef.current?.click()}
              >
                <Upload aria-hidden="true" /> Choose XLSX file
              </Button>
              <p className="mt-4 text-xs text-text-muted">
                XLSX only · Maximum 5 MB
              </p>
            </div>
            {filename ? (
              <p className="mt-3 text-sm text-text-secondary">
                Selected: {filename}
              </p>
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
