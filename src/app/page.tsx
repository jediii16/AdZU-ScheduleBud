import { CalendarDays, HardDrive, Layers3 } from "lucide-react";

const foundations = [
  { icon: CalendarDays, label: "Canonical schedule domain" },
  { icon: HardDrive, label: "Local-first project storage" },
  { icon: Layers3, label: "Shared Konva render-model boundary" },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16">
      <div className="max-w-2xl space-y-4">
        <p className="font-mono text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Foundation pass
        </p>
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl">
          AdZU ScheduleBud 2.0
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          The new local-first schedule wallpaper generator is being built on a
          typed, renderer-independent domain foundation.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {foundations.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm"
          >
            <Icon aria-hidden="true" className="size-5 text-primary" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
