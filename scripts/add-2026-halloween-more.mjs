#!/usr/bin/env node
/**
 * Halloween 2026, round two: dry red wine goes into the inventory, and six more
 * drinks join the Halloween set — Jack-o'-Lantern, Frankenstein, Black Cat,
 * Hocus Pocus Spritz, Witch's Cauldron Punch and Devil's Margarita.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const bottlesPath = path.join(root, 'src/data/bottles/bottles.json')
const inventoryPath = path.join(root, 'src/data/inventory/seed-inventory.json')
const cocktailsDir = path.join(root, 'src/data/cocktails')
const setPath = path.join(root, 'src/data/sets/halloween.json')
const manifestPath = path.join(root, 'src/data/illustrations/illustration-manifest.json')

const knownIngredients = new Set(JSON.parse(fs.readFileSync(ingredientsPath, 'utf8')).map((item) => item.id))
const knownBottles = new Set(JSON.parse(fs.readFileSync(bottlesPath, 'utf8')).map((item) => item.id))
const existingRecipes = new Set(fs.readdirSync(cocktailsDir).map((file) => file.replace(/\.json$/, '')))

// ── Inventory: dry red wine ───────────────────────────────────────────────
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))
if (!inventory.some((item) => item.ingredientId === 'red_wine')) {
  inventory.push({
    id: 'inv-red_wine',
    ingredientId: 'red_wine',
    status: 'in_stock',
    productName: 'Dry red wine',
    tags: ['wine', 'pantry'],
    notes: 'Plenty on hand. Unlocks the New York Sour and the Devil’s Margarita.',
  })
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
  Object.defineProperty(record, 'palette', { value: spec.palette, enumerable: false })
  return record
}

const recipes = [
  cocktail({
    id: 'jack-o-lantern',
    name: 'Jack-o’-Lantern',
    description:
      'Bourbon, Grand Marnier and orange juice over ice, topped with ginger beer. Pumpkin-orange, with an orange wheel for the face.',
    history:
      'The older Jack-o’-Lantern is a cognac drink with orange liqueur, orange juice and ginger ale. This house version uses bourbon, since the cognac shelf is empty, and ginger beer for more bite.',
    origin: 'House',
    whyItWorks:
      'Grand Marnier and orange juice make it taste like orange, bourbon gives it a warm spine, and ginger beer keeps it from being heavy.',
    classifications: ['highball', 'variation'],
    cocktailFamily: 'Buck',
    flavorProfiles: ['orange', 'ginger', 'oak'],
    preparationTime: 3,
    glassware: 'Rocks glass',
    ice: 'Cubed ice',
    garnish: ['Orange wheel'],
    ingredients: [
      ing('bourbon', 1.5),
      ing('grand_marnier', 0.5),
      ing('orange_juice', 1, 'oz', { label: 'Fresh orange juice' }),
      ing('ginger_beer', 2, 'oz', { label: 'Ginger beer, to top' }),
      garnish('orange', 'Orange wheel'),
    ],
    steps: [
      'Shake bourbon, Grand Marnier and orange juice briefly with ice.',
      'Strain into a rocks glass over fresh ice and top with ginger beer.',
      'Cut a jack-o’-lantern face into the orange wheel if you are feeling it, and float it on top.',
    ],
    techniqueNotes: ['With cognac on the shelf, swap it in for the older version, and use ginger ale for a softer drink.'],
    recommendedBottles: [
      rec('kirkland-bourbon', 1, 'A mixing bourbon; the orange covers the rest.'),
      rec('grand-marnier', 2, 'Orange liqueur.'),
    ],
    substitutions: [
      { ingredientId: 'bourbon', alternatives: ['cognac'], notes: 'Cognac is the older spec.' },
    ],
    relatedCocktailIds: ['satans-whiskers', 'whiskey-sour', 'moscow-mule'],
    tags: ['bourbon', 'orange', 'ginger', 'highball', 'house', 'halloween'],
    palette: { name: 'pumpkin-orange', hex: '#E07B24' },
  }),
  cocktail({
    id: 'frankenstein',
    name: 'Frankenstein',
    description:
      'Gin, Green Chartreuse and lime shaken and lengthened with ginger beer. A monster-green highball.',
    history: 'A house Halloween highball: a Last Word turned into a buck.',
    origin: 'House',
    whyItWorks:
      'A half ounce of Green Chartreuse is enough to color it and fill it with herbs; lime and ginger beer keep it crisp.',
    classifications: ['highball', 'buck'],
    cocktailFamily: 'Buck',
    flavorProfiles: ['herbal', 'ginger', 'citrus'],
    preparationTime: 3,
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lime wheel'],
    ingredients: [
      ing('gin', 1.5),
      ing('green_chartreuse', 0.5),
      ing('lime_juice', 0.75),
      ing('simple_syrup', 0.5),
      ing('ginger_beer', 2, 'oz', { label: 'Ginger beer, to top' }),
      garnish('lime', 'Lime wheel'),
    ],
    steps: [
      'Shake gin, Chartreuse, lime and simple syrup with ice.',
      'Strain into a highball over fresh ice and top with ginger beer.',
      'Garnish with a lime wheel.',
    ],
    recommendedBottles: [
      rec('drumshanbo-gunpowder', 1, 'Green-tea gin that matches the color and the herbs.'),
      rec('green-chartreuse', 2, 'The green.'),
    ],
    relatedCocktailIds: ['last-word', 'chartreuse-tonic', 'gin-gin-mule', 'swamp-water'],
    tags: ['gin', 'chartreuse', 'ginger', 'highball', 'house', 'halloween'],
    palette: { name: 'monster-green', hex: '#6E9F3A' },
  }),
  cocktail({
    id: 'black-cat',
    name: 'Black Cat',
    description: 'Kraken, Kahlúa and cola over ice with a squeeze of lime. Jet black and easy to make for a crowd.',
    history: 'A house Halloween highball: a Cuba Libre that crossed paths with a Black Russian.',
    origin: 'House',
    whyItWorks:
      'Black spiced rum and coffee liqueur are both dark and vanilla-sweet; cola carries them, and the lime keeps it from tasting like a soda fountain.',
    classifications: ['highball'],
    cocktailFamily: 'Highball',
    flavorProfiles: ['coffee', 'spiced', 'cola'],
    preparationTime: 1,
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lime wedge'],
    ingredients: [
      ing('spiced_rum', 1.5, 'oz', { label: 'Black spiced rum' }),
      ing('coffee_liqueur', 0.5),
      ing('cola', 4),
      ing('lime', 1, 'piece', { label: 'Lime wedge, squeezed', scaleMode: 'linear' }),
    ],
    steps: [
      'Build rum and Kahlúa over ice in a highball.',
      'Top with cola, squeeze in the lime wedge and stir once.',
    ],
    recommendedBottles: [
      rec('kraken-spiced', 1, 'The black rum.'),
      rec('kahlua', 2, 'Coffee liqueur.'),
    ],
    relatedCocktailIds: ['cuba-libre', 'black-russian', 'graveyard-old-fashioned'],
    tags: ['rum', 'spiced-rum', 'coffee', 'highball', 'house', 'halloween'],
    palette: { name: 'cat-black', hex: '#1E120C' },
  }),
  cocktail({
    id: 'hocus-pocus-spritz',
    name: 'Hocus Pocus Spritz',
    description:
      'An Aperol Spritz with a splash of cranberry and cherry liqueur sunk to the bottom. Orange on top, blood-red underneath.',
    history: 'A house Halloween spritz.',
    origin: 'House',
    whyItWorks:
      'The spritz ratio stays the same, so it is still light and bitter; cranberry adds tartness, and the dense cherry liqueur settles at the bottom.',
    classifications: ['spritz', 'sparkling', 'aperitivo'],
    cocktailFamily: 'Spritz',
    flavorProfiles: ['bitter', 'orange', 'cherry'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Wine glass',
    ice: 'Cubed ice',
    garnish: ['Orange slice'],
    ingredients: [
      ing('aperol', 2),
      ing('prosecco', 3),
      ing('club_soda', 1),
      ing('cranberry_juice', 0.5),
      ing('cherry_liqueur', 0.25),
      garnish('orange', 'Orange slice'),
    ],
    steps: [
      'Fill a wine glass with ice and add Aperol, prosecco, soda and cranberry. Stir once.',
      'Pour the cherry liqueur down the inside of the glass so it sinks.',
      'Garnish with an orange slice.',
    ],
    recommendedBottles: [
      rec('aperol', 1, 'The base.'),
      rec('bozkov-griotte', 2, 'For the red at the bottom.'),
    ],
    relatedCocktailIds: ['aperol-spritz', 'vampires-kiss', 'hugo'],
    tags: ['aperol', 'spritz', 'sparkling', 'low-abv', 'house', 'halloween'],
    palette: { name: 'hocus-orange', hex: '#E8562A' },
  }),
  cocktail({
    id: 'witchs-cauldron-punch',
    name: 'Witch’s Cauldron Punch',
    description:
      'Dark and gold rum with pineapple, orange, lime, grenadine and falernum, topped with ginger beer. Written per glass; multiply by ten for a punch bowl.',
    history: 'A house Halloween party punch, built like a Planter’s Punch.',
    origin: 'House',
    whyItWorks:
      'Two rums give it depth, pineapple and orange make it easy to drink, and falernum adds clove and lime so it tastes like more than fruit juice. Ginger beer goes in last to keep it fizzy.',
    classifications: ['punch', 'tiki'],
    cocktailFamily: 'Punch',
    flavorProfiles: ['tropical', 'spiced', 'citrus'],
    preparationTime: 5,
    glassware: 'Punch cup or rocks glass',
    ice: 'Large block in the bowl; cubes in the glass',
    garnish: ['Orange wheels and lime wheels floating in the bowl'],
    ingredients: [
      ing('dark_rum', 1),
      ing('gold_rum', 1),
      ing('pineapple_juice', 1.5),
      ing('orange_juice', 1),
      ing('lime_juice', 0.5),
      ing('grenadine', 0.25),
      ing('falernum', 0.25),
      ing('ginger_beer', 2, 'oz', { label: 'Ginger beer, added at serving' }),
      garnish('orange', 'Orange wheels'),
    ],
    steps: [
      'For a bowl, scale to ten servings and stir everything except the ginger beer in a punch bowl or pot.',
      'Chill for an hour. Add a large block of ice and the ginger beer just before guests arrive.',
      'Float citrus wheels on top and ladle into cups over fresh ice.',
    ],
    techniqueNotes: [
      'Ten servings is about 15 oz of rum and 7.5 cups total before ice.',
      'For fog, set a chunk of dry ice in a smaller bowl nested inside the punch bowl, or in the bowl itself, using tongs and gloves. Never put dry ice in a glass, and wait until it has fully dissolved before ladling from a bowl it was dropped into.',
    ],
    recommendedBottles: [
      rec('myers-dark-rum', 1, 'The dark rum.'),
      rec('havana-club-especial', 2, 'Gold rum.'),
      rec('bitter-truth-falernum', 3, 'Falernum.'),
    ],
    relatedCocktailIds: ['planters-punch', 'rum-punch', 'zombie-house', 'jungle-bird'],
    tags: ['rum', 'punch', 'batch', 'party', 'tiki', 'house', 'halloween'],
    palette: { name: 'cauldron-red', hex: '#C2452D' },
  }),
  cocktail({
    id: 'devils-margarita',
    name: 'Devil’s Margarita',
    description:
      'A tequila sour served up with a float of dry red wine, which sits on top like a layer of blood.',
    history:
      'A modern bar riff that borrows the red wine float from the New York Sour and puts it on a margarita.',
    origin: 'United States',
    whyItWorks:
      'Lime and tequila make a sharp sour; the dry red wine adds tannin and dark fruit and sits on top, so the first sips taste different from the last.',
    classifications: ['modern', 'sour'],
    cocktailFamily: 'Margarita',
    flavorProfiles: ['agave', 'citrus', 'red-wine'],
    preparationTime: 4,
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Lime wheel'],
    ingredients: [
      ing('blanco_tequila', 1.5),
      ing('lime_juice', 1),
      ing('simple_syrup', 0.75),
      ing('red_wine', 0.5, 'oz', { label: 'Dry red wine, for the float' }),
    ],
    steps: [
      'Shake tequila, lime and simple syrup hard with ice.',
      'Strain into a chilled coupe.',
      'Pour the red wine slowly over the back of a bar spoon so it floats on top.',
    ],
    techniqueNotes: ['A fruity, medium-bodied red (Malbec, Zinfandel, Syrah) floats and tastes better than a light one.'],
    recommendedBottles: [rec('kirkland-tequila-other', 1, 'The blanco tequila in stock.')],
    relatedCocktailIds: ['new-york-sour', 'margarita', 'el-diablo'],
    tags: ['tequila', 'red-wine', 'sour', 'margarita', 'halloween'],
    palette: { name: 'devil-red', hex: '#7A1424' },
  }),
]

// The Halloween set: new drinks go after the eight from round one, before the
// classics already in the book.
const setAdditions = [
  ['jack-o-lantern', 'Cut a face in the orange wheel.'],
  ['frankenstein', 'Gunpowder gin and Green Chartreuse.'],
  ['black-cat', 'Kraken, Kahlúa and cola; good for a crowd.'],
  ['hocus-pocus-spritz', 'Low-alcohol. Sink the Griotte last.'],
  ['devils-margarita', 'Float the red wine over a spoon.'],
  ['witchs-cauldron-punch', 'Party bowl: scale to ten. Dry ice in the bowl only, never in a glass.'],
]

// ── Validate ──────────────────────────────────────────────────────────────
const allRecipes = new Set([...existingRecipes, ...recipes.map((r) => r.id)])
for (const recipe of recipes) {
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

// ── Write ─────────────────────────────────────────────────────────────────
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`)
for (const recipe of recipes) {
  fs.writeFileSync(path.join(cocktailsDir, `${recipe.id}.json`), `${JSON.stringify(recipe, null, 2)}\n`)
}

function patchCocktail(id, extras) {
  const file = path.join(cocktailsDir, `${id}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  data.relatedCocktailIds = [...new Set([...(data.relatedCocktailIds ?? []), ...extras])]
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}
patchCocktail('new-york-sour', ['devils-margarita'])
patchCocktail('aperol-spritz', ['hocus-pocus-spritz'])
patchCocktail('cuba-libre', ['black-cat'])
patchCocktail('last-word', ['frankenstein'])
patchCocktail('planters-punch', ['witchs-cauldron-punch'])

const set = JSON.parse(fs.readFileSync(setPath, 'utf8'))
const inSet = new Set(set.drinks.map((entry) => entry.drinkId))
const insertAt = set.drinks.findIndex((entry) => entry.drinkId === 'zombie-house')
const fresh = setAdditions
  .filter(([id]) => !inSet.has(id))
  .map(([drinkId, note]) => ({ drinkId, note }))
set.drinks.splice(insertAt === -1 ? set.drinks.length : insertAt, 0, ...fresh)
set.description =
  'Spooky drinks for the 31st. The first fourteen are ready from the bar (the punch scales to a party bowl); the next five are classics with a Halloween name; the last three need one more bottle (cognac and calvados, absinthe, or eggs).'
fs.writeFileSync(setPath, `${JSON.stringify(set, null, 2)}\n`)

// ── Illustration manifest ─────────────────────────────────────────────────
const glassId = (glassware) => {
  const value = glassware.toLowerCase()
  if (value.includes('coupe')) return 'coupe'
  if (value.includes('wine')) return 'wine'
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
manifest.generatedFrom = `${manifest.generatedFrom ?? 'catalog'}; halloween 2026 round two`
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Added red wine to inventory and ${recipes.length} recipes; Halloween set now ${set.drinks.length}; catalog ${manifest.cocktailCount}.`)
