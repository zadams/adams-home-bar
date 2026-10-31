#!/usr/bin/env node
/**
 * Stock Herbsaint, Fee Brothers Browned Butter fat wash, and Sabadi's Limonata
 * and Aranciata Madre soda syrups; point the absinthe recipes at the Herbsaint,
 * and add the drinks the new bottles unlock.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const bottlesPath = path.join(root, 'src/data/bottles/bottles.json')
const inventoryPath = path.join(root, 'src/data/inventory/seed-inventory.json')
const cocktailsDir = path.join(root, 'src/data/cocktails')
const setsDir = path.join(root, 'src/data/sets')
const manifestPath = path.join(root, 'src/data/illustrations/illustration-manifest.json')

const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'))
const bottles = JSON.parse(fs.readFileSync(bottlesPath, 'utf8'))
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))

const PURCHASED = '2026-10-31'

const ingredientAdditions = [
  {
    id: 'browned_butter_fat_wash',
    name: 'Browned butter fat wash',
    category: 'bitter',
    subcategory: 'savory',
    aliases: ['Fee Brothers Browned Butter', 'brown butter fat wash'],
    tags: ['savory', 'butter', 'nutty'],
  },
  {
    id: 'lemon_soda_syrup',
    name: 'Sicilian lemon soda syrup',
    category: 'syrup',
    subcategory: 'citrus',
    aliases: ['Limonata Madre', 'Sabadi Limonata Madre', 'lemon soda syrup'],
    tags: ['lemon', 'citrus', 'sweet'],
  },
  {
    id: 'orange_soda_syrup',
    name: 'Sicilian orange soda syrup',
    category: 'syrup',
    subcategory: 'citrus',
    aliases: ['Aranciata Madre', 'Sabadi Aranciata Madre', 'orange soda syrup'],
    tags: ['orange', 'citrus', 'sweet'],
  },
]

const ingredientIds = new Set(ingredients.map((item) => item.id))
for (const item of ingredientAdditions) {
  if (ingredientIds.has(item.id)) continue
  ingredients.push(item)
  ingredientIds.add(item.id)
}

const bottleAdditions = [
  {
    id: 'herbsaint',
    brand: 'Herbsaint',
    productName: 'Original',
    ingredientIds: ['absinthe'],
    category: 'spirit',
    subcategory: 'anise',
    tags: ['anise', 'new-orleans'],
    notes: 'New Orleans anise liqueur, 100 proof. The traditional Sazerac rinse; covers absinthe in any recipe.',
  },
  {
    id: 'fee-brothers-browned-butter',
    brand: 'Fee Brothers',
    productName: 'Browned Butter Fat Wash',
    ingredientIds: ['browned_butter_fat_wash'],
    category: 'bitter',
    subcategory: 'savory',
    tags: ['savory', 'butter'],
    notes: 'Water-soluble, used by the dash. Nutty and buttery with a butterscotch finish; no actual dairy.',
  },
  {
    id: 'sabadi-limonata-madre',
    brand: 'Sabadi',
    productName: 'Limonata Madre',
    ingredientIds: ['lemon_soda_syrup'],
    category: 'syrup',
    subcategory: 'citrus',
    tags: ['lemon', 'organic', 'sicilian'],
    notes: 'Organic Sicilian lemon syrup for making limonata with sparkling water.',
  },
  {
    id: 'sabadi-aranciata-madre',
    brand: 'Sabadi',
    productName: 'Aranciata Madre',
    ingredientIds: ['orange_soda_syrup'],
    category: 'syrup',
    subcategory: 'citrus',
    tags: ['orange', 'organic', 'sicilian'],
    notes: 'Organic Sicilian orange syrup for making aranciata with sparkling water.',
  },
]

const bottleIds = new Set(bottles.map((item) => item.id))
for (const bottle of bottleAdditions) {
  if (bottleIds.has(bottle.id)) continue
  bottles.push(bottle)
  bottleIds.add(bottle.id)
}

// The Herbsaint replaces the "not stocked" placeholder.
const inventoryAfter = inventory.filter((item) => item.id !== 'inv-absinthe')
const inventoryIds = new Set(inventoryAfter.map((item) => item.id))
for (const bottle of bottleAdditions) {
  const id = `inv-${bottle.id}`
  if (inventoryIds.has(id)) continue
  inventoryAfter.push({
    id,
    bottleId: bottle.id,
    status: 'in_stock',
    brand: bottle.brand,
    productName: bottle.productName,
    preferredForMixing: true,
    purchaseDate: PURCHASED,
    tags: bottle.tags,
    notes: `Purchased ${PURCHASED}.`,
  })
  inventoryIds.add(id)
}


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
  if (spec.year) record.year = spec.year
  if (spec.creator) record.creator = spec.creator
  if (spec.kind) record.kind = spec.kind
  Object.defineProperty(record, 'palette', { value: spec.palette, enumerable: false })
  return record
}

const recipes = [
  cocktail({
    id: 'brown-butter-old-fashioned',
    name: 'Brown Butter Old Fashioned',
    description:
      'Wheated bourbon, demerara and Angostura with four dashes of browned-butter fat wash. An Old Fashioned that tastes like the top of a pecan pie.',
    history:
      'Fat-washing — infusing a spirit with butter or bacon fat, freezing and straining — has been a bar technique since the PDT Benton’s Old Fashioned in 2007. Fee Brothers’ 2026 water-soluble fat washes get the flavor in by the dash. A house build.',
    origin: 'House',
    whyItWorks:
      'Butter flavor rounds the bourbon’s edges and draws out its caramel; a wheated bourbon is already soft, so the two meet in the middle. Demerara adds molasses depth that white sugar wouldn’t.',
    classifications: ['house', 'spirit-forward'],
    cocktailFamily: 'Old Fashioned',
    flavorProfiles: ['buttery', 'nutty', 'oaky'],
    strength: 'strong',
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Orange peel'],
    ingredients: [
      ing('bourbon', 2),
      ing('demerara_sugar', 1, 'tsp'),
      ing('browned_butter_fat_wash', 4, 'dashes'),
      ing('angostura_bitters', 2, 'dashes'),
      garnish('orange', 'Orange peel'),
    ],
    steps: [
      'Stir the demerara with a barspoon of water in a mixing glass until dissolved.',
      'Add bourbon, fat wash and bitters, fill with ice and stir until cold.',
      'Strain over a large cube and express an orange peel over the top.',
    ],
    techniqueNotes: ['Start at three dashes of fat wash; four is rich, five tips into butterscotch.'],
    recommendedBottles: [
      rec('old-fitzgerald-bib-7', 1, 'Wheated and 100 proof: soft enough to meet the butter, strong enough not to vanish.'),
      rec('fee-brothers-browned-butter', 2, 'The fat wash.'),
      rec('angostura-aromatic', 3, 'Spice.'),
    ],
    relatedCocktailIds: ['old-fashioned', 'brown-sugar-cinnamon-old-fashioned', 'brown-butter-rum-old-fashioned'],
    seasonality: ['autumn', 'winter'],
    tags: ['bourbon', 'old-fashioned', 'fat-wash', 'butter', 'house', 'thanksgiving'],
    palette: { name: 'brown-butter-amber', hex: '#A8642A' },
  }),
  cocktail({
    id: 'brown-butter-rum-old-fashioned',
    name: 'Brown Butter Rum Old Fashioned',
    description:
      'Aged Cuban rum, demerara, orange bitters and browned-butter fat wash over a big cube. Butterscotch and banana bread.',
    history: 'A house build: the Brown Butter Old Fashioned with aged rum in place of bourbon.',
    origin: 'House',
    whyItWorks:
      'Aged rum’s vanilla and dried fruit pair with brown butter the way a bananas Foster does; orange bitters keep it from getting heavy.',
    classifications: ['house', 'spirit-forward'],
    cocktailFamily: 'Old Fashioned',
    flavorProfiles: ['buttery', 'vanilla', 'rich'],
    strength: 'strong',
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Orange peel'],
    ingredients: [
      ing('gold_rum', 2),
      ing('demerara_sugar', 1, 'tsp'),
      ing('browned_butter_fat_wash', 3, 'dashes'),
      ing('orange_bitters', 1, 'dash'),
      ing('angostura_bitters', 1, 'dash'),
      garnish('orange', 'Orange peel'),
    ],
    steps: [
      'Stir the demerara with a barspoon of water in a mixing glass until dissolved.',
      'Add rum, fat wash and both bitters, fill with ice and stir until cold.',
      'Strain over a large cube and express an orange peel over the top.',
    ],
    recommendedBottles: [
      rec('havana-club-maestros', 1, 'The most aged of the Havana Clubs.'),
      rec('fee-brothers-browned-butter', 2, 'The fat wash.'),
      rec('fee-brothers-orange', 3, 'Orange bitters.'),
    ],
    relatedCocktailIds: ['brown-butter-old-fashioned', 'hot-buttered-rum'],
    seasonality: ['autumn', 'winter'],
    tags: ['rum', 'old-fashioned', 'fat-wash', 'butter', 'house'],
    palette: { name: 'butterscotch-gold', hex: '#B87A33' },
  }),
  cocktail({
    id: 'herbsaint-frappe',
    name: 'Herbsaint Frappé',
    aliases: ['Absinthe Frappé'],
    description:
      'Herbsaint, a little syrup and a splash of soda over crushed ice, stirred until the glass frosts. A New Orleans cooler that louches cloudy as it dilutes.',
    history:
      'The Absinthe Frappé is credited to Cayetano Ferrer at the Old Absinthe House on Bourbon Street in 1874. After absinthe was banned in 1912, New Orleans made it with Herbsaint, which was created in the city for exactly that job.',
    origin: 'New Orleans',
    year: 1874,
    creator: 'Cayetano Ferrer',
    whyItWorks:
      'Crushed ice dilutes the 100-proof anise fast and turns it milky; the syrup softens the licorice and a dash of Peychaud’s adds a New Orleans signature.',
    classifications: ['classic', 'cooler'],
    cocktailFamily: 'Frappé',
    flavorProfiles: ['anise', 'herbal', 'refreshing'],
    strength: 'strong',
    glassware: 'Rocks glass',
    ice: 'Crushed ice',
    garnish: [],
    ingredients: [
      ing('absinthe', 1.5, 'oz', { label: 'Herbsaint' }),
      ing('simple_syrup', 0.5),
      ing('club_soda', 1),
      ing('peychauds_bitters', 1, 'dash'),
    ],
    steps: [
      'Pack a rocks glass with crushed ice.',
      'Add Herbsaint, syrup and bitters and swizzle or stir until the glass frosts.',
      'Top with soda and more crushed ice.',
    ],
    techniqueNotes: ['Traditionally garnished with mint; add a sprig if you have it.'],
    recommendedBottles: [
      rec('herbsaint', 1, 'The New Orleans anise.'),
      rec('peychauds', 2, 'The other New Orleans bottle.'),
    ],
    relatedCocktailIds: ['sazerac', 'death-in-the-afternoon'],
    seasonality: ['summer', 'year-round'],
    tags: ['absinthe', 'herbsaint', 'anise', 'new-orleans', 'classic'],
    palette: { name: 'louche-opal', hex: '#D8DCC4' },
  }),
  cocktail({
    id: 'sicilian-collins',
    name: 'Sicilian Collins',
    description:
      'Amalfi lemon gin, fresh lemon and Sicilian lemon soda syrup, lengthened with soda. A Tom Collins that tastes like a trip to Palermo.',
    history: 'A house build: the Collins template, with Sabadi’s lemon syrup doing the sweetening.',
    origin: 'House',
    whyItWorks:
      'The syrup is made from whole Sicilian lemons, so it brings peel and pith as well as sugar; a little fresh juice keeps it sharp.',
    classifications: ['house', 'highball', 'collins'],
    cocktailFamily: 'Collins',
    flavorProfiles: ['lemon', 'botanical', 'refreshing'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lemon wheel'],
    ingredients: [
      ing('gin', 2),
      ing('lemon_juice', 0.5),
      ing('lemon_soda_syrup', 0.75),
      ing('club_soda', 3),
      garnish('lemon', 'Lemon wheel'),
    ],
    steps: [
      'Build gin, lemon and syrup in a highball over ice and stir.',
      'Top with soda, stir once and add a lemon wheel.',
    ],
    recommendedBottles: [
      rec('malfy-originale', 1, 'Italian gin made with Amalfi lemons.'),
      rec('sabadi-limonata-madre', 2, 'The lemon syrup.'),
    ],
    relatedCocktailIds: ['tom-collins', 'limonata'],
    seasonality: ['summer', 'year-round'],
    tags: ['gin', 'lemon', 'collins', 'house'],
    palette: { name: 'limonata-pale', hex: '#F1E7A6' },
  }),
  cocktail({
    id: 'campari-aranciata',
    name: 'Campari Aranciata',
    description:
      'Campari and Sicilian orange soda syrup topped with sparkling water. A homemade Campari and orange soda.',
    history:
      'Campari and orange soda is an Italian bar staple; Sabadi’s syrup makes the aranciata to order.',
    origin: 'Italy',
    whyItWorks: 'Orange is Campari’s natural partner; the syrup is sweet enough to balance the bitterness without juice’s weight.',
    classifications: ['classic', 'highball', 'aperitivo'],
    cocktailFamily: 'Highball',
    flavorProfiles: ['bitter', 'orange', 'refreshing'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Orange slice'],
    ingredients: [
      ing('campari', 1.5),
      ing('orange_soda_syrup', 0.75),
      ing('club_soda', 4),
      garnish('orange', 'Orange slice'),
    ],
    steps: [
      'Build Campari and syrup in a highball over ice and stir.',
      'Top with soda, stir once and add an orange slice.',
    ],
    recommendedBottles: [
      rec('campari', 1, 'The bitter.'),
      rec('sabadi-aranciata-madre', 2, 'The orange syrup.'),
    ],
    relatedCocktailIds: ['campari-soda', 'aranciata', 'americano'],
    seasonality: ['summer', 'year-round'],
    tags: ['campari', 'aperitivo', 'orange', 'low-abv'],
    palette: { name: 'campari-orange', hex: '#D9452B' },
  }),
  cocktail({
    id: 'limonata',
    name: 'Limonata',
    kind: 'mocktail',
    description: 'Sicilian lemon soda syrup and sparkling water over ice. Homemade Italian lemon soda.',
    history: 'Limonata is Italy’s lemon soda. Sabadi’s “Madre” is the concentrate you make it from.',
    origin: 'Sicily',
    whyItWorks: 'Whole-lemon syrup gives peel bitterness as well as juice, so it tastes like lemons rather than lemonade.',
    classifications: ['non-alcoholic', 'highball'],
    cocktailFamily: 'Soda',
    flavorProfiles: ['lemon', 'refreshing', 'sweet'],
    preparationTime: 1,
    strength: 'light',
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lemon wheel'],
    ingredients: [
      ing('lemon_soda_syrup', 1),
      ing('club_soda', 5),
      garnish('lemon', 'Lemon wheel'),
    ],
    steps: ['Pour the syrup over ice, top with sparkling water and stir gently.', 'Add a lemon wheel.'],
    techniqueNotes: ['About one part syrup to five of water; adjust to taste.'],
    recommendedBottles: [rec('sabadi-limonata-madre', 1, 'The syrup.')],
    relatedCocktailIds: ['aranciata', 'sicilian-collins'],
    seasonality: ['summer', 'year-round'],
    tags: ['mocktail', 'non-alcoholic', 'lemon'],
    palette: { name: 'limonata-yellow', hex: '#F3E28A' },
  }),
  cocktail({
    id: 'aranciata',
    name: 'Aranciata',
    kind: 'mocktail',
    description: 'Sicilian orange soda syrup and sparkling water over ice. Homemade Italian orange soda.',
    history: 'Aranciata is Italy’s orange soda. Sabadi’s “Madre” is the concentrate you make it from.',
    origin: 'Sicily',
    whyItWorks: 'Made from Sicilian oranges, so it tastes of peel and juice rather than orange candy.',
    classifications: ['non-alcoholic', 'highball'],
    cocktailFamily: 'Soda',
    flavorProfiles: ['orange', 'refreshing', 'sweet'],
    preparationTime: 1,
    strength: 'light',
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Orange slice'],
    ingredients: [
      ing('orange_soda_syrup', 1),
      ing('club_soda', 5),
      garnish('orange', 'Orange slice'),
    ],
    steps: ['Pour the syrup over ice, top with sparkling water and stir gently.', 'Add an orange slice.'],
    techniqueNotes: ['About one part syrup to five of water; adjust to taste.'],
    recommendedBottles: [rec('sabadi-aranciata-madre', 1, 'The syrup.')],
    relatedCocktailIds: ['limonata', 'campari-aranciata'],
    seasonality: ['summer', 'year-round'],
    tags: ['mocktail', 'non-alcoholic', 'orange'],
    palette: { name: 'aranciata-orange', hex: '#F08A2C' },
  }),
]

// ── Validate ────────────────────────────────────────────────────────────────
const existingRecipes = new Set(fs.readdirSync(cocktailsDir).map((file) => file.replace(/\.json$/, '')))
const allRecipes = new Set([...existingRecipes, ...recipes.map((r) => r.id)])
for (const recipe of recipes) {
  if (existingRecipes.has(recipe.id)) throw new Error(`${recipe.name}: id ${recipe.id} already exists`)
  for (const line of recipe.ingredients) {
    if (!ingredientIds.has(line.ingredientId)) throw new Error(`${recipe.name}: unknown ingredient ${line.ingredientId}`)
  }
  for (const item of recipe.recommendedBottles) {
    if (!bottleIds.has(item.bottleId)) throw new Error(`${recipe.name}: unknown bottle ${item.bottleId}`)
  }
  for (const related of recipe.relatedCocktailIds) {
    if (!allRecipes.has(related)) throw new Error(`${recipe.name}: unknown related drink ${related}`)
  }
}

// ── Write ───────────────────────────────────────────────────────────────────
for (const recipe of recipes) {
  fs.writeFileSync(path.join(cocktailsDir, `${recipe.id}.json`), `${JSON.stringify(recipe, null, 2)}\n`)
}
fs.writeFileSync(ingredientsPath, `${JSON.stringify(ingredients, null, 2)}\n`)
fs.writeFileSync(bottlesPath, `${JSON.stringify(bottles, null, 2)}\n`)
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventoryAfter, null, 2)}\n`)

function patchJson(file, mutate) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  mutate(data)
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}
const patchCocktail = (id, mutate) => patchJson(path.join(cocktailsDir, `${id}.json`), mutate)

/** Insert a recommendation at `rank`, pushing later ranks down. No-op if present. */
function addRec(recipe, bottleId, rank, rationale) {
  if (recipe.recommendedBottles.some((r) => r.bottleId === bottleId)) return
  const at = Math.min(rank, recipe.recommendedBottles.length + 1)
  for (const r of recipe.recommendedBottles) if (r.rank >= at) r.rank += 1
  recipe.recommendedBottles.push(rec(bottleId, at, rationale))
  recipe.recommendedBottles.sort((a, b) => a.rank - b.rank)
}

// Point every absinthe recipe at the Herbsaint.
for (const id of existingRecipes) {
  const file = path.join(cocktailsDir, `${id}.json`)
  const recipe = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!recipe.ingredients.some((line) => line.ingredientId === 'absinthe')) continue
  patchCocktail(id, (data) => addRec(data, 'herbsaint', data.recommendedBottles.length + 1, 'Herbsaint for the absinthe.'))
}
patchCocktail('sazerac', (data) => {
  data.relatedCocktailIds = [...new Set([...(data.relatedCocktailIds ?? []), 'herbsaint-frappe'])]
})
patchCocktail('old-fashioned', (data) => {
  data.relatedCocktailIds = [...new Set([...(data.relatedCocktailIds ?? []), 'brown-butter-old-fashioned'])]
})

// Death in the Afternoon no longer needs a purchase.
patchJson(path.join(setsDir, 'halloween.json'), (set) => {
  set.description = set.description.replace(
    'the last three need one more bottle (cognac and calvados, absinthe, or eggs)',
    'Death in the Afternoon is made with Herbsaint; the last two need cognac and calvados, or eggs',
  )
  const entry = set.drinks.find((d) => d.drinkId === 'death-in-the-afternoon')
  if (entry) entry.note = 'Herbsaint stands in for absinthe.'
})
// The Brown Butter Old Fashioned belongs on the Thanksgiving table.
patchJson(path.join(setsDir, 'thanksgiving.json'), (set) => {
  if (set.drinks.some((d) => d.drinkId === 'brown-butter-old-fashioned')) return
  const at = set.drinks.findIndex((d) => d.drinkId === 'brown-sugar-cinnamon-old-fashioned')
  set.drinks.splice(at + 1, 0, {
    drinkId: 'brown-butter-old-fashioned',
    note: 'Old Fitzgerald and the Fee Brothers fat wash.',
  })
})

// ── Illustration manifest ───────────────────────────────────────────────────
const glassId = (glassware) => {
  const value = glassware.toLowerCase()
  if (value.includes('coupe')) return 'coupe'
  if (value.includes('highball')) return 'highball'
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
      composition: 'single centered hero cocktail, three-quarter view, generous safe area, no text, no bottle labels',
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
manifest.generatedFrom = `${manifest.generatedFrom ?? 'catalog'}; 2026-10-31 bottle additions`
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Stocked ${bottleAdditions.length} bottles, added ${ingredientAdditions.length} ingredients and ${recipes.length} recipes; catalog ${manifest.cocktailCount}.`)
