import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";

export const bodySans = Geist({
  subsets: ["latin"],
  variable: "--font-body-sans",
  display: "swap",
});

export const headingSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-heading-sans",
  display: "swap",
});

export const uiMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-ui-mono",
  display: "swap",
});

export const fontClassNames = `${bodySans.variable} ${headingSans.variable} ${uiMono.variable}`;
