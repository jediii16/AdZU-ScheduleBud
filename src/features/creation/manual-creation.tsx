"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { PageShell } from "@/components/shell/page-shell";
import { PageReveal } from "@/components/shared/page-reveal";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  MeetingFields,
  StoreSubjectList,
} from "@/features/classes/class-editor";
import type { Meeting, ScheduleDay } from "@/domain/schedule/types";
import { ensureCreationProject } from "./project-policy";
import { useScheduleBudStore, useScheduleBudStoreApi } from "@/state/react";

const newMeeting = (): Meeting => ({
  id: `draft-${crypto.randomUUID()}`,
  days: [],
  startTime: "07:00",
  endTime: "07:00",
  room: "",
  professor: "",
  enabled: true,
});

export function ManualCreation({
  editingExisting = false,
}: {
  editingExisting?: boolean;
}) {
  const store = useScheduleBudStoreApi();
  const addSubject = useScheduleBudStore((state) => state.addSubject);
  const activeId = useScheduleBudStore((state) => state.activeProjectId);
  const activeProject = useScheduleBudStore((state) =>
    activeId ? state.projectsById[activeId] : undefined,
  );
  const subjects = activeProject?.schedule ?? [];
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [units, setUnits] = useState("0");
  const [section, setSection] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([newMeeting()]);
  const [error, setError] = useState<string | null>(null);
  const creationProjectId = useRef<string | null>(null);

  const updateMeeting = (id: string, updates: Partial<Omit<Meeting, "id">>) =>
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id === id ? { ...meeting, ...updates } : meeting,
      ),
    );
  const toggleDay = (id: string, day: ScheduleDay) =>
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id !== id
          ? meeting
          : {
              ...meeting,
              days: meeting.days.includes(day)
                ? meeting.days.filter((value) => value !== day)
                : [...meeting.days, day],
            },
      ),
    );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError("Add a subject code and name.");
      return;
    }
    if (!editingExisting || !activeId) {
      if (!creationProjectId.current) {
        creationProjectId.current = ensureCreationProject(store);
      } else if (
        store.getState().activeProjectId !== creationProjectId.current
      ) {
        store.getState().setActiveProject(creationProjectId.current);
      }
    }
    addSubject({
      code,
      name,
      units: Number(units) || 0,
      section,
      enabled: true,
      isCustom: true,
      meetings: meetings.map((meeting) => ({
        days: meeting.days,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        room: meeting.room,
        professor: meeting.professor,
        enabled: meeting.enabled,
      })),
      importMetadata: { source: "manual" },
    });
    setCode("");
    setName("");
    setUnits("0");
    setSection("");
    setMeetings([newMeeting()]);
    setError(null);
  };

  return (
    <PageShell>
      <PageReveal>
        <Link
          href={editingExisting ? "/review" : "/create"}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-brand"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />{" "}
          {editingExisting ? "Back to review" : "Creation methods"}
        </Link>
        <header className="mb-8">
          <p className="mb-2 font-mono text-xs font-bold tracking-[0.14em] text-brand uppercase">
            Manual entry
          </p>
          <h1 className="sb-page-title">Add your classes.</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            Enter one subject at a time. Room and professor are optional, and
            you can add more than one meeting.
          </p>
        </header>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
          <form
            noValidate
            onSubmit={submit}
            className="space-y-6 rounded-lg border border-border bg-card p-5 sm:p-6"
          >
            <h2 className="sb-section-title">Subject details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="sb-label">Subject code</span>
                <input
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "manual-error" : undefined}
                  className="sb-control"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="e.g. CS 201"
                />
              </label>
              <label>
                <span className="sb-label">Subject name</span>
                <input
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "manual-error" : undefined}
                  className="sb-control"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Data Structures"
                />
              </label>
              <label>
                <span className="sb-label">Units</span>
                <input
                  className="sb-control"
                  type="number"
                  min="0"
                  step="0.5"
                  value={units}
                  onChange={(event) => setUnits(event.target.value)}
                />
              </label>
              <label>
                <span className="sb-label">Section</span>
                <input
                  className="sb-control"
                  value={section}
                  onChange={(event) => setSection(event.target.value)}
                />
              </label>
            </div>
            {meetings.map((meeting) => (
              <MeetingFields
                key={meeting.id}
                meeting={meeting}
                onChange={(updates) => updateMeeting(meeting.id, updates)}
                onToggleDay={(day) => toggleDay(meeting.id, day)}
                {...(meetings.length > 1
                  ? {
                      onRemove: () =>
                        setMeetings((current) =>
                          current.filter((value) => value.id !== meeting.id),
                        ),
                    }
                  : {})}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setMeetings((current) => [...current, newMeeting()])
              }
            >
              <Plus aria-hidden="true" /> Add another meeting
            </Button>
            {error ? (
              <p
                id="manual-error"
                role="alert"
                className="text-sm font-semibold text-destructive"
              >
                {error}
              </p>
            ) : null}
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Add class
            </Button>
          </form>
          <section aria-labelledby="class-list-heading">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 id="class-list-heading" className="sb-section-title">
                  Your classes
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  {subjects.length}{" "}
                  {subjects.length === 1 ? "subject" : "subjects"}
                </p>
              </div>
              {subjects.length > 0 ? (
                <Link href="/review" className={buttonVariants({ size: "lg" })}>
                  Review schedule <ArrowRight aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <StoreSubjectList />
          </section>
        </div>
      </PageReveal>
    </PageShell>
  );
}
