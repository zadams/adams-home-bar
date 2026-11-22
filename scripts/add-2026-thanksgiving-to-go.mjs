#!/usr/bin/env node
/**
 * Thanksgiving To Go: a portable four-bottle Thanksgiving bar. Three batched
 * drinks made at home (a punch, a sparkling pitcher, a bottled Manhattan) and
 * six made to order from the same bag.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const bottlesPath = path.join(root, 'src/data/bottles/bottles.json')
const cocktailsDir = path.join(root, 'src/data/cocktails')
const setsDir = path.join(root, 'src/data/sets')
const manifestPath = path.join(root, 'src/data/illustrations/illustration-manifest.json')

const knownIngredients = new Set(JSON.parse(fs.readFileSync(ingredientsPath, 'utf8')).map((item) => item.id))
const knownBottles = new Set(JSON.parse(fs.readFileSync(bottlesPath, 'utf8')).map((item) => item.id))
const existingRecipes = new Set(fs.readdirSync(cocktailsDir).map((file) => file.replace(/\.json$/, '')))

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
  Object.defineProperty(record, 'vessel', { value: spec.vessel, enumerable: false })
  return record
}

const recipes = [
  cocktail({
    id: 'gobbler-punch',
    name: 'Gobbler Punch',
    description:
      'Bourbon, orange, cranberry and brown-sugar-cinnamon syrup with lemon and a dash of Angostura, lengthened with ginger beer. Mix the base at home and pour it into a drink dispenser when you get there.',
    history:
      'A house punch for carrying to someone else’s Thanksgiving: one bottle of bourbon, juice from the store, and the cinnamon syrup already in the fridge.',
    origin: 'House',
    whyItWorks:
      'Orange and cranberry make the sour, the cinnamon syrup the sweet and the spice, and ginger beer gives it the length and bite of a punch without a second bottle.',
    classifications: ['house', 'punch', 'batch'],
    cocktailFamily: 'Punch',
    flavorProfiles: ['fruity', 'spiced', 'oaky'],
    preparationTime: 8,
    strength: 'light',
    glassware: 'Rocks glass',
    ice: 'Large block in the dispenser; cubes in the glass',
    garnish: ['Orange wheel'],
    ingredients: [
      ing('bourbon', 1.5),
      ing('orange_juice', 1, 'oz', { label: 'Fresh orange juice' }),
      ing('cranberry_juice', 1),
      ing('brown_sugar_cinnamon_syrup', 0.5),
      ing('lemon_juice', 0.5),
      ing('angostura_bitters', 1, 'dash', { scaleMode: 'linear' }),
      ing('ginger_beer', 2),
      garnish('orange', 'Orange wheel'),
    ],
    steps: [
      'Scale to the guest count. At home, stir the bourbon, juices, syrup and bitters together in a jug or bottles and chill overnight.',
      'On site, pour the base into a glass drink dispenser over a block of ice and add the ginger beer.',
      'Float orange wheels, and pour over cubes in each glass.',
    ],
    techniqueNotes: [
      'For 12: 18 oz bourbon (most of a 750 ml), 12 oz each orange and cranberry, 6 oz each syrup and lemon, 12 dashes Angostura; two 12 oz cans of ginger beer on site.',
      'Freeze a loaf pan of water the day before for the block; it melts far slower than cubes.',
    ],
    recommendedBottles: [
      rec('kirkland-bourbon', 1, 'A good mixing bourbon for a crowd.'),
      rec('brown-sugar-cinnamon-syrup', 2, 'The spice.'),
      rec('angostura-aromatic', 3, 'The clove.'),
    ],
    relatedCocktailIds: ['harvest-punch', 'cranberry-bourbon-sour', 'whiskey-ginger'],
    tags: ['bourbon', 'cranberry', 'punch', 'batch', 'party', 'house', 'thanksgiving'],
    palette: { name: 'amber-cranberry', hex: '#B4472A' },
    vessel:
      'a large clear glass drink dispenser with a spigot, filled with the amber-red punch, a block of ice and floating orange wheels, with one filled rocks glass beside it',
  }),
  cocktail({
    id: 'cranberry-apple-sparkler',
    name: 'Cranberry Apple Sparkler',
    description:
      'Apple vodka, cranberry, brown-sugar-cinnamon syrup and lemon, topped with prosecco. Bring the base in a pitcher and add the bubbles at the table.',
    history:
      'A house pitcher drink: Koskenkorva Apple and the cinnamon syrup taste like apple pie, cranberry gives it the colour, and prosecco makes it a toast.',
    origin: 'House',
    whyItWorks:
      'Cranberry and lemon keep the apple and cinnamon from going sweet; the prosecco dries it out and lifts it.',
    classifications: ['house', 'sparkling', 'batch'],
    cocktailFamily: 'Sparkling',
    flavorProfiles: ['apple', 'tart', 'sparkling'],
    preparationTime: 6,
    strength: 'light',
    glassware: 'Wine glass',
    ice: 'A few cubes',
    garnish: ['Orange wheel'],
    ingredients: [
      ing('apple_vodka', 1.5),
      ing('cranberry_juice', 1.5),
      ing('brown_sugar_cinnamon_syrup', 0.5),
      ing('lemon_juice', 0.5),
      ing('prosecco', 2),
      garnish('orange', 'Orange wheel'),
    ],
    steps: [
      'Scale to the guest count. At home, stir everything but the prosecco together and chill it in a sealed pitcher or bottle.',
      'At the table, pour the base into a glass pitcher with ice and top with cold prosecco; stir once.',
      'Pour into wine glasses over a few cubes and garnish with an orange wheel.',
    ],
    techniqueNotes: [
      'For 12: 18 oz apple vodka, 18 oz cranberry, 6 oz each syrup and lemon, and one 750 ml bottle of prosecco.',
      'Add the prosecco last and only stir once, or it goes flat in the pitcher.',
    ],
    recommendedBottles: [
      rec('koskenkorva-apple', 1, 'The apple.'),
      rec('brown-sugar-cinnamon-syrup', 2, 'The crust.'),
    ],
    relatedCocktailIds: ['apple-pie-sour', 'champagne-cocktail', 'harvest-punch'],
    tags: ['vodka', 'apple', 'cranberry', 'sparkling', 'batch', 'party', 'house', 'thanksgiving'],
    palette: { name: 'sparkling-cranberry', hex: '#C2304A' },
    vessel:
      'a tall clear glass pitcher of bright sparkling cranberry-red drink with ice cubes and orange wheels, fine bubbles rising, with one filled stemmed wine glass beside it',
  }),
  cocktail({
    id: 'bottled-manhattan',
    name: 'Bottled Manhattan',
    description:
      'A bourbon Manhattan batched with its dilution, bottled and kept in the freezer. Nothing to stir on site: pour it straight into a glass.',
    history:
      'Bartenders have bottled stirred drinks for events for years: the water a stir would add goes in up front, so the drink is right the moment it is poured.',
    origin: 'House batch',
    whyItWorks:
      'At about 28% alcohol it will not freeze, so it pours colder than you could stir it, and adding the water ahead keeps it from tasting hot.',
    classifications: ['house', 'stirred', 'batch'],
    cocktailFamily: 'Manhattan',
    flavorProfiles: ['oaky', 'rich', 'spirit-forward'],
    preparationTime: 10,
    strength: 'strong',
    glassware: 'Coupe',
    ice: 'None; poured from the freezer',
    garnish: ['Cocktail cherry'],
    ingredients: [
      ing('bourbon', 2),
      ing('sweet_vermouth', 1),
      ing('angostura_bitters', 2, 'dash', { scaleMode: 'linear' }),
      garnish('cocktail_cherry', 'Cocktail cherry'),
    ],
    steps: [
      'For a 750 ml bottle (8 drinks): funnel in 12 oz bourbon, 6 oz sweet vermouth, 1 tsp Angostura and 5 oz cold filtered water. Cap and shake.',
      'Freeze overnight; it will not set. Carry it in a cooler bag.',
      'Pour about 3 oz into a coupe and drop in a cherry.',
    ],
    techniqueNotes: [
      'The water is the dilution a stir with ice would add. Leave it out and the drink tastes hot and syrupy.',
      'Rinse an empty 750 ml bottle for it, or use a swing-top; label it.',
    ],
    recommendedBottles: [
      rec('kirkland-bourbon', 1, 'Plenty of backbone for the vermouth.'),
      rec('sweet-vermouth', 2, 'Fresh vermouth matters; it is a third of the drink.'),
      rec('angostura-aromatic', 3, 'The bitters.'),
    ],
    relatedCocktailIds: ['bourbon-sweet-manhattan', 'manhattan', 'brown-sugar-cinnamon-old-fashioned'],
    tags: ['bourbon', 'manhattan', 'stirred', 'batch', 'party', 'house', 'thanksgiving'],
    palette: { name: 'deep-mahogany', hex: '#6B2A14' },
    vessel:
      'a frosted clear glass swing-top bottle of deep mahogany Manhattan, cold condensation on the glass, beside one coupe of the drink with a dark cherry',
  }),
]

const set = {
  id: 'thanksgiving-to-go',
  name: 'Thanksgiving To Go',
  description:
    'A Thanksgiving bar that fits in one bag: four bottles (bourbon, Koskenkorva Apple, sweet vermouth and prosecco), plus Angostura, the brown-sugar-cinnamon and honey syrups, sugar cubes, cranberry, orange, lemon and lime juice, and ginger beer. The first three are batched at home and are the ones to photograph; the rest are made to order from the same bag.',
  drinks: [
    ['gobbler-punch', 'Batch: mix the base at home; ginger beer and ice go in on site.'],
    ['cranberry-apple-sparkler', 'Batch: base in a pitcher; add the prosecco at the table.'],
    ['bottled-manhattan', 'Batch: bottle it the night before and freeze it.'],
    ['cranberry-bourbon-sour', 'Shake to order with the same bourbon.'],
    ['apple-pie-sour', 'Shake to order.'],
    ['brown-sugar-cinnamon-old-fashioned', 'Built in the glass; no shaker needed.'],
    ['champagne-cocktail', 'For the toast, with the prosecco you brought.'],
    ['cranberry-ginger-fizz', 'No alcohol, for drivers and kids.'],
    ['hot-toddy', 'After dinner, if the host has a kettle.'],
  ],
}

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
for (const [id] of set.drinks) if (!allRecipes.has(id)) throw new Error(`${set.id}: unknown drink ${id}`)

// ── Write ───────────────────────────────────────────────────────────────────
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
patchCocktail('harvest-punch', (data) => addRelated(data, ['gobbler-punch']))
patchCocktail('bourbon-sweet-manhattan', (data) => addRelated(data, ['bottled-manhattan']))
patchCocktail('apple-pie-sour', (data) => addRelated(data, ['cranberry-apple-sparkler']))

fs.writeFileSync(
  path.join(setsDir, `${set.id}.json`),
  `${JSON.stringify(
    { ...set, drinks: set.drinks.map(([drinkId, note]) => (note ? { drinkId, note } : { drinkId })) },
    null,
    2,
  )}\n`,
)

// ── Illustration manifest ───────────────────────────────────────────────────
const glassId = (glassware) => {
  const value = glassware.toLowerCase()
  if (value.includes('wine')) return 'wine'
  if (value.includes('coupe')) return 'coupe'
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
      composition: `batch hero: ${recipe.vessel}; three-quarter view, generous safe area, no text, no bottle labels`,
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
manifest.generatedFrom = `${manifest.generatedFrom ?? 'catalog'}; thanksgiving to go 2026`
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Added ${recipes.length} recipes and the ${set.id} set; catalog ${manifest.cocktailCount}.`)
