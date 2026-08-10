# The Adams Home Bar — static hosting

## GitHub Pages (recommended)

This repo deploys automatically via `.github/workflows/deploy-pages.yml` on every push to `main`.

Live URL pattern:

`https://<your-github-username>.github.io/adams-home-bar/`

### First-time setup

1. Push this repo to GitHub (public repo on a free account)
2. GitHub Actions will build and publish
3. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**
4. After the workflow finishes, open the Pages URL in Safari on your iPad
5. Share → **Add to Home Screen**

Local builds use `/` as the base path. The Pages workflow sets `BASE_PATH=/adams-home-bar/` so assets and routing work under the project subpath.

## Cocktail illustrations

Art direction lives in `docs/illustration-system/`. Runtime WebPs go in `public/images/cocktails/webp/`. Until those exist, stock photos remain the fallback. See that folder’s README for the production workflow.

## Netlify

This repo includes `public/_redirects` for SPA routing.

1. Connect the GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Leave base path as `/` (do not set `BASE_PATH`)

## Local preview (same Wi‑Fi as iPad)

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

Open `http://<your-mac-lan-ip>:4173/` in Safari → Share → Add to Home Screen.
