import generatedCatalog from "./catalog.generated.json";

export const emojiCategories = [
  { id: "emojis-people", label: "Emojis & People" },
  { id: "animals-nature", label: "Animals & Nature" },
  { id: "flags", label: "Flags" },
  { id: "food-drinks", label: "Food & Drinks" },
  { id: "others", label: "Others" },
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
  glyph?: string;
};

/**
 * Application-wide emoji artwork catalog.
 *
 * This is deliberately independent of stickers so future background-pattern
 * tools can consume the same stable emoji IDs and public asset sources.
 */
export const emojiCatalog: readonly EmojiDefinition[] =
  generatedCatalog as EmojiDefinition[];
export const emojiById = new Map(
  emojiCatalog.map((emoji) => [emoji.id, emoji]),
);
export const emojiCategoryById = new Map(
  emojiCategories.map((category) => [category.id, category]),
);
