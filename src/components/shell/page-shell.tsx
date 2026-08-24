import type { ReactNode } from "react";

import { AppHeader } from "./app-header";

export function PageShell({
  children,
  width = "standard",
}: {
  children: ReactNode;
  width?: "narrow" | "standard" | "wide";
}) {
  const maxWidth =
    width === "narrow"
      ? "max-w-3xl"
      : width === "wide"
        ? "max-w-6xl"
        : "max-w-5xl";
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className={`mx-auto w-full ${maxWidth} px-4 py-8 sm:px-6 sm:py-12`}>
        {children}
      </main>
    </div>
  );
}
