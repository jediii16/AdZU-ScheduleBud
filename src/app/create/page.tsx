import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  Keyboard,
  LibraryBig,
} from "lucide-react";

import { PageShell } from "@/components/shell/page-shell";
import { PageReveal } from "@/components/shared/page-reveal";

const methods = [
  {
    href: "/create/portal",
    icon: FileSpreadsheet,
    title: "Import your schedule",
    description:
      "Upload an XLSX or PDF file, or paste a schedule copied from your school portal.",
    note: "Recommended",
  },
  {
    href: "/create/curriculum",
    icon: LibraryBig,
    title: "Use curriculum",
    description:
      "Start with subjects from the current AdZU curriculum, then add your meeting times.",
  },
  {
    href: "/create/manual",
    icon: Keyboard,
    title: "Enter manually",
    description:
      "Add each class and meeting yourself. Best for irregular schedules.",
  },
] as const;

export default function CreatePage() {
  return (
    <PageShell width="narrow">
      <PageReveal>
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-brand"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Back
        </Link>
        <header className="mb-8">
          <p className="mb-2 font-mono text-xs font-bold tracking-[0.14em] text-brand uppercase">
            New schedule
          </p>
          <h1 className="sb-page-title">
            How do you want to add your classes?
          </h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            Choose the source that matches what you have. You can edit every
            class before designing.
          </p>
        </header>
        <div className="divide-y divide-border border-y border-border">
          {methods.map(
            ({ href, icon: Icon, title, description, ...method }) => (
              <Link
                key={href}
                href={href}
                className="group grid min-h-24 grid-cols-[2.75rem_1fr_auto] items-center gap-4 px-1 py-5 hover:bg-card sm:px-4"
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-accent text-brand">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span>
                  <span className="flex flex-wrap items-center gap-2 font-heading font-bold text-foreground">
                    {title}
                    {"note" in method ? (
                      <span className="rounded-sm bg-accent px-1.5 py-0.5 font-sans text-[0.65rem] font-bold tracking-wide text-brand uppercase">
                        {method.note}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-text-secondary">
                    {description}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-5 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </Link>
            ),
          )}
        </div>
      </PageReveal>
    </PageShell>
  );
}
