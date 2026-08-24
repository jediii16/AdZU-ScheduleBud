"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";

import { PageShell } from "@/components/shell/page-shell";
import { PageReveal } from "@/components/shared/page-reveal";
import { IssueNotice } from "@/components/shared/issue-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { StoreSubjectList } from "@/features/classes/class-editor";
import { curriculumPrograms } from "@/data/curriculum";
import { normalizeSubject } from "@/domain/schedule/normalization";
import { useScheduleBudStore, useScheduleBudStoreApi } from "@/state/react";
import { ProgramCombobox } from "./program-combobox";
import { ensureCreationProject } from "./project-policy";

export function CurriculumCreation() {
  const store = useScheduleBudStoreApi();
  const replaceSchedule = useScheduleBudStore((state) => state.replaceSchedule);
  const activeId = useScheduleBudStore((state) => state.activeProjectId);
  const activeProject = useScheduleBudStore((state) =>
    activeId ? state.projectsById[activeId] : undefined,
  );
  const activeSubjects = activeProject?.schedule ?? [];
  const [programId, setProgramId] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [semester, setSemester] = useState<number | null>(null);
  const [committed, setCommitted] = useState(false);

  const program = curriculumPrograms.find((item) => item.id === programId);
  const years = [
    ...new Set(program?.terms.map((term) => term.yearLevel) ?? []),
  ].toSorted((a, b) => a - b);
  const semesters = [
    ...new Set(
      program?.terms
        .filter((term) => term.yearLevel === year)
        .map((term) => term.semester) ?? [],
    ),
  ].toSorted((a, b) => a - b);
  const term = program?.terms.find(
    (item) => item.yearLevel === year && item.semester === semester,
  );

  const selectProgram = (
    selected: (typeof curriculumPrograms)[number] | null,
  ) => {
    setProgramId(selected?.id ?? null);
    setYear(null);
    setSemester(null);
    setCommitted(false);
  };
  const useTerm = () => {
    if (!program || !term || term.subjects.length === 0) return;
    ensureCreationProject(
      store,
      `${program.abbreviation ?? program.name} schedule`,
    );
    const idFactory = (kind: "subject" | "meeting") =>
      `${kind}-${crypto.randomUUID()}`;
    const subjects = term.subjects.map((subject) =>
      normalizeSubject(
        {
          code: subject.code,
          name: subject.name,
          units: subject.units,
          section: "",
          enabled: true,
          isCustom: false,
          importMetadata: { source: "curriculum" },
        },
        idFactory,
      ),
    );
    replaceSchedule(subjects, {
      source: "curriculum",
      term: { schoolYear: null, semester: `Semester ${term.semester}` },
      curriculum: {
        programId: program.id,
        yearLevel: term.yearLevel,
        semesterId: String(term.semester),
      },
    });
    setCommitted(true);
  };

  return (
    <PageShell>
      <PageReveal>
        <Link
          href="/create"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-brand"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Creation methods
        </Link>
        <header className="mb-8">
          <p className="mb-2 font-mono text-xs font-bold tracking-[0.14em] text-brand uppercase">
            Current curriculum
          </p>
          <h1 className="sb-page-title">Choose your curriculum term.</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            We’ll add the supplied subject names and units. You’ll enter your
            own days, times, section, room, and professor.
          </p>
        </header>
        {!committed ? (
          <div className="max-w-3xl space-y-7">
            <section aria-labelledby="program-heading">
              <h2 id="program-heading" className="mb-3 sb-section-title">
                <span className="mr-2 font-mono text-xs text-brand">01</span>
                Program
              </h2>
              <ProgramCombobox
                programs={curriculumPrograms}
                value={program ?? null}
                onChange={selectProgram}
              />
            </section>
            {program ? (
              <section
                aria-labelledby="year-heading"
                className="border-t border-border pt-6"
              >
                <h2 id="year-heading" className="sb-section-title">
                  <span className="mr-2 font-mono text-xs text-brand">02</span>
                  Year level
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {years.map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={year === value ? "default" : "outline"}
                      onClick={() => {
                        setYear(value);
                        setSemester(null);
                      }}
                    >
                      {year === value ? (
                        <Check aria-hidden="true" className="size-4" />
                      ) : null}
                      Year {value}
                    </Button>
                  ))}
                </div>
              </section>
            ) : null}
            {year ? (
              <section className="border-t border-border pt-6">
                <h2 className="sb-section-title">
                  <span className="mr-2 font-mono text-xs text-brand">03</span>
                  Semester
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {semesters.map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={semester === value ? "default" : "outline"}
                      onClick={() => setSemester(value)}
                    >
                      {semester === value ? (
                        <Check aria-hidden="true" className="size-4" />
                      ) : null}
                      Semester {value}
                    </Button>
                  ))}
                </div>
              </section>
            ) : null}
            {term ? (
              <section className="border-y border-border py-6">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <h2 className="sb-section-title">
                    <span className="mr-2 font-mono text-xs text-brand">
                      04
                    </span>
                    Supplied subjects
                  </h2>
                  <p className="text-xs text-text-muted">
                    {term.subjects.length} subjects
                  </p>
                </div>
                {term.subjects.length > 0 ? (
                  <ul className="divide-y divide-border-muted">
                    {term.subjects.map((subject) => (
                      <li
                        key={`${subject.code}-${subject.name}`}
                        className="grid grid-cols-[minmax(5rem,.3fr)_1fr_auto] gap-3 py-3 text-sm"
                      >
                        <strong>{subject.code}</strong>
                        <span className="text-text-secondary">
                          {subject.name}
                        </span>
                        <span className="font-mono text-xs text-text-muted">
                          {subject.units}u
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <IssueNotice title="This supplied term is empty." tone="info">
                    No subjects were provided for this exact curriculum term.
                    ScheduleBud won’t invent any.
                  </IssueNotice>
                )}
              </section>
            ) : null}
            {term ? (
              <Button
                size="lg"
                disabled={!term || term.subjects.length === 0}
                onClick={useTerm}
              >
                Use this term <ArrowRight aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        ) : (
          <section>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand">
                  {program?.abbreviation ?? program?.name} · Year {year} ·
                  Semester {semester}
                </p>
                <h2 className="mt-1 sb-section-title">
                  Add your meeting details
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Every subject starts incomplete because the curriculum does
                  not contain your personal class times.
                </p>
              </div>
              {activeSubjects.length > 0 ? (
                <Link href="/review" className={buttonVariants({ size: "lg" })}>
                  Review schedule <ArrowRight aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <StoreSubjectList />
          </section>
        )}
      </PageReveal>
    </PageShell>
  );
}
