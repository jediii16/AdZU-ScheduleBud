import Dexie, { type EntityTable } from "dexie";

import type { StoredAsset } from "./types";

export type PersistedProjectRecord = {
  id: string;
  updatedAt: string;
  payload: unknown;
};
export type ApplicationMetadataRecord = { key: string; value: unknown };

export class ScheduleBudDatabase extends Dexie {
  projects!: EntityTable<PersistedProjectRecord, "id">;
  assets!: EntityTable<StoredAsset, "id">;
  applicationMetadata!: EntityTable<ApplicationMetadataRecord, "key">;

  constructor(name = "schedulebud-v2") {
    super(name);
    this.version(1).stores({
      projects: "id, updatedAt",
      assets: "id, projectId, kind, [projectId+kind]",
      applicationMetadata: "key",
    });
  }
}

export const scheduleBudDatabase = new ScheduleBudDatabase();
