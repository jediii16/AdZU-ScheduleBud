import type { ScheduleProject } from "@/domain/project";

export type StoredAssetKind = "photo" | "background-image" | "screen-guide";

export type StoredAsset = {
  id: string;
  projectId: string;
  kind: StoredAssetKind;
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
  filename?: string;
};

export type ProjectReadResult =
  | { status: "found"; project: ScheduleProject }
  | { status: "not-found" }
  | { status: "invalid"; id: string; reason: string }
  | { status: "unsupported-version"; id: string; schemaVersion: number };

export type ProjectListResult = {
  projects: ScheduleProject[];
  failures: Array<
    Exclude<ProjectReadResult, { status: "found" } | { status: "not-found" }>
  >;
};

export interface ProjectRepository {
  list(): Promise<ProjectListResult>;
  read(id: string): Promise<ProjectReadResult>;
  write(project: ScheduleProject): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface AssetRepository {
  write(asset: StoredAsset): Promise<void>;
  read(id: string): Promise<StoredAsset | undefined>;
  delete(id: string): Promise<void>;
  listByProject(projectId: string): Promise<StoredAsset[]>;
  deleteByProject(projectId: string): Promise<void>;
}

export interface ApplicationMetadataRepository {
  readActiveProjectId(): Promise<string | null>;
  writeActiveProjectId(projectId: string | null): Promise<void>;
}
