# Image attribution

## Cocktail photos

Finished-drink photographs are sourced from [TheCocktailDB](https://www.thecocktaildb.com) free API image CDN for offline use in this personal PWA.

Replace any file in `public/images/cocktails/photos/{cocktail-id}.jpg` to use your own photography or AI renders — the illustration registry already points at those paths.

Bundled mappings: 80 cocktails.

## Ingredient photos

Ingredient product and produce shots are also sourced from TheCocktailDB ingredient image CDN:

`public/images/ingredients/photos/{ingredient-id}.png`

Bundled mappings: all catalog ingredients (see `src/data/illustrations/ingredients.json`).
