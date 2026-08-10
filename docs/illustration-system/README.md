# Adams Home Bar Illustration System

This package converts the cocktail index into a production-ready illustration workflow for all **322** drinks.

> These files are **art direction, prompts, metadata, and validation tooling** — not finished illustrations.

## Files

- `ILLUSTRATION_BIBLE.md` — art direction and QA standard
- `illustration-manifest.json` — one art-direction record per cocktail (canonical app copy also at `src/data/illustrations/illustration-manifest.json`)
- `hero-20-prompts.md` — the calibration set to generate first
- `cocktail-index.json` — source index copy packaged with the system
- Scripts in the repo:
  - `npm run illustrations:prompts`
  - `npm run illustrations:validate`
  - `npm run illustrations:sync-registry`

## Start here

1. Read `ILLUSTRATION_BIBLE.md`.
2. Generate the images in `hero-20-prompts.md`.
3. Review the 20 images together and lock the style.
4. Generate individual prompts:

```bash
npm run illustrations:prompts
```

5. Produce the remaining assets family by family.
6. Place runtime files in:

```text
public/images/cocktails/webp/<illustrationKey>.webp
public/images/cocktails/thumbs/<illustrationKey>.webp
```

7. Sync the illustration registry and validate:

```bash
npm run illustrations:sync-registry
npm run illustrations:validate
```

## App integration

- Manifest drives art direction + placeholder liquid colors.
- `CocktailIllustration` prefers editorial WebP, then stock photos, then SVG placeholders.
- Asset generator: `npm run illustrations:generate-hero` / `illustrations:generate-all`
- Runtime output: `public/images/cocktails/webp/` + `thumbs/`

Bootstrap generation currently uses Pollinations/Flux with Bible-aligned prompts, then ImageMagick conversion to the delivery sizes. Re-run with `--force` to regenerate.

## Accuracy note

The index includes glassware, family, flavors, and ingredient IDs, but not a definitive garnish or ice field for every cocktail. The manifest therefore provides conservative art-direction defaults. Where it says to follow recipe metadata, read the full recipe JSON in `src/data/cocktails/` before producing final art.
