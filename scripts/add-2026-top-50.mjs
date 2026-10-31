#!/usr/bin/env node
/**
 * Add the World's Top 50 set — Drinks International's 2026 list of the
 * bestselling classic cocktails at the world's best bars — and the four drinks
 * on it the catalog was missing: Pornstar Martini, Milano-Torino, Bramble and
 * East 8 Hold-Up.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const cocktailsDir = path.join(root, 'src/data/cocktails')
const setsDir = path.join(root, 'src/data/sets')
const manifestPath = path.join(root, 'src/data/illustrations/illustration-manifest.json')

const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'))

if (!ingredients.some((item) => item.id === 'creme_de_mure')) {
  ingredients.push({
    id: 'creme_de_mure',
    name: 'Crème de mûre',
    category: 'liqueur',
    subcategory: 'fruit liqueur',
    aliases: ['blackberry liqueur', 'crème de mûre'],
    tags: ['blackberry', 'berry', 'sweet'],
  })
}

const ing = (ingredientId, amount, unit = 'oz', extra = {}) => ({
  ingredientId,
  amount,
  unit,
  scaleMode: extra.scaleMode ?? 'linear',
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
    seasonality: spec.seasonality ?? ['year-round'],
    tags: spec.tags,
  }
  if (spec.creator) record.creator = spec.creator
  Object.defineProperty(record, 'palette', { value: spec.palette, enumerable: false })
  return record
}

const recipes = [
  cocktail({
    id: 'pornstar-martini',
    name: 'Pornstar Martini',
    aliases: ['Maverick Martini'],
    description:
      'Vanilla vodka, passion fruit and lime shaken and served up, with a chilled shot of sparkling wine on the side.',
    history:
      'Douglas Ankrah created it at the Townhouse bar in London in the early 2000s, first calling it the Maverick Martini. It became the UK’s most-ordered cocktail for years.',
    origin: 'London',
    creator: 'Douglas Ankrah',
    whyItWorks:
      'Passion fruit is sharp and perfumed; vanilla rounds it off and vodka stays out of the way. The sparkling wine is a palate cleanser between sips, not a topper.',
    classifications: ['modern-classic', 'sour'],
    cocktailFamily: 'Martini',
    flavorProfiles: ['tropical', 'citrus', 'sweet'],
    preparationTime: 4,
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Half a passion fruit', 'Shot of sparkling wine on the side'],
    ingredients: [
      ing('vodka', 1.5, 'oz', { label: 'Vanilla vodka (or vodka)' }),
      ing('passion_fruit_syrup', 1, 'oz', { label: 'Passion fruit purée or syrup' }),
      ing('lime_juice', 0.5),
      ing('simple_syrup', 0.25, 'oz', { label: 'Vanilla syrup (or simple)' }),
      ing('prosecco', 2, 'oz', { label: 'Sparkling wine, on the side', optional: true }),
    ],
    steps: [
      'Shake vodka, passion fruit, lime and syrup hard with ice.',
      'Fine-strain into a chilled coupe and float half a passion fruit.',
      'Serve a shot glass of cold prosecco alongside.',
    ],
    techniqueNotes: [
      'Ankrah’s spec adds 0.5 oz Passoã passion fruit liqueur. Without it, use a little more purée.',
      'No vanilla vodka on the shelf: a drop of vanilla extract in the simple syrup does the job.',
    ],
    recommendedBottles: [rec('titos', 1, 'Clean base for the fruit.')],
    relatedCocktailIds: ['espresso-martini', 'french-75', 'east-8-hold-up'],
    tags: ['vodka', 'passion-fruit', 'modern-classic', 'popular', 'worlds-top-50'],
    palette: { name: 'passion-fruit-gold', hex: '#E9B649' },
  }),
  cocktail({
    id: 'milano-torino',
    name: 'Milano-Torino',
    aliases: ['Mi-To'],
    description: 'Campari and sweet vermouth over ice with an orange slice. The Americano before the soda.',
    history:
      'Served by Gaspare Campari at his Caffè Camparino in Milan in the mid-19th century. The name pairs Campari from Milan with vermouth from Turin. Add soda and it becomes the Americano; add gin and it becomes the Negroni.',
    origin: 'Milan',
    creator: 'Gaspare Campari',
    whyItWorks:
      'Equal parts bitter and sweet, so neither wins. It is the base of the whole Negroni family.',
    classifications: ['classic', 'aperitivo'],
    cocktailFamily: 'Negroni',
    flavorProfiles: ['bitter', 'orange', 'herbal'],
    preparationTime: 1,
    strength: 'light',
    glassware: 'Rocks glass',
    ice: 'Cubed ice',
    garnish: ['Orange slice'],
    ingredients: [
      ing('campari', 1.5),
      ing('sweet_vermouth', 1.5),
      garnish('orange', 'Orange slice'),
    ],
    steps: [
      'Build Campari and sweet vermouth over ice in a rocks glass.',
      'Stir briefly and add an orange slice.',
    ],
    techniqueNotes: ['Fresh vermouth matters more here than in a Negroni; there is nothing else to hide behind.'],
    recommendedBottles: [
      rec('campari', 1, 'Milano.'),
      rec('sweet-vermouth', 2, 'Torino.'),
    ],
    relatedCocktailIds: ['americano', 'negroni', 'negroni-sbagliato'],
    tags: ['campari', 'aperitivo', 'classic', 'low-abv', 'worlds-top-50'],
    palette: { name: 'campari-red', hex: '#A8262C' },
  }),
  cocktail({
    id: 'bramble',
    name: 'Bramble',
    description:
      'Gin, lemon and sugar over crushed ice, with blackberry liqueur drizzled through the top.',
    history:
      'Dick Bradsell created it at Fred’s Club in London in the 1980s, thinking of blackberry-picking on the Isle of Wight. It is one of the few modern British classics.',
    origin: 'London',
    creator: 'Dick Bradsell',
    whyItWorks:
      'A plain gin sour made fruity at the last moment. The liqueur bleeds down through the ice, so the drink gets sweeter and darker as you go.',
    classifications: ['modern-classic', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['berry', 'citrus', 'botanical'],
    preparationTime: 4,
    glassware: 'Rocks glass',
    ice: 'Crushed ice',
    garnish: ['Lemon slice', 'Blackberry'],
    ingredients: [
      ing('gin', 2),
      ing('lemon_juice', 1),
      ing('simple_syrup', 0.5),
      ing('creme_de_mure', 0.5),
      garnish('lemon', 'Lemon slice'),
    ],
    steps: [
      'Shake gin, lemon and simple syrup with ice.',
      'Strain into a rocks glass packed with crushed ice.',
      'Drizzle the crème de mûre over the top so it bleeds down.',
      'Garnish with a lemon slice and a blackberry.',
    ],
    techniqueNotes: ['Crème de cassis is the common stand-in if you can’t find crème de mûre.'],
    recommendedBottles: [rec('drumshanbo-gunpowder', 1, 'Bright, citrus-forward gin.')],
    relatedCocktailIds: ['gin-sour', 'clover-club', 'southside'],
    tags: ['gin', 'berry', 'sour', 'modern-classic', 'worlds-top-50'],
    palette: { name: 'bramble-purple', hex: '#6B2A4A' },
  }),
  cocktail({
    id: 'east-8-hold-up',
    name: 'East 8 Hold-Up',
    description: 'Vodka, Aperol, passion fruit and lime, shaken and served up. Bitter-orange, tropical and tart.',
    history:
      'Kevin Armstrong created it at Milk & Honey in London in the early 2010s. Bartenders picked it up and it has stayed on the bestseller lists since.',
    origin: 'London',
    creator: 'Kevin Armstrong',
    whyItWorks:
      'Aperol’s bitter orange gives passion fruit an edge, and vodka lets both come through clearly.',
    classifications: ['modern-classic', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['tropical', 'bitter', 'citrus'],
    preparationTime: 3,
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: [],
    ingredients: [
      ing('vodka', 1.5),
      ing('aperol', 0.5),
      ing('passion_fruit_syrup', 0.75),
      ing('lime_juice', 0.75),
      ing('simple_syrup', 0.25),
    ],
    steps: ['Shake everything hard with ice.', 'Fine-strain into a chilled coupe.'],
    techniqueNotes: ['If you use passion fruit syrup rather than purée, leave out the simple syrup.'],
    recommendedBottles: [
      rec('titos', 1, 'Neutral base.'),
      rec('aperol', 2, 'Bitter orange.'),
    ],
    relatedCocktailIds: ['pornstar-martini', 'aperol-sour', 'paper-plane'],
    tags: ['vodka', 'aperol', 'passion-fruit', 'modern-classic', 'worlds-top-50'],
    palette: { name: 'aperol-orange', hex: '#E8813A' },
  }),
]

// Drinks International, "The bestselling classic cocktails at the world's best
// bars 2026", in rank order.
const ranking = [
  ['negroni', 'Number one for the fifth year running.'],
  ['margarita'],
  ['old-fashioned'],
  ['martini', 'The Dry Martini.'],
  ['espresso-martini'],
  ['daiquiri'],
  ['aperol-spritz'],
  ['paloma'],
  ['whiskey-sour'],
  ['manhattan'],
  ['amaretto-sour'],
  ['mojito'],
  ['gimlet'],
  ['bloody-mary'],
  ['americano'],
  ['moscow-mule'],
  ['bamboo'],
  ['zombie-house', 'Our house build; Donn Beach’s original is more elaborate.'],
  ['boulevardier'],
  ['penicillin'],
  ['pisco-sour'],
  ['clover-club'],
  ['french-75'],
  ['mai-tai'],
  ['gin-fizz'],
  ['pornstar-martini'],
  ['gin-basil-smash'],
  ['vodka-martini'],
  ['bees-knees'],
  ['vesper'],
  ['last-word'],
  ['paper-plane'],
  ['caipirinha'],
  ['mezcal-margarita'],
  ['aviation'],
  ['negroni-sbagliato'],
  ['scotch-lemon-sour'],
  ['brandy-crusta'],
  ['milano-torino'],
  ['bramble'],
  ['garibaldi'],
  ['champagne-cocktail'],
  ['cuba-libre'],
  ['pina-colada'],
  ['east-8-hold-up'],
  ['vieux-carre'],
  ['bellini'],
  ['sidecar'],
  ['southside'],
  ['naked-and-famous'],
]
if (ranking.length !== 50) throw new Error(`ranking has ${ranking.length} entries`)

const knownIngredients = new Set(ingredients.map((item) => item.id))
const existingRecipes = new Set(
  fs.readdirSync(cocktailsDir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')),
)
for (const recipe of recipes) existingRecipes.add(recipe.id)

for (const recipe of recipes) {
  for (const line of recipe.ingredients) {
    if (!knownIngredients.has(line.ingredientId)) throw new Error(`${recipe.name}: unknown ingredient ${line.ingredientId}`)
  }
  for (const related of recipe.relatedCocktailIds) {
    if (!existingRecipes.has(related)) throw new Error(`${recipe.name}: unknown related drink ${related}`)
  }
}
for (const [id] of ranking) {
  if (!existingRecipes.has(id)) throw new Error(`ranking: unknown drink ${id}`)
}

fs.writeFileSync(ingredientsPath, `${JSON.stringify(ingredients, null, 2)}\n`)
for (const recipe of recipes) {
  fs.writeFileSync(path.join(cocktailsDir, `${recipe.id}.json`), `${JSON.stringify(recipe, null, 2)}\n`)
}

fs.writeFileSync(
  path.join(setsDir, 'worlds-top-50.json'),
  `${JSON.stringify(
    {
      id: 'worlds-top-50',
      name: 'World’s Top 50',
      description:
        'The 50 bestselling classic cocktails at the world’s best bars, in rank order, from Drinks International’s 2026 Cocktail Report.',
      ranked: true,
      drinks: ranking.map(([drinkId, note]) => (note ? { drinkId, note } : { drinkId })),
    },
    null,
    2,
  )}\n`,
)

const glassId = (glassware) => {
  const value = glassware.toLowerCase()
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
manifest.generatedFrom = `${manifest.generatedFrom ?? 'catalog'}; 2026 world's top 50`
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Added ${recipes.length} recipes and the worlds-top-50 set; catalog ${manifest.cocktailCount}.`)
