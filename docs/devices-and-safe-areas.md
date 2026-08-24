# Devices and safe areas

## Target identity and dimensions

Wallpaper targets use five semantic categories: Phone, Tablet, Laptop, Desktop, and Square. Category and dimension source are independent. A Phone remains a Phone whether its dimensions came from a generic preset, custom input, or Match My Screen. There is deliberately no `custom` category.

Each `DeviceVariant` has its own stable ID, semantic category, dimensions, orientation, composition ID, normalized schedule position, overrides, and preview preferences. Multiple variants in the same category may coexist, so Phone 1080 × 2400 and Phone 1170 × 2532 retain separate positions. Shared schedule and design intent remain project-level.

The existing schema already modeled multiple variants, all categories, and the `preset | custom | matched-screen` provenance union. Phase 5 therefore does not change the serialized shape or increment schema version. Existing Phone/Desktop variants remain valid without migration.

## Preset registry and validation

The typed registry under `src/data/devices` contains generic, model-neutral presets only: one FHD+ Phone; 4:3 and 16:10 Tablet orientations; 1366 × 768, 1920 × 1080, and 2560 × 1600 Laptop canvases; Full HD, QHD, and 4K Desktop canvases; and 1080/2048 Square canvases. Named-device research remains deferred.

All preset, custom, and matched-screen canvases use shared limits:

- minimum edge: 320 px
- maximum edge: 5120 px
- maximum area: 16,000,000 pixels

Invalid dimensions are rejected rather than clamped. Orientation is derived from actual dimensions. Switching orientation swaps width and height and rebuilds Cards geometry; no RenderModel is rotated or stretched.

## Target composition

`resolveTargetComposition()` is pure TypeScript and reads only semantic target information and target dimensions. It never reads browser viewport size. It resolves Phone portrait, Tablet portrait, Tablet landscape, Desktop landscape, or Square composition families.

Clean Slate Cards keeps the Phase 4.1 compact two-column Phone packing. Wider portrait Tablet targets and five/six-day Square targets may use three content-driven columns. Tablet landscape and Laptop/Desktop targets use balanced bounded-width day columns. Every switch rebuilds resolved target-pixel geometry from the same schedule and design.

## Match My Screen

Match My Screen accepts PNG, JPEG, and WebP locally. Browser image decoding supplies width, height, MIME type, orientation, and conservative category candidates. Dimensions never identify a model. Ambiguous screens require the student to confirm Phone, Tablet, Laptop, Desktop, or Square.

The temporary image is not uploaded, serialized into project JSON, or stored automatically. Choosing “Use as preview guide” explicitly writes one `screen-guide` Blob through the Dexie asset repository and stores only its asset ID in preview preferences. Replacement and removal operate only on `screen-guide` assets. Object URLs are short-lived, and decoded guide images are cached by asset ID rather than recreated on unrelated renders.

## Preview environments and safe areas

Preview modes are category-aware:

- Phone: wallpaper, generic lock screen, generic home screen, My Screen
- Tablet: wallpaper, generic lock/home interface, My Screen
- Laptop/Desktop: wallpaper, schematic Windows desktop, schematic macOS desktop, My Screen
- Square: wallpaper and My Screen

OS representations are spatial guides, not brand-perfect replicas. Safe-area models contain typed `blocked`, `caution`, and `clear` rectangles. Collision status is derived from resolved schedule bounds and is never persisted. Caution and blocked feedback is textual as well as colored and never interrupts dragging.

## Snapping, export, and privacy boundary

Canvas center remains the highest-priority snap target. Safe-area clear-boundary anchors are considered only when center is outside the acquisition threshold, preventing jitter. The 8 px acquisition and 14 px release thresholds remain display-space values independent of preview zoom.

Preview environments, safe areas, collision feedback, smart guides, and uploaded guides are React Konva editor overlays. The exact export Stage has no dependency on their models or assets and renders only the ordered wallpaper `RenderModel`. Export remains pixel-ratio 1 at the exact selected target dimensions; failures never reduce resolution silently.
