import type { EditorSlice, StoreContext } from "../types";

export const initialEditorState: EditorSlice["editor"] = {
  activeSection: null,
  selectedSubjectId: null,
  selectedMeetingId: null,
  inspectorOpen: false,
  previewZoom: 1,
  previewPan: { x: 0, y: 0 },
  dragging: false,
  alignmentGuides: { verticalCenter: false, horizontalCenter: false },
};

export function createEditorSlice(context: StoreContext): EditorSlice {
  return {
    editor: initialEditorState,
    setActiveEditorSection(activeSection) {
      context.set((state) => ({
        editor: { ...state.editor, activeSection, inspectorOpen: true },
      }));
    },
    setEditorSelection(subjectId, meetingId = null) {
      context.set((state) => ({
        editor: {
          ...state.editor,
          selectedSubjectId: subjectId,
          selectedMeetingId: meetingId,
        },
      }));
    },
    setPreviewViewport(previewZoom, previewPan) {
      context.set((state) => ({
        editor: { ...state.editor, previewZoom, previewPan },
      }));
    },
    setInspectorOpen(inspectorOpen) {
      context.set((state) => ({ editor: { ...state.editor, inspectorOpen } }));
    },
    setDragging(dragging) {
      context.set((state) => ({ editor: { ...state.editor, dragging } }));
    },
    setAlignmentGuides(alignmentGuides) {
      context.set((state) => ({
        editor: { ...state.editor, alignmentGuides },
      }));
    },
  };
}
