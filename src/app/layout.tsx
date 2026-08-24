import type { Metadata } from "next";
import type { ReactNode } from "react";

import { fontClassNames } from "@/lib/fonts";

import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AdZU ScheduleBud 2.0",
  description: "A local-first schedule wallpaper generator for AdZU students.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={fontClassNames}>{children}</body>
    </html>
  );
}
