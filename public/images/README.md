# Image assets

## Finished drinks (photo-realistic)

Primary art lives in:

`public/images/cocktails/photos/{cocktail-id}.jpg`

These are photo-realistic finished-drink images (currently from TheCocktailDB for bootstrapping).

## Ingredients (photo-realistic)

Ingredient product/produce shots live in:

`public/images/ingredients/photos/{ingredient-id}.png`

Registered in `src/data/illustrations/ingredients.json`. The recipe view shows them in the **“In the glass”** strip under the drink photo and next to each line in the ingredients table.

### Replacing with your own photos or AI renders

1. Export a photo or Midjourney/Flux render of the finished drink (4:3 works best).
2. Save it as `public/images/cocktails/photos/{cocktail-id}.jpg` (same id as the recipe).
3. Optional: replace ingredient shots under `public/images/ingredients/photos/{ingredient-id}.png`.
4. Rebuild or hard-refresh — registries already point at those paths.

Keep recipe text in the UI, not burned into the image.

See `ATTRIBUTION.md` for bundled photo credits.
