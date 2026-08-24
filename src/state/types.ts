import type { LayoutId } from "@/domain/design/types";
import type {
  Density,
  DeviceCategory,
  DeviceDimensions,
  DeviceVariant,
  NormalizedPoint,
  Orientation,
  PhotoTransform,
  PreviewPreferences,
  VisibleFields,
} from "@/domain/device/types";
import type { AlignmentGuides } from "@/domain/render";
import type {
  ProjectDesign,
  ScheduleProject,
  WallpaperLabels,
} from "@/domain/project";
import type {
  MeetingInput,
  SubjectInput,
} from "@/domain/schedule/normalization";
import type { Meeting, ScheduleDay, Subject } from "@/domain/schedule/types";
import type {
  ApplicationMetadataRepository,
  AssetRepository,
  ProjectListResult,
  ProjectRepository,
} from "@/storage/types";

export type IdKind =
  "project" | "subject" | "meeting" | "device-variant" | "asset";
export type StoreDependencies = {
  projects: ProjectRepository;
  assets: AssetRepository;
  applicationMetadata: ApplicationMetadataRepository;
  idFactory?: (kind: IdKind) => string;
  now?: () => string;
  autosaveDebounceMs?: number;
};

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";
export type AutosaveState = {
  status: AutosaveStatus;
  lastSavedAt: string | null;
  error: string | null;
};
export type HistoryEntry = {
  label: string;
  projectId: string;
  before: ScheduleProject;
  after: ScheduleProject;
};
export type HistoryTransaction = {
  label: string;
  projectId: string;
  before: ScheduleProject;
};
export type HistoryState = {
  past: HistoryEntry[];
  future: HistoryEntry[];
  transaction: HistoryTransaction | null;
};

export type EditorState = {
  activeSection: "classes" | "design" | "device" | null;
  selectedSubjectId: string | null;
  selectedMeetingId: string | null;
  inspectorOpen: boolean;
  previewZoom: number;
  previewPan: { x: number; y: number };
  dragging: boolean;
  alignmentGuides: AlignmentGuides;
};

export interface ProjectSlice {
  projectsById: Record<string, ScheduleProject>;
  activeProjectId: string | null;
  loadProjects(): Promise<ProjectListResult>;
  createProject(title?: string): string;
  duplicateProject(projectId?: string): Promise<string | null>;
  renameProject(title: string): void;
  deleteProject(projectId?: string): Promise<void>;
  setActiveProject(projectId: string | null): void;
  resetProject(): void;
}

export interface ScheduleSlice {
  replaceSchedule(
    schedule: readonly Subject[],
    origin: {
      source: "portal" | "curriculum" | "manual" | "mixed";
      term?: { schoolYear: string | null; semester: string | null } | null;
      curriculum?: {
        programId: string;
        yearLevel: number;
        semesterId: string;
      } | null;
    },
  ): void;
  addSubject(input: SubjectInput): string | null;
  updateSubject(
    subjectId: string,
    updates: Partial<Omit<Subject, "id" | "meetings">>,
  ): void;
  removeSubject(subjectId: string): void;
  duplicateSubject(subjectId: string): string | null;
  setSubjectEnabled(subjectId: string, enabled: boolean): void;
  addMeeting(subjectId: string, input?: MeetingInput): string | null;
  updateMeeting(
    subjectId: string,
    meetingId: string,
    updates: Partial<Omit<Meeting, "id">>,
  ): void;
  removeMeeting(subjectId: string, meetingId: string): void;
  duplicateMeeting(subjectId: string, meetingId: string): string | null;
  toggleMeetingDay(
    subjectId: string,
    meetingId: string,
    day: ScheduleDay,
  ): void;
}

export interface DesignSlice {
  setTheme(themeId: string): void;
  setThemeVariant(themeVariantId: string | null): void;
  setLayout(layoutId: LayoutId): void;
  applyTemplateMetadata(
    templateId: string,
    design: Omit<ProjectDesign, "baseTemplateId" | "templateModified">,
  ): void;
  setDensity(density: Density): void;
  setDayVisibility(value: ProjectDesign["dayVisibility"]): void;
  setVisibleField(field: keyof VisibleFields, visible: boolean): void;
  setSubjectColorMode(mode: ProjectDesign["subjectColors"]["mode"]): void;
  setSubjectColor(subjectId: string, color: string | null): void;
  setBackground(background: ProjectDesign["background"]): void;
  setTypography(typography: ProjectDesign["typography"]): void;
  setDecorationIntensity(intensity: number): void;
  setWallpaperTitle(text: string): void;
  setWallpaperTitleVisible(visible: boolean): void;
  setWallpaperLabel(
    label: keyof WallpaperLabels,
    value: WallpaperLabels[keyof WallpaperLabels],
  ): void;
}

export interface DeviceSlice {
  createDeviceVariant(input: {
    category: DeviceCategory;
    dimensions: DeviceDimensions;
    dimensionSource?: DeviceVariant["dimensionSource"];
    presetId?: string | null;
    schedulePosition?: NormalizedPoint;
    compositionId?: string;
  }): string | null;
  removeDeviceVariant(variantId: string): void;
  setActiveDeviceVariant(variantId: string): void;
  setCanvasDimensions(
    variantId: string,
    dimensions: DeviceDimensions,
    source?: DeviceVariant["dimensionSource"],
  ): void;
  setDevicePreset(variantId: string, presetId: string | null): void;
  setDeviceOrientation(variantId: string, orientation: Orientation): void;
  setPreviewMode(variantId: string, mode: PreviewPreferences["mode"]): void;
  setShowSafeAreas(variantId: string, visible: boolean): void;
  setShowWarnings(variantId: string, visible: boolean): void;
  setSnappingEnabled(variantId: string, enabled: boolean): void;
  setGuideAsset(variantId: string, assetId: string | null): void;
  setSchedulePosition(variantId: string, position: NormalizedPoint): void;
  setComposition(variantId: string, compositionId: string): void;
  setDeviceOverrides(
    variantId: string,
    overrides: {
      layout?: LayoutId | null;
      density?: Density | null;
      visibleFields?: Partial<VisibleFields> | null;
    },
  ): void;
  setPhotoTransform(
    variantId: string,
    assetId: string,
    transform: PhotoTransform,
  ): void;
  clearPhotoTransform(variantId: string, assetId: string): void;
}

export interface EditorSlice {
  editor: EditorState;
  setActiveEditorSection(section: EditorState["activeSection"]): void;
  setEditorSelection(subjectId: string | null, meetingId?: string | null): void;
  setPreviewViewport(zoom: number, pan: { x: number; y: number }): void;
  setInspectorOpen(open: boolean): void;
  setDragging(dragging: boolean): void;
  setAlignmentGuides(guides: EditorState["alignmentGuides"]): void;
}

export interface HistorySlice {
  history: HistoryState;
  undo(): void;
  redo(): void;
  beginHistoryTransaction(label: string): void;
  commitHistoryTransaction(): void;
  cancelHistoryTransaction(): void;
}

export interface AutosaveSlice {
  autosave: AutosaveState;
  flushAutosave(): Promise<void>;
}

export type ScheduleBudState = ProjectSlice &
  ScheduleSlice &
  DesignSlice &
  DeviceSlice &
  EditorSlice &
  HistorySlice &
  AutosaveSlice;

export type CommitOptions = { history?: boolean; autosave?: boolean };
export type StoreContext = {
  dependencies: Required<
    Pick<StoreDependencies, "projects" | "assets" | "applicationMetadata">
  > &
    StoreDependencies;
  get(): ScheduleBudState;
  set(
    partial:
      | Partial<ScheduleBudState>
      | ((state: ScheduleBudState) => Partial<ScheduleBudState>),
  ): void;
  commit(
    label: string,
    mutate: (project: ScheduleProject) => ScheduleProject,
    options?: CommitOptions,
  ): ScheduleProject | null;
  enqueueAutosave(project: ScheduleProject): void;
  cancelAutosave(projectId: string): void;
};
