import type { ScheduleProject } from "@/domain/project";
import type { AssetRepository, StoredAsset } from "./types";

export function collectReferencedAssetIds(
  project: ScheduleProject,
): ReadonlySet<string> {
  const ids = new Set<string>([
    ...project.assetReferences.photoAssetIds,
    ...project.assetReferences.screenGuideAssetIds,
  ]);
  if (project.design.background.kind === "asset")
    ids.add(project.design.background.assetId);
  for (const variant of project.deviceVariants) {
    if (variant.preview.guideAssetId) ids.add(variant.preview.guideAssetId);
    for (const assetId of Object.keys(variant.photoTransforms))
      ids.add(assetId);
  }
  return ids;
}

export function findUnreferencedAssets(
  project: ScheduleProject,
  assets: readonly StoredAsset[],
): StoredAsset[] {
  const referenced = collectReferencedAssetIds(project);
  return assets.filter(
    (asset) => asset.projectId === project.id && !referenced.has(asset.id),
  );
}

export async function deleteUnreferencedProjectAssets(
  project: ScheduleProject,
  repository: AssetRepository,
): Promise<string[]> {
  const unused = findUnreferencedAssets(
    project,
    await repository.listByProject(project.id),
  );
  await Promise.all(unused.map((asset) => repository.delete(asset.id)));
  return unused.map((asset) => asset.id);
}

export type InspectedImage = {
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
  filename?: string;
};
export type ImageBitmapLike = { width: number; height: number; close(): void };

export async function inspectTemporaryImage(
  blob: Blob,
  createBitmap: (blob: Blob) => Promise<ImageBitmapLike> = (source) =>
    createImageBitmap(source),
  filename?: string,
): Promise<InspectedImage> {
  const bitmap = await createBitmap(blob);
  try {
    const result: InspectedImage = {
      blob,
      mimeType: blob.type,
      width: bitmap.width,
      height: bitmap.height,
    };
    return filename ? { ...result, filename } : result;
  } finally {
    bitmap.close();
  }
}

export async function saveScreenGuide(
  repository: AssetRepository,
  input: InspectedImage & { id: string; projectId: string; createdAt: string },
): Promise<StoredAsset> {
  const asset: StoredAsset = {
    id: input.id,
    projectId: input.projectId,
    kind: "screen-guide",
    blob: input.blob,
    mimeType: input.mimeType,
    width: input.width,
    height: input.height,
    createdAt: input.createdAt,
    ...(input.filename ? { filename: input.filename } : {}),
  };
  await repository.write(asset);
  return asset;
}
