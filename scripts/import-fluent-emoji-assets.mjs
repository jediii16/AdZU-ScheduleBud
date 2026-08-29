import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

import { enrichEmojiCatalog } from "./lib/emoji-test-metadata.mjs";

const workspace = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(
  process.argv[2] ?? join(workspace, ".tmp-fluentui-emoji"),
);
const sourceCommit = process.argv[3] ?? "unrecorded-source-checkout";
const sourceAssets = join(sourceRoot, "assets");
const publicRoot = resolve(workspace, "public", "emojis");
const outputAssets = join(publicRoot, "fluent");
const catalogPath = resolve(
  workspace,
  "src",
  "data",
  "emojis",
  "catalog.generated.json",
);
const sourceInfoPath = resolve(
  workspace,
  "src",
  "data",
  "emojis",
  "source.generated.json",
);
const emojiTestPath = resolve(
  workspace,
  "source-data",
  "unicode",
  "emoji-test.txt",
);

const categoryIds = {
  "Smileys & Emotion": "smileys-emotion",
  "People & Body": "people-body",
  "Animals & Nature": "animals-nature",
  "Food & Drink": "food-drink",
  "Travel & Places": "travel-places",
  Activities: "activities",
  Objects: "objects",
  Symbols: "symbols",
  Flags: "flags",
};

const toneByFolder = {
  Default: { suffix: "", label: "" },
  Light: { suffix: "1f3fb", label: "Light Skin Tone" },
  "Medium-Light": { suffix: "1f3fc", label: "Medium-Light Skin Tone" },
  Medium: { suffix: "1f3fd", label: "Medium Skin Tone" },
  "Medium-Dark": { suffix: "1f3fe", label: "Medium-Dark Skin Tone" },
  Dark: { suffix: "1f3ff", label: "Dark Skin Tone" },
};

function assertDirectory(path, label) {
  if (!statSync(path, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`${label} was not found: ${path}`);
  }
}

function assertSafeOutput(path) {
  const requiredPrefix = `${workspace}${sep}`;
  if (!path.startsWith(requiredPrefix) || basename(path) !== "emojis") {
    throw new Error(`Refusing to replace unexpected output directory: ${path}`);
  }
}

function walkFiles(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? walkFiles(child) : [child];
  });
}

function unicodeToGlyph(unicode) {
  return String.fromCodePoint(
    ...unicode.split(/\s+/).map((value) => Number.parseInt(value, 16)),
  );
}

function titleCase(value) {
  return value.replace(/(^|[\s-])\p{Ll}/gu, (match) => match.toUpperCase());
}

function svgDimensions(svg) {
  const viewBox = svg.match(
    /viewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i,
  );
  if (viewBox) {
    return {
      intrinsicWidth: Number.parseFloat(viewBox[1]),
      intrinsicHeight: Number.parseFloat(viewBox[2]),
    };
  }
  const width = svg.match(/\bwidth=["']([\d.]+)/i);
  const height = svg.match(/\bheight=["']([\d.]+)/i);
  if (!width || !height) throw new Error("SVG has no usable dimensions");
  return {
    intrinsicWidth: Number.parseFloat(width[1]),
    intrinsicHeight: Number.parseFloat(height[1]),
  };
}

function toneForFile(assetDirectory, file) {
  const parts = relative(assetDirectory, file).split(sep);
  if (parts[0] === "Color") return toneByFolder.Default;
  return toneByFolder[parts[0]];
}

function unicodeForTone(metadata, tone) {
  if (!tone.suffix) return metadata.unicode;
  return metadata.unicodeSkintones?.find((unicode) =>
    unicode.toLowerCase().includes(tone.suffix),
  );
}

assertDirectory(sourceAssets, "Fluent Emoji assets directory");
assertSafeOutput(publicRoot);

const metadataFiles = walkFiles(sourceAssets).filter(
  (file) => basename(file) === "metadata.json",
);
const candidates = [];
const skipped = [];

for (const metadataFile of metadataFiles) {
  const assetDirectory = dirname(metadataFile);
  const metadata = JSON.parse(readFileSync(metadataFile, "utf8"));
  const category = categoryIds[metadata.group];
  if (!category) {
    skipped.push(
      `${relative(sourceAssets, assetDirectory)}: unknown group ${metadata.group}`,
    );
    continue;
  }

  const colorFiles = walkFiles(assetDirectory).filter(
    (file) => file.endsWith(".svg") && basename(dirname(file)) === "Color",
  );
  if (colorFiles.length === 0) {
    skipped.push(`${relative(sourceAssets, assetDirectory)}: no Color SVG`);
    continue;
  }

  for (const file of colorFiles) {
    const tone = toneForFile(assetDirectory, file);
    const unicode = tone && unicodeForTone(metadata, tone);
    if (!tone || !unicode) {
      skipped.push(`${relative(sourceAssets, file)}: unmatched skin tone`);
      continue;
    }
    candidates.push({
      assetDirectory,
      file,
      metadata,
      category,
      tone,
      unicode,
    });
  }
}

// A few upstream folders contain duplicate spellings of the same artwork.
// Stable Unicode IDs let us deterministically keep one canonical file.
const byUnicode = new Map();
for (const candidate of candidates.sort((left, right) =>
  relative(left.assetDirectory, left.file).localeCompare(
    relative(right.assetDirectory, right.file),
  ),
)) {
  if (!byUnicode.has(candidate.unicode))
    byUnicode.set(candidate.unicode, candidate);
}

rmSync(publicRoot, { recursive: true, force: true });
mkdirSync(outputAssets, { recursive: true });

const importedCatalog = [...byUnicode.values()]
  .map(({ file, metadata, category, tone, unicode }) => {
    const idSuffix = unicode.toLowerCase().replaceAll(" ", "-");
    const filename = `${idSuffix}.svg`;
    const output = join(outputAssets, filename);
    copyFileSync(file, output);
    const dimensions = svgDimensions(readFileSync(file, "utf8"));
    const baseLabel = titleCase(metadata.cldr || metadata.tts);
    const label = tone.label ? `${baseLabel}: ${tone.label}` : baseLabel;
    return {
      id: `fluent-${idSuffix}`,
      label,
      category,
      src: `/emojis/fluent/${filename}`,
      keywords: [
        metadata.glyph,
        metadata.cldr,
        metadata.tts,
        metadata.group,
        ...(metadata.keywords ?? []),
        ...(tone.label ? [tone.label] : []),
      ].filter(
        (value, index, values) => value && values.indexOf(value) === index,
      ),
      ...dimensions,
      glyph: unicodeToGlyph(unicode),
      unicode,
    };
  })
  .sort((left, right) => left.label.localeCompare(right.label));

const emojiTest = readFileSync(emojiTestPath, "utf8");
const catalog = enrichEmojiCatalog(importedCatalog, emojiTest);
const unicodeVersion =
  emojiTest.match(/^# Version:\s*(.+)$/m)?.[1] ?? "unknown";

copyFileSync(join(sourceRoot, "LICENSE"), join(outputAssets, "LICENSE.txt"));
mkdirSync(dirname(catalogPath), { recursive: true });
writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
writeFileSync(
  sourceInfoPath,
  `${JSON.stringify(
    {
      name: "Microsoft Fluent Emoji",
      source: "https://github.com/microsoft/fluentui-emoji",
      license: "MIT",
      licensePath: "/emojis/fluent/LICENSE.txt",
      commit: sourceCommit,
      style: "Color",
      emojiCount: catalog.length,
      unicodeSource:
        "https://www.unicode.org/Public/emoji/latest/emoji-test.txt",
      unicodeVersion,
      skipped,
    },
    null,
    2,
  )}\n`,
);

console.log(`Imported ${catalog.length} Fluent Color emoji assets.`);
console.log(`Skipped ${skipped.length} upstream asset folders/files.`);
