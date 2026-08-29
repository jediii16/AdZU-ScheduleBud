import generatedCatalog from "./catalog.generated.json";
import generatedSource from "./source.generated.json";

export const emojiCategories = [
  { id: "smileys-emotion", label: "Smileys & Emotion" },
  { id: "people-body", label: "People & Body" },
  { id: "animals-nature", label: "Animals & Nature" },
  { id: "food-drink", label: "Food & Drink" },
  { id: "travel-places", label: "Travel & Places" },
  { id: "activities", label: "Activities" },
  { id: "objects", label: "Objects" },
  { id: "symbols", label: "Symbols" },
  { id: "flags", label: "Flags" },
] as const;
export type EmojiCategoryId = (typeof emojiCategories)[number]["id"];

export type EmojiDefinition = {
  id: string;
  label: string;
  category: EmojiCategoryId;
  src: string;
  keywords: readonly string[];
  intrinsicWidth: number;
  intrinsicHeight: number;
  glyph: string;
  unicode: string;
  subgroup: string;
  sortOrder: number;
};

export type EmojiCatalogSource = {
  name: string;
  source: string;
  license: string;
  licensePath: string;
  commit: string;
  style: string;
  emojiCount: number;
  unicodeSource: string;
  unicodeVersion: string;
  skipped: readonly string[];
};

/**
 * Application-wide emoji artwork catalog.
 *
 * This is deliberately independent of stickers so future background-pattern
 * tools can consume the same stable emoji IDs and public asset sources.
 */
export const emojiCatalog: readonly EmojiDefinition[] =
  generatedCatalog as EmojiDefinition[];
export const emojiCatalogSource = generatedSource as EmojiCatalogSource;
export const emojiById = new Map(
  emojiCatalog.map((emoji) => [emoji.id, emoji]),
);
export const emojiCategoryById = new Map(
  emojiCategories.map((category) => [category.id, category]),
);
