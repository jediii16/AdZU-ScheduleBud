# State boundary

The Phase 2 Zustand implementation is composed in `store.ts` from cohesive project, schedule, design, device, editor, and history slice creators. Persistent mutations use explicit validated actions; temporary editor state and derived schedule/render data never enter `ScheduleProject` persistence.
