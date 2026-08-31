import { afterEach, describe, expect, it, vi } from "vitest";

import {
  TYPOGRAPHY_PRESET_IDS,
  resolveTypographyPreset,
  typographyPresets,
} from "@/data/typography/registry";
import { migrateProject } from "@/domain/project";
import {
  applyTypographyPreset,
  buildScheduleRenderModel,
  createCustomPalette,
  estimateTextWidthForFont,
  isWallpaperTitleNode,
  resolveAvailableWeight,
  type RenderModel,
  type TextRenderNode,
} from "@/domain/render";
import type { DeviceVariant } from "@/domain/device/types";
import {
  ensureRenderModelFonts,
  fontFamilyForId,
  renderModelFontSignature,
} from "@/renderer/konva/font-loading";
import { fontRegistry } from "@/lib/font-registry";
import { createTestStore, MemoryProjectRepository } from "../state/helpers";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

afterEach(() => vi.restoreAllMocks());

const EXPECTED_SCHEDULE_FONTS = [
  ["poppins-inter", "inter", "Inter"],
  ["outfit-dm-sans", "dm-sans", "DM Sans"],
  ["playfair-inter", "inter", "Inter"],
  ["cormorant-source-sans", "source-sans-3", "Source Sans 3"],
  ["quicksand-dm-sans", "dm-sans", "DM Sans"],
  ["league-spartan-inter", "inter", "Inter"],
  ["allura-manrope", "manrope", "Manrope"],
] as const;

const RENDER_CASES = [
  ["cards", null],
  ["minimal", null],
  ["grid", null],
  ["planner", null],
  ["photo", "hero"],
  ["photo", "split"],
  ["photo", "polaroid"],
] as const;

function auditDeviceVariants(
  project: ReturnType<typeof visualScheduleProject>,
): DeviceVariant[] {
  const phone = project.deviceVariants[0]!;
  return [
    phone,
    {
      ...phone,
      id: "typography-tablet-portrait",
      category: "tablet",
      dimensions: { width: 1536, height: 2048 },
      orientation: "portrait",
      presetId: null,
    },
    {
      ...phone,
      id: "typography-tablet-landscape",
      category: "tablet",
      dimensions: { width: 2048, height: 1536 },
      orientation: "landscape",
      presetId: null,
    },
    project.deviceVariants[1]!,
    {
      ...phone,
      id: "typography-square",
      category: "square",
      dimensions: { width: 1080, height: 1080 },
      orientation: "square",
      presetId: null,
    },
  ];
}

describe("paired typography", () => {
  it("publishes the complete stable catalog and exact ScheduleBud baseline", () => {
    expect(typographyPresets.map((preset) => preset.id)).toEqual(
      TYPOGRAPHY_PRESET_IDS,
    );
    expect(resolveTypographyPreset("schedulebud")).toMatchObject({
      titleFont: "heading-sans",
      scheduleFont: "body-sans",
      baseline: true,
    });
  });

  it("defaults old projects, including the former font object, to ScheduleBud", () => {
    const current = visualScheduleProject();
    const { typography: _typography, ...withoutTypography } = current.design;
    void _typography;
    expect(
      migrateProject({ ...current, design: withoutTypography }),
    ).toMatchObject({
      status: "success",
      project: { design: { typography: { presetId: "schedulebud" } } },
    });
    expect(
      migrateProject({
        ...current,
        design: {
          ...current.design,
          typography: {
            bodyFontId: "body-sans",
            headingFontId: "heading-sans",
            scale: 1,
          },
        },
      }),
    ).toMatchObject({
      status: "success",
      project: { design: { typography: { presetId: "schedulebud" } } },
    });
  });

  it("resolves title and functional text separately while preserving Polaroid captions", () => {
    const project = visualScheduleProject();
    project.design.layoutId = "photo";
    project.design.photoComposition = "polaroid";
    project.assetReferences.photoAssetIds.push("photo-1");
    project.design.photoCaptions["photo-1"] = "Study day";
    project.design.typography = { presetId: "allura-manrope" };
    const result = buildScheduleRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    const text = result.model.layers
      .flatMap((layer) => layer.nodes)
      .filter((node) => node.kind === "text");
    expect(
      text.find((node) => node.id === "photo-polaroid-title"),
    ).toMatchObject({ fontId: "allura", fontWeight: 400 });
    expect(
      text.find((node) => node.id.startsWith("photo-polaroid-day-")),
    ).toMatchObject({ fontId: "manrope" });
    expect(
      text.find((node) => node.id.startsWith("polaroid-caption-")),
    ).toMatchObject({ fontId: "caption-hand" });
  });

  it.each(EXPECTED_SCHEDULE_FONTS)(
    "%s applies the exact %s family to every functional text node",
    (presetId, expectedFontId, expectedFamily) => {
      const preset = resolveTypographyPreset(presetId);
      expect(preset.scheduleFont).toBe(expectedFontId);
      expect(fontRegistry[expectedFontId].label).toBe(expectedFamily);
      expect(fontFamilyForId(expectedFontId)).toContain(expectedFamily);

      for (const [layoutId, composition] of RENDER_CASES) {
        const project = visualScheduleProject();
        project.design.layoutId = layoutId;
        project.design.typography = { presetId };
        if (composition) project.design.photoComposition = composition;
        if (composition === "polaroid") {
          project.assetReferences.photoAssetIds.push("font-proof-photo");
          project.design.photoCaptions["font-proof-photo"] = "Keep Caveat";
        }
        const textNodes = buildScheduleRenderModel(
          project,
          project.deviceVariants[1]!,
        ).model.layers.flatMap((layer) =>
          layer.nodes.filter((node) => node.kind === "text"),
        );
        const titles = textNodes.filter(isWallpaperTitleNode);
        const functional = textNodes.filter(
          (node) =>
            !isWallpaperTitleNode(node) && node.fontId !== "caption-hand",
        );
        expect(
          functional.length,
          `${layoutId}/${composition} functional`,
        ).toBeGreaterThan(0);
        if (titles.length > 0)
          expect(new Set(titles.map((node) => node.fontId))).toEqual(
            new Set([preset.titleFont]),
          );
        expect(new Set(functional.map((node) => node.fontId))).toEqual(
          new Set([expectedFontId]),
        );
        const captions = textNodes.filter(
          (node) => node.fontId === "caption-hand",
        );
        if (composition === "polaroid") expect(captions).toHaveLength(1);
      }
    },
  );

  it("keeps Wednesday intact with Manrope and safely enlarges Allura titles", () => {
    const project = visualScheduleProject();
    project.design.layoutId = "minimal";
    project.design.dayVisibility = "full-week";
    project.design.typography = { presetId: "allura-manrope" };
    const result = buildScheduleRenderModel(
      project,
      project.deviceVariants[1]!,
    );
    const text = result.model.layers
      .flatMap((layer) => layer.nodes)
      .filter((node) => node.kind === "text");
    const wednesday = text.find((node) => node.id === "day-Wed")!;
    expect(wednesday).toMatchObject({ text: "Wednesday", fontId: "manrope" });
    expect(wednesday.width / wednesday.fontSize).toBeGreaterThanOrEqual(5.8);

    const title = text.find(isWallpaperTitleNode)!;
    expect(title).toMatchObject({ fontId: "allura", fontWeight: 400 });
    const baselineProject = visualScheduleProject();
    baselineProject.design.layoutId = "minimal";
    const baselineTitle = buildScheduleRenderModel(
      baselineProject,
      baselineProject.deviceVariants[1]!,
    )
      .model.layers.flatMap((layer) => layer.nodes)
      .find((node) => node.kind === "text" && isWallpaperTitleNode(node));
    expect(baselineTitle?.kind).toBe("text");
    if (!baselineTitle || baselineTitle.kind !== "text") return;
    expect(title.fontSize).toBeCloseTo(baselineTitle.fontSize * 1.2);
    expect(title.height).toBeGreaterThanOrEqual(title.fontSize * 1.32);

    project.design.wallpaperTitle.text = "My Weekly Class Schedule";
    const longTitle = buildScheduleRenderModel(
      project,
      project.deviceVariants[0]!,
    )
      .model.layers.flatMap((layer) => layer.nodes)
      .find((node) => node.kind === "text" && isWallpaperTitleNode(node));
    expect(longTitle?.kind).toBe("text");
    if (!longTitle || longTitle.kind !== "text") return;
    const glyphUnits = [...longTitle.text].reduce(
      (sum, character) => sum + (character === " " ? 0.36 : 1),
      0,
    );
    expect(
      glyphUnits * longTitle.fontSize * 0.5 + longTitle.fontSize * 0.8,
    ).toBeLessThanOrEqual(longTitle.width + 0.01);
  });

  it.each(EXPECTED_SCHEDULE_FONTS)(
    "%s keeps every single-line functional label inside its box on all devices and layouts",
    (presetId) => {
      for (const [layoutId, composition] of RENDER_CASES) {
        const project = visualScheduleProject();
        project.design.layoutId = layoutId;
        project.design.dayVisibility = "full-week";
        project.design.typography = { presetId };
        if (composition) project.design.photoComposition = composition;
        for (const variant of auditDeviceVariants(project)) {
          const textNodes = buildScheduleRenderModel(project, variant)
            .model.layers.flatMap((layer) => layer.nodes)
            .filter(
              (node): node is TextRenderNode =>
                node.kind === "text" &&
                !isWallpaperTitleNode(node) &&
                node.fontId !== "caption-hand" &&
                node.wrap === "none" &&
                !node.text.includes("\n"),
            );
          for (const node of textNodes) {
            const estimatedWidth = estimateTextWidthForFont(
              node.text,
              node.fontSize,
              node.fontId,
              node.fontWeight ?? 400,
              node.letterSpacing ?? 0,
            );
            const safeWidth = node.width - Math.max(1, node.fontSize * 0.08);
            expect(
              estimatedWidth,
              `${presetId}/${layoutId}/${composition}/${variant.id}/${node.id}: ${node.text}`,
            ).toBeLessThanOrEqual(safeWidth + 0.01);
            if (node.id.startsWith("grid-hour-label-"))
              expect(node.text).not.toMatch(/\s[AP]$/);
          }
          if (layoutId === "grid" && variant.category === "phone") {
            const fullPeriodLabels = textNodes
              .filter((node) => node.id.startsWith("grid-hour-label-"))
              .map((node) => node.text)
              .filter((text) => /\s(?:AM|PM)$/.test(text));
            expect(
              fullPeriodLabels.length,
              `${presetId}/${variant.id} full Grid axis period labels`,
            ).toBeGreaterThan(0);
            for (const label of fullPeriodLabels)
              expect(label).toMatch(/^\d{1,2} (?:AM|PM)$/);
          }
        }
      }
    },
  );

  it.each(EXPECTED_SCHEDULE_FONTS)(
    "%s preserves a complete 8 AM label in the narrow phone Grid axis",
    (presetId, expectedFontId) => {
      const model: RenderModel = {
        width: 60,
        height: 40,
        layers: [
          { id: "background", nodes: [] },
          { id: "scenery", nodes: [] },
          { id: "photos", nodes: [] },
          {
            id: "schedule",
            nodes: [
              {
                id: "grid-hour-label-test",
                kind: "text",
                position: { x: 0, y: 0 },
                width: 60,
                height: 30,
                text: "8 AM",
                fontId: "body-sans",
                fontSize: 24,
                fontWeight: 500,
                wrap: "none",
                fill: "#000000",
              },
            ],
          },
          { id: "foreground", nodes: [] },
        ],
      };
      const node = applyTypographyPreset(model, presetId).layers[3]
        .nodes[0] as TextRenderNode;
      expect(node).toMatchObject({
        text: "8 AM",
        fontId: expectedFontId,
        wrap: "none",
      });
      expect(
        estimateTextWidthForFont(
          node.text,
          node.fontSize,
          node.fontId,
          node.fontWeight ?? 400,
          node.letterSpacing ?? 0,
        ),
      ).toBeLessThanOrEqual(
        node.width - Math.max(1, node.fontSize * 0.08) + 0.01,
      );
    },
  );

  it("maps semantic emphasis to real supported weights", () => {
    expect(resolveAvailableWeight("allura", 800)).toBe(400);
    expect(
      resolveTypographyPreset("cormorant-source-sans").scheduleWeights[500],
    ).toBe(600);
    expect(resolveAvailableWeight("source-sans-3", 600)).toBe(600);
    expect(resolveAvailableWeight("poppins", 800)).toBe(700);
  });

  it("persists one project-level choice across layout/device changes and supports undo/redo", async () => {
    const projects = new MemoryProjectRepository();
    const { store } = createTestStore({ projects });
    store.getState().createProject();
    const variant = store.getState().createDeviceVariant({
      category: "phone",
      dimensions: { width: 1080, height: 2400 },
    })!;
    store.getState().setTypography("playfair-inter");
    store.getState().setLayout("minimal");
    store.getState().setActiveDeviceVariant(variant);
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]!.design
        .typography.presetId,
    ).toBe("playfair-inter");
    store.getState().undo();
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]!.design
        .layoutId,
    ).toBe("cards");
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]!.design
        .typography.presetId,
    ).toBe("playfair-inter");
    store.getState().undo();
    expect(
      store.getState().projectsById[store.getState().activeProjectId!]!.design
        .typography.presetId,
    ).toBe("schedulebud");
    store.getState().redo();
    await store.getState().flushAutosave();
    expect(projects.writes.at(-1)?.design.typography.presetId).toBe(
      "playfair-inter",
    );
  });

  it("waits for every resolved canvas face and rejects unavailable faces", async () => {
    const project = visualScheduleProject();
    project.design.typography = { presetId: "poppins-inter" };
    const model = buildScheduleRenderModel(
      project,
      project.deviceVariants[0]!,
    ).model;
    const load = vi.fn(async (request: string, sample?: string) => {
      void request;
      void sample;
      return [{}] as FontFace[];
    });
    const check = vi.fn(() => true);
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { load, check, ready: Promise.resolve() },
    });
    await ensureRenderModelFonts(model);
    expect(load).toHaveBeenCalled();
    expect(
      load.mock.calls.some(([request]) => String(request).includes("Poppins")),
    ).toBe(true);
    check.mockReturnValue(false);
    project.design.typography = { presetId: "outfit-dm-sans" };
    await expect(
      ensureRenderModelFonts(
        buildScheduleRenderModel(project, project.deviceVariants[0]!).model,
      ),
    ).rejects.toThrow(/failed to load/);
  });

  it("keeps font readiness stable across movement and color-only models", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const baseline = renderModelFontSignature(
      buildScheduleRenderModel(project, variant).model,
    );
    const movedVariant = {
      ...variant,
      schedulePosition: { x: 0.23, y: 0.76 },
    };
    expect(
      renderModelFontSignature(
        buildScheduleRenderModel(project, movedVariant).model,
      ),
    ).toBe(baseline);

    const coloredProject = {
      ...project,
      design: {
        ...project.design,
        themeId: "custom" as const,
        customPalette: {
          ...createCustomPalette("clean-slate"),
          canvas: "#123456",
          primary: "#FEDCBA",
        },
      },
    };
    expect(
      renderModelFontSignature(
        buildScheduleRenderModel(coloredProject, variant).model,
      ),
    ).toBe(baseline);

    const resizedModel = structuredClone(
      buildScheduleRenderModel(project, variant).model,
    );
    for (const layer of resizedModel.layers)
      for (const node of layer.nodes)
        if (node.kind === "text") node.fontSize *= 0.73;
    expect(renderModelFontSignature(resizedModel)).toBe(baseline);

    const typographyProject = {
      ...project,
      design: {
        ...project.design,
        typography: { presetId: "poppins-inter" as const },
      },
    };
    expect(
      renderModelFontSignature(
        buildScheduleRenderModel(typographyProject, variant).model,
      ),
    ).not.toBe(baseline);
  });
});
