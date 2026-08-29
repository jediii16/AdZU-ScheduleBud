const CATEGORY_ID_BY_GROUP = {
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

export function parseEmojiTest(value) {
  const metadataByUnicode = new Map();
  let group = "";
  let subgroup = "";
  let sortOrder = 0;

  for (const line of value.split(/\r?\n/)) {
    if (line.startsWith("# group: ")) {
      group = line.slice("# group: ".length);
      continue;
    }
    if (line.startsWith("# subgroup: ")) {
      subgroup = line.slice("# subgroup: ".length);
      continue;
    }
    const match = line.match(/^([0-9A-F ]+)\s*;\s*(fully-qualified|component)/);
    if (!match) continue;
    metadataByUnicode.set(match[1].trim().toLowerCase(), {
      group,
      subgroup,
      sortOrder,
    });
    sortOrder += 1;
  }

  return metadataByUnicode;
}

export function enrichEmojiCatalog(catalog, emojiTest) {
  const metadataByUnicode = parseEmojiTest(emojiTest);
  return catalog
    .map((emoji) => {
      const metadata = metadataByUnicode.get(emoji.unicode);
      if (!metadata) {
        throw new Error(`Unicode metadata is missing for ${emoji.unicode}`);
      }
      const category = CATEGORY_ID_BY_GROUP[metadata.group];
      if (!category) {
        throw new Error(`Unknown Unicode emoji group: ${metadata.group}`);
      }
      return {
        ...emoji,
        category,
        subgroup: metadata.subgroup,
        sortOrder: metadata.sortOrder,
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}
