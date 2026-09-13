# Phase 8R Production Polish Implementation Plan

> **For agentic workers:** Execute inline using superpowers:executing-plans, with verification checkpoints; no delegation needed.

**Goal:** Prepare the existing ScheduleBud experience for public launch without redesign.

**Architecture:** Static metadata and existing brand assets; small route-convention fallback components. Retain the existing local project architecture and deferred Studio renderer.

**Tech Stack:** Next.js 16.3.2, React 19, Vitest, Playwright, Sharp.

**Spec:** User's Phase 8R request in this task.

## Global Constraints

- Preserve current features and unrelated worktree edits; no user-data reset.
- No deployment, major features, redesign, or launch-video/pubmat work.
- Run focused checks and exactly one final production build.

## Tasks

- [x] Add launch metadata/route smoke tests in `tests/e2e/launch.spec.ts`; run against the current server to confirm missing social metadata.
- [x] Complete static metadata in `src/app/layout.tsx` and route pages, plus `robots.ts`/`sitemap.ts`. Reuse existing logos for social and touch assets; rasterize `hero.svg` to a smaller WebP without changing layout.
- [x] Add branded loading, error and not-found route conventions; test retry/Home actions and safe error copy. Remove internal Studio empty-state copy.
- [ ] Run focused tests, TypeScript, relevant ESLint, diff whitespace check, and one production build. Run launch routes/responsive/assets and representative existing persistence/export tests against `next start` on an isolated port.
- [x] Record evidence and limitations in `docs/production-launch.md`; report Phase 8R only, leaving final deployed visual QA to the user.

Production checkpoint: one build passed; 9/10 focused production browser checks passed. Immediate-title-refresh persistence failed in production. Resolve that blocker and obtain approval before spending a second build; do not claim Phase 8R complete yet.
