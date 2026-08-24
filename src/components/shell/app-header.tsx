"use client";

import Link from "next/link";
import { HardDrive, TriangleAlert } from "lucide-react";

import { BrandLockup } from "@/components/shared/brand-lockup";
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
          aria-label="ScheduleBud for AdZU students"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <BrandLockup descriptor />
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
