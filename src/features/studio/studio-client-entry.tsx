"use client";

import dynamic from "next/dynamic";
import { AppLoading } from "@/components/shared/app-loading";

const StudioExperience = dynamic(
  () => import("./studio-experience").then((module) => module.StudioExperience),
  {
    ssr: false,
    loading: () => <AppLoading message="Preparing Studio…" />,
  },
);

export function StudioClientEntry() {
  return <StudioExperience />;
}
