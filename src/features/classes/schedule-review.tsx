"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/shell/page-shell";
import { PageReveal } from "@/components/shared/page-reveal";
import { IssueNotice } from "@/components/shared/issue-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { detectConflicts } from "@/domain/schedule/conflicts";
import { expandOccurrences } from "@/domain/schedule/occurrences";
import type { ScheduleDay } from "@/domain/schedule/types";
import { validateMeeting } from "@/domain/schedule/validation";
import {
  attemptWarningGate,
  type WarningGateState,
} from "@/domain/schedule/warnings";
import { useScheduleBudReady, useScheduleBudStore } from "@/state/react";

const DAY_NAMES: Record<ScheduleDay, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};
const DAY_ORDER: ScheduleDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function displayTime(time: string): string {
  const [hourValue, minute] = time.split(":").map(Number);
  const hour = hourValue! % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${hourValue! < 12 ? "AM" : "PM"}`;
}

export function ScheduleReview() {
  const ready = useScheduleBudReady();
  const router = useRouter();
  const activeId = useScheduleBudStore((state) => state.activeProjectId);
  const project = useScheduleBudStore((state) =>
    activeId ? state.projectsById[activeId] : undefined,
  );
  const [gate, setGate] = useState<WarningGateState>("idle");

  const review = useMemo(() => {
    const subjects = project?.schedule ?? [];
    const occurrences = expandOccurrences(subjects, "full");
    const conflicts = detectConflicts(subjects);
    const incomplete = subjects.flatMap((subject) =>
      subject.enabled
        ? subject.meetings
            .filter(
              (meeting) =>
                meeting.enabled && !validateMeeting(meeting).complete,
            )
            .map((meeting) => ({
              subject,
              meeting,
              issues: validateMeeting(meeting).issues,
            }))
        : [],
    );
    const grouped = new Map<ScheduleDay, typeof occurrences>();
    for (const day of DAY_ORDER) grouped.set(day, []);
    for (const occurrence of occurrences)
      grouped.get(occurrence.actualDays[0]!)!.push(occurrence);
    for (const values of grouped.values())
      values.sort(
        (left, right) =>
          left.startMinutes - right.startMinutes ||
          left.subjectCode.localeCompare(right.subjectCode),
      );
    return { subjects, occurrences, conflicts, incomplete, grouped };
  }, [project]);

  if (!ready)
    return (
      <PageShell width="narrow">
        <p className="py-20 text-center text-sm text-text-muted">
          Loading your schedule…
        </p>
      </PageShell>
    );
  if (!project)
    return (
      <PageShell width="narrow">
        <PageReveal>
          <h1 className="sb-page-title">No schedule to review yet.</h1>
          <p className="mt-3 text-text-secondary">
            Add your classes first, then return here to check them.
          </p>
          <Link
            href="/create"
            className={`${buttonVariants({ size: "lg" })} mt-7`}
          >
            Create a schedule
          </Link>
        </PageReveal>
      </PageShell>
    );

  const enabledSubjects = review.subjects.filter((subject) => subject.enabled);
  const meetingCount = enabledSubjects.reduce(
    (count, subject) =>
      count + subject.meetings.filter((meeting) => meeting.enabled).length,
    0,
  );
  const issueCount = review.incomplete.length + review.conflicts.length;
  const subjectName = new Map(
    review.subjects.map((subject) => [subject.id, subject.name]),
  );

  const attemptDesign = () => {
    const result = attemptWarningGate(issueCount > 0, gate);
    setGate(result.state);
    if (result.allowed) router.push("/studio");
  };

  return (
    <PageShell width="wide">
      <PageReveal>
        <Link
          href="/create/manual?edit=1"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-brand"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Edit classes
        </Link>
        <header className="mb-8 border-b border-border pb-7">
          <p className="mb-2 font-mono text-xs font-bold tracking-[0.14em] text-brand uppercase">
            Schedule review
          </p>
          <h1 className="sb-page-title">Make sure your schedule is correct.</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            {enabledSubjects.length}{" "}
            {enabledSubjects.length === 1 ? "subject" : "subjects"} ·{" "}
            {meetingCount} {meetingCount === 1 ? "meeting" : "meetings"} ·{" "}
            {issueCount} {issueCount === 1 ? "issue" : "issues"}
          </p>
        </header>
        {issueCount > 0 ? (
          <section aria-labelledby="issues-heading" className="mb-10 space-y-4">
            <h2 id="issues-heading" className="sb-section-title">
              Needs attention
            </h2>
            {review.incomplete.map(({ subject, meeting, issues }) => (
              <IssueNotice
                key={meeting.id}
                title={`${subject.code} has an incomplete meeting.`}
              >
                <p>
                  Missing or invalid: {issues.join(", ").replaceAll("-", " ")}.
                  The meeting stays editable and is not placed in the schedule
                  below.
                </p>
                <Link
                  href={`/create/manual?edit=1#subject-${subject.id}`}
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-hover"
                >
                  Fix class{" "}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </IssueNotice>
            ))}
            {review.conflicts.map((conflict) => (
              <IssueNotice
                key={`${conflict.leftMeetingId}-${conflict.rightMeetingId}-${conflict.day}`}
                title={`${conflict.leftSubjectCode} and ${conflict.rightSubjectCode} overlap.`}
              >
                <p>
                  {DAY_NAMES[conflict.day]},{" "}
                  {displayTime(conflict.overlapStart)}–
                  {displayTime(conflict.overlapEnd)}. Review both meeting times.
                </p>
                <Link
                  href={`/create/manual?edit=1#subject-${conflict.leftSubjectId}`}
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-hover"
                >
                  Review classes{" "}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </IssueNotice>
            ))}
          </section>
        ) : (
          <div className="mb-10">
            <IssueNotice tone="info" title="Your schedule is ready to design.">
              All enabled meetings have valid days and times, with no schedule
              conflicts.
            </IssueNotice>
          </div>
        )}
        <section aria-labelledby="week-heading">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="week-heading" className="sb-section-title">
              Week at a glance
            </h2>
            <p className="text-xs text-text-muted">
              Chronological, actual days
            </p>
          </div>
          <div className="grid gap-x-8 lg:grid-cols-2">
            {DAY_ORDER.map((day) => {
              const items = review.grouped.get(day)!;
              return (
                <section key={day} className="border-t border-border py-5">
                  <h3 className="font-mono text-xs font-bold tracking-[0.13em] text-brand uppercase">
                    {DAY_NAMES[day]}
                  </h3>
                  {items.length > 0 ? (
                    <ol className="mt-3 divide-y divide-border-muted">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="grid grid-cols-[5.5rem_1fr] gap-4 py-3"
                        >
                          <time className="font-mono text-xs font-semibold text-text-secondary">
                            {displayTime(item.startTime)}
                          </time>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {item.subjectCode}
                              {subjectName.get(item.subjectId) ? (
                                <span className="ml-1 font-normal text-text-secondary">
                                  {subjectName.get(item.subjectId)}
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-text-muted">
                              <span>
                                <Clock3
                                  aria-hidden="true"
                                  className="mr-1 inline size-3"
                                />
                                {displayTime(item.startTime)}–
                                {displayTime(item.endTime)}
                              </span>
                              {item.room ? <span>{item.room}</span> : null}
                              {item.professor ? (
                                <span>{item.professor}</span>
                              ) : null}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-3 text-sm text-text-muted">
                      No complete meetings.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        </section>
        <footer className="sticky bottom-0 mt-8 border-t border-border bg-background/95 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-secondary">
              Your schedule saves automatically on this device.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {issueCount > 0 ? (
                <>
                  <Link
                    href="/create/manual?edit=1"
                    className={buttonVariants({
                      size: "lg",
                    })}
                  >
                    Fix issues
                  </Link>
                  <Button variant="ghost" size="lg" onClick={attemptDesign}>
                    {gate === "revealed"
                      ? "I understand — continue"
                      : "Continue anyway"}
                  </Button>
                </>
              ) : (
                <Button size="lg" onClick={attemptDesign}>
                  Start designing <ArrowRight aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
          {gate === "revealed" ? (
            <p
              role="status"
              className="mt-2 text-right text-xs font-medium text-warning"
            >
              These issues can affect the wallpaper. Choose “I understand —
              continue” to proceed with the current schedule.
            </p>
          ) : null}
        </footer>
      </PageReveal>
    </PageShell>
  );
}
