# Image assets

## Editorial cocktail illustrations (preferred)

Art direction and prompts live in `docs/illustration-system/` (Illustration Bible + manifest).

Runtime delivery paths:

```text
public/images/cocktails/webp/{illustrationKey}.webp   # 1536×1536
public/images/cocktails/thumbs/{illustrationKey}.webp # 512×512
public/images/cocktails/masters/{illustrationKey}.png # archival (optional, usually gitignored)
```

Until a WebP exists, the app falls back to stock photos or a painterly SVG placeholder tinted from the drink’s liquid palette.

### Workflow

1. Read `docs/illustration-system/ILLUSTRATION_BIBLE.md`
2. Generate the Hero Twenty from `docs/illustration-system/hero-20-prompts.md`
3. `npm run illustrations:prompts` — write 322 prompt files
4. Drop finished WebPs into `public/images/cocktails/webp/`
5. `npm run illustrations:sync-registry`
6. `npm run illustrations:validate`

## Stock drink photos (fallback)

`public/images/cocktails/photos/{cocktail-id}.jpg`

Currently bootstrapped from TheCocktailDB for offline use.

## Ingredients

`public/images/ingredients/photos/{ingredient-id}.png`

Registered in `src/data/illustrations/ingredients.json`.

Keep recipe text in the UI, not burned into images.

See `ATTRIBUTION.md` for bundled photo credits.
