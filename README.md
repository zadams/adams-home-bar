# The Adams Home Bar

A Personal Cocktail Manual for the Spirits You Own.

Installable Progressive Web App for browsing and mixing cocktails from your home-bar inventory. Optimized for landscape 11-inch iPad use beside the bar.

## Features

- 300+ cocktail recipes (JSON) with bottle recommendations
- Editorial illustration system (art direction + WebP pipeline; photos as interim fallback)
- Seeded home-bar inventory with editable status
- Readiness matching, Make Something rankings, shopping list
- Favorites, ratings, tasting notes, drink history, Cocktail Journey
- Offline-capable PWA with JSON import/export

## Scripts

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
npm run index:cocktails
npm run illustrations:prompts
npm run illustrations:sync-registry
npm run illustrations:validate
```

Illustration Bible and prompts: `docs/illustration-system/`.

## Install on iPad

1. Open the hosted site in Safari (GitHub Pages URL after deploy, or local preview on the same Wi‑Fi)
2. Tap Share → Add to Home Screen
3. Launch from the home-screen icon

See `DEPLOY.md` for GitHub Pages / Netlify hosting, `FINISH.md` for the completion checklist, and `PROJECT_BRIEF.md` for the product roadmap.

To replace cocktail art later, see `public/images/README.md`.
