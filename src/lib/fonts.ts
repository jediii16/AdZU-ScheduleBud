import {
  Allura,
  Bodoni_Moda,
  Caveat,
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Geist,
  Geist_Mono,
  Inter,
  League_Spartan,
  Manrope,
  Nunito_Sans,
  Outfit,
  Playfair_Display,
  Poppins,
  Quicksand,
  Source_Sans_3,
  Space_Grotesk,
} from "next/font/google";

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

export const captionHand = Caveat({
  subsets: ["latin"],
  variable: "--font-caption-hand",
  display: "swap",
});

export const inter = Inter({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});
export const poppins = Poppins({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
});
export const outfit = Outfit({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-outfit",
});
export const dmSans = DM_Sans({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});
export const playfairDisplay = Playfair_Display({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair-display",
});
export const cormorantGaramond = Cormorant_Garamond({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant-garamond",
});
export const sourceSans3 = Source_Sans_3({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-sans-3",
});
export const quicksand = Quicksand({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-quicksand",
});
export const leagueSpartan = League_Spartan({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-league-spartan",
});
export const allura = Allura({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: "400",
  variable: "--font-allura",
});
export const manrope = Manrope({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});
export const fraunces = Fraunces({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fraunces",
});
export const bodoniModa = Bodoni_Moda({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-bodoni-moda",
});
export const spaceGrotesk = Space_Grotesk({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
});
export const dmSerifDisplay = DM_Serif_Display({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif-display",
});

export const fontClassNames = [
  bodySans.variable,
  headingSans.variable,
  uiMono.variable,
  captionHand.variable,
  inter.variable,
  poppins.variable,
  outfit.variable,
  dmSans.variable,
  playfairDisplay.variable,
  cormorantGaramond.variable,
  sourceSans3.variable,
  quicksand.variable,
  leagueSpartan.variable,
  allura.variable,
  manrope.variable,
  fraunces.variable,
  bodoniModa.variable,
  spaceGrotesk.variable,
  dmSerifDisplay.variable,
].join(" ");
