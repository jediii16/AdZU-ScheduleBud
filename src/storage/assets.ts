import type { ScheduleProject } from "@/domain/project";
import type { AssetRepository, StoredAsset } from "./types";

export function collectReferencedAssetIds(
  project: ScheduleProject,
): ReadonlySet<string> {
  const ids = new Set<string>([
    ...project.assetReferences.photoAssetIds,
    ...project.assetReferences.screenGuideAssetIds,
  ]);
  if (project.design.background.image?.assetId)
    ids.add(project.design.background.image.assetId);
  for (const variant of project.deviceVariants) {
    if (variant.preview.guideAssetId) ids.add(variant.preview.guideAssetId);
    for (const transforms of Object.values(variant.photoTransforms))
      for (const assetId of Object.keys(transforms)) ids.add(assetId);
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
export const LOCAL_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export async function inspectTemporaryImage(
  blob: Blob,
  createBitmap: (blob: Blob) => Promise<ImageBitmapLike> = (source) =>
    createImageBitmap(source),
  filename?: string,
): Promise<InspectedImage> {
  if (!(LOCAL_IMAGE_MIME_TYPES as readonly string[]).includes(blob.type))
    throw new TypeError("Choose a PNG, JPEG, or WebP image.");
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

export async function replaceScreenGuide(
  repository: AssetRepository,
  input: Parameters<typeof saveScreenGuide>[1],
  previousId?: string | null,
): Promise<StoredAsset> {
  const saved = await saveScreenGuide(repository, input);
  if (previousId && previousId !== saved.id)
    await repository.delete(previousId);
  return saved;
}

export async function removeScreenGuide(
  repository: AssetRepository,
  id: string,
): Promise<void> {
  const asset = await repository.read(id);
  if (asset?.kind === "screen-guide") await repository.delete(id);
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

export async function savePhoto(
  repository: AssetRepository,
  input: InspectedImage & { id: string; projectId: string; createdAt: string },
): Promise<StoredAsset> {
  const asset: StoredAsset = {
    id: input.id,
    projectId: input.projectId,
    kind: "photo",
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

export async function saveBackgroundImage(
  repository: AssetRepository,
  input: InspectedImage & { id: string; projectId: string; createdAt: string },
): Promise<StoredAsset> {
  const asset: StoredAsset = {
    id: input.id,
    projectId: input.projectId,
    kind: "background-image",
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
