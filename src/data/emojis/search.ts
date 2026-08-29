import {
  emojiCatalog,
  emojiCategoryById,
  type EmojiCategoryId,
  type EmojiDefinition,
} from "./catalog";

type SemanticTopic = {
  aliases: readonly string[];
  triggers: readonly string[];
};

const semanticTopics: readonly SemanticTopic[] = [
  {
    aliases: ["happy", "happiness", "cheerful", "positive"],
    triggers: [
      "beaming",
      "celebrate",
      "delighted",
      "grin",
      "grinning",
      "joy",
      "laugh",
      "party",
      "pleased",
      "smile",
      "smiling",
    ],
  },
  {
    aliases: ["sad", "sadness", "unhappy", "upset", "crying"],
    triggers: [
      "cry",
      "crying",
      "disappointed",
      "frown",
      "frowning",
      "sad",
      "tear",
    ],
  },
  {
    aliases: ["angry", "anger", "annoyed", "mad", "furious"],
    triggers: ["anger", "angry", "enraged", "mad", "rage", "wrath"],
  },
  {
    aliases: ["love", "loving", "romance", "romantic", "affection"],
    triggers: [
      "affection",
      "couple",
      "heart",
      "hearts",
      "kiss",
      "love",
      "romance",
    ],
  },
  {
    aliases: ["funny", "humor", "joke", "silly"],
    triggers: ["clown", "funny", "goofy", "joke", "laugh", "silly", "winking"],
  },
  {
    aliases: ["sick", "ill", "unwell", "medicine", "health"],
    triggers: [
      "bandage",
      "doctor",
      "hospital",
      "medical",
      "nauseated",
      "pill",
      "sick",
      "syringe",
      "thermometer",
      "vomit",
    ],
  },
  {
    aliases: ["tired", "sleepy", "sleep", "rest", "exhausted"],
    triggers: [
      "bed",
      "drowsy",
      "sleep",
      "sleeping",
      "sleepy",
      "tired",
      "yawn",
      "yawning",
    ],
  },
  {
    aliases: ["afraid", "fear", "scared", "scary", "frightened"],
    triggers: [
      "afraid",
      "fear",
      "fearful",
      "frightened",
      "scared",
      "scream",
      "terrified",
    ],
  },
  {
    aliases: ["celebration", "celebrate", "congratulations", "party", "event"],
    triggers: [
      "balloon",
      "birthday",
      "celebrate",
      "confetti",
      "fireworks",
      "party",
      "tada",
    ],
  },
  {
    aliases: ["work", "job", "office", "business", "professional"],
    triggers: [
      "briefcase",
      "business",
      "computer",
      "desktop",
      "keyboard",
      "laptop",
      "office",
      "worker",
    ],
  },
  {
    aliases: ["travel", "trip", "vacation", "holiday", "transport"],
    triggers: [
      "airplane",
      "airport",
      "bus",
      "car",
      "hotel",
      "luggage",
      "map",
      "passport",
      "ship",
      "train",
      "travel",
    ],
  },
  {
    aliases: [
      "food",
      "hungry",
      "meal",
      "snack",
      "breakfast",
      "lunch",
      "dinner",
    ],
    triggers: ["food drink"],
  },
  {
    aliases: ["weather", "forecast", "climate"],
    triggers: [
      "cloud",
      "lightning",
      "rain",
      "snow",
      "storm",
      "sun",
      "tornado",
      "umbrella",
      "weather",
      "wind",
    ],
  },
  {
    aliases: ["sport", "sports", "exercise", "fitness", "game"],
    triggers: [
      "ball",
      "boxing",
      "exercise",
      "game",
      "runner",
      "sport",
      "swimming",
      "trophy",
      "weight",
    ],
  },
  {
    aliases: ["music", "song", "audio", "sound"],
    triggers: [
      "drum",
      "guitar",
      "headphone",
      "microphone",
      "music",
      "musical",
      "piano",
      "radio",
      "speaker",
    ],
  },
  {
    aliases: ["money", "payment", "finance", "cash", "price"],
    triggers: [
      "bank",
      "cash",
      "coin",
      "credit card",
      "currency",
      "dollar",
      "euro",
      "money",
      "pound",
      "wallet",
      "yen",
    ],
  },
  {
    aliases: ["time", "date", "schedule", "appointment"],
    triggers: [
      "alarm",
      "calendar",
      "clock",
      "hourglass",
      "stopwatch",
      "time",
      "timer",
      "watch",
    ],
  },
  {
    aliases: ["message", "chat", "communication", "contact", "talk"],
    triggers: [
      "email",
      "envelope",
      "mail",
      "message",
      "phone",
      "speech",
      "telephone",
    ],
  },
];

const educationAliases = [
  "school",
  "student",
  "study",
  "studying",
  "education",
  "class",
  "classroom",
  "learning",
  "homework",
  "academic",
  "university",
  "college",
] as const;

const educationUnicodeOrder = [
  "1f393", // graduation cap
  "1f4da", // books
  "270f fe0f", // pencil
  "1f4dd", // memo
  "1f3eb", // school
  "1f392", // backpack
  "1f4d6", // open book
  "1f4d3", // notebook
  "1f4cf", // straight ruler
  "1f4d0", // triangular ruler
  "1f9ee", // abacus
  "1f52c", // microscope
  "1f4bb", // laptop
] as const;

const educationRank: ReadonlyMap<string, number> = new Map(
  educationUnicodeOrder.map((unicode, index) => [unicode, index]),
);

const happinessAliases = [
  "happy",
  "happiness",
  "cheerful",
  "positive",
] as const;
const happinessUnicodeOrder = [
  "1f600", // grinning face
  "1f603", // grinning face with big eyes
  "1f604", // grinning face with smiling eyes
  "1f601", // beaming face with smiling eyes
  "1f606", // grinning squinting face
  "1f605", // grinning face with sweat
  "1f923", // rolling on the floor laughing
  "1f602", // face with tears of joy
  "1f642", // slightly smiling face
] as const;
const happinessRank: ReadonlyMap<string, number> = new Map(
  happinessUnicodeOrder.map((unicode, index) => [unicode, index]),
);

export function normalizeEmojiSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function termMatches(values: readonly string[], query: string) {
  const tokens = query.split(" ");
  return tokens.every((token) =>
    values.some((value) =>
      value.split(" ").some((word) => word.startsWith(token)),
    ),
  );
}

function containsPhrase(values: readonly string[], query: string) {
  return values.some(
    (value) =>
      value === query ||
      value.startsWith(`${query} `) ||
      value.includes(` ${query} `) ||
      value.endsWith(` ${query}`),
  );
}

function fieldScore(values: readonly string[], query: string, base: number) {
  if (values.some((value) => value === query)) return base;
  if (values.some((value) => value.startsWith(query))) return base - 50;
  if (containsPhrase(values, query)) return base - 100;
  if (termMatches(values, query)) return base - 150;
  return 0;
}

function hasTrigger(values: readonly string[], trigger: string) {
  return values.some(
    (value) =>
      value === trigger ||
      value.startsWith(`${trigger} `) ||
      value.endsWith(` ${trigger}`) ||
      value.includes(` ${trigger} `),
  );
}

export type EmojiSearchMetadata = {
  name: string;
  keywords: readonly string[];
  semanticAliases: readonly string[];
  category: string;
  subgroup: string;
};

export function getEmojiSearchMetadata(
  emoji: EmojiDefinition,
): EmojiSearchMetadata {
  const name = normalizeEmojiSearch(emoji.label);
  const category = normalizeEmojiSearch(
    emojiCategoryById.get(emoji.category)?.label ?? emoji.category,
  );
  const subgroup = normalizeEmojiSearch(emoji.subgroup.replaceAll("-", " "));
  const keywords = emoji.keywords.map(normalizeEmojiSearch).filter(Boolean);
  const searchableMetadata = [name, category, subgroup, ...keywords];
  const semanticAliases = new Set<string>();

  for (const topic of semanticTopics) {
    if (
      topic.triggers.some((trigger) => hasTrigger(searchableMetadata, trigger))
    ) {
      topic.aliases.forEach((alias) => semanticAliases.add(alias));
      topic.triggers.forEach((trigger) => semanticAliases.add(trigger));
    }
  }
  if (educationRank.has(emoji.unicode)) {
    educationAliases.forEach((alias) => semanticAliases.add(alias));
  }

  return {
    name,
    keywords,
    semanticAliases: [...semanticAliases].map(normalizeEmojiSearch),
    category,
    subgroup,
  };
}

type IndexedEmoji = {
  emoji: EmojiDefinition;
  metadata: EmojiSearchMetadata;
};

const searchIndex: readonly IndexedEmoji[] = emojiCatalog.map((emoji) => ({
  emoji,
  metadata: getEmojiSearchMetadata(emoji),
}));

export type EmojiSearchResult = {
  emoji: EmojiDefinition;
  score: number;
  matchedOn: "name" | "keyword" | "semantic" | "category";
};

export function searchEmojiCatalog(
  query: string,
  options: { category?: EmojiCategoryId } = {},
): readonly EmojiSearchResult[] {
  const normalizedQuery = normalizeEmojiSearch(query);
  if (!normalizedQuery) return [];
  const isEducationQuery = educationAliases.includes(
    normalizedQuery as (typeof educationAliases)[number],
  );
  const isHappinessQuery = happinessAliases.includes(
    normalizedQuery as (typeof happinessAliases)[number],
  );
  const includesSkinTone = ["skin", "tone", "light", "medium", "dark"].some(
    (term) => normalizedQuery.split(" ").includes(term),
  );

  return searchIndex
    .filter(
      ({ emoji }) =>
        (!options.category || emoji.category === options.category) &&
        (includesSkinTone || !/\b1f3f[b-f]\b/.test(emoji.unicode)),
    )
    .map(({ emoji, metadata }): EmojiSearchResult | null => {
      const nameScore = fieldScore([metadata.name], normalizedQuery, 1000);
      const keywordScore = fieldScore(metadata.keywords, normalizedQuery, 800);
      const semanticScore = fieldScore(
        metadata.semanticAliases,
        normalizedQuery,
        600,
      );
      const categoryScore = fieldScore(
        [metadata.category, metadata.subgroup],
        normalizedQuery,
        400,
      );
      const bestScore = Math.max(
        nameScore,
        keywordScore,
        semanticScore,
        categoryScore,
      );
      if (!bestScore) return null;

      const curatedEducationRank = isEducationQuery
        ? educationRank.get(emoji.unicode)
        : undefined;
      const curatedHappinessRank = isHappinessQuery
        ? happinessRank.get(emoji.unicode)
        : undefined;
      const score =
        curatedEducationRank !== undefined
          ? 2000 - curatedEducationRank
          : curatedHappinessRank !== undefined
            ? 1900 - curatedHappinessRank
            : bestScore;
      const matchedOn =
        curatedEducationRank !== undefined ||
        curatedHappinessRank !== undefined ||
        semanticScore === bestScore
          ? "semantic"
          : nameScore === bestScore
            ? "name"
            : keywordScore === bestScore
              ? "keyword"
              : "category";
      return { emoji, score, matchedOn };
    })
    .filter((result): result is EmojiSearchResult => result !== null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.emoji.sortOrder - right.emoji.sortOrder,
    );
}
