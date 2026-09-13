import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/next";
import { ScheduleBudProvider } from "@/state/react";
import { fontClassNames } from "@/lib/fonts";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site-metadata";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "ScheduleBud",
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "ScheduleBud",
    locale: "en_PH",
    type: "website",
    images: [
      {
        url: "/brand/social-preview.png",
        width: 1200,
        height: 630,
        alt: "ScheduleBud — personalized AdZU class schedule wallpapers for every device",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/brand/social-preview.png"],
  },
  icons: {
    icon: [
      { url: "/brand/icon-32.png", type: "image/png", sizes: "32x32" },
      {
        url: "/brand/schedulebud-logo-on-light.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/brand/schedulebud-logo-on-dark.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/brand/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
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
        <Analytics />
      </body>
    </html>
  );
}
