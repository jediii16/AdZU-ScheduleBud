import {
  migrateProject,
  scheduleProjectSchema,
  type ScheduleProject,
} from "@/domain/project";

import type { ScheduleBudDatabase } from "./dexie";
import type {
  ApplicationMetadataRepository,
  AssetRepository,
  ProjectListResult,
  ProjectReadResult,
  ProjectRepository,
  StoredAsset,
} from "./types";

function portableProject(project: ScheduleProject): ScheduleProject {
  return scheduleProjectSchema.parse(
    JSON.parse(JSON.stringify(project)) as unknown,
  );
}

function readPayload(id: string, payload: unknown): ProjectReadResult {
  const result = migrateProject(payload);
  if (result.status === "success")
    return { status: "found", project: result.project };
  if (result.status === "unsupported-version") {
    return {
      status: "unsupported-version",
      id,
      schemaVersion: result.schemaVersion,
    };
  }
  return { status: "invalid", id, reason: result.error.message };
}

export class DexieProjectRepository implements ProjectRepository {
  constructor(private readonly database: ScheduleBudDatabase) {}

  async list(): Promise<ProjectListResult> {
    const records = await this.database.projects
      .orderBy("updatedAt")
      .reverse()
      .toArray();
    const result: ProjectListResult = { projects: [], failures: [] };
    for (const record of records) {
      const read = readPayload(record.id, record.payload);
      if (read.status === "found") result.projects.push(read.project);
      else if (
        read.status === "invalid" ||
        read.status === "unsupported-version"
      )
        result.failures.push(read);
    }
    return result;
  }

  async read(id: string): Promise<ProjectReadResult> {
    const record = await this.database.projects.get(id);
    return record ? readPayload(id, record.payload) : { status: "not-found" };
  }

  async write(project: ScheduleProject): Promise<void> {
    const payload = portableProject(project);
    await this.database.projects.put({
      id: payload.id,
      updatedAt: payload.updatedAt,
      payload,
    });
  }

  async delete(id: string): Promise<void> {
    await this.database.projects.delete(id);
  }
}

function validateAsset(asset: StoredAsset): void {
  const blobLike =
    asset.blob &&
    typeof asset.blob.size === "number" &&
    typeof asset.blob.type === "string" &&
    typeof asset.blob.arrayBuffer === "function";
  if (!asset.id || !asset.projectId || !asset.mimeType || !blobLike) {
    throw new TypeError("Stored assets require IDs, a MIME type, and a Blob.");
  }
  if (
    !Number.isInteger(asset.width) ||
    !Number.isInteger(asset.height) ||
    asset.width <= 0 ||
    asset.height <= 0
  ) {
    throw new RangeError("Stored asset dimensions must be positive integers.");
  }
}

export class DexieAssetRepository implements AssetRepository {
  constructor(private readonly database: ScheduleBudDatabase) {}
  async write(asset: StoredAsset): Promise<void> {
    validateAsset(asset);
    await this.database.assets.put(asset);
  }
  read(id: string): Promise<StoredAsset | undefined> {
    return this.database.assets.get(id);
  }
  async delete(id: string): Promise<void> {
    await this.database.assets.delete(id);
  }
  listByProject(projectId: string): Promise<StoredAsset[]> {
    return this.database.assets.where("projectId").equals(projectId).toArray();
  }
  async deleteByProject(projectId: string): Promise<void> {
    await this.database.assets.where("projectId").equals(projectId).delete();
  }
}

const ACTIVE_PROJECT_KEY = "active-project-id";
export class DexieApplicationMetadataRepository implements ApplicationMetadataRepository {
  constructor(private readonly database: ScheduleBudDatabase) {}
  async readActiveProjectId(): Promise<string | null> {
    const record =
      await this.database.applicationMetadata.get(ACTIVE_PROJECT_KEY);
    return typeof record?.value === "string" ? record.value : null;
  }
  async writeActiveProjectId(projectId: string | null): Promise<void> {
    await this.database.applicationMetadata.put({
      key: ACTIVE_PROJECT_KEY,
      value: projectId,
    });
  }
}
