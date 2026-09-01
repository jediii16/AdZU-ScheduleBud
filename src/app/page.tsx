import type { Metadata } from "next";

import { HomeExperience } from "@/features/creation/home-experience";

export const metadata: Metadata = {
  title: "ScheduleBud — AdZU Schedule Wallpaper Generator",
  description:
    "Create a personalized class schedule wallpaper for your phone, tablet, laptop, or desktop. Built for Ateneo de Zamboanga University students.",
  openGraph: {
    title: "ScheduleBud — AdZU Schedule Wallpaper Generator",
    description:
      "Create a personalized class schedule wallpaper for your phone, tablet, laptop, or desktop. Built for Ateneo de Zamboanga University students.",
    type: "website",
  },
};

export default function HomePage() {
  return <HomeExperience />;
}
