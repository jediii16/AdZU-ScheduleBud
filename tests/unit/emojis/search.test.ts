import { describe, expect, it } from "vitest";

import { emojiCatalog, emojiCategories } from "@/data/emojis/catalog";
import {
  getEmojiSearchMetadata,
  searchEmojiCatalog,
} from "@/data/emojis/search";

describe("emoji catalog organization and search", () => {
  it("uses the standard Microsoft and Unicode picker groups in CLDR order", () => {
    expect(emojiCategories.map((category) => category.label)).toEqual([
      "Smileys & Emotion",
      "People & Body",
      "Animals & Nature",
      "Food & Drink",
      "Travel & Places",
      "Activities",
      "Objects",
      "Symbols",
      "Flags",
    ]);
    expect(emojiCatalog.slice(0, 6).map((emoji) => emoji.glyph)).toEqual([
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
    ]);
    expect(
      emojiCatalog.every(
        (emoji, index) =>
          Boolean(emoji.subgroup) &&
          (index === 0 ||
            emoji.sortOrder >= emojiCatalog[index - 1]!.sortOrder),
      ),
    ).toBe(true);
  });

  it("expands emotion metadata so natural-language searches find related faces", () => {
    const grinningFace = emojiCatalog.find(
      (emoji) => emoji.unicode === "1f600",
    )!;
    const metadata = getEmojiSearchMetadata(grinningFace);

    expect(metadata.keywords).toEqual(
      expect.arrayContaining(["face", "grin", "grinning face"]),
    );
    expect(metadata.semanticAliases).toEqual(
      expect.arrayContaining(["happy", "smile", "cheerful"]),
    );
    expect(
      searchEmojiCatalog("happy")
        .slice(0, 3)
        .map(({ emoji }) => emoji.glyph),
    ).toEqual(["😀", "😃", "😄"]);
    expect(
      searchEmojiCatalog("happy").some(({ emoji }) =>
        emoji.label.includes("Unamused"),
      ),
    ).toBe(false);
    expect(
      searchEmojiCatalog("happy").some(({ emoji }) =>
        emoji.label.includes("Skin Tone"),
      ),
    ).toBe(false);
  });

  it("ranks useful education concepts for school and student searches", () => {
    const expected = ["🎓", "📚", "✏️", "📝"];

    expect(
      searchEmojiCatalog("school")
        .slice(0, 4)
        .map(({ emoji }) => emoji.glyph),
    ).toEqual(expected);
    expect(
      searchEmojiCatalog("student")
        .slice(0, 4)
        .map(({ emoji }) => emoji.glyph),
    ).toEqual(expected);
  });

  it("supports names, upstream keywords, subgroups, and category-scoped search", () => {
    expect(searchEmojiCatalog("graduation cap")[0]!.emoji.glyph).toBe("🎓");
    expect(
      searchEmojiCatalog("joy").some(({ emoji }) => emoji.glyph === "😂"),
    ).toBe(true);
    expect(
      searchEmojiCatalog("animal mammal", { category: "animals-nature" }).every(
        ({ emoji }) => emoji.category === "animals-nature",
      ),
    ).toBe(true);
  });
});
