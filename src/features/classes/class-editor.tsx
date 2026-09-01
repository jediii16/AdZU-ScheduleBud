"use client";

import { Copy, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SCHEDULE_DAYS,
  type Meeting,
  type ScheduleDay,
} from "@/domain/schedule/types";
import { validateMeeting } from "@/domain/schedule/validation";
import { useScheduleBudStore } from "@/state/react";

const DAY_LABELS: Record<ScheduleDay, string> = {
  Mon: "Mon",
  Tue: "Tue",
  Wed: "Wed",
  Thu: "Thu",
  Fri: "Fri",
  Sat: "Sat",
};

export function meetingSummary(meeting: Meeting): string {
  const days =
    meeting.days.length > 0 ? meeting.days.join(" · ") : "Days needed";
  return `${days} · ${meeting.startTime}–${meeting.endTime}`;
}

function DayPicker({
  meeting,
  onToggle,
}: {
  meeting: Meeting;
  onToggle(day: ScheduleDay): void;
}) {
  return (
    <fieldset>
      <legend className="sb-label">Days</legend>
      <div className="flex flex-wrap gap-2">
        {SCHEDULE_DAYS.map((day) => (
          <label
            key={day}
            className={`relative flex min-h-10 cursor-pointer items-center rounded-md border px-3 text-sm font-semibold transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand ${meeting.days.includes(day) ? "border-brand bg-accent text-brand" : "border-border bg-surface-elevated text-text-secondary hover:border-input"}`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={meeting.days.includes(day)}
              onChange={() => onToggle(day)}
            />
            {DAY_LABELS[day]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function MeetingFields({
  meeting,
  onChange,
  onToggleDay,
  onRemove,
  showValidation = true,
}: {
  meeting: Meeting;
  onChange(updates: Partial<Omit<Meeting, "id">>): void;
  onToggleDay(day: ScheduleDay): void;
  onRemove?: () => void;
  showValidation?: boolean;
}) {
  const validation = validateMeeting(meeting);
  return (
    <div className="space-y-4 border-l-2 border-border pl-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-foreground">Meeting</p>
        {onRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 aria-hidden="true" /> Remove
          </Button>
        ) : null}
      </div>
      <DayPicker meeting={meeting} onToggle={onToggleDay} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="sb-label">Starts</span>
          <input
            aria-label="Start time"
            className="sb-control font-mono"
            type="time"
            min="07:00"
            max="20:55"
            step="300"
            value={meeting.startTime}
            onChange={(event) => onChange({ startTime: event.target.value })}
          />
        </label>
        <label>
          <span className="sb-label">Ends</span>
          <input
            aria-label="End time"
            className="sb-control font-mono"
            type="time"
            min="07:05"
            max="23:00"
            step="300"
            value={meeting.endTime}
            onChange={(event) => onChange({ endTime: event.target.value })}
          />
        </label>
        <label>
          <span className="sb-label">
            Room <span className="font-normal text-text-muted">optional</span>
          </span>
          <input
            className="sb-control"
            value={meeting.room}
            onChange={(event) => onChange({ room: event.target.value })}
          />
        </label>
        <label>
          <span className="sb-label">
            Professor{" "}
            <span className="font-normal text-text-muted">optional</span>
          </span>
          <input
            className="sb-control"
            value={meeting.professor}
            onChange={(event) => onChange({ professor: event.target.value })}
          />
        </label>
      </div>
      {showValidation && !validation.complete ? (
        <p role="status" className="text-xs font-medium text-warning">
          This meeting needs valid days and a time between 07:00 and 23:00.
        </p>
      ) : null}
    </div>
  );
}

export function StoreSubjectList({
  emptyMessage = "No classes added yet.",
}: {
  emptyMessage?: string;
}) {
  const activeId = useScheduleBudStore((state) => state.activeProjectId);
  const project = useScheduleBudStore((state) =>
    activeId ? state.projectsById[activeId] : undefined,
  );
  const subjects = project?.schedule ?? [];
  const updateSubject = useScheduleBudStore((state) => state.updateSubject);
  const removeSubject = useScheduleBudStore((state) => state.removeSubject);
  const duplicateSubject = useScheduleBudStore(
    (state) => state.duplicateSubject,
  );
  const setSubjectEnabled = useScheduleBudStore(
    (state) => state.setSubjectEnabled,
  );
  const addMeeting = useScheduleBudStore((state) => state.addMeeting);
  const updateMeeting = useScheduleBudStore((state) => state.updateMeeting);
  const removeMeeting = useScheduleBudStore((state) => state.removeMeeting);
  const toggleMeetingDay = useScheduleBudStore(
    (state) => state.toggleMeetingDay,
  );

  if (subjects.length === 0)
    return (
      <p className="border-y border-border-muted py-8 text-center text-sm text-text-muted">
        {emptyMessage}
      </p>
    );
  const groups = [
    {
      label: "Included",
      subjects: subjects.filter((subject) => subject.enabled),
    },
    {
      label: "Not included",
      subjects: subjects.filter((subject) => !subject.enabled),
    },
  ];
  return (
    <div className="space-y-8">
      {groups
        .filter((group) => group.subjects.length > 0)
        .map((group) => (
          <section
            key={group.label}
            aria-labelledby={
              group.label === "Included"
                ? "classes-included"
                : "classes-not-included"
            }
          >
            <h3
              id={
                group.label === "Included"
                  ? "classes-included"
                  : "classes-not-included"
              }
              className="mb-2 font-mono text-xs font-bold tracking-[0.12em] text-text-muted uppercase"
            >
              {group.label} · {group.subjects.length}
            </h3>
            <div className="divide-y divide-border border-y border-border">
              {group.subjects.map((subject) => (
                <article
                  key={subject.id}
                  id={`subject-${subject.id}`}
                  className={`py-5 ${subject.enabled ? "" : "opacity-75"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-foreground">
                        {subject.code || "No code"}
                      </h3>
                      <p className="mt-1 text-xs text-text-muted">
                        {subject.enabled
                          ? subject.meetings.map(meetingSummary).join(" · ")
                          : "Not included in schedule"}
                        {subject.enabled && subject.section
                          ? ` · Section ${subject.section}`
                          : ""}
                      </p>
                    </div>
                    <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-sm px-2 text-xs font-semibold text-text-secondary transition-colors duration-150 hover:bg-muted/70 motion-reduce:transition-none">
                      <input
                        type="checkbox"
                        className="sb-check"
                        checked={subject.enabled}
                        onChange={(event) =>
                          setSubjectEnabled(subject.id, event.target.checked)
                        }
                      />{" "}
                      {subject.enabled ? "Included" : "Include in schedule"}
                    </label>
                  </div>
                  <details className="mt-4">
                    <summary className="min-h-11 cursor-pointer rounded-sm py-3 text-sm font-semibold text-brand transition-colors duration-150 hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">
                      Edit class
                    </summary>
                    <div className="mt-5 space-y-5 rounded-md bg-card p-4 sm:p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label>
                          <span className="sb-label">Subject code</span>
                          <input
                            className="sb-control"
                            defaultValue={subject.code}
                            required
                            onBlur={(event) => {
                              const code = event.currentTarget.value.trim();
                              if (!code) {
                                event.currentTarget.value = subject.code;
                                return;
                              }
                              updateSubject(subject.id, { code });
                            }}
                          />
                        </label>
                        <label>
                          <span className="sb-label">Units</span>
                          <input
                            className="sb-control"
                            type="number"
                            min="0"
                            step="0.5"
                            defaultValue={subject.units}
                            onBlur={(event) =>
                              updateSubject(subject.id, {
                                units: Number(event.target.value),
                              })
                            }
                          />
                        </label>
                        <label>
                          <span className="sb-label">Section</span>
                          <input
                            className="sb-control"
                            defaultValue={subject.section}
                            onBlur={(event) =>
                              updateSubject(subject.id, {
                                section: event.target.value,
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
                            toggleMeetingDay(subject.id, meeting.id, day)
                          }
                          {...(subject.meetings.length > 1
                            ? {
                                onRemove: () =>
                                  removeMeeting(subject.id, meeting.id),
                              }
                            : {})}
                        />
                      ))}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addMeeting(subject.id)}
                        >
                          <Plus aria-hidden="true" /> Add meeting
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateSubject(subject.id)}
                        >
                          <Copy aria-hidden="true" /> Duplicate class
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSubject(subject.id)}
                        >
                          <Trash2 aria-hidden="true" /> Remove from project
                        </Button>
                      </div>
                    </div>
                  </details>
                </article>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
