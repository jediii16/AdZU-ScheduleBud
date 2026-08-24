"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, LockKeyhole } from "lucide-react";

import { AppHeader } from "@/components/shell/app-header";
import { PageReveal } from "@/components/shared/page-reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScheduleBudReady, useScheduleBudStore } from "@/state/react";

function CleanSlatePreview() {
  const rows = [
    ["MON", "8:00", "CS 201"],
    ["TUE", "10:30", "HIST 12"],
    ["THU", "1:00", "CS 201"],
    ["FRI", "3:30", "ENG 14"],
  ] as const;
  return (
    <div className="relative mx-auto aspect-[9/19] w-full max-w-73 overflow-hidden rounded-[1.4rem] border-[5px] border-slate-800 bg-[#f7fafc] p-4 shadow-[0_24px_60px_-32px_rgba(20,45,75,.55)] sm:max-w-82 sm:p-5 lg:max-w-96">
      <div className="mx-auto mb-6 h-1.5 w-14 rounded-full bg-slate-800" />
      <div className="border-b border-slate-200 pb-3">
        <p className="text-[0.6rem] font-bold tracking-[0.2em] text-[#1673a5] uppercase">
          Weekly schedule
        </p>
        <p className="mt-1 font-heading text-lg font-extrabold tracking-tight text-slate-800">
          First Semester
        </p>
      </div>
      <div className="divide-y divide-slate-200">
        {rows.map(([day, time, code]) => (
          <div
            key={`${day}-${code}`}
            className="grid grid-cols-[2.4rem_2.6rem_1fr] gap-2 py-3"
          >
            <span className="text-[0.52rem] font-bold tracking-[0.12em] text-[#1673a5]">
              {day}
            </span>
            <span className="font-mono text-[0.55rem] font-semibold text-slate-500">
              {time}
            </span>
            <strong className="block text-[0.65rem] leading-none text-slate-800">
              {code}
            </strong>
          </div>
        ))}
      </div>
      <div className="absolute right-4 bottom-4 left-4 flex justify-between border-t border-slate-200 pt-2 text-[0.48rem] font-medium text-slate-400">
        <span>AdZU ScheduleBud</span>
        <span>Clean Slate</span>
      </div>
    </div>
  );
}

export function HomeExperience() {
  const ready = useScheduleBudReady();
  const projectsById = useScheduleBudStore((state) => state.projectsById);
  const projects = Object.values(projectsById);
  const activeProjectId = useScheduleBudStore((state) => state.activeProjectId);
  const active = activeProjectId
    ? projects.find((project) => project.id === activeProjectId)
    : undefined;
  const latest =
    active ??
    projects.toSorted((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    )[0];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <PageReveal>
        <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,.95fr)_minmax(20rem,1.05fr)] md:py-12 lg:gap-16 lg:px-8">
          <section className="max-w-xl lg:justify-self-end">
            <p className="mb-5 font-mono text-xs font-bold tracking-[0.16em] text-brand uppercase">
              Local-first schedule maker
            </p>
            {ready && latest ? (
              <div className="mb-9 border-l-2 border-brand pl-5">
                <p className="text-sm font-semibold text-brand">
                  Welcome back.
                </p>
                <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {latest.metadata.title}
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                  {latest.schedule.length}{" "}
                  {latest.schedule.length === 1 ? "subject" : "subjects"}
                  {latest.metadata.term?.semester
                    ? ` · ${latest.metadata.term.semester}`
                    : ""}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={
                      latest.schedule.length > 0 ? "/review" : "/create/manual"
                    }
                    className={buttonVariants({ size: "lg" })}
                  >
                    Continue editing <ArrowRight aria-hidden="true" />
                  </Link>
                  <Link
                    href="/create"
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                    })}
                  >
                    Start a new schedule
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-heading text-4xl font-extrabold tracking-[-0.035em] text-balance text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
                  Your class schedule, made for your screen.
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-text-secondary">
                  Turn your AdZU schedule into a wallpaper without designing
                  everything from scratch.
                </p>
                <Link
                  href="/create"
                  className={cn(buttonVariants({ size: "lg" }), "mt-8")}
                >
                  Create my schedule <ArrowRight aria-hidden="true" />
                </Link>
              </>
            )}
            <div className="mt-8 flex items-start gap-3 border-t border-border-muted pt-5 text-sm text-text-muted">
              <LockKeyhole
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-brand"
              />
              <p>No account · Your Portal file stays on your device.</p>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-text-muted">
              <CalendarDays aria-hidden="true" className="size-3.5" /> Built for
              Ateneo de Zamboanga University students. Not an official
              university service.
            </p>
          </section>
          <aside
            aria-label="Clean Slate schedule wallpaper sample"
            className="relative py-4 md:justify-self-center lg:w-full"
          >
            <div
              aria-hidden="true"
              className="absolute top-1/2 right-0 left-0 hidden h-px bg-border-muted lg:block"
            />
            <CleanSlatePreview />
          </aside>
        </main>
      </PageReveal>
    </div>
  );
}
