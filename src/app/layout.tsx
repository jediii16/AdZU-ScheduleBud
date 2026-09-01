import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ScheduleBudProvider } from "@/state/react";
import { fontClassNames } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "ScheduleBud — AdZU Schedule Wallpaper Generator",
  description:
    "Create a personalized class schedule wallpaper for your phone, tablet, laptop, or desktop. Built for Ateneo de Zamboanga University students.",
  icons: {
    icon: [
      {
        url: "/brand/schedulebud-logo-on-light.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/brand/schedulebud-logo-on-dark.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={fontClassNames}>
      <body>
        <ScheduleBudProvider>{children}</ScheduleBudProvider>
      </body>
    </html>
  );
}
