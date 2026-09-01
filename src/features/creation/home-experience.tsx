"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brush,
  Check,
  FileUp,
  HardDrive,
  MonitorSmartphone,
} from "lucide-react";

import heroVisual from "../../../hero.svg";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { Button, buttonVariants } from "@/components/ui/button";
import { devicePresetById } from "@/data/devices/registry";
import type { ScheduleProject } from "@/domain/project";
import { cn } from "@/lib/utils";
import { useScheduleBudStore } from "@/state/react";

const productCapabilities = [
  {
    icon: FileUp,
    title: "Built for AdZU schedules",
    copy: "Bring in your Portal schedule file, start from your curriculum, or add classes manually.",
  },
  {
    icon: MonitorSmartphone,
    title: "Designed for any screen",
    copy: "Make wallpapers for your phone, tablet, laptop, desktop, or a custom screen size.",
  },
  {
    icon: Brush,
    title: "Customize without Canva",
    copy: "Choose a layout, colors, type, backgrounds, photos, and stickers without rebuilding your schedule.",
  },
] as const;

function formatUpdatedDate(value: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function projectTarget(project: ScheduleProject): string | null {
  const variant =
    project.deviceVariants.find(
      (candidate) => candidate.id === project.activeDeviceVariantId,
    ) ?? project.deviceVariants[0];
  if (!variant) return null;
  const preset = variant.presetId
    ? devicePresetById.get(variant.presetId)
    : undefined;
  return (
    preset?.displayName ??
    `${variant.category[0]!.toUpperCase()}${variant.category.slice(1)}`
  );
}

function PublicHeader({ hasProjects }: { hasProjects: boolean }) {
  return (
    <header className="border-b border-border-muted bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="ScheduleBud for AdZU students"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <BrandLockup descriptor />
        </Link>
        <nav aria-label="Homepage" className="flex items-center gap-2 sm:gap-5">
          {hasProjects ? (
            <a
              href="#your-schedules"
              className="hidden text-sm font-semibold text-text-secondary transition-colors hover:text-brand motion-reduce:transition-none sm:inline"
            >
              My schedules
            </a>
          ) : null}
          <Link href="/create" className={buttonVariants({ size: "sm" })}>
            Create schedule
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-14 pb-16 sm:px-6 sm:pt-18 sm:pb-20 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:gap-5 lg:px-8 lg:pt-22 lg:pb-24">
      <div className="relative z-10 max-w-xl lg:pb-4">
        <p className="mb-5 font-mono text-xs font-bold tracking-[0.16em] text-brand uppercase">
          Built for AdZU students
        </p>
        <h1 className="font-heading text-[2.75rem] leading-[0.98] font-extrabold tracking-[-0.045em] text-balance text-foreground sm:text-6xl lg:text-[4.3rem]">
          Your schedule.
          <br />
          Your wallpaper.
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
          Turn your AdZU class schedule into a wallpaper made for your phone,
          tablet, laptop, or desktop—without rebuilding it from scratch.
        </p>
        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link href="/create" className={buttonVariants({ size: "lg" })}>
            Create my schedule <ArrowRight aria-hidden="true" />
          </Link>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-text-muted">
            <Check aria-hidden="true" className="size-4 text-brand" /> No
            account required
          </span>
        </div>
      </div>

      <figure className="relative -mx-4 min-h-[17rem] sm:mx-0 sm:min-h-[24rem] lg:-mr-9 lg:min-h-[32rem]">
        <div
          aria-hidden="true"
          className="absolute inset-[12%_5%_4%_8%] rounded-[50%] bg-brand/7 blur-3xl"
        />
        <Image
          src={heroVisual}
          alt="ScheduleBud wallpapers displayed across a desktop monitor, laptop, tablet, and phone"
          width={1440}
          height={810}
          preload
          sizes="(max-width: 1023px) 100vw, 60vw"
          className="relative h-auto w-full scale-[1.08] object-contain sm:scale-100 lg:translate-x-2 lg:scale-[1.08]"
        />
      </figure>
    </section>
  );
}

function ProjectDashboard({ projects }: { projects: ScheduleProject[] }) {
  const router = useRouter();
  const setActiveProject = useScheduleBudStore(
    (state) => state.setActiveProject,
  );

  const openProject = (project: ScheduleProject) => {
    setActiveProject(project.id);
    router.push(
      project.schedule.length > 0 ? "/studio" : "/create/manual?edit=1",
    );
  };

  return (
    <section
      id="your-schedules"
      aria-labelledby="your-schedules-heading"
      className="scroll-mt-6 border-y border-border-muted bg-card/55"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-bold tracking-[0.14em] text-brand uppercase">
              Saved on this device
            </p>
            <h2
              id="your-schedules-heading"
              className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.03em] text-foreground"
            >
              Your schedules
            </h2>
          </div>
          <Link
            href="/create"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            New schedule
          </Link>
        </div>

        <ul className="mt-7 grid gap-3 md:grid-cols-2">
          {projects.map((project) => {
            const target = projectTarget(project);
            return (
              <li
                key={project.id}
                className="group flex min-w-0 items-center justify-between gap-4 rounded-lg border border-border-muted bg-background px-4 py-4 transition-[border-color,box-shadow] hover:border-brand/30 hover:shadow-[0_12px_32px_-24px_rgba(20,65,110,.5)] motion-reduce:transition-none sm:px-5"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-heading text-base font-bold text-foreground">
                    {project.metadata.title}
                  </h3>
                  <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-text-muted">
                    <span>Updated {formatUpdatedDate(project.updatedAt)}</span>
                    {target ? <span aria-hidden="true">·</span> : null}
                    {target ? <span>{target}</span> : null}
                    <span aria-hidden="true">·</span>
                    <span>
                      {project.schedule.length}{" "}
                      {project.schedule.length === 1 ? "class" : "classes"}
                    </span>
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`Open ${project.metadata.title}`}
                  onClick={() => openProject(project)}
                  className="shrink-0 text-brand hover:bg-accent"
                >
                  Open <ArrowRight aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Add your classes",
      copy: "Import your Portal schedule, use your curriculum, or build your classes manually.",
    },
    {
      title: "Make it yours",
      copy: "Shape the layout, colors, typography, backgrounds, photos, and stickers in Studio.",
    },
    {
      title: "Export your wallpaper",
      copy: "Choose a target screen, export a crisp PNG, and set it as your wallpaper.",
    },
  ] as const;

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="max-w-2xl">
        <p className="font-mono text-xs font-bold tracking-[0.14em] text-brand uppercase">
          From classes to wallpaper
        </p>
        <h2
          id="how-it-works-heading"
          className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.035em] text-foreground sm:text-4xl"
        >
          Three steps. Nothing to rebuild.
        </h2>
      </div>
      <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-0">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={cn(
              "border-t border-border pt-5 md:min-h-56 md:pr-8",
              index > 0 && "md:border-l md:pl-8",
            )}
          >
            <span className="font-mono text-4xl font-bold tracking-[-0.06em] text-brand/45">
              0{index + 1}
            </span>
            <h3 className="mt-8 font-heading text-xl font-bold tracking-[-0.02em] text-foreground">
              {step.title}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">
              {step.copy}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Capabilities() {
  return (
    <section
      aria-labelledby="capabilities-heading"
      className="border-y border-border-muted bg-card/45"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="font-mono text-xs font-bold tracking-[0.14em] text-brand uppercase">
              Made for the way you study
            </p>
            <h2
              id="capabilities-heading"
              className="mt-3 max-w-md font-heading text-3xl font-extrabold tracking-[-0.035em] text-foreground sm:text-4xl"
            >
              Your timetable, ready for the screens you already use.
            </h2>
          </div>
          <div className="divide-y divide-border-muted border-y border-border-muted">
            {productCapabilities.map(({ icon: Icon, title, copy }) => (
              <article
                key={title}
                className="grid gap-4 py-6 sm:grid-cols-[2.5rem_12rem_1fr] sm:items-start sm:gap-5"
              >
                <Icon aria-hidden="true" className="size-5 text-brand" />
                <h3 className="font-heading text-base font-bold text-foreground">
                  {title}
                </h3>
                <p className="text-sm leading-6 text-text-secondary">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section
      aria-labelledby="privacy-heading"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent text-brand">
          <HardDrive aria-hidden="true" className="size-7" />
        </div>
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.14em] text-brand uppercase">
            Local-first by design
          </p>
          <h2
            id="privacy-heading"
            className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.035em] text-foreground sm:text-4xl"
          >
            Your schedule stays with you.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
            ScheduleBud runs locally in your browser. Your schedule and design
            projects are stored on your device—no account, backend, or cloud
            sync required.
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="bg-brand text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-14 sm:px-6 sm:py-16 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <h2 className="font-heading text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
            Ready to make your schedule?
          </h2>
          <p className="mt-2 text-sm text-white/75">No account required.</p>
        </div>
        <Link
          href="/create"
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "w-fit bg-white text-brand hover:bg-white/90",
          )}
        >
          Create my schedule <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-muted bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <BrandLockup />
        <p>
          Built for AdZU students · Independent student project · ©{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

export function HomeExperience() {
  const projectsById = useScheduleBudStore((state) => state.projectsById);
  const projects = Object.values(projectsById).toSorted((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <PublicHeader hasProjects={projects.length > 0} />
      <main>
        <Hero />
        {projects.length > 0 ? <ProjectDashboard projects={projects} /> : null}
        <HowItWorks />
        <Capabilities />
        <Privacy />
        <FinalCallToAction />
      </main>
      <Footer />
    </div>
  );
}
