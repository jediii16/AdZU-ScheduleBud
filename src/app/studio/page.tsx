import type { Metadata } from "next";
import { StudioClientEntry } from "@/features/studio/studio-client-entry";

export const metadata: Metadata = {
  title: "Schedule Studio — ScheduleBud",
  robots: { index: false, follow: true },
};

export default function StudioPage() {
  return <StudioClientEntry />;
}
