import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ScheduleBudProvider } from "@/state/react";
import { fontClassNames } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "AdZU ScheduleBud 2.0",
  description: "A local-first schedule wallpaper generator for AdZU students.",
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
