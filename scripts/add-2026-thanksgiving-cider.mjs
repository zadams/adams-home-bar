#!/usr/bin/env node
/**
 * Thanksgiving 2026, part two: apple cider, maple syrup, fresh cranberries and
 * rosemary join the bar, with the five drinks they unlock (cider Old
 * Fashioned, maple bourbon sour, cider mimosa, cider sangria, cranberry Aperol
 * spritz). Both Thanksgiving sets are rewritten to use them.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const inventoryPath = path.join(root, 'src/data/inventory/seed-inventory.json')
const bottlesPath = path.join(root, 'src/data/bottles/bottles.json')
const cocktailsDir = path.join(root, 'src/data/cocktails')
const setsDir = path.join(root, 'src/data/sets')
const manifestPath = path.join(root, 'src/data/illustrations/illustration-manifest.json')

const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'))
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))
const knownBottles = new Set(JSON.parse(fs.readFileSync(bottlesPath, 'utf8')).map((item) => item.id))
const existingRecipes = new Set(fs.readdirSync(cocktailsDir).map((file) => file.replace(/\.json$/, '')))

// ── Ingredients and stock ───────────────────────────────────────────────────
const newIngredients = [
  {
    id: 'apple_cider',
    name: 'Apple cider',
    category: 'juice',
    subcategory: 'orchard',
    aliases: ['fresh cider', 'sweet cider', 'unfiltered apple juice'],
    tags: ['apple', 'juice', 'seasonal'],
  },
  {
    id: 'maple_syrup',
    name: 'Maple syrup',
    category: 'syrup',
    subcategory: 'sweetener',
    aliases: ['pure maple syrup'],
    tags: ['sweet', 'seasonal'],
  },
  {
    id: 'cranberries',
    name: 'Fresh cranberries',
    category: 'fresh',
    subcategory: 'fruit',
    aliases: ['cranberry'],
    tags: ['garnish', 'fresh', 'seasonal'],
  },
  {
    id: 'rosemary',
    name: 'Fresh rosemary',
    category: 'fresh',
    subcategory: 'herb',
    aliases: ['rosemary sprig'],
    tags: ['garnish', 'fresh', 'herb'],
  },
]

const newStock = [
  ['apple_cider', 'Fresh apple cider', 'Fresh, unfiltered; keep it cold and use within a week.'],
  ['maple_syrup', 'Pure maple syrup', 'On hand.'],
  ['cranberries', 'Fresh cranberries', 'For garnish and the sangria; they keep for weeks in the fridge.'],
  ['rosemary', 'Fresh rosemary', 'Sprigs for garnish; clap one between your palms to wake it up.'],
]

const knownIngredients = new Set(ingredients.map((item) => item.id))
for (const item of newIngredients) {
  if (!knownIngredients.has(item.id)) {
    ingredients.push(item)
    knownIngredients.add(item.id)
  }
}
const inventoryIds = new Set(inventory.map((item) => item.id))
for (const [ingredientId, productName, notes] of newStock) {
  const id = `inv-${ingredientId}`
  if (inventoryIds.has(id)) continue
  inventory.push({ id, ingredientId, status: 'in_stock', productName, tags: ['fresh', 'thanksgiving'], notes })
}

// ── Recipes ─────────────────────────────────────────────────────────────────
const ing = (ingredientId, amount, unit = 'oz', extra = {}) => ({
  ingredientId,
  amount,
  unit,
  scaleMode: extra.scaleMode ?? (['dash', 'dashes', 'drop'].includes(unit) ? 'fixed' : 'linear'),
  ...extra,
})
const garnish = (ingredientId, label) =>
  ing(ingredientId, 1, 'piece', { scaleMode: 'garnish', label, optional: true })
const rec = (bottleId, rank, rationale) => ({ bottleId, rank, rationale })

function cocktail(spec) {
  const record = {
    id: spec.id,
    slug: spec.id,
    name: spec.name,
    aliases: spec.aliases ?? [],
    description: spec.description,
    history: spec.history,
    origin: spec.origin,
    whyItWorks: spec.whyItWorks,
    classifications: spec.classifications,
    cocktailFamily: spec.cocktailFamily,
    flavorProfiles: spec.flavorProfiles,
    difficulty: spec.difficulty ?? 'easy',
    preparationTime: spec.preparationTime ?? 4,
    strength: spec.strength ?? 'medium',
    glassware: spec.glassware,
    ice: spec.ice,
    garnish: spec.garnish,
    illustrationKey: spec.id,
    featuredBottleImages: [],
    ingredients: spec.ingredients,
    steps: spec.steps,
    techniqueNotes: spec.techniqueNotes ?? [],
    recommendedBottles: spec.recommendedBottles ?? [],
    substitutions: spec.substitutions ?? [],
    variations: spec.variations ?? [],
    relatedCocktailIds: spec.relatedCocktailIds ?? [],
    seasonality: spec.seasonality ?? ['autumn'],
    tags: spec.tags,
  }
  Object.defineProperty(record, 'palette', { value: spec.palette, enumerable: false })
  Object.defineProperty(record, 'scene', { value: spec.scene, enumerable: false })
  return record
}

const recipes = [
  cocktail({
    id: 'apple-cider-old-fashioned',
    name: 'Apple Cider Old Fashioned',
    aliases: ['Apple Cider Bourbon Old Fashioned'],
    description:
      'Bourbon, fresh apple cider, maple syrup and Angostura, stirred and poured over a big cube. The most autumnal Old Fashioned there is.',
    history:
      'A modern seasonal Old Fashioned that has become a Thanksgiving standard: cider for the fruit and maple in place of the sugar cube.',
    origin: 'Modern American',
    whyItWorks:
      'Cider adds apple and a little acidity without watering the drink down; maple’s woodiness matches the bourbon’s barrel.',
    classifications: ['old-fashioned', 'stirred', 'seasonal'],
    cocktailFamily: 'Old Fashioned',
    flavorProfiles: ['apple', 'oaky', 'rich'],
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Orange peel', 'Rosemary sprig'],
    ingredients: [
      ing('bourbon', 2),
      ing('apple_cider', 1),
      ing('maple_syrup', 0.25),
      ing('angostura_bitters', 2, 'dash'),
      garnish('orange', 'Orange peel'),
      garnish('rosemary', 'Rosemary sprig'),
    ],
    steps: [
      'Stir the bourbon, cider, maple syrup and bitters with ice until cold.',
      'Strain over a large cube in a rocks glass.',
      'Express an orange peel over the top and add a rosemary sprig.',
    ],
    techniqueNotes: ['Use fresh, unfiltered cider from the refrigerated section, not shelf-stable apple juice.'],
    recommendedBottles: [
      rec('henry-mckenna-10', 1, 'Bottled-in-bond proof keeps the cider from taking over.'),
      rec('kirkland-bourbon', 2, 'A good mixing bourbon.'),
      rec('angostura-aromatic', 3, 'The spice.'),
    ],
    relatedCocktailIds: ['old-fashioned', 'brown-sugar-cinnamon-old-fashioned', 'maple-bourbon-sour'],
    tags: ['bourbon', 'apple', 'cider', 'maple', 'old-fashioned', 'thanksgiving'],
    palette: { name: 'cider-amber', hex: '#A8621E' },
    scene:
      'one rocks glass of hazy amber Old Fashioned over a single large clear cube, an orange peel and a rosemary sprig',
  }),
  cocktail({
    id: 'maple-bourbon-sour',
    name: 'Maple Bourbon Sour',
    description:
      'Bourbon, lemon and maple syrup, shaken, with an egg white if you like the foam. A whiskey sour with maple in place of sugar.',
    history:
      'A seasonal whiskey sour. Maple syrup has sweetened sours in New England for as long as there have been sours there.',
    origin: 'American',
    whyItWorks:
      'Maple is less sweet and more savoury than sugar, so it reads as caramel next to the bourbon instead of candy.',
    classifications: ['sour', 'shaken', 'seasonal'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['tart', 'rich', 'oaky'],
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Angostura drops', 'Lemon twist'],
    ingredients: [
      ing('bourbon', 2),
      ing('lemon_juice', 0.75),
      ing('maple_syrup', 0.5),
      ing('egg_white', 1, 'piece', { label: 'Egg white (optional)', optional: true }),
      garnish('angostura_bitters', 'A few drops of Angostura on the foam'),
      garnish('lemon', 'Lemon twist'),
    ],
    steps: [
      'With egg white: shake everything without ice first, then again with ice.',
      'Without: shake hard with ice.',
      'Strain over a large cube; dot the foam with Angostura or add a lemon twist.',
    ],
    recommendedBottles: [
      rec('henry-mckenna-10', 1, 'Proof to stand up to the lemon.'),
      rec('kirkland-bourbon', 2, 'A good mixing bourbon.'),
    ],
    relatedCocktailIds: ['whiskey-sour', 'cranberry-bourbon-sour', 'apple-cider-old-fashioned'],
    tags: ['bourbon', 'maple', 'sour', 'thanksgiving'],
    palette: { name: 'maple-gold', hex: '#C98A2E' },
    scene:
      'one rocks glass of golden whiskey sour over a large cube, a thick white foam cap dotted with three drops of dark red bitters',
  }),
  cocktail({
    id: 'apple-cider-mimosa',
    name: 'Apple Cider Mimosa',
    description:
      'Cold apple cider topped with prosecco. A one-step toast; rim the glass with cinnamon sugar if there’s time.',
    history: 'The mimosa’s autumn cousin, a brunch and Thanksgiving-morning fixture.',
    origin: 'Modern American',
    whyItWorks: 'Cider brings more body and acidity than orange juice, and the bubbles lift its apple.',
    classifications: ['sparkling', 'brunch', 'seasonal'],
    cocktailFamily: 'Sparkling',
    flavorProfiles: ['apple', 'sparkling', 'light'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Flute',
    ice: 'None',
    garnish: ['Rosemary sprig'],
    ingredients: [
      ing('apple_cider', 2),
      ing('prosecco', 4),
      garnish('demerara_sugar', 'Cinnamon-sugar rim (optional)'),
      garnish('rosemary', 'Rosemary sprig'),
    ],
    steps: [
      'Pour cold cider into a flute.',
      'Top slowly with cold prosecco.',
      'Add a rosemary sprig.',
    ],
    techniqueNotes: ['For a rim, wet the edge with cider and dip it in demerara mixed with a pinch of cinnamon.'],
    relatedCocktailIds: ['mimosa', 'champagne-cocktail', 'cranberry-apple-sparkler'],
    tags: ['sparkling', 'prosecco', 'apple', 'cider', 'brunch', 'thanksgiving'],
    palette: { name: 'pale-cider-gold', hex: '#D9A441' },
    scene: 'one champagne flute of pale golden sparkling cider with fine rising bubbles, a rosemary sprig standing in it',
  }),
  cocktail({
    id: 'apple-cider-sangria',
    name: 'Apple Cider Sangria',
    description:
      'Red wine, apple cider, bourbon and orange with a touch of cinnamon syrup, steeped overnight with orange slices and fresh cranberries. Made by the pitcher.',
    history:
      'An autumn sangria. Brandy is the usual spirit; bourbon is in the bag already and suits the cider.',
    origin: 'House',
    whyItWorks:
      'Cider softens the wine’s tannin and adds fruit, bourbon gives it backbone, and an overnight steep pulls the orange and cranberry into it.',
    classifications: ['house', 'punch', 'batch'],
    cocktailFamily: 'Punch',
    flavorProfiles: ['fruity', 'apple', 'spiced'],
    preparationTime: 10,
    strength: 'light',
    glassware: 'Wine glass',
    ice: 'Cubes in the glass',
    garnish: ['Orange slice', 'Fresh cranberries', 'Rosemary sprig'],
    ingredients: [
      ing('red_wine', 3),
      ing('apple_cider', 2),
      ing('bourbon', 0.75),
      ing('orange_juice', 0.5, 'oz', { label: 'Fresh orange juice' }),
      ing('brown_sugar_cinnamon_syrup', 0.25),
      garnish('orange', 'Orange slices'),
      garnish('cranberries', 'Fresh cranberries'),
      garnish('rosemary', 'Rosemary sprig'),
    ],
    steps: [
      'Scale to the guest count. The night before, stir everything together in a pitcher with sliced oranges and a handful of fresh cranberries.',
      'Refrigerate overnight, covered.',
      'Pour over ice in wine glasses, with some fruit, and add a rosemary sprig.',
    ],
    techniqueNotes: [
      'For 12: one 750 ml bottle plus a glass of dry red (36 oz), 24 oz cider, 9 oz bourbon, 6 oz orange juice, 3 oz cinnamon syrup, two oranges and a cup of cranberries.',
      'A fruity, low-tannin red (Garnacha, Zinfandel, Merlot) works best.',
    ],
    recommendedBottles: [
      rec('kirkland-bourbon', 1, 'The spirit.'),
      rec('brown-sugar-cinnamon-syrup', 2, 'The spice.'),
    ],
    relatedCocktailIds: ['christmas-sangria', 'gobbler-punch', 'harvest-punch'],
    tags: ['wine', 'bourbon', 'apple', 'cider', 'sangria', 'batch', 'party', 'house', 'thanksgiving'],
    palette: { name: 'garnet', hex: '#7A1F2B' },
    scene:
      'batch hero: a large clear glass pitcher of deep garnet sangria full of orange slices and bright fresh cranberries, a rosemary sprig on top, with one stemmed wine glass of it over ice beside it',
  }),
  cocktail({
    id: 'cranberry-aperol-spritz',
    name: 'Cranberry Aperol Spritz',
    description:
      'Aperol, cranberry and prosecco with a splash of soda, over ice. A spritz in Thanksgiving colours for the appetizers.',
    history: 'A seasonal twist on the Aperol Spritz; cranberry replaces some of the soda.',
    origin: 'Modern',
    whyItWorks:
      'Cranberry’s tartness and Aperol’s bitter orange point the same way, so it tastes like a sharper, redder spritz rather than a juice drink.',
    classifications: ['spritz', 'sparkling', 'seasonal'],
    cocktailFamily: 'Spritz',
    flavorProfiles: ['bittersweet', 'tart', 'sparkling'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Wine glass',
    ice: 'Cubes',
    garnish: ['Fresh cranberries', 'Rosemary sprig'],
    ingredients: [
      ing('aperol', 1.5),
      ing('cranberry_juice', 1),
      ing('prosecco', 3),
      ing('club_soda', 1),
      garnish('cranberries', 'Fresh cranberries'),
      garnish('rosemary', 'Rosemary sprig'),
    ],
    steps: [
      'Fill a wine glass with ice.',
      'Add prosecco, then Aperol and cranberry, then the soda.',
      'Drop in a few cranberries and a rosemary sprig.',
    ],
    recommendedBottles: [rec('aperol', 1, 'The bitter.')],
    relatedCocktailIds: ['aperol-spritz', 'cranberry-apple-sparkler'],
    tags: ['aperol', 'spritz', 'sparkling', 'cranberry', 'thanksgiving'],
    palette: { name: 'cranberry-orange', hex: '#D9452B' },
    scene:
      'one large stemmed wine glass of glowing red-orange spritz over ice with fine bubbles, fresh cranberries floating and a rosemary sprig',
  }),
]

// Rosemary and cranberries for the existing batch drinks, for the photos.
const extraGarnish = {
  'gobbler-punch': [garnish('cranberries', 'Fresh cranberries')],
  'cranberry-apple-sparkler': [garnish('cranberries', 'Fresh cranberries'), garnish('rosemary', 'Rosemary sprig')],
}

// ── Sets ────────────────────────────────────────────────────────────────────
const toGo = {
  id: 'thanksgiving-to-go',
  name: 'Thanksgiving To Go',
  description:
    'A Thanksgiving bar that fits in one bag. Bottles: bourbon (bring a 1.75 L), Koskenkorva Apple, sweet vermouth, prosecco and a bottle of red. Also: Angostura, the brown-sugar-cinnamon and honey syrups, maple syrup, sugar cubes, apple cider, cranberry, orange, lemon and lime juice, ginger beer, oranges, fresh cranberries and rosemary. The four batches are made at home and are the ones to photograph; the rest are made to order from the same bag.',
  drinks: [
    ['apple-cider-sangria', 'Batch: steep it in the pitcher overnight.'],
    ['gobbler-punch', 'Batch: mix the base at home; ginger beer and ice go in on site.'],
    ['cranberry-apple-sparkler', 'Batch: base in a pitcher; add the prosecco at the table.'],
    ['bottled-manhattan', 'Batch: bottle it the night before and freeze it.'],
    ['apple-cider-old-fashioned', 'Stirred in a mixing glass, or built in the glass at a pinch.'],
    ['maple-bourbon-sour', 'Shake to order; skip the egg white on the road.'],
    ['cranberry-bourbon-sour', 'Shake to order.'],
    ['apple-pie-sour', 'Shake to order.'],
    ['apple-cider-mimosa', 'For arrivals: cider and prosecco, nothing else.'],
    ['champagne-cocktail', 'For the toast, with the prosecco you brought.'],
    ['cranberry-ginger-fizz', 'No alcohol, for drivers and kids.'],
    ['hot-toddy', 'After dinner, if the host has a kettle.'],
  ],
}

const thanksgivingPath = path.join(setsDir, 'thanksgiving.json')
const thanksgiving = JSON.parse(fs.readFileSync(thanksgivingPath, 'utf8'))
const oldNotes = new Map(thanksgiving.drinks.map((entry) => [entry.drinkId, entry.note]))
const newNotes = {
  'apple-cider-sangria': 'Pitcher: steep it overnight.',
  'apple-cider-old-fashioned': 'Fresh, unfiltered cider.',
  'maple-bourbon-sour': 'Egg white optional.',
  'mistletoe-mule': 'The cranberry Moscow Mule.',
  'cranberry-margarita': 'Kirkland blanco and Cointreau.',
  'cranberry-aperol-spritz': 'With the appetizers.',
  'apple-cider-mimosa': 'For the morning, or the toast.',
}
const thanksgivingOrder = [
  'harvest-punch',
  'apple-cider-sangria',
  'apple-cider-old-fashioned',
  'maple-bourbon-sour',
  'cranberry-bourbon-sour',
  'apple-pie-sour',
  'mistletoe-mule',
  'cranberry-margarita',
  'cranberry-aperol-spritz',
  'ward-eight',
  'jack-rose',
  'brown-sugar-cinnamon-old-fashioned',
  'brown-butter-old-fashioned',
  'manhattan',
  'champagne-cocktail',
  'apple-cider-mimosa',
  'cranberry-ginger-fizz',
  'cranberry-toddy',
  'hot-toddy',
  'hot-buttered-rum',
]
for (const id of oldNotes.keys()) {
  if (!thanksgivingOrder.includes(id)) throw new Error(`thanksgiving: ${id} would be dropped`)
}
thanksgiving.description =
  'Apple cider, cranberry, maple, cinnamon and brown spirits for the fourth Thursday. Two big-batch drinks to have ready when people arrive, sours, spritzes and stirred drinks for before dinner, and hot drinks for after.'
thanksgiving.drinks = thanksgivingOrder.map((drinkId) => {
  const note = newNotes[drinkId] ?? oldNotes.get(drinkId)
  return note ? { drinkId, note } : { drinkId }
})

// ── Validate ────────────────────────────────────────────────────────────────
const allRecipes = new Set([...existingRecipes, ...recipes.map((r) => r.id)])
for (const recipe of recipes) {
  if (existingRecipes.has(recipe.id)) throw new Error(`${recipe.name}: id ${recipe.id} already exists`)
  for (const line of recipe.ingredients) {
    if (!knownIngredients.has(line.ingredientId)) throw new Error(`${recipe.name}: unknown ingredient ${line.ingredientId}`)
  }
  for (const item of recipe.recommendedBottles) {
    if (!knownBottles.has(item.bottleId)) throw new Error(`${recipe.name}: unknown bottle ${item.bottleId}`)
  }
  for (const related of recipe.relatedCocktailIds) {
    if (!allRecipes.has(related)) throw new Error(`${recipe.name}: unknown related drink ${related}`)
  }
}
for (const id of [...toGo.drinks.map(([id]) => id), ...thanksgivingOrder]) {
  if (!allRecipes.has(id)) throw new Error(`set: unknown drink ${id}`)
}

// ── Write ───────────────────────────────────────────────────────────────────
fs.writeFileSync(ingredientsPath, `${JSON.stringify(ingredients, null, 2)}\n`)
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`)
for (const recipe of recipes) {
  fs.writeFileSync(path.join(cocktailsDir, `${recipe.id}.json`), `${JSON.stringify(recipe, null, 2)}\n`)
}

function patchCocktail(id, mutate) {
  const file = path.join(cocktailsDir, `${id}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  mutate(data)
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}
const addRelated = (data, extras) => {
  data.relatedCocktailIds = [...new Set([...(data.relatedCocktailIds ?? []), ...extras])]
}
for (const [id, lines] of Object.entries(extraGarnish)) {
  patchCocktail(id, (data) => {
    for (const line of lines) {
      if (data.ingredients.some((l) => l.ingredientId === line.ingredientId)) continue
      data.ingredients.push(line)
      data.garnish = [...new Set([...data.garnish, line.label])]
    }
  })
}
patchCocktail('old-fashioned', (data) => addRelated(data, ['apple-cider-old-fashioned']))
patchCocktail('whiskey-sour', (data) => addRelated(data, ['maple-bourbon-sour']))
patchCocktail('mimosa', (data) => addRelated(data, ['apple-cider-mimosa']))
patchCocktail('aperol-spritz', (data) => addRelated(data, ['cranberry-aperol-spritz']))
patchCocktail('christmas-sangria', (data) => addRelated(data, ['apple-cider-sangria']))

const writeSet = (set) =>
  fs.writeFileSync(path.join(setsDir, `${set.id}.json`), `${JSON.stringify(set, null, 2)}\n`)
writeSet({ ...toGo, drinks: toGo.drinks.map(([drinkId, note]) => (note ? { drinkId, note } : { drinkId })) })
writeSet(thanksgiving)

// ── Illustration manifest ───────────────────────────────────────────────────
const glassId = (glassware) => {
  const value = glassware.toLowerCase()
  if (value.includes('wine')) return 'wine'
  if (value.includes('flute')) return 'flute'
  return 'double-old-fashioned'
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const byId = new Map(manifest.cocktails.map((item) => [item.id, item]))
for (const recipe of recipes) {
  byId.set(recipe.id, {
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    illustrationKey: recipe.illustrationKey,
    cocktailFamily: recipe.cocktailFamily,
    classifications: recipe.classifications,
    flavorProfiles: recipe.flavorProfiles,
    ingredientIds: recipe.ingredients.filter((item) => !item.optional).map((item) => item.ingredientId),
    artDirection: {
      template: recipe.cocktailFamily.toLowerCase().replaceAll(' ', '-'),
      glass: glassId(recipe.glassware),
      sourceGlassware: recipe.glassware,
      ice: recipe.ice,
      garnish: recipe.garnish.join(' and ') || 'none',
      liquidPalette: recipe.palette,
      composition: `${recipe.scene}; three-quarter view, generous safe area, no text, no bottle labels`,
      background: 'deep emerald-to-charcoal matte backdrop above a dark walnut bar, restrained brass accents',
      lighting: 'warm amber key from upper left, soft neutral fill, subtle rim light, realistic shadow',
      output: {
        master: `cocktails/masters/${recipe.id}.png`,
        runtime: `cocktails/webp/${recipe.id}.webp`,
        thumbnail: `cocktails/thumbs/${recipe.id}.webp`,
      },
    },
  })
}
manifest.cocktails = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
manifest.cocktailCount = manifest.cocktails.length
manifest.generatedFrom = `${manifest.generatedFrom ?? 'catalog'}; thanksgiving cider 2026`
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Added ${newIngredients.length} ingredients and ${recipes.length} recipes; rewrote both Thanksgiving sets; catalog ${manifest.cocktailCount}.`)
for (const r of recipes) console.log(`ART ${r.id}: ${r.scene}`)
