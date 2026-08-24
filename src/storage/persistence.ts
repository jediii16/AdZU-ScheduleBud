import { scheduleBudDatabase, type ScheduleBudDatabase } from "./dexie";
import {
  DexieApplicationMetadataRepository,
  DexieAssetRepository,
  DexieProjectRepository,
} from "./repositories";

export function createPersistence(
  database: ScheduleBudDatabase = scheduleBudDatabase,
) {
  return {
    database,
    projects: new DexieProjectRepository(database),
    assets: new DexieAssetRepository(database),
    applicationMetadata: new DexieApplicationMetadataRepository(database),
  };
}
