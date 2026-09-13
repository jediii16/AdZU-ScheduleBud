import type { BackgroundDesign } from "@/domain/project";

export type GradientColorStops = readonly (number | string)[];

type Rgb = { r: number; g: number; b: number };
type Oklab = { l: number; a: number; b: number };

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

function hexToRgb(hex: string): Rgb {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16) / 255,
    g: Number.parseInt(hex.slice(3, 5), 16) / 255,
    b: Number.parseInt(hex.slice(5, 7), 16) / 255,
  };
}

function rgbToHex({ r, g, b }: Rgb) {
  const channel = (value: number) =>
    Math.round(clamp(value) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function srgbToLinear(value: number) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number) {
  return value <= 0.0031308
    ? 12.92 * value
    : 1.055 * value ** (1 / 2.4) - 0.055;
}

function rgbToOklab(rgb: Rgb): Oklab {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToRgb(color: Oklab): Rgb {
  const l = color.l + 0.3963377774 * color.a + 0.2158037573 * color.b;
  const m = color.l - 0.1055613458 * color.a - 0.0638541728 * color.b;
  const s = color.l - 0.0894841775 * color.a - 1.291485548 * color.b;
  const l3 = l ** 3;
  const m3 = m ** 3;
  const s3 = s ** 3;
  return {
    r: linearToSrgb(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3),
    g: linearToSrgb(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3),
    b: linearToSrgb(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3),
  };
}

export function mixGradientColors(
  color1: string,
  color2: string,
  amount: number,
) {
  const from = rgbToOklab(hexToRgb(color1));
  const to = rgbToOklab(hexToRgb(color2));
  const t = clamp(amount);
  return rgbToHex(
    oklabToRgb({
      l: from.l + (to.l - from.l) * t,
      a: from.a + (to.a - from.a) * t,
      b: from.b + (to.b - from.b) * t,
    }),
  );
}

function appendPerceptualSegment(
  stops: Array<number | string>,
  color1: string,
  color2: string,
  start: number,
  end: number,
  subdivisions: number,
  includeStart: boolean,
) {
  for (let index = includeStart ? 0 : 1; index <= subdivisions; index += 1) {
    const progress = index / subdivisions;
    stops.push(
      start + (end - start) * progress,
      mixGradientColors(color1, color2, progress),
    );
  }
}

export function buildPerceptualGradientStops(
  colors: readonly string[],
  positions?: readonly number[],
): GradientColorStops {
  if (colors.length < 2)
    return [0, colors[0] ?? "#FFFFFF", 1, colors[0] ?? "#FFFFFF"];
  const resolvedPositions =
    positions ?? colors.map((_, index) => index / (colors.length - 1));
  const stops: Array<number | string> = [];
  for (let index = 0; index < colors.length - 1; index += 1)
    appendPerceptualSegment(
      stops,
      colors[index]!,
      colors[index + 1]!,
      resolvedPositions[index]!,
      resolvedPositions[index + 1]!,
      4,
      index === 0,
    );
  return stops;
}

export function resolveConicThirdColor(
  gradient: NonNullable<BackgroundDesign["gradient"]>,
) {
  return gradient.color3 ?? mixGradientColors(gradient.color2, "#FFFFFF", 0.38);
}

export function resolveGradientColorStops(
  gradient: NonNullable<BackgroundDesign["gradient"]>,
): GradientColorStops {
  if (gradient.type === "radial")
    return buildPerceptualGradientStops(
      [gradient.color1, gradient.color1, gradient.color2],
      [0, 0.14, 1],
    );
  if (gradient.type === "conic") {
    const color3 = resolveConicThirdColor(gradient);
    return buildPerceptualGradientStops(
      [gradient.color1, gradient.color2, color3, gradient.color1],
      [0, 0.34, 0.68, 1],
    );
  }
  return buildPerceptualGradientStops([gradient.color1, gradient.color2]);
}
