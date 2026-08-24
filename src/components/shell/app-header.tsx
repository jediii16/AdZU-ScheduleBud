"use client";

import Link from "next/link";
import { HardDrive, TriangleAlert } from "lucide-react";

import { useScheduleBudStore } from "@/state/react";

export function AppHeader() {
  const autosave = useScheduleBudStore((state) => state.autosave);
  const status =
    autosave.status === "saving"
      ? "Saving…"
      : autosave.status === "saved"
        ? "Saved locally"
        : autosave.status === "error"
          ? "Couldn't save locally"
          : null;

  return (
    <header className="border-b border-border-muted bg-background/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex flex-col rounded-sm font-heading font-bold tracking-tight text-foreground"
        >
          <span className="text-lg leading-5">ScheduleBud</span>
          <span className="mt-0.5 text-[0.56rem] leading-3 font-semibold tracking-[0.13em] text-text-muted uppercase sm:text-[0.6rem]">
            for AdZU students
          </span>
        </Link>
        {status ? (
          <p
            aria-live="polite"
            className={`flex items-center gap-1.5 text-xs font-medium ${autosave.status === "error" ? "text-destructive" : "text-text-muted"}`}
          >
            {autosave.status === "error" ? (
              <TriangleAlert aria-hidden="true" className="size-3.5" />
            ) : (
              <HardDrive aria-hidden="true" className="size-3.5" />
            )}
            {status}
          </p>
        ) : null}
      </div>
    </header>
  );
}
