# Konva renderer boundary

Phase 5 will add React Konva components that draw a resolved `RenderModel`. Core schedule and layout calculations must remain in `src/domain`; editor overlays must consume `EditorOverlayModel` separately and must never enter export layers.
