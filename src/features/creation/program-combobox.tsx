"use client";

import { Combobox } from "@base-ui/react/combobox";
import { Dialog } from "@base-ui/react/dialog";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { useId, useMemo, useState } from "react";

import type { CurriculumProgram } from "@/data/curriculum/schema";

function programLabel(program: CurriculumProgram): string {
  return program.abbreviation
    ? `${program.abbreviation} — ${program.name}`
    : program.name;
}

function ProgramOption({ program }: { program: CurriculumProgram }) {
  return (
    <span className="min-w-0">
      <strong className="block font-semibold">
        {program.abbreviation ?? program.name}
      </strong>
      {program.abbreviation ? (
        <span className="block truncate text-xs text-text-muted">
          {program.name}
        </span>
      ) : null}
    </span>
  );
}

function DesktopProgramCombobox({
  programs,
  value,
  onChange,
}: ProgramPickerProps) {
  const inputId = useId();
  return (
    <div className="hidden sm:block">
      <Combobox.Root
        items={programs}
        value={value}
        onValueChange={onChange}
        itemToStringLabel={programLabel}
        itemToStringValue={(program) => program.id}
        isItemEqualToValue={(item, selected) => item.id === selected.id}
        autoHighlight
      >
        <label htmlFor={inputId} className="sb-label">
          Program
        </label>
        <Combobox.InputGroup className="relative rounded-md border border-input bg-surface-elevated transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
          />
          <Combobox.Input
            id={inputId}
            aria-label="Program"
            placeholder="Search by program name or abbreviation"
            className="min-h-12 w-full border-0 bg-transparent pr-18 pl-10 text-sm text-foreground outline-none placeholder:text-text-muted"
          />
          <div className="absolute top-0 right-0 flex h-full items-center pr-1">
            <Combobox.Clear
              aria-label="Clear program"
              className="flex size-10 items-center justify-center rounded-md text-text-muted hover:bg-muted hover:text-foreground data-disabled:hidden"
            >
              <X aria-hidden="true" className="size-4" />
            </Combobox.Clear>
            <Combobox.Trigger
              aria-label="Choose program"
              className="flex size-10 items-center justify-center rounded-md text-text-secondary hover:bg-muted"
            >
              <ChevronsUpDown aria-hidden="true" className="size-4" />
            </Combobox.Trigger>
          </div>
        </Combobox.InputGroup>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={6} className="z-50 outline-none">
            <Combobox.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] overflow-hidden rounded-md border border-border bg-surface-elevated shadow-[0_18px_45px_-24px_rgba(20,45,75,.45)] transition-[transform,opacity] duration-100 data-ending-style:scale-[.98] data-ending-style:opacity-0 data-starting-style:scale-[.98] data-starting-style:opacity-0">
              <Combobox.Empty className="px-4 py-8 text-center text-sm text-text-muted">
                No supplied program matches that search.
              </Combobox.Empty>
              <Combobox.List className="max-h-[min(23rem,var(--available-height))] overflow-y-auto overscroll-contain p-1 outline-none">
                {(program: CurriculumProgram) => (
                  <Combobox.Item
                    key={program.id}
                    value={program}
                    className="grid min-h-13 cursor-default grid-cols-[1fr_1.25rem] items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                  >
                    <ProgramOption program={program} />
                    <Combobox.ItemIndicator>
                      <Check aria-hidden="true" className="size-4 text-brand" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}

function MobileProgramPicker({
  programs,
  value,
  onChange,
}: ProgramPickerProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return programs;
    return programs.filter((program) =>
      `${program.abbreviation ?? ""} ${program.name}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [programs, query]);

  return (
    <div className="sm:hidden">
      <p className="sb-label">Program</p>
      <Dialog.Root onOpenChange={(open) => open && setQuery("")}>
        <Dialog.Trigger
          aria-label="Choose program"
          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-input bg-surface-elevated px-3 text-left text-sm"
        >
          <span className={value ? "text-foreground" : "text-text-muted"}>
            {value ? programLabel(value) : "Choose and search programs"}
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 text-text-muted"
          />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 min-h-dvh bg-foreground/20 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed right-0 bottom-0 left-0 z-50 max-h-[82dvh] overflow-hidden rounded-t-xl border-t border-border bg-surface-elevated shadow-[0_-18px_45px_-30px_rgba(20,45,75,.5)] transition-[transform,opacity] duration-150 data-ending-style:translate-y-4 data-ending-style:opacity-0 data-starting-style:translate-y-4 data-starting-style:opacity-0">
            <div className="flex items-center justify-between border-b border-border-muted px-4 py-4">
              <div>
                <Dialog.Title className="font-heading font-bold">
                  Choose your program
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-xs text-text-muted">
                  Search the supplied current curriculum.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Close program picker"
                className="flex size-11 items-center justify-center rounded-md text-text-secondary hover:bg-muted"
              >
                <X aria-hidden="true" className="size-5" />
              </Dialog.Close>
            </div>
            <label className="relative m-4 block">
              <span className="sr-only">Search programs</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
              />
              <input
                aria-label="Search programs"
                autoFocus
                className="sb-control min-h-12 pl-10 text-base"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name or abbreviation"
              />
            </label>
            <div className="max-h-[55dvh] overflow-y-auto overscroll-contain px-2 pb-[max(.75rem,env(safe-area-inset-bottom))]">
              {filtered.length > 0 ? (
                filtered.map((program) => (
                  <Dialog.Close
                    key={program.id}
                    onClick={() => onChange(program)}
                    className="grid min-h-14 w-full grid-cols-[1fr_1.25rem] items-center gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-accent"
                  >
                    <ProgramOption program={program} />
                    {program.id === value?.id ? (
                      <Check aria-hidden="true" className="size-4 text-brand" />
                    ) : null}
                  </Dialog.Close>
                ))
              ) : (
                <p className="px-3 py-8 text-center text-sm text-text-muted">
                  No supplied program matches that search.
                </p>
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      {value ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2 text-xs font-semibold text-text-muted hover:text-brand"
        >
          Clear program
        </button>
      ) : null}
    </div>
  );
}

type ProgramPickerProps = {
  programs: CurriculumProgram[];
  value: CurriculumProgram | null;
  onChange(program: CurriculumProgram | null): void;
};

export function ProgramCombobox(props: ProgramPickerProps) {
  return (
    <>
      <DesktopProgramCombobox {...props} />
      <MobileProgramPicker {...props} />
    </>
  );
}
