# Finished-state checklist

Status after the finishing pass. Re-verify on a physical iPad when convenient.

## Phase 4 — Imagery & variations

- [x] Per-cocktail SVG illustrations in `public/images/cocktails/`
- [x] Replaceable registry at `src/data/illustrations/registry.json`
- [x] Graceful fallback silhouette if an asset is missing
- [x] Variations on key classics link to full recipes when available
- [x] Asset replacement notes in `public/images/README.md`

## Phase 5 — Accessibility

- [x] Skip link to `#main`
- [x] Landmark structure (`nav`, `main`)
- [x] Visible `:focus-visible` styles
- [x] Status not conveyed by color alone (readiness labels + dots)
- [x] `prefers-reduced-motion` honored in global CSS
- [x] Form controls labeled (visible or `sr-only`)
- [x] Decorative images use empty/`presentation` alt with sr-only name where needed

## Phase 5 — Tablet usability

- [x] Landscape iPad media query for book-spread + arm’s-length type
- [x] Touch targets ≥ ~44px on primary controls
- [x] Recipe panels scroll independently on short landscape viewports
- [x] Stacked layout under ~1024px

## Phase 5 — Offline / PWA

- [x] Web app manifest + service worker via `vite-plugin-pwa`
- [x] Precache app shell + assets; image/font runtime caching
- [x] `public/offline.html` included in assets
- [x] Update-available prompt
- [x] Install instructions in Settings + README

## Phase 5 — Performance

- [x] Route-level code splitting (`React.lazy` + `Suspense`)
- [x] Lazy-loaded cocktail images (`loading="lazy"`)
- [x] CSS code splitting enabled
- [x] Production build target `es2022`

## Phase 5 — Data & deploy

- [x] Full JSON import/export with validation
- [x] Shopping list + tasting history exports
- [x] `DEPLOY.md` + `netlify.toml` + SPA redirects

## Manual device checks (recommended)

1. `npm run build && npm run preview -- --host`
2. Open LAN URL in iPad Safari → Add to Home Screen
3. Toggle Airplane Mode and confirm cached recipes still open
4. Open Old Fashioned in landscape and confirm two-panel spread without excessive zoom
