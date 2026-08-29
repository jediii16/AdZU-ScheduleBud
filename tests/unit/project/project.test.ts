import { describe, expect, it } from "vitest";

import {
  createBlankProject,
  detectLegacyWorkspace,
  migrateLegacyWorkspaceToV2,
  migrateProject,
  scheduleProjectSchema,
} from "@/domain/project";
import { normalizeSubject } from "@/domain/schedule";

const NOW = "2026-08-24T01:02:03.000Z";

describe("ScheduleProject", () => {
  it("creates a valid empty project with deterministic safe defaults", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    expect(project).toMatchObject({
      schemaVersion: 1,
      metadata: {
        title: "Untitled schedule",
        source: "manual",
        curriculum: null,
      },
      schedule: [],
      design: {
        themeId: "clean-slate",
        customPalette: null,
        layoutId: "cards",
        background: { mode: "palette" },
        wallpaperTitle: { visible: true, text: "Weekly Schedule" },
      },
      deviceVariants: [],
      activeDeviceVariantId: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(scheduleProjectSchema.parse(project)).toEqual(project);
  });

  it("migrates missing and legacy theme background state to Palette", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const missing = JSON.parse(JSON.stringify(project));
    delete missing.design.background;
    const missingResult = migrateProject(missing);
    expect(missingResult.status).toBe("success");
    if (missingResult.status === "success")
      expect(missingResult.project.design.background).toEqual({
        mode: "palette",
      });

    const legacy = {
      ...project,
      design: { ...project.design, background: { kind: "theme" } },
    };
    const legacyResult = migrateProject(legacy);
    expect(legacyResult.status).toBe("success");
    if (legacyResult.status === "success")
      expect(legacyResult.project.design.background).toEqual({
        mode: "palette",
      });
  });

  it("loads missing Subject Colors as Automatic and accepts legacy per-subject state", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const missing = structuredClone(project) as unknown as {
      design: Record<string, unknown>;
    };
    delete missing.design.subjectColors;
    expect(scheduleProjectSchema.parse(missing).design.subjectColors).toEqual({
      mode: "automatic",
      singleColor: null,
      bySubjectId: {},
    });

    const legacy = structuredClone(project) as unknown as {
      design: Record<string, unknown>;
    };
    legacy.design.subjectColors = {
      mode: "per-subject",
      singleColor: null,
      bySubjectId: { old: "#abcdef" },
    };
    expect(scheduleProjectSchema.parse(legacy).design.subjectColors).toEqual({
      mode: "custom",
      singleColor: null,
      bySubjectId: { old: "#ABCDEF" },
    });
  });

  it("keeps the project title separate from wallpaper title and supports blank wallpaper text", () => {
    const project = createBlankProject({
      id: "project-1",
      now: NOW,
      title: "My local project",
    });
    const changed = {
      ...project,
      design: {
        ...project.design,
        wallpaperTitle: { visible: false, text: "" },
      },
    };
    expect(scheduleProjectSchema.parse(changed).metadata.title).toBe(
      "My local project",
    );
    expect(scheduleProjectSchema.parse(changed).design.wallpaperTitle).toEqual({
      visible: false,
      text: "",
    });
  });

  it("serializes without blobs, functions, or derived data", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify(project);
    expect(JSON.parse(serialized)).toEqual(project);
    expect(serialized).not.toContain("conflicts");
    expect(serialized).not.toContain("renderModel");
    expect(serialized).not.toContain("Blob");
  });

  it("round-trips SITEAO through project serialization", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify({
      ...project,
      design: { ...project.design, themeId: "siteao-orange" },
    });
    const migrated = migrateProject(JSON.parse(serialized));

    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.themeId).toBe("siteao-orange");
  });

  it("round-trips LAAO through project serialization", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify({
      ...project,
      design: { ...project.design, themeId: "laao-green" },
    });
    const migrated = migrateProject(JSON.parse(serialized));

    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.themeId).toBe("laao-green");
  });

  it("round-trips EAO through project serialization", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify({
      ...project,
      design: { ...project.design, themeId: "eao-blue" },
    });
    const migrated = migrateProject(JSON.parse(serialized));

    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.themeId).toBe("eao-blue");
  });

  it("round-trips MAO through project serialization", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify({
      ...project,
      design: { ...project.design, themeId: "mao-red" },
    });
    const migrated = migrateProject(JSON.parse(serialized));

    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.themeId).toBe("mao-red");
  });

  it("round-trips AAO through project serialization", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify({
      ...project,
      design: { ...project.design, themeId: "aao-yellow" },
    });
    const migrated = migrateProject(JSON.parse(serialized));

    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.themeId).toBe("aao-yellow");
  });

  it("round-trips NAO through project serialization", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify({
      ...project,
      design: { ...project.design, themeId: "nao-white" },
    });
    const migrated = migrateProject(JSON.parse(serialized));

    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.themeId).toBe("nao-white");
  });

  it("round-trips Matcha Study through project serialization", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify({
      ...project,
      design: { ...project.design, themeId: "matcha-study" },
    });
    const migrated = migrateProject(JSON.parse(serialized));

    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.themeId).toBe("matcha-study");
  });

  it("round-trips Girlfriend's Choice through project serialization", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify({
      ...project,
      design: { ...project.design, themeId: "girlfriends-choice" },
    });
    const migrated = migrateProject(JSON.parse(serialized));

    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.themeId).toBe("girlfriends-choice");
  });

  it("round-trips Pink Diary through project serialization", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify({
      ...project,
      design: { ...project.design, themeId: "pink-diary" },
    });
    const migrated = migrateProject(JSON.parse(serialized));

    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.themeId).toBe("pink-diary");
  });

  it("loads existing device variants without sticker state as empty", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const serialized = JSON.stringify(project);
    const migrated = migrateProject(JSON.parse(serialized));

    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.deviceVariants).toEqual([]);
  });

  it("rejects a dangling active device variant", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    expect(
      scheduleProjectSchema.safeParse({
        ...project,
        activeDeviceVariantId: "missing",
      }).success,
    ).toBe(false);
  });

  it("accepts current schema records and returns typed invalid/future failures", () => {
    expect(
      migrateProject(createBlankProject({ id: "project-1", now: NOW })).status,
    ).toBe("success");
    expect(migrateProject({ schemaVersion: 2 })).toEqual({
      status: "unsupported-version",
      schemaVersion: 2,
    });
    expect(migrateProject({ schemaVersion: 1 }).status).toBe("invalid");
  });

  it("defaults schema-1 projects without a theme to Clean Slate", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const { themeId: _themeId, ...legacyDesign } = project.design;
    void _themeId;
    const migrated = migrateProject({ ...project, design: legacyDesign });
    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.themeId).toBe("clean-slate");
  });

  it("loads existing schema-1 theme selections without creating Custom data", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const { customPalette: _customPalette, ...legacyDesign } = project.design;
    void _customPalette;
    const migrated = migrateProject({
      ...project,
      design: { ...legacyDesign, themeId: "pink-diary" },
    });
    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design).toMatchObject({
      themeId: "pink-diary",
      customPalette: null,
    });
  });

  it("normalizes and round-trips opaque Custom palette colors", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const migrated = migrateProject({
      ...project,
      design: {
        ...project.design,
        themeId: "custom",
        customPalette: {
          basedOnPaletteId: "matcha-study",
          canvas: "#abcdef",
          primary: "#123456",
          secondary: "#234567",
          accent: "#345678",
          surface: "#456789",
          border: "#56789a",
        },
      },
    });
    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.customPalette).toEqual({
      basedOnPaletteId: "matcha-study",
      canvas: "#ABCDEF",
      primary: "#123456",
      secondary: "#234567",
      accent: "#345678",
      surface: "#456789",
      border: "#56789A",
    });
  });

  it("loads schema-1 projects without styles using visual baseline defaults", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const { layoutStyles: _layoutStyles, ...legacyDesign } = project.design;
    void _layoutStyles;
    const migrated = migrateProject({ ...project, design: legacyDesign });
    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.design.layoutStyles).toEqual({
      minimal: "minimal-clean",
      cards: "cards-soft",
      grid: "grid-filled",
      planner: "planner-paper",
      photo: "photo-clean",
    });
  });

  it("strips legacy subject-name fields from saved schema-1 projects", () => {
    const project = createBlankProject({ id: "project-1", now: NOW });
    const subject = normalizeSubject(
      { code: "CS.412", meetings: [{ days: ["Mon"] }] },
      (kind) => `${kind}-1`,
    );
    const raw = {
      ...project,
      schedule: [{ ...subject, name: "Data Mining" }],
      design: {
        ...project.design,
        visibleFields: {
          ...project.design.visibleFields,
          subjectCode: false,
          subjectName: true,
        },
      },
    };
    const migrated = migrateProject(raw);
    expect(migrated.status).toBe("success");
    if (migrated.status !== "success") return;
    expect(migrated.project.schedule[0]).not.toHaveProperty("name");
    expect(migrated.project.design.visibleFields).not.toHaveProperty(
      "subjectName",
    );
    expect(migrated.project.design.visibleFields).not.toHaveProperty(
      "subjectCode",
    );
    expect(migrated.project.schedule[0]).toMatchObject({
      code: "CS.412",
      meetings: [{ days: ["Mon"] }],
    });
  });

  it("detects schema 13 but refuses to guess its undocumented shape", () => {
    expect(detectLegacyWorkspace({ schemaVersion: 13 })).toEqual({
      status: "legacy-detected",
      schemaVersion: 13,
    });
    expect(migrateLegacyWorkspaceToV2({ schemaVersion: 13 })).toMatchObject({
      status: "unsupported",
      schemaVersion: 13,
    });
    expect(migrateLegacyWorkspaceToV2({ schemaVersion: 1 })).toEqual({
      status: "not-legacy",
    });
  });
});
