# State boundary

The Phase 3 Zustand store will separate persistent project slices (`project`, `schedule`, `design`, `device`) from temporary editor state and in-memory bounded history. Derived conflicts, layouts, render models, zoom, pan, hover, and modal state will not be persisted.
