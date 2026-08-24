"use client";

import dynamic from "next/dynamic";

const StudioExperience = dynamic(
  () => import("./studio-experience").then((module) => module.StudioExperience),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center text-sm text-text-muted"
      >
        Preparing Studio…
      </div>
    ),
  },
);

export function StudioClientEntry() {
  return <StudioExperience />;
}
