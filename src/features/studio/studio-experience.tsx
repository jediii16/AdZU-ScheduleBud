"use client";

import Link from "next/link";
import type Konva from "konva";
import {
  BookOpen,
  Check,
  ChevronDown,
  Download,
  Minus,
  Palette,
  Plus,
  Redo2,
  Smartphone,
  Undo2,
  X,
} from "lucide-react";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { BrandLockup } from "@/components/shared/brand-lockup";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  STUDIO_TARGETS,
  balancedPositionFor,
  studioTargetForVariant,
} from "@/data/devices/studio-targets";
import {
  devicePresetRegistry,
  type DevicePreset,
} from "@/data/devices/registry";
import {
  detectSafeAreaCollision,
  resolveSafeAreaModel,
  safeAreaSnapAnchors,
} from "@/domain/device/safe-areas";
import {
  DEFAULT_SCHEDULE_SIZE,
  inferOrientation,
  type BackgroundImageTransform,
  type DeviceCategory,
  type NormalizedPoint,
  type PhotoTransform,
} from "@/domain/device/types";
import {
  DEFAULT_PHOTO_TRANSFORM,
  buildScheduleRenderModel,
  createCustomPalette,
  panPhotoTransform,
  photoTransformFor,
  resolveAvailablePhotoComposition,
  resolveLayoutDetailCapabilities,
  resolveLayoutVisibleFields,
  resolveAlignmentSnap,
  resolveProjectLayout,
  scheduleSizeFromPixels,
  scheduleSizeLimits,
  type Rect,
  type RenderModel,
} from "@/domain/render";
import type { CustomPaletteColorRole } from "@/domain/project";
import {
  ExportPreparationError,
  PngExportCoordinator,
  createPngZip,
  downloadBlob,
  photoExportBlockReason,
  preparePngExport,
  renderModelForExportContent,
  schedulebudPngFilename,
  schedulebudZipFilename,
  stagePngBlob,
  uniqueArchiveFilename,
  type ExportContent,
  type ExportStatus,
} from "@/features/export/png-export";
import {
  pointIsInsideRect,
  pointIsNearRect,
  StickerTrashDropZone,
  type ClientPoint,
} from "@/features/studio/sticker-trash-drop-zone";
import {
  StickerContextMenu,
  type StickerMenuPoint,
} from "@/features/studio/sticker-context-menu";
import { ScheduleArtboard } from "@/renderer/konva/artboard";
import type { ScheduleResizeHandle } from "@/renderer/konva/editor-overlay/schedule-overlay";
import {
  loadRenderAssetSources,
  renderAssetSourceEntries,
  renderAssetLoadSignature,
  type RenderAssetSourceEntry,
} from "@/renderer/konva/theme-asset-loading";
import type { RenderAssetImages } from "@/renderer/konva/schedule-scene";
import { createPersistence } from "@/storage/persistence";
import {
  inspectTemporaryImage,
  removeScreenGuide,
  savePhoto,
  saveBackgroundImage,
  saveScreenGuide,
  type InspectedImage,
} from "@/storage/assets";
import type { StoredAsset } from "@/storage/types";

const EMPTY_PHOTO_ASSET_IDS: readonly string[] = [];

async function waitForExportStage(
  stageRef: { current: Konva.Stage | null },
  dimensions: { width: number; height: number },
  timeoutMs = 5_000,
): Promise<Konva.Stage> {
  const deadline = performance.now() + timeoutMs;
  while (performance.now() < deadline) {
    if (
      stageRef.current?.width() === dimensions.width &&
      stageRef.current.height() === dimensions.height
    )
      return stageRef.current;
    await new Promise<void>((resolve) => window.setTimeout(resolve, 16));
  }
  throw new Error("The wallpaper is still preparing.");
}

async function decodeExportImage(
  blob: Blob,
  temporaryUrls: string[],
): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  temporaryUrls.push(url);
  const image = new Image();
  image.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Image decoding failed."));
    image.src = url;
  });
  return image;
}

import { useScheduleBudStore, useScheduleBudStoreApi } from "@/state/react";
import type { EditorState } from "@/state/types";
import {
  ClassesStudioPanel,
  DesignStudioPanel,
  DeviceStudioPanel,
} from "./studio-panels";
import { DeviceTargetPicker } from "./device-target-picker";
import { studioShortcutAction } from "./studio-shortcuts";

const studioPersistence = createPersistence();

const TOOL_ITEMS = [
  { id: "classes", label: "Classes", icon: BookOpen },
  { id: "design", label: "Design", icon: Palette },
  { id: "device", label: "Device", icon: Smartphone },
] as const;

const EXPORT_CONTENT_OPTIONS: readonly {
  id: ExportContent;
  label: string;
  description: string;
}[] = [
  {
    id: "wallpaper",
    label: "Full wallpaper",
    description: "Complete design and schedule",
  },
  {
    id: "schedule",
    label: "Schedule only",
    description: "Transparent full-size PNG",
  },
  {
    id: "background",
    label: "Background only",
    description: "Design without the schedule",
  },
];

function autosaveCopy(status: string): string {
  if (status === "saving" || status === "idle") return "Saving…";
  if (status === "error") return "Couldn't save locally";
  return "Saved locally";
}

function exportCopy(status: ExportStatus): string {
  if (status === "preparing") return "Preparing…";
  if (status === "exporting") return "Exporting…";
  return "Export PNG";
}

function TransientPreviewWarning({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFading(true), 3_400);
    const hideTimer = window.setTimeout(() => setVisible(false), 4_200);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;
  return (
    <div
      role="status"
      data-fading={fading ? "true" : "false"}
      className={`absolute top-3 left-1/2 z-10 -translate-x-1/2 border border-warning/35 bg-surface-elevated px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-opacity duration-700 ease-out motion-reduce:transition-none ${fading ? "opacity-0" : "opacity-100"}`}
    >
      {message}
    </div>
  );
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
  const targetPickerReturnFocusRef = useRef<HTMLElement | null>(null);
  const deviceMenuRef = useRef<HTMLDetailsElement | null>(null);
  const deviceMenuTriggerRef = useRef<HTMLElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const exportSnapshotKey = useRef(0);
  const stickerTrashRef = useRef<HTMLDivElement | null>(null);
  const stickerMenuReturnFocusRef = useRef<HTMLElement | null>(null);
  const exportCoordinator = useRef(new PngExportCoordinator());
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSnapshot, setExportSnapshot] = useState<{
    key: number;
    model: RenderModel;
    assets: RenderAssetImages;
  } | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportContent, setExportContent] =
    useState<ExportContent>("wallpaper");
  const [exportSuccessMessage, setExportSuccessMessage] = useState<
    string | null
  >(null);
  const [targetPickerOpen, setTargetPickerOpen] = useState(false);
  const [guideOpacity, setGuideOpacity] = useState(0.35);
  const [photoAdjusting, setPhotoAdjusting] = useState(false);
  const [backgroundAdjusting, setBackgroundAdjusting] = useState(false);
  const [draggedStickerId, setDraggedStickerId] = useState<string | null>(null);
  const [stickerNearTrash, setStickerNearTrash] = useState(false);
  const [stickerOverTrash, setStickerOverTrash] = useState(false);
  const [stickerMenu, setStickerMenu] = useState<{
    instanceId: string;
    point: StickerMenuPoint;
  } | null>(null);
  const [palettePreview, setPalettePreview] = useState<{
    role: CustomPaletteColorRole;
    color: string;
  } | null>(null);
  const [subjectColorPreview, setSubjectColorPreview] = useState<{
    subjectId: string | null;
    color: string;
  } | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [loadedGuide, setLoadedGuide] = useState<{
    id: string;
    image: HTMLImageElement;
  } | null>(null);
  const [loadedPhotos, setLoadedPhotos] = useState<
    ReadonlyMap<string, { image: HTMLImageElement; asset: StoredAsset }>
  >(() => new Map());
  const [loadedBackground, setLoadedBackground] = useState<{
    id: string;
    image: HTMLImageElement;
    asset: StoredAsset;
  } | null>(null);
  const [loadedStaticAssets, setLoadedStaticAssets] = useState<{
    signature: string;
    images: ReadonlyMap<string, HTMLImageElement>;
  }>(() => ({ signature: "[]", images: new Map() }));
  const photoPanStart = useRef<PhotoTransform | null>(null);
  const backgroundPanStart = useRef<BackgroundImageTransform | null>(null);

  useEffect(() => {
    if (exportStatus !== "success") return;
    const timer = window.setTimeout(() => {
      setExportStatus("idle");
      setExportSuccessMessage(null);
    }, 3_000);
    return () => window.clearTimeout(timer);
  }, [exportStatus]);

  useEffect(() => {
    if (!exportMenuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!exportMenuRef.current?.contains(event.target as Node))
        setExportMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExportMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [exportMenuOpen]);

  const pointIsOverStickerTrash = (point: ClientPoint | null) => {
    const rect = stickerTrashRef.current?.getBoundingClientRect();
    return Boolean(point && rect && pointIsInsideRect(point, rect));
  };
  const pointIsNearStickerTrash = (point: ClientPoint | null) => {
    const rect = stickerTrashRef.current?.getBoundingClientRect();
    return Boolean(point && rect && pointIsNearRect(point, rect));
  };
  const closeStickerMenu = useCallback((restoreFocus = false) => {
    setStickerMenu(null);
    const returnFocus = stickerMenuReturnFocusRef.current;
    stickerMenuReturnFocusRef.current = null;
    if (restoreFocus && returnFocus)
      window.requestAnimationFrame(() =>
        returnFocus.focus({ preventScroll: true }),
      );
  }, []);
  const openStickerMenu = useCallback(
    (
      instanceId: string,
      point: StickerMenuPoint,
      returnFocus?: HTMLElement,
    ) => {
      stickerMenuReturnFocusRef.current = returnFocus ?? null;
      store.getState().setSelectedSticker(instanceId);
      setStickerMenu({ instanceId, point });
    },
    [store],
  );

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
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const action = studioShortcutAction(event);
      if (!action) return;
      const state = store.getState();
      const variantId =
        state.projectsById[state.activeProjectId ?? ""]?.activeDeviceVariantId;
      const selectedStickerId = state.editor.selectedStickerId;

      if (action === "undo") {
        event.preventDefault();
        state.undo();
        return;
      }
      if (action === "redo") {
        event.preventDefault();
        state.redo();
        return;
      }
      if (action === "save") {
        event.preventDefault();
        void state.flushAutosave();
        return;
      }
      if (action === "zoom-in" || action === "zoom-out") {
        event.preventDefault();
        const direction = action === "zoom-in" ? 1 : -1;
        state.setPreviewViewport(
          Math.min(
            2,
            Math.max(0.5, state.editor.previewZoom + direction * 0.1),
          ),
          state.editor.previewPan,
        );
        return;
      }
      if (action === "zoom-fit") {
        event.preventDefault();
        state.setPreviewViewport(1, { x: 0, y: 0 });
        return;
      }
      if (action === "duplicate-selection") {
        event.preventDefault();
        if (!variantId || !selectedStickerId) return;
        const duplicateId = state.duplicateSticker(
          variantId,
          selectedStickerId,
        );
        if (duplicateId) state.setSelectedSticker(duplicateId);
        return;
      }
      if (action === "delete-selection") {
        if (!variantId || !selectedStickerId) return;
        event.preventDefault();
        state.deleteSticker(variantId, selectedStickerId);
        state.setSelectedSticker(null);
        return;
      }
      if (action.startsWith("nudge-")) {
        if (!variantId || !selectedStickerId) return;
        const variant = state.projectsById[
          state.activeProjectId ?? ""
        ]?.deviceVariants.find((item) => item.id === variantId);
        const sticker = variant?.stickers.find(
          (item) => item.instanceId === selectedStickerId,
        );
        if (!variant || !sticker) return;
        event.preventDefault();
        const distance = event.shiftKey ? 10 : 1;
        const xDirection =
          action === "nudge-left" ? -1 : action === "nudge-right" ? 1 : 0;
        const yDirection =
          action === "nudge-up" ? -1 : action === "nudge-down" ? 1 : 0;
        state.updateSticker(variantId, selectedStickerId, {
          xRatio:
            sticker.xRatio + (xDirection * distance) / variant.dimensions.width,
          yRatio:
            sticker.yRatio +
            (yDirection * distance) / variant.dimensions.height,
        });
        return;
      }

      const hasSelection =
        Boolean(selectedStickerId) ||
        Boolean(selectedPhotoId) ||
        photoAdjusting ||
        backgroundAdjusting ||
        targetPickerOpen;
      if (!hasSelection) return;
      event.preventDefault();
      state.setSelectedSticker(null);
      setSelectedPhotoId(null);
      setPhotoAdjusting(false);
      setBackgroundAdjusting(false);
      setTargetPickerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    backgroundAdjusting,
    photoAdjusting,
    selectedPhotoId,
    store,
    targetPickerOpen,
  ]);
  useEffect(() => {
    if (
      editor.selectedStickerId &&
      !activeVariant?.stickers.some(
        (item) => item.instanceId === editor.selectedStickerId,
      )
    )
      store.getState().setSelectedSticker(null);
  }, [activeVariant, editor.selectedStickerId, store]);
  const target = useMemo(
    () => (activeVariant ? studioTargetForVariant(activeVariant) : undefined),
    [activeVariant],
  );
  const photoAssetIds =
    project?.assetReferences.photoAssetIds ?? EMPTY_PHOTO_ASSET_IDS;
  const photoAssetId = photoAssetIds[0] ?? null;
  const backgroundAssetId = project?.design.background.image?.assetId ?? null;
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
  useEffect(() => {
    if (!backgroundAssetId) return;
    let active = true;
    let url: string | null = null;
    void studioPersistence.assets.read(backgroundAssetId).then((asset) => {
      if (
        !active ||
        !asset ||
        (asset.kind !== "background-image" && asset.kind !== "photo")
      )
        return;
      url = URL.createObjectURL(asset.blob);
      const image = new Image();
      image.onload = () => {
        if (active)
          setLoadedBackground({ id: backgroundAssetId, image, asset });
      };
      image.onerror = () => {
        if (active) setLoadedBackground(null);
      };
      image.src = url;
    });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [backgroundAssetId]);
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
  const previewProject = useMemo(() => {
    if (!project) return project;
    let next = project;
    if (palettePreview) {
      const customPalette =
        project.design.themeId === "custom"
          ? (project.design.customPalette ?? createCustomPalette("clean-slate"))
          : createCustomPalette(project.design.themeId);
      next = {
        ...next,
        design: {
          ...next.design,
          themeId: "custom" as const,
          customPalette: {
            ...customPalette,
            [palettePreview.role]: palettePreview.color,
          },
        },
      };
    }
    if (subjectColorPreview) {
      const current = next.design.subjectColors;
      next = {
        ...next,
        design: {
          ...next.design,
          subjectColors:
            subjectColorPreview.subjectId === null
              ? { ...current, singleColor: subjectColorPreview.color }
              : {
                  ...current,
                  bySubjectId: {
                    ...current.bySubjectId,
                    [subjectColorPreview.subjectId]: subjectColorPreview.color,
                  },
                },
        },
      };
    }
    return next;
  }, [palettePreview, project, subjectColorPreview]);
  const fullRenderResult = useMemo(
    () =>
      previewProject && activeVariant && target
        ? buildScheduleRenderModel(previewProject, activeVariant)
        : null,
    [activeVariant, previewProject, target],
  );
  const renderResult = useMemo(
    () =>
      fullRenderResult
        ? {
            ...fullRenderResult,
            model: renderModelForExportContent(
              fullRenderResult.model,
              exportContent,
            ),
          }
        : null,
    [exportContent, fullRenderResult],
  );
  const staticAssetSignature = renderResult
    ? renderAssetLoadSignature(renderResult.model)
    : "[]";
  const staticAssetSources = useMemo<readonly RenderAssetSourceEntry[]>(
    () => JSON.parse(staticAssetSignature) as RenderAssetSourceEntry[],
    [staticAssetSignature],
  );
  useEffect(() => {
    if (staticAssetSources.length === 0) return;
    let active = true;
    void loadRenderAssetSources(staticAssetSources).then((images) => {
      if (active)
        setLoadedStaticAssets({ signature: staticAssetSignature, images });
    });
    return () => {
      active = false;
    };
  }, [staticAssetSignature, staticAssetSources]);
  const renderAssetImages = useMemo(
    () =>
      new Map([
        ...photoImages,
        ...(loadedBackground?.id === backgroundAssetId
          ? ([[loadedBackground.id, loadedBackground.image]] as const)
          : []),
        ...(loadedStaticAssets.signature === staticAssetSignature
          ? loadedStaticAssets.images
          : []),
      ]),
    [
      backgroundAssetId,
      loadedBackground,
      loadedStaticAssets,
      photoImages,
      staticAssetSignature,
    ],
  );
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
  const stickerMenuInstance = stickerMenu
    ? activeVariant.stickers.find(
        (sticker) => sticker.instanceId === stickerMenu.instanceId,
      )
    : undefined;
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
    (activePhotoComposition === "polaroid" ||
      activePhotoComposition === "split") &&
    selectedPhotoId &&
    photoAssetIds.includes(selectedPhotoId)
      ? selectedPhotoId
      : photoAssetId;
  const activePhotoFrame =
    activePhotoComposition === "polaroid" || activePhotoComposition === "split"
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
  const scheduleLimits = scheduleSizeLimits(renderResult);

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
  const beginResize = () => {
    if (!store.getState().history.transaction)
      store.getState().beginHistoryTransaction("Resize schedule");
    store.getState().setDragging(true);
    store.getState().setAlignmentGuides({
      verticalCenter: false,
      horizontalCenter: false,
    });
  };
  const finishResize = () => {
    store.getState().setDragging(false);
    store.getState().setAlignmentGuides({
      verticalCenter: false,
      horizontalCenter: false,
    });
    store.getState().commitHistoryTransaction();
  };
  const setSchedulePixels = (
    pixels: { width: number; height: number },
    position?: NormalizedPoint,
  ) =>
    store
      .getState()
      .setScheduleSize(
        activeVariant.id,
        scheduleSizeFromPixels(
          renderResult.model,
          pixels,
          activeVariant.scheduleSize.lockAspectRatio,
        ),
        position,
      );
  const setScheduleSizeFromRect = (
    handle: ScheduleResizeHandle,
    proposed: Rect,
  ) => {
    const clamp = (value: number, minimum: number, maximum: number) =>
      Math.min(maximum, Math.max(minimum, value));
    let width = proposed.width;
    let height = proposed.height;
    if (activeVariant.scheduleSize.lockAspectRatio) {
      const shrink = Math.min(
        1,
        scheduleLimits.maxWidth / Math.max(1, width),
        scheduleLimits.maxHeight / Math.max(1, height),
      );
      width *= shrink;
      height *= shrink;
      const grow = Math.max(
        1,
        scheduleLimits.minWidth / Math.max(1, width),
        scheduleLimits.minHeight / Math.max(1, height),
      );
      width *= grow;
      height *= grow;
    } else {
      width = clamp(width, scheduleLimits.minWidth, scheduleLimits.maxWidth);
      height = clamp(
        height,
        scheduleLimits.minHeight,
        scheduleLimits.maxHeight,
      );
    }
    width = Math.min(scheduleLimits.maxWidth, width);
    height = Math.min(scheduleLimits.maxHeight, height);
    const proposedRight = proposed.x + proposed.width;
    const proposedBottom = proposed.y + proposed.height;
    const proposedCenter = {
      x: proposed.x + proposed.width / 2,
      y: proposed.y + proposed.height / 2,
    };
    const anchoredX = handle.includes("west")
      ? proposedRight - width
      : handle.includes("east")
        ? proposed.x
        : proposedCenter.x - width / 2;
    const anchoredY = handle.includes("north")
      ? proposedBottom - height
      : handle.includes("south")
        ? proposed.y
        : proposedCenter.y - height / 2;
    const minX = renderResult.positionRange.minX;
    const maxX = minX + scheduleLimits.maxWidth - width;
    const minY = renderResult.positionRange.minY;
    const maxY = minY + scheduleLimits.maxHeight - height;
    const x = clamp(anchoredX, minX, maxX);
    const y = clamp(anchoredY, minY, maxY);
    const normalize = (value: number, minimum: number, maximum: number) =>
      maximum === minimum ? 0.5 : (value - minimum) / (maximum - minimum);
    setSchedulePixels(
      { width, height },
      {
        x: normalize(x, minX, maxX),
        y: normalize(y, minY, maxY),
      },
    );
  };
  const setScheduleAxisSize = (axis: "width" | "height", requested: number) => {
    if (!Number.isFinite(requested)) return;
    const current = renderResult.scheduleBounds;
    let width = current.width;
    let height = current.height;
    if (activeVariant.scheduleSize.lockAspectRatio) {
      const factor =
        axis === "width"
          ? requested / Math.max(1, current.width)
          : requested / Math.max(1, current.height);
      const constrainedFactor = Math.min(
        Math.max(
          factor,
          scheduleLimits.minWidth / current.width,
          scheduleLimits.minHeight / current.height,
        ),
        scheduleLimits.maxWidth / current.width,
        scheduleLimits.maxHeight / current.height,
      );
      width *= constrainedFactor;
      height *= constrainedFactor;
    } else if (axis === "width") {
      width = Math.min(
        scheduleLimits.maxWidth,
        Math.max(scheduleLimits.minWidth, requested),
      );
    } else {
      height = Math.min(
        scheduleLimits.maxHeight,
        Math.max(scheduleLimits.minHeight, requested),
      );
    }
    setSchedulePixels({ width, height });
  };
  const switchTarget = (id: string) => {
    const variant = project.deviceVariants.find((item) => item.id === id);
    if (variant) {
      setStickerMenu(null);
      stickerMenuReturnFocusRef.current = null;
      store.getState().setActiveDeviceVariant(variant.id);
    }
  };
  const createTarget = (
    category: DeviceCategory,
    dimensions: { width: number; height: number },
    source: "preset" | "custom" | "matched-screen",
    presetId: string | null = null,
  ) => {
    setStickerMenu(null);
    stickerMenuReturnFocusRef.current = null;
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
  const chooseBackgroundImage = async (file: File) => {
    const inspected = await inspectTemporaryImage(file, undefined, file.name);
    const saved = await saveBackgroundImage(studioPersistence.assets, {
      ...inspected,
      id: crypto.randomUUID(),
      projectId: project.id,
      createdAt: new Date().toISOString(),
    });
    store.getState().setBackgroundImage(saved.id);
    setBackgroundAdjusting(false);
    setPhotoAdjusting(false);
    setExportError(null);
  };
  const removeBackgroundImage = () => {
    store.getState().setBackgroundImage(null);
    setBackgroundAdjusting(false);
  };
  const beginBackgroundGesture = () => {
    if (!store.getState().history.transaction)
      store.getState().beginHistoryTransaction("Adjust background");
  };
  const finishBackgroundGesture = () =>
    store.getState().commitHistoryTransaction();
  const beginBackgroundCrop = () => {
    if (!loadedBackground || loadedBackground.id !== backgroundAssetId) return;
    backgroundPanStart.current = activeVariant.backgroundImageTransform;
    if (!store.getState().history.transaction)
      store.getState().beginHistoryTransaction("Adjust background crop");
  };
  const moveBackgroundCrop = (delta: { x: number; y: number }) => {
    if (!loadedBackground || !backgroundPanStart.current) return;
    const next = panPhotoTransform(
      { ...backgroundPanStart.current, rotation: 0 },
      {
        width: loadedBackground.asset.width,
        height: loadedBackground.asset.height,
      },
      {
        width: activeVariant.dimensions.width,
        height: activeVariant.dimensions.height,
      },
      delta,
    );
    store.getState().setBackgroundImageTransform(activeVariant.id, {
      position: next.position,
      scale: next.scale,
    });
  };
  const finishBackgroundCrop = () => {
    backgroundPanStart.current = null;
    store.getState().commitHistoryTransaction();
  };
  const runExport = async (
    content: ExportContent = "wallpaper",
    allConfiguredSizes = false,
  ) => {
    if (photoExportBlocked && content !== "schedule") {
      setExportError(photoExportIssue);
      return;
    }
    setExportError(null);
    setExportSuccessMessage(null);
    setExportMenuOpen(false);
    const result = await exportCoordinator.current.run(async () => {
      setExportStatus("preparing");
      const state = store.getState();
      const currentProject = state.activeProjectId
        ? state.projectsById[state.activeProjectId]
        : undefined;
      if (!currentProject) throw new Error("The active wallpaper is unavailable.");
      const snapshotProject = structuredClone(currentProject);
      const activeSnapshotVariant = snapshotProject.deviceVariants.find(
        (variant) => variant.id === snapshotProject.activeDeviceVariantId,
      );
      if (!activeSnapshotVariant)
        throw new Error("The active wallpaper is unavailable.");
      const variants = allConfiguredSizes
        ? snapshotProject.deviceVariants
        : [activeSnapshotVariant];
      if (content !== "schedule") {
        const batchPhotoIssue = variants
          .map((variant) =>
            photoExportBlockReason(
              resolveProjectLayout(snapshotProject, variant),
              snapshotProject.assetReferences.photoAssetIds.length,
              resolveAvailablePhotoComposition(
                snapshotProject.design.photoComposition,
              ),
            ),
          )
          .find((issue) => issue !== null);
        if (batchPhotoIssue)
          throw new ExportPreparationError("asset", batchPhotoIssue);
      }
      const temporaryUrls: string[] = [];
      try {
        const archiveFiles = new Map<string, Blob>();
        for (const variant of variants) {
          const fullResult = buildScheduleRenderModel(snapshotProject, variant);
          const model = renderModelForExportContent(fullResult.model, content);
          const sourceById = new Map(renderAssetSourceEntries(model));
          const assets = await preparePngExport({
            model,
            availableAssets: renderAssetImages,
            resolveAssets: async (missingIds) => {
              const resolved = new Map<string, HTMLImageElement>();
              const staticSources = missingIds.flatMap((assetId) => {
                const source = sourceById.get(assetId);
                return source ? ([[assetId, source]] as const) : [];
              });
              for (const entry of await loadRenderAssetSources(staticSources))
                resolved.set(...entry);
              await Promise.all(
                missingIds.map(async (assetId) => {
                  if (resolved.has(assetId) || sourceById.has(assetId)) return;
                  const asset = await studioPersistence.assets.read(assetId);
                  if (!asset) return;
                  resolved.set(
                    assetId,
                    await decodeExportImage(asset.blob, temporaryUrls),
                  );
                }),
              );
              return resolved;
            },
          });
          exportStageRef.current = null;
          const key = (exportSnapshotKey.current += 1);
          setExportSnapshot({ key, model, assets });
          const stage = await waitForExportStage(exportStageRef, model);
          setExportStatus("exporting");
          const blob = await stagePngBlob(stage, model);
          const target = studioTargetForVariant(variant);
          const filename = schedulebudPngFilename(
            snapshotProject.metadata.title,
            target.label,
            content,
          );
          if (allConfiguredSizes) {
            const uniqueFilename = uniqueArchiveFilename(
              filename,
              new Set(archiveFiles.keys()),
            );
            archiveFiles.set(uniqueFilename, blob);
          } else {
            downloadBlob(blob, filename);
          }
        }
        if (allConfiguredSizes) {
          const archive = await createPngZip(archiveFiles);
          downloadBlob(
            archive,
            schedulebudZipFilename(snapshotProject.metadata.title, content),
          );
        }
        setExportSuccessMessage(
          allConfiguredSizes ? "ZIP exported" : "PNG exported",
        );
        setExportStatus("success");
      } finally {
        exportStageRef.current = null;
        setExportSnapshot(null);
        temporaryUrls.forEach((url) => URL.revokeObjectURL(url));
      }
    });
    if (result === null && exportCoordinator.current.busy) return;
  };
  const guardedExport = (
    content: ExportContent = "wallpaper",
    allConfiguredSizes = false,
  ) => {
    void runExport(content, allConfiguredSizes).catch((error: unknown) => {
      console.error("ScheduleBud PNG export failed", error);
      setExportStatus("error");
      setExportError(
        error instanceof ExportPreparationError
          ? error.message
          : "Couldn’t export the wallpaper. Try again.",
      );
    });
  };
  const previewWarningMessage =
    exportContent === "background" || !activeVariant.preview.showWarnings
    ? null
    : safeCollision.status === "blocked"
      ? "Part of your schedule is in a blocked system area."
      : safeCollision.status === "caution"
        ? "Part of your schedule may be covered by screen content."
        : renderResult.scheduleResize?.readabilityWarning
          ? "The schedule is very small. Check text readability before exporting."
          : null;
  const panel =
    editor.activeSection === "classes" ? (
      <ClassesStudioPanel />
    ) : editor.activeSection === "device" ? (
      <DeviceStudioPanel
        targetLabel={target.label}
        variant={activeVariant}
        scheduleBounds={renderResult.scheduleBounds}
        scheduleSizeLimits={scheduleLimits}
        targetTriggerRef={targetPickerTriggerRef}
        onChangeTarget={() => {
          deviceMenuRef.current?.setAttribute("open", "");
          window.requestAnimationFrame(() => deviceMenuTriggerRef.current?.focus());
        }}
        onPosition={(position) =>
          store.getState().setSchedulePosition(activeVariant.id, position)
        }
        onPositionStart={beginMove}
        onPositionEnd={finishMove}
        onSize={setScheduleAxisSize}
        onSizeStart={beginResize}
        onSizeEnd={finishResize}
        onAspectLock={(locked) =>
          store
            .getState()
            .setScheduleAspectRatioLocked(activeVariant.id, locked)
        }
        onResetSize={() =>
          store
            .getState()
            .setScheduleSize(activeVariant.id, DEFAULT_SCHEDULE_SIZE)
        }
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
        onTheme={(themeId) => {
          setPalettePreview(null);
          store.getState().setTheme(themeId);
        }}
        onCustomPaletteColor={(role, color) => {
          setPalettePreview(null);
          store.getState().setCustomPaletteColor(role, color);
        }}
        onCustomPalettePickerStart={() => setPalettePreview(null)}
        onCustomPalettePickerPreview={(role, color) =>
          startTransition(() => setPalettePreview({ role, color }))
        }
        onCustomPalettePickerEnd={(role, color) => {
          if (color !== null)
            store.getState().setCustomPaletteColor(role, color);
          setPalettePreview(null);
        }}
        onResetCustomPalette={() => store.getState().resetCustomPalette()}
        subjects={project.schedule}
        onSubjectColorMode={(mode) => {
          setSubjectColorPreview(null);
          store.getState().setSubjectColorMode(mode);
        }}
        onSingleSubjectColor={(color) => {
          setSubjectColorPreview(null);
          store.getState().setSingleSubjectColor(color);
        }}
        onCustomSubjectColor={(subjectId, color) => {
          setSubjectColorPreview(null);
          store.getState().setCustomSubjectColor(subjectId, color);
        }}
        onSubjectColorPickerStart={() => setSubjectColorPreview(null)}
        onSubjectColorPickerPreview={(subjectId, color) =>
          startTransition(() => setSubjectColorPreview({ subjectId, color }))
        }
        onSubjectColorPickerEnd={(subjectId, color) => {
          if (color !== null) {
            if (subjectId === null)
              store.getState().setSingleSubjectColor(color);
            else store.getState().setCustomSubjectColor(subjectId, color);
          }
          setSubjectColorPreview(null);
        }}
        onResetCustomSubjectColors={() =>
          store.getState().resetCustomSubjectColors()
        }
        backgroundImageFilename={
          loadedBackground?.id === backgroundAssetId
            ? loadedBackground.asset.filename
            : undefined
        }
        backgroundImageAsset={
          loadedBackground?.id === backgroundAssetId
            ? {
                filename: loadedBackground.asset.filename ?? "Background image",
                previewUrl: loadedBackground.image.src,
                mimeType: loadedBackground.asset.mimeType,
                size: loadedBackground.asset.blob.size,
                width: loadedBackground.asset.width,
                height: loadedBackground.asset.height,
              }
            : undefined
        }
        backgroundImageAdjusting={backgroundAdjusting}
        backgroundImageZoom={activeVariant.backgroundImageTransform.scale}
        onBackgroundMode={(mode) => {
          setBackgroundAdjusting(false);
          store.getState().setBackgroundMode(mode);
        }}
        onBackground={(background) =>
          store.getState().setBackground(background)
        }
        onBackgroundImageFile={chooseBackgroundImage}
        onBackgroundImageAdjust={() => {
          setPhotoAdjusting(false);
          store.getState().setSelectedSticker(null);
          setBackgroundAdjusting(true);
        }}
        onBackgroundImageRemove={removeBackgroundImage}
        onBackgroundImageZoom={(scale) =>
          store.getState().setBackgroundImageTransform(activeVariant.id, {
            ...activeVariant.backgroundImageTransform,
            scale,
          })
        }
        onBackgroundImageCenter={() =>
          store.getState().setBackgroundImageTransform(activeVariant.id, {
            ...activeVariant.backgroundImageTransform,
            position: { x: 0.5, y: 0.5 },
          })
        }
        onBackgroundImageReset={() =>
          store.getState().resetBackgroundImageTransform(activeVariant.id)
        }
        onBackgroundImageDone={() => setBackgroundAdjusting(false)}
        onBackgroundGestureStart={beginBackgroundGesture}
        onBackgroundGestureEnd={finishBackgroundGesture}
        onLayout={(layoutId) => {
          if (layoutId !== "photo") setPhotoAdjusting(false);
          store.getState().setLayout(layoutId);
        }}
        onStyle={(styleId) => store.getState().setLayoutStyle(styleId)}
        onTypography={(typographyId) =>
          store.getState().setTypography(typographyId)
        }
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
        photos={photoAssetIds.map((assetId) => {
          const loaded = loadedPhotos.get(assetId);
          return {
            id: assetId,
            filename: loaded?.asset.filename ?? "Loading photo…",
            caption: project.design.photoCaptions[assetId] ?? "",
            ...(loaded
              ? {
                  previewUrl: loaded.image.src,
                  mimeType: loaded.asset.mimeType,
                  size: loaded.asset.blob.size,
                  width: loaded.asset.width,
                  height: loaded.asset.height,
                }
              : {}),
          };
        })}
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
          setBackgroundAdjusting(false);
          store.getState().setSelectedSticker(null);
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
        stickers={activeVariant.stickers}
        selectedStickerId={editor.selectedStickerId}
        onStickerAdd={(stickerId) => {
          setBackgroundAdjusting(false);
          setPhotoAdjusting(false);
          const instanceId = store
            .getState()
            .addSticker(activeVariant.id, stickerId);
          if (instanceId) store.getState().setSelectedSticker(instanceId);
        }}
        onStickerSelect={(instanceId) => {
          setBackgroundAdjusting(false);
          setPhotoAdjusting(false);
          store.getState().setSelectedSticker(instanceId);
        }}
        onStickerMenu={openStickerMenu}
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
        <details ref={deviceMenuRef} className="group relative shrink-0">
          <summary
            ref={deviceMenuTriggerRef}
            aria-label={`Current device: ${target.label}`}
            className="flex h-9 max-w-[11rem] cursor-pointer list-none items-center gap-2 rounded-sm border border-border bg-background px-2.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[14rem]"
          >
            <Smartphone aria-hidden="true" className="size-4 shrink-0" />
            <span className="hidden min-w-0 flex-1 truncate sm:block">
              {target.label}
            </span>
            <span className="sm:hidden">Device</span>
            <ChevronDown
              aria-hidden="true"
              className="size-3.5 shrink-0 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="absolute top-[calc(100%+0.5rem)] right-0 z-40 max-h-[min(75dvh,32rem)] w-[min(20rem,calc(100vw-1rem))] overflow-y-auto rounded-md border border-border bg-surface-elevated p-2 shadow-xl">
            <p className="px-2 pt-1 pb-2 text-[11px] font-bold tracking-[0.08em] text-text-muted uppercase">
              Preview device
            </p>
            <div role="radiogroup" aria-label="Active preview device">
              {devicePresetRegistry.map((preset) => {
                const checked = activeVariant.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    className={`flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${checked ? "bg-brand/8 text-brand" : "text-text-secondary hover:bg-muted hover:text-foreground"}`}
                    onClick={() => {
                      createPresetTarget(preset);
                      deviceMenuRef.current?.removeAttribute("open");
                    }}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {preset.displayName}
                      </span>
                      <span className="block font-mono text-[11px] text-text-muted">
                        {preset.width} × {preset.height}
                      </span>
                    </span>
                    <Check
                      aria-hidden="true"
                      className={`size-4 shrink-0 ${checked ? "opacity-100" : "opacity-0"}`}
                    />
                  </button>
                );
              })}
              {project.deviceVariants.some(
                (variant) => variant.presetId === null,
              ) ? (
                <p className="mt-1 border-t border-border px-2 pt-2 pb-1 text-[10px] font-bold tracking-[0.08em] text-text-muted uppercase">
                  Custom & matched
                </p>
              ) : null}
              {project.deviceVariants
                .filter((variant) => variant.presetId === null)
                .map((variant) => {
                  const item = studioTargetForVariant(variant);
                  const checked = variant.id === activeVariant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      className={`flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${checked ? "bg-brand/8 text-brand" : "text-text-secondary hover:bg-muted hover:text-foreground"}`}
                      onClick={() => {
                        switchTarget(variant.id);
                        deviceMenuRef.current?.removeAttribute("open");
                      }}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {item.label}
                        </span>
                        <span className="block font-mono text-[11px] text-text-muted">
                          {variant.dimensions.width} × {variant.dimensions.height}
                        </span>
                      </span>
                      <Check
                        aria-hidden="true"
                        className={`size-4 shrink-0 ${checked ? "opacity-100" : "opacity-0"}`}
                      />
                    </button>
                  );
                })}
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-1 w-full justify-start border-t border-border"
              onClick={() => {
                targetPickerReturnFocusRef.current =
                  deviceMenuTriggerRef.current;
                deviceMenuRef.current?.removeAttribute("open");
                setTargetPickerOpen(true);
              }}
            >
              Custom size or Match My Screen
            </Button>
          </div>
        </details>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Undo"
            aria-keyshortcuts="Control+Z Meta+Z"
            title="Undo (Ctrl/Cmd+Z)"
            variant="ghost"
            size="icon"
            disabled={!canUndo}
            onClick={() => store.getState().undo()}
          >
            <Undo2 aria-hidden="true" />
          </Button>
          <Button
            aria-label="Redo"
            aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y"
            title="Redo (Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y)"
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
        <div ref={exportMenuRef} className="relative flex shrink-0">
          <Button
            onClick={() => guardedExport(exportContent)}
            aria-busy={
              exportStatus === "preparing" || exportStatus === "exporting"
            }
            title={`Export ${EXPORT_CONTENT_OPTIONS.find((option) => option.id === exportContent)?.label.toLowerCase()} — ${renderResult.model.width} × ${renderResult.model.height}`}
            className="rounded-r-none"
            disabled={
              photoExportBlocked ||
              exportStatus === "preparing" ||
              exportStatus === "exporting"
            }
          >
            {exportStatus === "success" ? (
              <Check aria-hidden="true" />
            ) : (
              <Download aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{exportCopy(exportStatus)}</span>
            <span className="sm:hidden">
              {exportStatus === "preparing" || exportStatus === "exporting"
                ? "Preparing…"
                : "Export"}
            </span>
          </Button>
          <Button
            type="button"
            size="icon"
            aria-label="More download options"
            aria-haspopup="dialog"
            aria-expanded={exportMenuOpen}
            title="More download options"
            className="rounded-l-none border-l border-white/25"
            disabled={
              exportStatus === "preparing" || exportStatus === "exporting"
            }
            onClick={() => setExportMenuOpen((open) => !open)}
          >
            <ChevronDown
              aria-hidden="true"
              className={`transition-transform ${exportMenuOpen ? "rotate-180" : ""}`}
            />
          </Button>
          {exportMenuOpen ? (
            <div
              role="dialog"
              aria-label="Export options"
              className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[min(22rem,calc(100vw-1rem))] rounded-md border border-border bg-surface-elevated p-3 text-foreground shadow-xl"
            >
              <p className="px-1 text-[11px] font-bold tracking-[0.08em] text-text-muted uppercase">
                Export content
              </p>
              <div
                role="radiogroup"
                aria-label="Content to export"
                className="mt-2 grid gap-1"
              >
                {EXPORT_CONTENT_OPTIONS.map((option) => {
                  const checked = exportContent === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      className={`flex min-h-12 items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${checked ? "bg-brand/8 text-brand" : "text-text-secondary hover:bg-muted hover:text-foreground"}`}
                      onClick={() => setExportContent(option.id)}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">
                          {option.label}
                        </span>
                        <span className="block text-[11px] text-text-muted">
                          {option.description}
                        </span>
                      </span>
                      <Check
                        aria-hidden="true"
                        className={`size-4 shrink-0 ${checked ? "opacity-100" : "opacity-0"}`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <p className="px-1 pb-2 font-mono text-[11px] text-text-muted">
                  Current: {target.label} · {renderResult.model.width} ×{" "}
                  {renderResult.model.height}
                </p>
                <div className="grid gap-2">
                  <Button
                    type="button"
                    className="w-full"
                    disabled={photoExportBlocked && exportContent !== "schedule"}
                    onClick={() => guardedExport(exportContent)}
                  >
                    <Download aria-hidden="true" />
                    Download current content
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={photoExportBlocked && exportContent !== "schedule"}
                    onClick={() => guardedExport(exportContent, true)}
                  >
                    <Download aria-hidden="true" />
                    Download all{" "}
                    {exportContent === "wallpaper"
                      ? "wallpapers"
                      : exportContent === "schedule"
                        ? "schedules"
                        : "backgrounds"}{" "}
                    ({project.deviceVariants.length} devices, .zip)
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
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
      {exportStatus === "success" ? (
        <div
          role="status"
          className="fixed top-16 right-4 z-50 rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs font-medium text-text-secondary shadow-lg"
        >
          {exportSuccessMessage ?? "Export complete"}
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
            contentMode={exportContent}
            exportStageRef={exportStageRef}
            exportSnapshot={exportSnapshot}
            dragging={editor.dragging}
            guides={editor.alignmentGuides}
            variant={activeVariant}
            safeAreas={safeAreas}
            guideImage={guideImage}
            guideOpacity={guideOpacity}
            assetImages={renderAssetImages}
            photoEditor={
              exportContent !== "schedule" &&
              activeLayout === "photo" &&
              activePhotoFrame
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
            backgroundEditor={
              exportContent !== "schedule" &&
              project.design.background.mode === "image" &&
              backgroundAssetId &&
              loadedBackground?.id === backgroundAssetId
                ? {
                    adjusting: backgroundAdjusting,
                    onPanStart: beginBackgroundCrop,
                    onPanMove: moveBackgroundCrop,
                    onPanEnd: finishBackgroundCrop,
                  }
                : undefined
            }
            stickerEditor={exportContent === "schedule" ? undefined : {
              selectedId: editor.selectedStickerId,
              onSelect: (instanceId) =>
                store.getState().setSelectedSticker(instanceId),
              onContextMenu: openStickerMenu,
              onTransformStart: (label) => {
                setStickerMenu(null);
                if (!store.getState().history.transaction)
                  store.getState().beginHistoryTransaction(label);
                store.getState().setDragging(true);
                store.getState().setAlignmentGuides({
                  verticalCenter: false,
                  horizontalCenter: false,
                });
              },
              onMoveStart: (instanceId, point) => {
                setDraggedStickerId(instanceId);
                setStickerNearTrash(pointIsNearStickerTrash(point));
                setStickerOverTrash(pointIsOverStickerTrash(point));
              },
              onMovePointer: (point) => {
                const nearTrash = pointIsNearStickerTrash(point);
                const overTrash = pointIsOverStickerTrash(point);
                setStickerNearTrash((current) =>
                  current === nearTrash ? current : nearTrash,
                );
                setStickerOverTrash((current) =>
                  current === overTrash ? current : overTrash,
                );
              },
              onMoveEnd: (instanceId, point) => {
                if (pointIsOverStickerTrash(point)) {
                  store.getState().deleteSticker(activeVariant.id, instanceId);
                  store.getState().setSelectedSticker(null);
                }
                setDraggedStickerId(null);
                setStickerNearTrash(false);
                setStickerOverTrash(false);
              },
              onMove: (instanceId, center, previewScale) => {
                const threshold = 8 / previewScale;
                const xCenter = renderResult.model.width / 2;
                const yCenter = renderResult.model.height / 2;
                const verticalCenter =
                  activeVariant.preview.enableSnapping &&
                  Math.abs(center.x - xCenter) <= threshold;
                const horizontalCenter =
                  activeVariant.preview.enableSnapping &&
                  Math.abs(center.y - yCenter) <= threshold;
                store.getState().updateSticker(activeVariant.id, instanceId, {
                  xRatio:
                    (verticalCenter ? xCenter : center.x) /
                    renderResult.model.width,
                  yRatio:
                    (horizontalCenter ? yCenter : center.y) /
                    renderResult.model.height,
                });
                store
                  .getState()
                  .setAlignmentGuides({ verticalCenter, horizontalCenter });
              },
              onResize: (instanceId, width) =>
                store.getState().updateSticker(activeVariant.id, instanceId, {
                  widthRatio: width / renderResult.model.width,
                }),
              onRotate: (instanceId, rotation) => {
                const snapAngles = [-90, -45, -30, -15, 0, 15, 30, 45, 90];
                const snapped = snapAngles.find(
                  (angle) => Math.abs(angle - rotation) <= 3,
                );
                store.getState().updateSticker(activeVariant.id, instanceId, {
                  rotation: snapped ?? rotation,
                });
              },
              onTransformEnd: () => {
                store.getState().setDragging(false);
                store.getState().setAlignmentGuides({
                  verticalCenter: false,
                  horizontalCenter: false,
                });
                store.getState().commitHistoryTransaction();
              },
            }}
            onDragStart={beginMove}
            onDragMove={setPositionFromOrigin}
            onDragEnd={(x, y, previewScale) => {
              setPositionFromOrigin(x, y, previewScale);
              finishMove();
            }}
            onResizeStart={() => beginResize()}
            onResizeMove={(handle, bounds) =>
              setScheduleSizeFromRect(handle, bounds)
            }
            onResizeEnd={(handle, bounds) => {
              setScheduleSizeFromRect(handle, bounds);
              finishResize();
            }}
          />
          <StickerTrashDropZone
            ref={stickerTrashRef}
            visible={draggedStickerId !== null}
            nearby={stickerNearTrash}
            active={stickerOverTrash}
          />
          {previewWarningMessage ? (
            <TransientPreviewWarning
              key={previewWarningMessage}
              message={previewWarningMessage}
            />
          ) : null}
          <div className="mb-16 flex h-12 shrink-0 items-center justify-between border-t border-border bg-background px-3 text-xs text-text-secondary lg:mb-0">
            <span className="font-mono">
              {target.label} · {renderResult.model.width} ×{" "}
              {renderResult.model.height}
            </span>
            <div className="flex items-center gap-1">
              <Button
                aria-keyshortcuts="Shift+1"
                title="Fit canvas (Shift+1)"
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
                aria-keyshortcuts="- Control+- Meta+-"
                title="Zoom out (−)"
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
                aria-keyshortcuts="Shift+= Control+= Meta+="
                title="Zoom in (+)"
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
          className={`${editor.inspectorOpen ? "absolute" : "hidden"} inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 min-h-0 max-h-[72dvh] [overflow-anchor:none] overscroll-contain overflow-y-auto rounded-t-xl border-t border-border bg-surface-elevated p-5 shadow-[0_-12px_32px_rgba(23,32,51,0.12)] md:inset-x-auto md:right-3 md:bottom-16 md:max-h-[70dvh] md:w-[23rem] md:rounded-lg md:border lg:static lg:block lg:h-full lg:max-h-full lg:w-[22rem] lg:shrink-0 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:shadow-none`}
        >
          <div className="mb-1 flex justify-end lg:hidden">
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
        returnFocusRef={targetPickerReturnFocusRef}
        onClose={() => setTargetPickerOpen(false)}
        onCustom={(category, width, height) =>
          createTarget(category, { width, height }, "custom")
        }
        onMatched={createMatchedTarget}
      />
      {stickerMenu && stickerMenuInstance ? (
        <StickerContextMenu
          instanceId={stickerMenuInstance.instanceId}
          layer={stickerMenuInstance.layer}
          point={stickerMenu.point}
          onClose={closeStickerMenu}
          onDelete={(instanceId) => {
            store.getState().deleteSticker(activeVariant.id, instanceId);
            store.getState().setSelectedSticker(null);
          }}
          onDuplicate={(instanceId) => {
            const duplicateId = store
              .getState()
              .duplicateSticker(activeVariant.id, instanceId);
            if (duplicateId) store.getState().setSelectedSticker(duplicateId);
          }}
          onReset={(instanceId) =>
            store.getState().resetStickerTransform(activeVariant.id, instanceId)
          }
          onLayer={(instanceId, layer) =>
            store
              .getState()
              .setStickerLayer(activeVariant.id, instanceId, layer)
          }
          onStack={(instanceId, direction) =>
            store
              .getState()
              .moveStickerInStack(activeVariant.id, instanceId, direction)
          }
        />
      ) : null}
    </main>
  );
}
