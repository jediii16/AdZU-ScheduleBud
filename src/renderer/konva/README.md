# Konva renderer boundary

`ScheduleScene` draws the resolved discriminated nodes from a plain
`RenderModel`. `ScheduleArtboard` uses that same scene for a scaled preview and
an exact-size export stage. The selection/drag layer lives under
`editor-overlay` and mounts only on the preview stage.

Core geometry remains in `src/domain/render`; these components do not derive
schedule occurrences, read the project store, or reinterpret layout.
