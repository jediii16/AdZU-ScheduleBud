import { CircleAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

export function IssueNotice({
  children,
  tone = "warning",
  title,
}: {
  children: ReactNode;
  tone?: "warning" | "info";
  title: string;
}) {
  const Icon = tone === "warning" ? TriangleAlert : CircleAlert;
  return (
    <div
      className={`flex gap-3 rounded-md border p-4 ${tone === "warning" ? "border-warning/35 bg-warning/8" : "border-brand/25 bg-accent/55"}`}
    >
      <Icon
        aria-hidden="true"
        className={`mt-0.5 size-5 shrink-0 ${tone === "warning" ? "text-warning" : "text-brand"}`}
      />
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <div className="mt-1 text-sm leading-6 text-text-secondary">
          {children}
        </div>
      </div>
    </div>
  );
}
