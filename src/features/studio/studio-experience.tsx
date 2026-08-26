"use client";

import Link from "next/link";
import type Konva from "konva";
import {
  BookOpen,
  Check,
  Download,
  Minus,
  Palette,
  Plus,
  Redo2,
  Smartphone,
  Undo2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { BrandLockup } from "@/components/shared/brand-lockup";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  STUDIO_TARGETS,
  balancedPositionFor,
  studioTargetForVariant,
} from "@/data/devices/studio-targets";
import type { DevicePreset } from "@/data/devices/registry";
import {
  detectSafeAreaCollision,
  resolveSafeAreaModel,
  safeAreaSnapAnchors,
} from "@/domain/device/safe-areas";
import {
  inferOrientation,
  type DeviceCategory,
  type PhotoTransform,
} from "@/domain/device/types";
import {
  DEFAULT_PHOTO_TRANSFORM,
  buildScheduleRenderModel,
  panPhotoTransform,
  photoTransformFor,
  resolveAvailablePhotoComposition,
  resolveLayoutDetailCapabilities,
  resolveLayoutVisibleFields,
  resolveAlignmentSnap,
  resolveProjectLayout,
} from "@/domain/render";
import { detectConflicts } from "@/domain/schedule/conflicts";
import { validateMeeting } from "@/domain/schedule/validation";
import {
  attemptWarningGate,
  type WarningGateState,
} from "@/domain/schedule/warnings";
import {
  PngExportCoordinator,
  exportStagePng,
  photoExportBlockReason,
  type ExportStatus,
} from "@/features/export/png-export";
import { ScheduleArtboard } from "@/renderer/konva/artboard";
import { createPersistence } from "@/storage/persistence";
import {
  inspectTemporaryImage,
  removeScreenGuide,
  savePhoto,
  saveScreenGuide,
  type InspectedImage,
} from "@/storage/assets";
import type { StoredAsset } from "@/storage/types";

const EMPTY_PHOTO_ASSET_IDS: readonly string[] = [];
import { useScheduleBudStore, useScheduleBudStoreApi } from "@/state/react";
import type { EditorState } from "@/state/types";
import {
  ClassesStudioPanel,
  DesignStudioPanel,
  DeviceStudioPanel,
} from "./studio-panels";
import { DeviceTargetPicker } from "./device-target-picker";

const studioPersistence = createPersistence();

const TOOL_ITEMS = [
  { id: "classes", label: "Classes", icon: BookOpen },
  { id: "design", label: "Design", icon: Palette },
  { id: "device", label: "Device", icon: Smartphone },
] as const;

function autosaveCopy(status: string): string {
  if (status === "saving" || status === "idle") return "Saving…";
  if (status === "error") return "Couldn't save locally";
  return "Saved locally";
}

function exportCopy(status: ExportStatus): string {
  if (status === "preparing") return "Preparing…";
  if (status === "exporting") return "Exporting…";
  if (status === "downloaded") return "Download again";
  return "Export PNG";
}

export function StudioExperience() {
  const store = useScheduleBudStoreApi();
  const activeId = useScheduleBudStore((state) => state.activeProjectId);
  const project = useScheduleBudStore((state) =>
    activeId ? state.projectsById[activeId] : undefined,
  );
  const editor = useScheduleBudStore((state) => state.editor);
  const autosave = useScheduleBudStore((state) => state.autosave);
  const canUndo = useScheduleBudStore((state) => state.history.past.length > 0);
  const canRedo = useScheduleBudStore(
    (state) => state.history.future.length > 0,
  );
  const initializedProject = useRef<string | null>(null);
  const exportStageRef = useRef<Konva.Stage | null>(null);
  const targetPickerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const exportCoordinator = useRef(new PngExportCoordinator());
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportGate, setExportGate] = useState<WarningGateState>("idle");
  const [targetPickerOpen, setTargetPickerOpen] = useState(false);
  const [guideOpacity, setGuideOpacity] = useState(0.35);
  const [photoAdjusting, setPhotoAdjusting] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [loadedGuide, setLoadedGuide] = useState<{
    id: string;
    image: HTMLImageElement;
  } | null>(null);
  const [loadedPhotos, setLoadedPhotos] = useState<
    ReadonlyMap<string, { image: HTMLImageElement; asset: StoredAsset }>
  >(() => new Map());
  const photoPanStart = useRef<PhotoTransform | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      rootHeight: root.style.height,
      rootOverflow: root.style.overflow,
      bodyHeight: body.style.height,
      bodyMinHeight: body.style.minHeight,
      bodyOverflow: body.style.overflow,
    };
    root.style.height = "100%";
    root.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.minHeight = "0";
    body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      root.style.height = previous.rootHeight;
      root.style.overflow = previous.rootOverflow;
      body.style.height = previous.bodyHeight;
      body.style.minHeight = previous.bodyMinHeight;
      body.style.overflow = previous.bodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (!project || initializedProject.current === project.id) return;
    initializedProject.current = project.id;
    const initialize = () => {
      const current = store.getState().projectsById[project.id];
      if (!current) return;
      const hadStudioTarget = current.deviceVariants.some(
        (variant) =>
          variant.id === current.activeDeviceVariantId &&
          studioTargetForVariant(variant) !== undefined,
      );
      const variantIds = new Map<string, string>();
      for (const target of STUDIO_TARGETS) {
        const existing = current.deviceVariants.find(
          (variant) => variant.presetId === target.presetId,
        );
        const id =
          existing?.id ??
          store.getState().createDeviceVariant({
            category: target.category,
            dimensions: target.dimensions,
            dimensionSource: "preset",
            presetId: target.presetId,
            schedulePosition: target.defaultPosition,
            compositionId: `cards-${target.id}`,
          });
        if (id) variantIds.set(target.id, id);
      }
      if (!hadStudioTarget) {
        const phoneId = variantIds.get("phone");
        if (phoneId) store.getState().setActiveDeviceVariant(phoneId);
      }
      if (!store.getState().editor.activeSection)
        store.getState().setActiveEditorSection("design");
    };
    initialize();
  }, [project, store]);

  const activeVariant = project?.deviceVariants.find(
    (variant) => variant.id === project.activeDeviceVariantId,
  );
  const target = activeVariant
    ? studioTargetForVariant(activeVariant)
    : undefined;
  const photoAssetIds =
    project?.assetReferences.photoAssetIds ?? EMPTY_PHOTO_ASSET_IDS;
  const photoAssetId = photoAssetIds[0] ?? null;
  useEffect(() => {
    const guideId = activeVariant?.preview.guideAssetId;
    if (!guideId) return;
    let active = true;
    let url: string | null = null;
    void studioPersistence.assets.read(guideId).then((asset) => {
      if (!active || !asset) return;
      url = URL.createObjectURL(asset.blob);
      const image = new Image();
      image.onload = () => active && setLoadedGuide({ id: guideId, image });
      image.src = url;
    });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [activeVariant?.preview.guideAssetId]);
  const guideImage =
    loadedGuide && loadedGuide.id === activeVariant?.preview.guideAssetId
      ? loadedGuide.image
      : null;
  useEffect(() => {
    if (photoAssetIds.length === 0) return;
    let active = true;
    const urls: string[] = [];
    void Promise.all(
      photoAssetIds.map(async (assetId) => {
        const asset = await studioPersistence.assets.read(assetId);
        if (!asset || asset.kind !== "photo") return null;
        const url = URL.createObjectURL(asset.blob);
        urls.push(url);
        const image = new Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("Photo decoding failed."));
          image.src = url;
        });
        return [assetId, { image, asset }] as const;
      }),
    )
      .then((entries) => {
        if (active)
          setLoadedPhotos(new Map(entries.filter((entry) => entry !== null)));
      })
      .catch((reason: unknown) => {
        console.error("ScheduleBud photo decoding failed", reason);
        if (active) setLoadedPhotos(new Map());
      });
    return () => {
      active = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoAssetIds]);
  const photoImages = useMemo(
    () =>
      new Map(
        photoAssetIds.flatMap((assetId) => {
          const loaded = loadedPhotos.get(assetId);
          return loaded ? ([[assetId, loaded.image]] as const) : [];
        }),
      ),
    [loadedPhotos, photoAssetIds],
  );
  const renderResult = useMemo(
    () =>
      project && activeVariant && target
        ? buildScheduleRenderModel(project, activeVariant)
        : null,
    [activeVariant, project, target],
  );
  const issueCount = useMemo(() => {
    if (!project) return 0;
    const incomplete = project.schedule.reduce(
      (count, subject) =>
        count +
        (subject.enabled
          ? subject.meetings.filter(
              (meeting) =>
                meeting.enabled && !validateMeeting(meeting).complete,
            ).length
          : 0),
      0,
    );
    return incomplete + detectConflicts(project.schedule).length;
  }, [project]);
  const safeAreas = useMemo(
    () => (activeVariant ? resolveSafeAreaModel(activeVariant) : { zones: [] }),
    [activeVariant],
  );
  const safeCollision = useMemo(
    () =>
      renderResult
        ? detectSafeAreaCollision(renderResult.scheduleBounds, safeAreas)
        : { status: "clear" as const, zones: [] },
    [renderResult, safeAreas],
  );

  if (!project || project.schedule.length === 0)
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-lg border-y border-border py-10 text-center">
          <p className="font-mono text-xs font-bold tracking-[0.14em] text-brand uppercase">
            Schedule Studio
          </p>
          <h1 className="mt-3 sb-page-title">
            Add a schedule before designing.
          </h1>
          <p className="mt-3 text-text-secondary">
            Studio uses your real active project and never inserts sample
            classes.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/create" className={buttonVariants({ size: "lg" })}>
              Create a schedule
            </Link>
            <Link
              href="/review"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Back to review
            </Link>
          </div>
        </div>
      </main>
    );

  if (!activeVariant || !target || !renderResult)
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center text-sm text-text-muted"
      >
        Preparing devices…
      </div>
    );

  const activeLayout = resolveProjectLayout(project, activeVariant);
  const detailCapabilities = resolveLayoutDetailCapabilities(
    activeLayout,
    activeVariant,
  );
  const visibleFields = resolveLayoutVisibleFields(
    activeLayout,
    project.design.visibleFields,
    activeVariant,
    detailCapabilities,
  );
  const activePhotoComposition = resolveAvailablePhotoComposition(
    project.design.photoComposition,
  );
  const activePhotoId =
    activePhotoComposition === "polaroid" &&
    selectedPhotoId &&
    photoAssetIds.includes(selectedPhotoId)
      ? selectedPhotoId
      : photoAssetId;
  const activePhotoFrame =
    activePhotoComposition === "polaroid"
      ? renderResult.photoFrames?.find(
          (frame) => frame.assetId === activePhotoId,
        )
      : renderResult.photoFrame
        ? {
            assetId: photoAssetId ?? "",
            frame: renderResult.photoFrame,
            rotation: 0,
          }
        : undefined;
  const loadedActivePhoto = activePhotoId
    ? loadedPhotos.get(activePhotoId)
    : undefined;
  const activePhotoTransform = activePhotoId
    ? photoTransformFor(activeVariant, activePhotoComposition, activePhotoId)
    : DEFAULT_PHOTO_TRANSFORM;
  const photoExportIssue = photoExportBlockReason(
    activeLayout,
    photoAssetIds.length,
    activePhotoComposition,
  );
  const photoExportBlocked = photoExportIssue !== null;

  const setSection = (section: NonNullable<EditorState["activeSection"]>) => {
    store.getState().setActiveEditorSection(section);
  };
  const setPositionFromOrigin = (
    x: number,
    y: number,
    previewScale: number,
  ) => {
    const range = renderResult.positionRange;
    const snap = resolveAlignmentSnap({
      proposedOrigin: { x, y },
      scheduleSize: renderResult.scheduleBounds,
      canvasSize: renderResult.model,
      positionRange: range,
      previewScale,
      enabled: activeVariant.preview.enableSnapping,
      previous: store.getState().editor.alignmentGuides,
      ...(activeVariant.preview.showSafeAreas
        ? {
            anchors: safeAreaSnapAnchors(
              safeAreas,
              renderResult.scheduleBounds,
            ),
          }
        : {}),
    });
    const normalize = (value: number, minimum: number, maximum: number) =>
      maximum === minimum
        ? 0.5
        : Math.min(1, Math.max(0, (value - minimum) / (maximum - minimum)));
    store.getState().setSchedulePosition(activeVariant.id, {
      x: normalize(snap.origin.x, range.minX, range.maxX),
      y: normalize(snap.origin.y, range.minY, range.maxY),
    });
    store.getState().setAlignmentGuides(snap.guides);
  };
  const beginMove = () => {
    if (!store.getState().history.transaction)
      store.getState().beginHistoryTransaction("Move schedule");
    store.getState().setDragging(true);
    store.getState().setAlignmentGuides({
      verticalCenter: false,
      horizontalCenter: false,
    });
  };
  const finishMove = () => {
    store.getState().setDragging(false);
    store.getState().setAlignmentGuides({
      verticalCenter: false,
      horizontalCenter: false,
    });
    store.getState().commitHistoryTransaction();
  };
  const switchTarget = (id: string) => {
    const variant = project.deviceVariants.find((item) => item.id === id);
    if (variant) store.getState().setActiveDeviceVariant(variant.id);
  };
  const createTarget = (
    category: DeviceCategory,
    dimensions: { width: number; height: number },
    source: "preset" | "custom" | "matched-screen",
    presetId: string | null = null,
  ) => {
    store.getState().createDeviceVariant({
      category,
      dimensions,
      dimensionSource: source,
      presetId,
      schedulePosition: balancedPositionFor(
        category,
        activeLayout,
        inferOrientation(dimensions),
      ),
      compositionId: `cards-${category}`,
    });
  };
  const createPresetTarget = (preset: DevicePreset) => {
    const existing = project.deviceVariants.find(
      (variant) => variant.presetId === preset.id,
    );
    if (existing) {
      switchTarget(existing.id);
      return;
    }
    createTarget(
      preset.category,
      { width: preset.width, height: preset.height },
      "preset",
      preset.id,
    );
  };
  const createMatchedTarget = async (
    image: InspectedImage,
    category: DeviceCategory,
    preserveGuide: boolean,
  ) => {
    createTarget(
      category,
      { width: image.width, height: image.height },
      "matched-screen",
    );
    const variantId =
      store.getState().projectsById[project.id]?.activeDeviceVariantId;
    if (!preserveGuide || !variantId) return;
    const assetId = crypto.randomUUID();
    await saveScreenGuide(studioPersistence.assets, {
      ...image,
      id: assetId,
      projectId: project.id,
      createdAt: new Date().toISOString(),
    });
    store.getState().setGuideAsset(variantId, assetId);
  };
  const removeGuide = async () => {
    const id = activeVariant.preview.guideAssetId;
    if (!id) return;
    store.getState().setGuideAsset(activeVariant.id, null);
    await removeScreenGuide(studioPersistence.assets, id);
    setLoadedGuide(null);
  };
  const choosePhoto = async (
    file: File,
    intent: "replace-primary" | "append",
  ) => {
    const inspected = await inspectTemporaryImage(file, undefined, file.name);
    const saved = await savePhoto(studioPersistence.assets, {
      ...inspected,
      id: crypto.randomUUID(),
      projectId: project.id,
      createdAt: new Date().toISOString(),
    });
    if (intent === "append") {
      if (!store.getState().addPhoto(saved.id)) {
        await studioPersistence.assets.delete(saved.id);
        throw new Error("Maximum 4 photos");
      }
      setSelectedPhotoId(saved.id);
    } else {
      store.getState().setPrimaryPhoto(saved.id);
      setSelectedPhotoId(saved.id);
    }
    setPhotoAdjusting(false);
    setExportError(null);
  };
  const removePhoto = (assetId: string) => {
    const remaining = photoAssetIds.filter((id) => id !== assetId);
    store.getState().removePhoto(assetId);
    setSelectedPhotoId(remaining[0] ?? null);
    setPhotoAdjusting(false);
  };
  const beginPhotoCrop = () => {
    if (!activePhotoId || !loadedActivePhoto) return;
    photoPanStart.current = activePhotoTransform;
    if (!store.getState().history.transaction)
      store.getState().beginHistoryTransaction("Adjust photo crop");
  };
  const movePhotoCrop = (delta: { x: number; y: number }) => {
    if (
      !activePhotoId ||
      !loadedActivePhoto ||
      !activePhotoFrame ||
      !photoPanStart.current
    )
      return;
    store.getState().setPhotoTransform(
      activeVariant.id,
      activePhotoComposition,
      activePhotoId,
      panPhotoTransform(
        photoPanStart.current,
        {
          width: loadedActivePhoto.asset.width,
          height: loadedActivePhoto.asset.height,
        },
        activePhotoFrame.frame,
        activePhotoFrame.rotation
          ? {
              x:
                delta.x *
                  Math.cos((-activePhotoFrame.rotation * Math.PI) / 180) -
                delta.y *
                  Math.sin((-activePhotoFrame.rotation * Math.PI) / 180),
              y:
                delta.x *
                  Math.sin((-activePhotoFrame.rotation * Math.PI) / 180) +
                delta.y *
                  Math.cos((-activePhotoFrame.rotation * Math.PI) / 180),
            }
          : delta,
      ),
    );
  };
  const finishPhotoCrop = () => {
    photoPanStart.current = null;
    store.getState().commitHistoryTransaction();
  };
  const beginPhotoZoom = () => {
    if (!store.getState().history.transaction)
      store.getState().beginHistoryTransaction("Adjust photo zoom");
  };
  const finishPhotoZoom = () => store.getState().commitHistoryTransaction();
  const runExport = async () => {
    if (photoExportBlocked) {
      setExportError(photoExportIssue);
      return;
    }
    if (
      activeLayout === "photo" &&
      photoAssetIds.some((assetId) => !loadedPhotos.has(assetId))
    ) {
      setExportError(
        "Your photo is still preparing. Try exporting again in a moment.",
      );
      return;
    }
    const gate = attemptWarningGate(issueCount > 0, exportGate);
    setExportGate(gate.state);
    if (!gate.allowed) return;
    setExportError(null);
    const result = await exportCoordinator.current.run(async () => {
      const stage = exportStageRef.current;
      if (!stage) throw new Error("The wallpaper is still preparing.");
      setExportStatus("preparing");
      await document.fonts.ready;
      setExportStatus("exporting");
      await exportStagePng(stage, renderResult.model, target.filename);
      setExportStatus("downloaded");
    });
    if (result === null && exportCoordinator.current.busy) return;
  };
  const guardedExport = () => {
    void runExport().catch((error: unknown) => {
      console.error("ScheduleBud PNG export failed", error);
      setExportStatus("error");
      setExportError(
        "We couldn't create this PNG on this device. Your project is safe; try again or choose a smaller device size if memory is limited.",
      );
    });
  };
  const panel =
    editor.activeSection === "classes" ? (
      <ClassesStudioPanel />
    ) : editor.activeSection === "device" ? (
      <DeviceStudioPanel
        targetLabel={target.label}
        variant={activeVariant}
        targetTriggerRef={targetPickerTriggerRef}
        onChangeTarget={() => setTargetPickerOpen(true)}
        onPosition={(position) =>
          store.getState().setSchedulePosition(activeVariant.id, position)
        }
        onPositionStart={beginMove}
        onPositionEnd={finishMove}
        onReset={() =>
          store
            .getState()
            .setSchedulePosition(
              activeVariant.id,
              balancedPositionFor(
                activeVariant.category,
                activeLayout,
                activeVariant.orientation,
              ),
            )
        }
        onSnapping={(enabled) =>
          store.getState().setSnappingEnabled(activeVariant.id, enabled)
        }
        onPreviewMode={(mode) =>
          store.getState().setPreviewMode(activeVariant.id, mode)
        }
        onSafeAreas={(enabled) =>
          store.getState().setShowSafeAreas(activeVariant.id, enabled)
        }
        onWarnings={(enabled) =>
          store.getState().setShowWarnings(activeVariant.id, enabled)
        }
        onOrientation={() =>
          store
            .getState()
            .setDeviceOrientation(
              activeVariant.id,
              activeVariant.orientation === "portrait"
                ? "landscape"
                : "portrait",
            )
        }
        guideOpacity={guideOpacity}
        onGuideOpacity={setGuideOpacity}
        onRemoveGuide={() => void removeGuide()}
      />
    ) : (
      <DesignStudioPanel
        design={project.design}
        visibleFields={visibleFields}
        activeLayout={activeLayout}
        detailCapabilities={detailCapabilities}
        onLayout={(layoutId) => {
          if (layoutId !== "photo") setPhotoAdjusting(false);
          store.getState().setLayout(layoutId);
        }}
        onTitleVisible={(visible) =>
          store.getState().setWallpaperTitleVisible(visible)
        }
        onTitleText={(text) => store.getState().setWallpaperTitle(text)}
        onField={(field, visible) => {
          if (detailCapabilities.preferenceScope === "variant-layout") {
            store
              .getState()
              .setLayoutVisibleField(
                activeVariant.id,
                activeLayout,
                field,
                visible,
              );
            return;
          }
          store.getState().setVisibleField(field, visible);
        }}
        onDayVisibility={(value) => store.getState().setDayVisibility(value)}
        photos={photoAssetIds.map((assetId) => ({
          id: assetId,
          filename:
            loadedPhotos.get(assetId)?.asset.filename ?? "Loading photo…",
          caption: project.design.photoCaptions[assetId] ?? "",
        }))}
        activePhotoId={activePhotoId}
        photoAdjusting={photoAdjusting}
        photoComposition={activePhotoComposition}
        photoZoom={activePhotoTransform.scale}
        onPhotoFile={choosePhoto}
        onPhotoComposition={(composition) => {
          setPhotoAdjusting(false);
          setSelectedPhotoId(photoAssetId);
          store.getState().setPhotoComposition(composition);
        }}
        onPhotoAdjust={(assetId) => {
          setSelectedPhotoId(assetId);
          setPhotoAdjusting(true);
        }}
        onPhotoRemove={removePhoto}
        onPhotoZoomStart={beginPhotoZoom}
        onPhotoZoom={(scale) => {
          if (!activePhotoId) return;
          store
            .getState()
            .setPhotoTransform(
              activeVariant.id,
              activePhotoComposition,
              activePhotoId,
              { ...activePhotoTransform, scale },
            );
        }}
        onPhotoZoomEnd={finishPhotoZoom}
        onPhotoReset={() => {
          if (activePhotoId)
            store
              .getState()
              .clearPhotoTransform(
                activeVariant.id,
                activePhotoComposition,
                activePhotoId,
              );
        }}
        onPhotoDone={() => setPhotoAdjusting(false)}
        onPhotoMove={(assetId, direction) =>
          store.getState().movePhoto(assetId, direction)
        }
        onPhotoCaption={(assetId, caption) =>
          store.getState().setPhotoCaption(assetId, caption)
        }
      />
    );

  return (
    <main
      data-testid="studio-shell"
      className="fixed inset-0 flex h-dvh max-h-dvh min-h-0 min-w-0 flex-col overflow-hidden bg-background"
    >
      <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface-elevated px-3 sm:px-4">
        <Link
          href="/"
          aria-label="ScheduleBud home"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <BrandLockup className="gap-2 [&_img]:h-8" />
        </Link>
        <span className="hidden h-5 w-px bg-border sm:block" />
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text-secondary">
          {project.metadata.title}
        </p>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Undo"
            variant="ghost"
            size="icon"
            disabled={!canUndo}
            onClick={() => store.getState().undo()}
          >
            <Undo2 aria-hidden="true" />
          </Button>
          <Button
            aria-label="Redo"
            variant="ghost"
            size="icon"
            disabled={!canRedo}
            onClick={() => store.getState().redo()}
          >
            <Redo2 aria-hidden="true" />
          </Button>
        </div>
        <p
          role="status"
          className={`hidden text-xs font-medium sm:block ${autosave.status === "error" ? "text-destructive" : "text-text-muted"}`}
        >
          {autosaveCopy(autosave.status)}
        </p>
        <Button
          onClick={guardedExport}
          disabled={
            photoExportBlocked ||
            exportStatus === "preparing" ||
            exportStatus === "exporting"
          }
        >
          {exportStatus === "downloaded" ? (
            <Check aria-hidden="true" />
          ) : (
            <Download aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{exportCopy(exportStatus)}</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </header>
      {photoExportBlocked ? (
        <div
          role="status"
          className="z-20 shrink-0 border-b border-border bg-surface px-4 py-2 text-xs text-text-secondary"
        >
          Photo Hero needs a photo before export. Open Design and choose Add
          photo.
        </div>
      ) : null}
      {exportGate === "revealed" ? (
        <div
          role="status"
          className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-warning/35 bg-[color-mix(in_oklch,var(--warning)_10%,white)] px-4 py-2 text-xs text-foreground"
        >
          <span>
            {issueCount} schedule{" "}
            {issueCount === 1 ? "issue was" : "issues were"} detected. Export
            again to continue intentionally.
          </span>
          <Link href="/review" className="shrink-0 font-semibold text-brand">
            Review issues
          </Link>
        </div>
      ) : null}
      {exportError ? (
        <div
          role="alert"
          className="shrink-0 border-b border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive"
        >
          {exportError}
        </div>
      ) : null}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <nav
          aria-label="Studio tools"
          className="hidden w-[5.25rem] shrink-0 flex-col border-r border-border bg-surface-elevated py-3 lg:flex"
        >
          {TOOL_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={editor.activeSection === id ? "page" : undefined}
              className={`mx-2 flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none ${editor.activeSection === id ? "bg-accent text-brand" : "text-text-secondary hover:bg-muted hover:text-foreground active:bg-accent"}`}
              onClick={() => setSection(id)}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </button>
          ))}
        </nav>
        <section
          aria-label="Wallpaper workspace"
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[oklch(0.94_0.008_245)]"
        >
          <ScheduleArtboard
            result={renderResult}
            zoom={editor.previewZoom}
            exportStageRef={exportStageRef}
            dragging={editor.dragging}
            guides={editor.alignmentGuides}
            variant={activeVariant}
            safeAreas={safeAreas}
            guideImage={guideImage}
            guideOpacity={guideOpacity}
            assetImages={photoImages}
            photoEditor={
              activeLayout === "photo" && activePhotoFrame
                ? {
                    frame: activePhotoFrame.frame,
                    rotation: activePhotoFrame.rotation,
                    hasPhoto:
                      Boolean(activePhotoId) && Boolean(loadedActivePhoto),
                    adjusting: photoAdjusting,
                    onPanStart: beginPhotoCrop,
                    onPanMove: movePhotoCrop,
                    onPanEnd: finishPhotoCrop,
                  }
                : undefined
            }
            onDragStart={beginMove}
            onDragMove={setPositionFromOrigin}
            onDragEnd={(x, y, previewScale) => {
              setPositionFromOrigin(x, y, previewScale);
              finishMove();
            }}
          />
          {activeVariant.preview.showWarnings &&
          safeCollision.status !== "clear" ? (
            <div
              role="status"
              className="absolute top-3 left-1/2 z-10 -translate-x-1/2 border border-warning/35 bg-surface-elevated px-3 py-2 text-xs font-semibold text-foreground shadow-sm"
            >
              {safeCollision.status === "blocked"
                ? "Part of your schedule is in a blocked system area."
                : "Part of your schedule may be covered by screen content."}
            </div>
          ) : null}
          <div className="mb-16 flex h-12 shrink-0 items-center justify-between border-t border-border bg-background px-3 text-xs text-text-secondary lg:mb-0">
            <span className="font-mono">
              {target.label} · {renderResult.model.width} ×{" "}
              {renderResult.model.height}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  store.getState().setPreviewViewport(1, { x: 0, y: 0 })
                }
              >
                Fit
              </Button>
              <Button
                aria-label="Zoom out"
                variant="ghost"
                size="icon"
                onClick={() =>
                  store
                    .getState()
                    .setPreviewViewport(
                      Math.max(0.5, editor.previewZoom - 0.1),
                      editor.previewPan,
                    )
                }
              >
                <Minus aria-hidden="true" />
              </Button>
              <span className="w-10 text-center font-mono">
                {Math.round(editor.previewZoom * 100)}%
              </span>
              <Button
                aria-label="Zoom in"
                variant="ghost"
                size="icon"
                onClick={() =>
                  store
                    .getState()
                    .setPreviewViewport(
                      Math.min(2, editor.previewZoom + 0.1),
                      editor.previewPan,
                    )
                }
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
        <aside
          aria-label="Studio inspector"
          data-testid="studio-inspector"
          className={`${editor.inspectorOpen ? "absolute" : "hidden"} inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 min-h-0 max-h-[48dvh] [overflow-anchor:none] overscroll-contain overflow-y-auto border-t border-border bg-surface-elevated p-5 shadow-[0_-8px_24px_rgba(23,32,51,0.08)] md:inset-x-auto md:right-3 md:bottom-16 md:w-[22rem] md:rounded-md md:border lg:static lg:block lg:h-full lg:max-h-full lg:w-[20rem] lg:shrink-0 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:shadow-none`}
        >
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3 lg:hidden">
            <p className="font-heading font-bold capitalize">
              {editor.activeSection}
            </p>
            <Button
              aria-label="Close inspector"
              variant="ghost"
              size="icon"
              onClick={() => store.getState().setInspectorOpen(false)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          {panel}
        </aside>
        <nav
          aria-label="Studio tools"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-surface-elevated pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          {TOOL_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={editor.activeSection === id ? "page" : undefined}
              className={`flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none ${editor.activeSection === id ? "bg-accent/55 text-brand" : "text-text-secondary active:bg-muted"}`}
              onClick={() => setSection(id)}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
      <DeviceTargetPicker
        open={targetPickerOpen}
        variants={project.deviceVariants}
        activeVariantId={activeVariant.id}
        returnFocusRef={targetPickerTriggerRef}
        onClose={() => setTargetPickerOpen(false)}
        onPreset={createPresetTarget}
        onCustom={(category, width, height) =>
          createTarget(category, { width, height }, "custom")
        }
        onMatched={createMatchedTarget}
      />
    </main>
  );
}
