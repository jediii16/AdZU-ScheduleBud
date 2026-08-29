import { describe, expect, it } from "vitest";

import {
  DEFAULT_LAYOUT_STYLES,
  layoutStyleRegistry,
  resolveLayoutStyleId,
  stylesForLayout,
} from "@/data/layout-styles/registry";
import { buildScheduleRenderModel } from "@/domain/render";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

describe("contextual layout styles", () => {
  it("keeps the initial catalog layout-specific with explicit baselines", () => {
    expect(
      Object.fromEntries(
        (["minimal", "cards", "grid", "planner", "photo"] as const).map(
          (layout) => [
            layout,
            stylesForLayout(layout).map((style) => style.id),
          ],
        ),
      ),
    ).toEqual({
      minimal: ["minimal-clean", "minimal-editorial", "minimal-bold"],
      cards: ["cards-soft", "cards-outline", "cards-bold", "cards-glass"],
      grid: ["grid-filled", "grid-outline", "grid-soft"],
      planner: ["planner-paper", "planner-soft", "planner-editorial"],
      photo: ["photo-clean", "photo-framed"],
    });
    expect(
      Object.fromEntries(
        layoutStyleRegistry
          .filter((style) => style.baseline)
          .map((style) => [style.layout, style.id]),
      ),
    ).toEqual(DEFAULT_LAYOUT_STYLES);
  });

  it("resolves unsupported Photo styles to Clean without forgetting the preference", () => {
    const preferences = {
      ...DEFAULT_LAYOUT_STYLES,
      photo: "photo-framed" as const,
    };
    expect(
      stylesForLayout("photo", "polaroid").map((style) => style.id),
    ).toEqual(["photo-clean"]);
    expect(resolveLayoutStyleId("photo", preferences, "polaroid")).toBe(
      "photo-clean",
    );
    expect(resolveLayoutStyleId("photo", preferences, "hero")).toBe(
      "photo-framed",
    );
  });

  it("applies deterministic export-safe treatments while retaining geometry", () => {
    const project = visualScheduleProject();
    project.design.layoutId = "cards";
    project.design.themeId = "midnight";
    project.design.layoutStyles.cards = "cards-outline";
    const target = project.deviceVariants[0]!;
    const first = buildScheduleRenderModel(project, target);
    const second = buildScheduleRenderModel(project, target);
    expect(first).toEqual(second);
    expect(first.resolvedStyle).toMatchObject({
      styleId: "cards-outline",
      surfaceTreatment: "outline",
    });
    const card = first.model.layers
      .flatMap((layer) => layer.nodes)
      .find((node) => node.id.startsWith("card-") && node.kind === "rect");
    expect(card).toMatchObject({ kind: "rect" });
    if (!card || card.kind !== "rect") return;
    expect(card.strokeWidth).toBeGreaterThanOrEqual(1);
    expect(card.fill).not.toBe(card.stroke);
  });

  it("adds Photo frames only to compatible Hero and Split compositions", () => {
    const project = visualScheduleProject();
    project.design.layoutId = "photo";
    project.design.photoComposition = "hero";
    project.design.layoutStyles.photo = "photo-framed";
    project.assetReferences.photoAssetIds = ["photo-one"];
    const target = project.deviceVariants[0]!;
    const hero = buildScheduleRenderModel(project, target);
    expect(hero.resolvedStyle?.styleId).toBe("photo-framed");
    expect(
      hero.model.layers
        .flatMap((layer) => layer.nodes)
        .some((node) => node.id === "photo-framed-mat"),
    ).toBe(true);
    expect(
      hero.model.layers
        .flatMap((layer) => layer.nodes)
        .some((node) => node.id === "photo-framed-inner-edge"),
    ).toBe(true);

    project.design.photoComposition = "split";
    project.assetReferences.photoAssetIds = ["photo-one", "photo-two"];
    const split = buildScheduleRenderModel(project, target);
    expect(
      split.model.layers
        .flatMap((layer) => layer.nodes)
        .filter((node) => node.id === "photo-framed-mat"),
    ).toHaveLength(1);
    expect(
      split.model.layers
        .flatMap((layer) => layer.nodes)
        .some(
          (node) =>
            node.id.includes("photo-split-image-") && node.id.includes("frame"),
        ),
    ).toBe(false);

    project.design.photoComposition = "polaroid";
    const polaroid = buildScheduleRenderModel(project, target);
    expect(polaroid.resolvedStyle?.styleId).toBe("photo-clean");
    expect(
      polaroid.model.layers
        .flatMap((layer) => layer.nodes)
        .some((node) => node.id.startsWith("photo-framed-")),
    ).toBe(false);
  });

  it("gives revised candidates unmistakable identities without moving geometry", () => {
    const minimal = visualScheduleProject();
    minimal.design.layoutId = "minimal";
    minimal.design.layoutStyles.minimal = "minimal-editorial";
    const minimalNodes = buildScheduleRenderModel(
      minimal,
      minimal.deviceVariants[0]!,
    ).model.layers.flatMap((layer) => layer.nodes);
    const minimalDay = minimalNodes.find(
      (node) => node.kind === "text" && node.id.startsWith("day-"),
    );
    const minimalCode = minimalNodes.find(
      (node) => node.kind === "text" && node.id.startsWith("code-"),
    );
    expect(minimalDay).toMatchObject({ kind: "text", fontWeight: 600 });
    if (minimalDay?.kind === "text")
      expect(minimalDay.text).toBe(minimalDay.text.toUpperCase());
    const fullDayNameById: Record<string, string> = {
      "day-Mon": "MONDAY",
      "day-Tue": "TUESDAY",
      "day-Wed": "WEDNESDAY",
      "day-Thu": "THURSDAY",
      "day-Fri": "FRIDAY",
      "day-Sat": "SATURDAY",
    };
    const minimalDays = minimalNodes.filter(
      (node) => node.kind === "text" && node.id.startsWith("day-"),
    );
    expect(minimalDays.length).toBeGreaterThan(0);
    expect(
      minimalDays.every(
        (node) =>
          node.kind === "text" && node.text === fullDayNameById[node.id],
      ),
    ).toBe(true);
    expect(
      minimalDays.every(
        (node) =>
          node.kind === "text" &&
          node.text.length * node.fontSize * 0.72 <= node.width,
      ),
    ).toBe(true);
    expect(minimalCode).toMatchObject({ kind: "text", fontWeight: 600 });

    const glass = visualScheduleProject();
    glass.design.layoutId = "cards";
    glass.design.layoutStyles.cards = "cards-glass";
    const glassNodes = buildScheduleRenderModel(
      glass,
      glass.deviceVariants[0]!,
    ).model.layers.flatMap((layer) => layer.nodes);
    expect(
      glassNodes.some((node) => node.id.endsWith("-glass-highlight")),
    ).toBe(true);
    const glassCard = glassNodes.find(
      (node) => node.kind === "rect" && node.id.startsWith("card-"),
    );
    expect(glassCard).toMatchObject({ kind: "rect" });
    if (glassCard?.kind === "rect") expect(glassCard.fill).toMatch(/^rgba\(/);

    const filledGrid = visualScheduleProject();
    filledGrid.design.layoutId = "grid";
    const outlineGrid = structuredClone(filledGrid);
    outlineGrid.design.layoutStyles.grid = "grid-outline";
    const block = (project: typeof filledGrid) =>
      buildScheduleRenderModel(project, project.deviceVariants[0]!)
        .model.layers.flatMap((layer) => layer.nodes)
        .find(
          (node) => node.kind === "rect" && node.id.startsWith("grid-block-"),
        );
    const filledBlock = block(filledGrid);
    const outlineBlock = block(outlineGrid);
    expect(outlineBlock).toMatchObject({ kind: "rect" });
    if (filledBlock?.kind === "rect" && outlineBlock?.kind === "rect") {
      expect(outlineBlock.geometry).toEqual(filledBlock.geometry);
      expect(outlineBlock.fill).not.toBe(filledBlock.fill);
      expect(outlineBlock.strokeWidth).toBeGreaterThan(
        filledBlock.strokeWidth ?? 0,
      );
    }

    const softPlanner = visualScheduleProject();
    softPlanner.design.layoutId = "planner";
    softPlanner.design.layoutStyles.planner = "planner-soft";
    const editorialPlanner = structuredClone(softPlanner);
    editorialPlanner.design.layoutStyles.planner = "planner-editorial";
    const plannerNodes = (project: typeof softPlanner) =>
      buildScheduleRenderModel(
        project,
        project.deviceVariants[0]!,
      ).model.layers.flatMap((layer) => layer.nodes);
    const softNodes = plannerNodes(softPlanner);
    const editorialNodes = plannerNodes(editorialPlanner);
    const softPanel = softNodes.find((node) =>
      node.id.startsWith("planner-panel-"),
    );
    const editorialPanel = editorialNodes.find((node) =>
      node.id.startsWith("planner-panel-"),
    );
    expect(editorialPanel).toMatchObject({ kind: "rect", cornerRadius: 0 });
    if (softPanel?.kind === "rect" && editorialPanel?.kind === "rect")
      expect(editorialPanel.fill).not.toBe(softPanel.fill);
    const editorialDay = editorialNodes.find(
      (node) => node.kind === "text" && node.id.startsWith("planner-day-"),
    );
    if (editorialDay?.kind === "text")
      expect(editorialDay.text).toBe(editorialDay.text.toUpperCase());
  });

  it.each([
    ["midnight", "cards", "cards-outline"],
    ["midnight", "cards", "cards-glass"],
    ["midnight", "grid", "grid-outline"],
    ["midnight", "planner", "planner-editorial"],
    ["clean-slate", "cards", "cards-outline"],
    ["clean-slate", "cards", "cards-glass"],
    ["clean-slate", "grid", "grid-outline"],
    ["clean-slate", "planner", "planner-editorial"],
  ] as const)("keeps %s readable for %s / %s", (themeId, layout, styleId) => {
    const project = visualScheduleProject();
    project.design.themeId = themeId;
    project.design.layoutId = layout;
    if (layout === "cards")
      project.design.layoutStyles.cards = styleId as
        "cards-outline" | "cards-glass";
    if (layout === "grid") project.design.layoutStyles.grid = "grid-outline";
    if (layout === "planner")
      project.design.layoutStyles.planner = "planner-editorial";
    const result = buildScheduleRenderModel(
      project,
      project.deviceVariants[0]!,
    );
    expect(result.resolvedStyle?.styleId).toBe(styleId);
    const textNodes = result.model.layers
      .flatMap((layer) => layer.nodes)
      .filter((node) => node.kind === "text");
    expect(textNodes.length).toBeGreaterThan(0);
    expect(textNodes.every((node) => Boolean(node.fill))).toBe(true);
  });
});
