import type { Metadata } from "next";

import { HomeExperience } from "@/features/creation/home-experience";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <HomeExperience />;
}
