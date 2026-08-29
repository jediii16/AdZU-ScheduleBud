import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { stickerCatalog, stickerCategories } from "@/data/stickers/catalog";
import {
  emojiCatalog,
  emojiCatalogSource,
  emojiCategories,
} from "@/data/emojis/catalog";
import { deviceVariantSchema } from "@/domain/device/types";
import { buildScheduleRenderModel } from "@/domain/render";
import {
  clampStickerInstance,
  stickerPixelGeometry,
} from "@/domain/stickers/geometry";
import { selectActiveDeviceVariant } from "@/state/selectors";
import { createTestStore, MemoryProjectRepository } from "../state/helpers";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

describe("built-in sticker system", () => {
  it("catalogs only real assets and non-empty categories", () => {
    expect(emojiCatalog).toHaveLength(3145);
    expect(stickerCatalog).toHaveLength(3160);
    expect(stickerCategories).toEqual(["Capybara", "Emojis"]);
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
    expect(
      emojiCategories.map((category) => [
        category.id,
        emojiCatalog.filter((emoji) => emoji.category === category.id).length,
      ]),
    ).toEqual([
      ["smileys-emotion", 168],
      ["people-body", 1893],
      ["animals-nature", 158],
      ["food-drink", 130],
      ["travel-places", 218],
      ["activities", 85],
      ["objects", 262],
      ["symbols", 223],
      ["flags", 8],
    ]);
    for (const sticker of stickerCatalog) {
      expect(sticker.label).not.toMatch(/\.svg$/i);
      expect(existsSync(join(process.cwd(), "public", sticker.src))).toBe(true);
      expect(
        stickerCatalog.some((item) => item.category === sticker.category),
      ).toBe(true);
    }
    expect(
      emojiCatalog.every((emoji) => !emoji.src.includes("source-assets")),
    ).toBe(true);
    expect(
      emojiCatalog.every(
        (emoji) =>
          emoji.src.startsWith("/emojis/fluent/") &&
          emoji.intrinsicWidth > 0 &&
          emoji.intrinsicHeight > 0,
      ),
    ).toBe(true);
    expect(emojiCatalog.every((emoji) => !/ Emoji$/.test(emoji.label))).toBe(
      true,
    );
    expect(new Set(emojiCatalog.map((emoji) => emoji.id))).toHaveProperty(
      "size",
      emojiCatalog.length,
    );
    expect(emojiCatalogSource).toMatchObject({
      name: "Microsoft Fluent Emoji",
      license: "MIT",
      style: "Color",
      emojiCount: emojiCatalog.length,
      skipped: [],
    });
    expect(
      existsSync(join(process.cwd(), "public", emojiCatalogSource.licensePath)),
    ).toBe(true);
    expect(emojiCatalog[0]).not.toHaveProperty("defaultWidthRatio");
  });

  it("defaults legacy variants to an empty sticker composition", () => {
    const parsed = deviceVariantSchema.parse({
      id: "legacy",
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
      dimensionSource: "custom",
      presetId: null,
      orientation: "portrait",
      compositionId: "cards-phone",
      schedulePosition: { x: 0.5, y: 0.5 },
      layoutOverride: null,
      densityOverride: null,
      visibleFieldsOverride: null,
      photoTransforms: { hero: {}, split: {}, polaroid: {} },
      preview: {
        mode: "clean",
        showSafeAreas: false,
        showWarnings: true,
        enableSnapping: true,
        guideAssetId: null,
      },
    });
    expect(parsed.stickers).toEqual([]);
  });

  it("keeps proportional normalized geometry stable across dimensions", () => {
    const instance = clampStickerInstance(
      {
        instanceId: "one",
        stickerId: "capy-reading",
        xRatio: 0.4,
        yRatio: 0.6,
        widthRatio: 0.2,
        rotation: 375,
        layer: "in-front",
        order: 0,
      },
      { width: 1080, height: 2400 },
    );
    const phone = stickerPixelGeometry(instance, { width: 1080, height: 2400 });
    const custom = stickerPixelGeometry(instance, {
      width: 1440,
      height: 3200,
    });
    expect(instance.rotation).toBe(15);
    expect(custom.width / phone.width).toBeCloseTo(4 / 3);
    expect(custom.height / custom.width).toBeCloseTo(
      phone.height / phone.width,
    );
    expect((custom.x + custom.width / 2) / 1440).toBeCloseTo(0.4);
  });

  it("adds, transforms, duplicates, layers, stacks, deletes, undoes, and isolates devices", async () => {
    const projects = new MemoryProjectRepository();
    const { store } = createTestStore({ projects });
    store.getState().createProject();
    const phone = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
    })!;
    const desktop = store.getState().createDeviceVariant({
      category: "desktop",
      dimensions: { width: 1920, height: 1080 },
    })!;
    store.getState().setActiveDeviceVariant(phone);
    const first = store.getState().addSticker(phone, "capy-reading")!;
    store.getState().beginHistoryTransaction("Move sticker");
    store.getState().updateSticker(phone, first, {
      xRatio: 0.7,
      yRatio: 0.3,
      widthRatio: 0.35,
      rotation: 30,
    });
    store.getState().updateSticker(phone, first, { xRatio: 0.75 });
    store.getState().commitHistoryTransaction();
    const duplicate = store.getState().duplicateSticker(phone, first)!;
    store.getState().setStickerLayer(phone, first, "behind-schedule");
    store.getState().moveStickerInStack(phone, duplicate, "backward");
    expect(selectActiveDeviceVariant(store.getState())?.stickers).toHaveLength(
      2,
    );
    expect(
      store
        .getState()
        .projectsById[store.getState().activeProjectId!]!.deviceVariants.find(
          (item) => item.id === desktop,
        )?.stickers,
    ).toEqual([]);
    store.getState().deleteSticker(phone, duplicate);
    store.getState().undo();
    expect(selectActiveDeviceVariant(store.getState())?.stickers).toHaveLength(
      2,
    );
    await store.getState().flushAutosave();
    const serialized = JSON.stringify(projects.writes.at(-1));
    expect(serialized).toContain("capy-reading");
    expect(serialized).not.toContain("<svg");
    expect(serialized).not.toContain("/themes/");
  });

  it("places resolved stickers in the exact render-model layer order", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const withStickers = {
      ...variant,
      stickers: [
        {
          instanceId: "behind",
          stickerId: "capy-sleeping",
          xRatio: 0.2,
          yRatio: 0.8,
          widthRatio: 0.2,
          rotation: -15,
          layer: "behind-schedule" as const,
          order: 0,
        },
        {
          instanceId: "front",
          stickerId: "capy-reading",
          xRatio: 0.8,
          yRatio: 0.2,
          widthRatio: 0.18,
          rotation: 20,
          layer: "in-front" as const,
          order: 0,
        },
      ],
    };
    const result = buildScheduleRenderModel(project, withStickers);
    expect(result.model.layers[1].nodes.at(-1)).toMatchObject({
      id: "sticker-behind",
      source: expect.stringContaining("capy-sleeping.svg"),
      rotation: -15,
    });
    expect(result.model.layers[4].nodes.at(-1)).toMatchObject({
      id: "sticker-front",
      source: expect.stringContaining("capy-reading.svg"),
      rotation: 20,
      rotationOrigin: "center",
    });
  });

  it("never creates stickers when a color theme changes", () => {
    const { store } = createTestStore();
    store.getState().createProject();
    const variantId = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
    })!;
    store.getState().setTheme("matcha-study");
    expect(
      store
        .getState()
        .projectsById[store.getState().activeProjectId!]!.deviceVariants.find(
          (item) => item.id === variantId,
        )?.stickers,
    ).toEqual([]);
  });
});
