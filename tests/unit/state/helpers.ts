import type { ScheduleProject } from "@/domain/project";
import { createScheduleBudStore } from "@/state/store";
import type { StoreDependencies } from "@/state/types";
import type {
  ApplicationMetadataRepository,
  AssetRepository,
  ProjectListResult,
  ProjectReadResult,
  ProjectRepository,
  StoredAsset,
} from "@/storage/types";

export class MemoryProjectRepository implements ProjectRepository {
  records = new Map<string, ScheduleProject>();
  writes: ScheduleProject[] = [];
  failNextWrite = false;
  async list(): Promise<ProjectListResult> {
    return { projects: [...this.records.values()], failures: [] };
  }
  async read(id: string): Promise<ProjectReadResult> {
    const project = this.records.get(id);
    return project ? { status: "found", project } : { status: "not-found" };
  }
  async write(project: ScheduleProject): Promise<void> {
    if (this.failNextWrite) {
      this.failNextWrite = false;
      throw new Error("IndexedDB unavailable");
    }
    const copy = structuredClone(project);
    this.writes.push(copy);
    this.records.set(copy.id, copy);
  }
  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }
}

export class MemoryAssetRepository implements AssetRepository {
  records = new Map<string, StoredAsset>();
  async write(asset: StoredAsset): Promise<void> {
    this.records.set(asset.id, asset);
  }
  async read(id: string): Promise<StoredAsset | undefined> {
    return this.records.get(id);
  }
  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }
  async listByProject(projectId: string): Promise<StoredAsset[]> {
    return [...this.records.values()].filter(
      (asset) => asset.projectId === projectId,
    );
  }
  async deleteByProject(projectId: string): Promise<void> {
    for (const asset of await this.listByProject(projectId))
      this.records.delete(asset.id);
  }
}

export class MemoryMetadataRepository implements ApplicationMetadataRepository {
  activeProjectId: string | null = null;
  async readActiveProjectId() {
    return this.activeProjectId;
  }
  async writeActiveProjectId(projectId: string | null) {
    this.activeProjectId = projectId;
  }
}

export function createTestStore(overrides: Partial<StoreDependencies> = {}) {
  const projects = overrides.projects ?? new MemoryProjectRepository();
  const assets = overrides.assets ?? new MemoryAssetRepository();
  const applicationMetadata =
    overrides.applicationMetadata ?? new MemoryMetadataRepository();
  let id = 0;
  let tick = 0;
  const store = createScheduleBudStore({
    projects,
    assets,
    applicationMetadata,
    idFactory: overrides.idFactory ?? ((kind) => `${kind}-${++id}`),
    now:
      overrides.now ??
      (() => new Date(Date.UTC(2026, 7, 24, 0, 0, 0, tick++)).toISOString()),
    autosaveDebounceMs: overrides.autosaveDebounceMs ?? 10,
  });
  return { store, projects, assets, applicationMetadata };
}
