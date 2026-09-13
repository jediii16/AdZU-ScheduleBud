# Phase 8R — production launch checkpoint

Date: 2026-09-13
Public URL: https://adzu-schedulebud.vercel.app/

## Checked and polished

- Inspected current routes, creation methods, templates, local project handling, newer Studio features, asset paths, fonts, public CTAs, and footer. No functioning feature was hidden or removed.
- Live deployment: Home and Create loaded, mobile Home had no horizontal overflow, and the isolated browser reported no page errors. Changes below are local, not deployed.
- Completed factual title/description, production metadata origin, route titles/canonicals, static Open Graph/Twitter preview, PNG favicon fallback, and Apple touch icon. Retained existing light/dark SVG marks; no PWA/offline claims.
- Added robots/sitemap for public entry routes; client-local Review and Studio are noindex.
- Added branded loading, unknown-route, route-error, and root-error fallbacks. Recovery actions offer retry and/or Home without exposing technical error details or resetting storage.
- Subsequent approved loading polish: floating blue/mint/lilac mini-schedule tiles, a subtle blue glow, and decorative loading dots around the existing brand. CSS-only animation respects reduced motion and adds no minimum loading duration. Local Chromium checks at 375/1366 px verified no overflow, animation disabled with reduced motion, completion into Home, and working Create navigation; 11 focused loading/fallback/provider tests plus TypeScript/ESLint/whitespace checks passed. No additional build or deployment was performed; the persistence blocker below is unchanged.
- Approved stronger-motion revision: staggered fly-in tile assembly, a spring-style logo entrance, increased floating motion, and a repeating highlight sweep. Reduced motion disables every added animation. The same 375/1366 px browser checks and 11 focused tests/checks passed; an animated preview was recorded outside the repository. Still no artificial loading delay, extra build, deployment, or persistence changes.
- Removed internal Studio empty-state wording and replaced its empty review loop with a Home action.
- Mechanically exported the approved hero SVG as WebP: 2,558,871-byte source becomes 115,536 bytes before Next image optimization. Layout and artwork remain unchanged. Existing SVG remains the source; `node scripts/prepare-brand-assets.mjs` regenerates exports.

## Verification evidence

- Relevant Vitest UI/state/integration suites: **169 tests, 16 files passed**.
- TypeScript, relevant ESLint, and `git diff --check`: passed.
- **One production build passed** (Next.js 16.3.2), including bundled fonts and all routes.
- Focused Playwright against `next start` on port 3100: **9 passed, 1 failed**. Passing checks cover metadata/social image dimensions, icons/robots/sitemap, deep links and refresh, unknown-route recovery, Home assets/fonts at 375/768/1024/1440 px, three creation methods, exact Phone/Desktop PNGs, and repeated schedule/background/ZIP exports.
- Existing immediate-refresh persistence flow passed in development but **failed in production immediately after changing the title**: reload restored “Weekly Schedule” instead of the edited title. The production failure occurs before that test's later device/background/reopen assertions; those later assertions must not be described as production-verified.

## Launch blocker and remaining limitations

- **P1 — immediate refresh can lose the latest edit.** Blur/page lifecycle handlers start asynchronous IndexedDB saves, but navigation does not await their completion. The development server's additional latency masked this race. A reliable shutdown/save-boundary fix and another production verification are required before declaring Phase 8R complete. No unverified persistence patch or second build was made in this checkpoint.
- Changes are not deployed; live-site visual/social-cache checks remain necessary after deployment.
- Existing local-first application requires JavaScript and browser storage. Metadata is server-produced, but the provider initially shows loading UI until local hydration; no server-rendering architecture rewrite was attempted.
- Browser verification used Chromium, not physical iOS/Safari devices. Real Portal PDF import and final font/image/export visual review remain manual checks from Phase 8Q.
- No new environment variables or deployment rewrites were needed. No user records/assets were cleared.

## Manual production checklist (after the persistence blocker is fixed)

1. Deploy the approved changes; check Home, all creation links, direct route refresh, and an unknown URL.
2. Check favicon/touch icon and a fresh social link preview; previews may retain cached artwork.
3. On phone/iPad/laptop, check hero/templates/footer, keyboard focus, and fallback Home/retry actions.
4. Edit a real schedule, immediately refresh, reopen, switch devices, and verify uploaded photos/backgrounds remain intact.
5. Export repeatedly and visually check exact dimensions, fonts, images, decorations, and absence of editor UI.

This checkpoint is not launch approval. Phase 8R remains open on the production autosave blocker.
