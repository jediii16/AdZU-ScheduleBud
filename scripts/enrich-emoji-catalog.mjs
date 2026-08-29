import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { enrichEmojiCatalog } from "./lib/emoji-test-metadata.mjs";

const workspace = resolve(import.meta.dirname, "..");
const catalogPath = resolve(
  workspace,
  "src",
  "data",
  "emojis",
  "catalog.generated.json",
);
const emojiTestPath = resolve(
  workspace,
  "source-data",
  "unicode",
  "emoji-test.txt",
);

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const emojiTest = readFileSync(emojiTestPath, "utf8");
const enriched = enrichEmojiCatalog(catalog, emojiTest);

writeFileSync(catalogPath, `${JSON.stringify(enriched, null, 2)}\n`);
console.log(`Enriched ${enriched.length} emoji catalog entries.`);
