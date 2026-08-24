export type FittedText = {
  text: string;
  fontSize: number;
  lineHeight: number;
  lines: number;
  truncated: boolean;
};

export type TextFitOptions = {
  text: string;
  width: number;
  preferredFontSize: number;
  minimumFontSize: number;
  maximumLines: number;
  averageGlyphWidth?: number;
};

function wrapAt(text: string, charactersPerLine: number): string[] {
  if (!text.trim()) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (word.length > charactersPerLine) {
      if (current) lines.push(current);
      for (let index = 0; index < word.length; index += charactersPerLine)
        lines.push(word.slice(index, index + charactersPerLine));
      current = "";
      continue;
    }
    const next = current ? `${current} ${word}` : word;
    if (next.length <= charactersPerLine) current = next;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function fitText({
  text,
  width,
  preferredFontSize,
  minimumFontSize,
  maximumLines,
  averageGlyphWidth = 0.54,
}: TextFitOptions): FittedText {
  const safeText = text.trim();
  for (
    let fontSize = preferredFontSize;
    fontSize >= minimumFontSize;
    fontSize -= 1
  ) {
    const charactersPerLine = Math.max(
      1,
      Math.floor(width / (fontSize * averageGlyphWidth)),
    );
    const lines = wrapAt(safeText, charactersPerLine);
    if (lines.length <= maximumLines)
      return {
        text: lines.join("\n"),
        fontSize,
        lineHeight: 1.16,
        lines: Math.max(1, lines.length),
        truncated: false,
      };
  }
  const charactersPerLine = Math.max(
    1,
    Math.floor(width / (minimumFontSize * averageGlyphWidth)),
  );
  const lines = wrapAt(safeText, charactersPerLine);
  const visible = lines.slice(0, maximumLines);
  if (lines.length > maximumLines && visible.length > 0) {
    const last = visible.length - 1;
    visible[last] =
      `${visible[last]!.slice(0, Math.max(1, charactersPerLine - 1)).trimEnd()}…`;
  }
  return {
    text: visible.join("\n"),
    fontSize: minimumFontSize,
    lineHeight: 1.16,
    lines: Math.max(1, visible.length),
    truncated: lines.length > maximumLines,
  };
}
