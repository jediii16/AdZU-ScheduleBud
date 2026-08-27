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
        layoutId: "cards",
        wallpaperTitle: { visible: true, text: "Weekly Schedule" },
      },
      deviceVariants: [],
      activeDeviceVariantId: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(scheduleProjectSchema.parse(project)).toEqual(project);
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
