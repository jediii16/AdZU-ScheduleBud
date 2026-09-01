"use client";

import { Menu } from "@base-ui/react/menu";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Copy, Ellipsis, Pencil, Trash2 } from "lucide-react";

import heroVisual from "../../../hero.svg";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { Button, buttonVariants } from "@/components/ui/button";
import { devicePresetById } from "@/data/devices/registry";
import type { ScheduleProject } from "@/domain/project";
import { cn } from "@/lib/utils";
import { useScheduleBudStore } from "@/state/react";

const ProjectCanvasPreview = dynamic(() => import("./project-canvas-preview"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

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

function PublicHeader() {
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
        <Link href="/create" className={buttonVariants({ size: "sm" })}>
          Create schedule
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-[96rem] items-center gap-8 px-4 pt-14 pb-16 sm:px-6 sm:pt-18 sm:pb-20 lg:px-8 lg:pt-22 lg:pb-24 xl:grid-cols-[minmax(0,36fr)_minmax(0,64fr)] xl:gap-0">
      <div className="relative z-10 max-w-xl xl:pb-4">
        <p className="mb-5 font-mono text-xs font-bold tracking-[0.16em] text-brand uppercase">
          Built for AdZU students
        </p>
        <h1 className="font-heading text-[2.75rem] leading-[0.98] font-extrabold tracking-[-0.045em] text-balance text-foreground sm:text-6xl xl:text-[4.3rem]">
          Your schedule.
          <br />
          Your wallpaper.
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
          Turn your AdZU class schedule into a wallpaper made for your phone,
          tablet, laptop, or desktop—without rebuilding it from scratch.
        </p>
        <div className="mt-8 flex items-center">
          <Link href="/create" className={buttonVariants({ size: "lg" })}>
            Create my schedule <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      <figure className="relative -mx-10 min-h-[20rem] sm:-mx-10 sm:min-h-[30rem] xl:-mr-32 xl:-ml-12 xl:min-h-[39rem]">
        <div
          aria-hidden="true"
          className="absolute inset-[3%_-2%_-3%_1%] rounded-[48%] bg-brand/18 blur-[68px]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-[18%_10%_10%_22%] rounded-[50%] bg-[#64bfff]/24 blur-3xl"
        />
        <Image
          src={heroVisual}
          alt="ScheduleBud wallpapers displayed across a desktop monitor, laptop, tablet, and phone"
          width={1440}
          height={810}
          preload
          sizes="(max-width: 1279px) 110vw, 68vw"
          className="relative h-auto w-full scale-[1.19] object-contain sm:scale-[1.14] xl:translate-x-5 xl:scale-[1.3]"
        />
      </figure>
    </section>
  );
}

const menuItemClass =
  "flex min-w-36 items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary outline-hidden select-none data-highlighted:bg-muted data-highlighted:text-foreground";

function ProjectActionsMenu({
  project,
  onRename,
  onDuplicate,
  onDelete,
}: {
  project: ScheduleProject;
  onRename(): void;
  onDuplicate(): void;
  onDelete(): void;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`More actions for ${project.metadata.title}`}
        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-md text-text-muted opacity-100 transition-[opacity,background-color,color] hover:bg-muted hover:text-foreground data-pressed:bg-muted data-pressed:text-foreground motion-reduce:transition-none sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 sm:data-pressed:opacity-100"
      >
        <Ellipsis aria-hidden="true" className="size-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          className="z-50 outline-hidden"
          sideOffset={6}
          align="end"
        >
          <Menu.Popup className="origin-[var(--transform-origin)] rounded-lg border border-border bg-surface-elevated py-1 shadow-[0_16px_40px_-16px_rgba(20,45,75,.35)] outline-hidden transition-[transform,opacity] duration-100 data-ending-style:scale-[.97] data-ending-style:opacity-0 data-starting-style:scale-[.97] data-starting-style:opacity-0 motion-reduce:transition-none">
            <Menu.Item className={menuItemClass} onClick={onRename}>
              <Pencil aria-hidden="true" className="size-3.5" /> Rename
            </Menu.Item>
            <Menu.Item className={menuItemClass} onClick={onDuplicate}>
              <Copy aria-hidden="true" className="size-3.5" /> Duplicate
            </Menu.Item>
            <Menu.Item
              className={cn(
                menuItemClass,
                "text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive",
              )}
              onClick={onDelete}
            >
              <Trash2 aria-hidden="true" className="size-3.5" /> Delete
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function ProjectCard({
  project,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: {
  project: ScheduleProject;
  onOpen(): void;
  onRename(title: string): void;
  onDuplicate(): void;
  onDelete(): void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(project.metadata.title);
  const target = projectTarget(project);

  const submitRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = draftTitle.trim();
    if (!normalized) return;
    onRename(normalized);
    setEditing(false);
  };

  const cancelRename = () => {
    setDraftTitle(project.metadata.title);
    setEditing(false);
  };

  return (
    <li className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-muted bg-background transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-[0_18px_44px_-28px_rgba(20,65,110,.65)] motion-reduce:transform-none motion-reduce:transition-none">
      <div className="aspect-[16/9] w-full overflow-hidden border-b border-border-muted">
        <ProjectCanvasPreview project={project} />
      </div>
      <div className="flex min-h-32 min-w-0 flex-1 flex-col items-start p-4 pr-12">
        {editing ? (
          <form className="w-full" onSubmit={submitRename}>
            <label htmlFor={`project-title-${project.id}`} className="sr-only">
              Schedule name
            </label>
            <input
              id={`project-title-${project.id}`}
              autoFocus
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              maxLength={160}
              className="sb-control h-9 min-h-9"
            />
            <div className="mt-2 flex gap-2">
              <Button type="submit" size="xs">
                Save
              </Button>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                onClick={cancelRename}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="w-full truncate font-heading text-base font-bold text-foreground">
              {project.metadata.title}
            </h3>
            <p className="mt-1 flex flex-wrap gap-x-2 text-xs leading-5 text-text-muted">
              <span>Updated {formatUpdatedDate(project.updatedAt)}</span>
              {target ? <span aria-hidden="true">·</span> : null}
              {target ? <span>{target}</span> : null}
              <span aria-hidden="true">·</span>
              <span>
                {project.schedule.length}{" "}
                {project.schedule.length === 1 ? "class" : "classes"}
              </span>
            </p>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              aria-label={`Open ${project.metadata.title}`}
              onClick={onOpen}
              className="mt-auto -ml-2 text-brand hover:bg-accent"
            >
              Open <ArrowRight aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
      {!editing ? (
        <ProjectActionsMenu
          project={project}
          onRename={() => setEditing(true)}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ) : null}
    </li>
  );
}

function ProjectDashboard({ projects }: { projects: ScheduleProject[] }) {
  const router = useRouter();
  const setActiveProject = useScheduleBudStore(
    (state) => state.setActiveProject,
  );
  const renameProject = useScheduleBudStore((state) => state.renameProject);
  const duplicateProject = useScheduleBudStore(
    (state) => state.duplicateProject,
  );
  const deleteProject = useScheduleBudStore((state) => state.deleteProject);

  const openProject = (project: ScheduleProject) => {
    setActiveProject(project.id);
    router.push(
      project.schedule.length > 0 ? "/studio" : "/create/manual?edit=1",
    );
  };

  const rename = (project: ScheduleProject, title: string) => {
    setActiveProject(project.id);
    renameProject(title);
  };

  const remove = (project: ScheduleProject) => {
    const confirmed = window.confirm(
      `Delete “${project.metadata.title}”? This schedule will be removed from this device.`,
    );
    if (confirmed) void deleteProject(project.id);
  };

  return (
    <section
      id="your-schedules"
      aria-labelledby="your-schedules-heading"
      className="scroll-mt-6 border-y border-border-muted bg-card/55"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="your-schedules-heading"
            className="font-heading text-3xl font-extrabold tracking-[-0.03em] text-foreground"
          >
            Your schedules
          </h2>
          <Link
            href="/create"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            New schedule
          </Link>
        </div>

        <ul className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => openProject(project)}
              onRename={(title) => rename(project, title)}
              onDuplicate={() => void duplicateProject(project.id)}
              onDelete={() => remove(project)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function TemplatesPlaceholder() {
  return (
    <section
      aria-labelledby="templates-heading"
      className="border-b border-border-muted"
    >
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 sm:pt-14 sm:pb-12 lg:px-8">
        <h2
          id="templates-heading"
          className="font-heading text-3xl font-extrabold tracking-[-0.03em] text-foreground"
        >
          Templates
        </h2>
        <div aria-hidden="true" className="h-12 sm:h-16" />
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

function Footer() {
  return (
    <footer className="bg-[#10253b] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
        <div>
          <BrandLockup descriptor surface="dark" />
          <p className="mt-5 max-w-md text-sm leading-6 text-white/65">
            Make an AdZU class schedule wallpaper for every screen you use.
            Everything stays in your browser.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <Link
            href="/create"
            className="text-sm font-bold text-white underline-offset-4 hover:underline"
          >
            Create a schedule{" "}
            <ArrowRight aria-hidden="true" className="ml-1 inline size-4" />
          </Link>
          <p className="text-xs text-white/45">
            Independent student project · © {new Date().getFullYear()}
          </p>
        </div>
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
      <PublicHeader />
      <main>
        <Hero />
        {projects.length > 0 ? <ProjectDashboard projects={projects} /> : null}
        <TemplatesPlaceholder />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
