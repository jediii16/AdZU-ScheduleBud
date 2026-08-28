import type { StickerDefinition } from "@/domain/stickers/types";

const capybara = (
  id: string,
  label: string,
  filename: string,
  crop: StickerDefinition["crop"],
  keywords: readonly string[] = [],
): StickerDefinition => ({
  id,
  label,
  category: "Capybara",
  src: `/themes/capybara-study-buddy/${filename}`,
  crop,
  keywords,
  defaultWidthRatio: 0.22,
});

export const stickerCatalog = [
  capybara(
    "capy-books-resting",
    "Resting on Books",
    "capy-books-resting.svg",
    { x: 764, y: 404, width: 391, height: 273 },
    ["reading", "study"],
  ),
  capybara(
    "capy-books-stack",
    "Book Stack Capybara",
    "capy-books-stack.svg",
    { x: 801, y: 504, width: 318, height: 213 },
    ["reading", "study"],
  ),
  capybara(
    "capy-drink",
    "Capybara with Drink",
    "capy-drink.svg",
    { x: 886, y: 429, width: 259, height: 273 },
    ["cup", "study break"],
  ),
  capybara(
    "capy-graduate",
    "Graduation Capybara",
    "capy-graduate.svg",
    { x: 439, y: 84, width: 309, height: 272 },
    ["cap", "school"],
  ),
  capybara(
    "capy-laptop",
    "Laptop Capybara",
    "capy-laptop.svg",
    { x: 767, y: 270, width: 323, height: 273 },
    ["computer", "study"],
  ),
  capybara(
    "capy-leaf-hat",
    "Leaf Hat Capybara",
    "capy-leaf-hat.svg",
    { x: 1607, y: 440, width: 206, height: 250 },
    ["plant"],
  ),
  capybara(
    "capy-leaves",
    "Capybara with Leaves",
    "capy-leaves.svg",
    { x: 848, y: 428, width: 223, height: 225 },
    ["plant"],
  ),
  capybara(
    "capy-orange",
    "Capybara with Orange",
    "capy-orange.svg",
    { x: 783, y: 403, width: 247, height: 269 },
    ["fruit"],
  ),
  capybara(
    "capy-pencil",
    "Pencil Capybara",
    "capy-pencil.svg",
    { x: 879, y: 425, width: 161, height: 230 },
    ["writing", "school"],
  ),
  capybara(
    "capy-presenting",
    "Presenting Capybara",
    "capy-presenting.svg",
    { x: 834, y: 425, width: 253, height: 231 },
    ["teacher", "school"],
  ),
  capybara(
    "capy-reading",
    "Reading Capybara",
    "capy-reading.svg",
    { x: 573, y: 429, width: 223, height: 273 },
    ["book", "study"],
  ),
  capybara(
    "capy-sleeping",
    "Sleeping Capybara",
    "capy-sleeping.svg",
    { x: 70, y: 431, width: 365, height: 271 },
    ["rest", "nap"],
  ),
  capybara(
    "capy-snacks",
    "Capybara with Snacks",
    "capy-snacks.svg",
    { x: 1238, y: 434, width: 224, height: 268 },
    ["food", "study break"],
  ),
  capybara(
    "capy-sparkles",
    "Capybara Sparkles",
    "capy-sparkles.svg",
    { x: 827, y: 400, width: 272, height: 276 },
    ["accent", "stars"],
  ),
  capybara(
    "capy-teacher-board",
    "Teacher Capybara",
    "capy-teacher-board.svg",
    { x: 1257, y: 93, width: 350, height: 257 },
    ["presenting", "school"],
  ),
] as const satisfies readonly StickerDefinition[];

export const stickerById = new Map(
  stickerCatalog.map((item) => [item.id, item]),
);
export const stickerCategories = [
  ...new Set(stickerCatalog.map((item) => item.category)),
];
