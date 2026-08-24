import { z } from "zod";
import {
  PROJECT_SCHEMA_VERSION,
  scheduleProjectSchema,
  type ScheduleProject,
} from "./types";

export type ProjectMigrationResult =
  | { status: "success"; project: ScheduleProject; migratedFrom: number | null }
  | { status: "invalid"; error: z.ZodError }
  | { status: "unsupported-version"; schemaVersion: number };

export function migrateProject(input: unknown): ProjectMigrationResult {
  const versionResult = z
    .object({ schemaVersion: z.number().int() })
    .safeParse(input);
  if (
    versionResult.success &&
    versionResult.data.schemaVersion !== PROJECT_SCHEMA_VERSION
  ) {
    return {
      status: "unsupported-version",
      schemaVersion: versionResult.data.schemaVersion,
    };
  }
  const parsed = scheduleProjectSchema.safeParse(input);
  return parsed.success
    ? { status: "success", project: parsed.data, migratedFrom: null }
    : { status: "invalid", error: parsed.error };
}

export type LegacyWorkspaceDetection =
  { status: "legacy-detected"; schemaVersion: 13 } | { status: "not-legacy" };
export function detectLegacyWorkspace(
  input: unknown,
): LegacyWorkspaceDetection {
  return z.object({ schemaVersion: z.literal(13) }).safeParse(input).success
    ? { status: "legacy-detected", schemaVersion: 13 }
    : { status: "not-legacy" };
}

export type LegacyMigrationResult =
  | { status: "not-legacy" }
  | { status: "unsupported"; schemaVersion: 13; reason: string };
export function migrateLegacyWorkspaceToV2(
  input: unknown,
): LegacyMigrationResult {
  if (detectLegacyWorkspace(input).status === "not-legacy")
    return { status: "not-legacy" };
  return {
    status: "unsupported",
    schemaVersion: 13,
    reason:
      "The exact legacy schema-13 serialized shape is not sufficiently specified for a safe migration.",
  };
}
