#!/usr/bin/env node
/**
 * Thanksgiving and Christmas 2026: nine seasonal drinks that are ready from
 * the bar, `thanksgiving` and `christmas` tags on the seasonal drinks already
 * in the book, and a set for each holiday.
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
  if (spec.year) record.year = spec.year
  if (spec.creator) record.creator = spec.creator
  Object.defineProperty(record, 'palette', { value: spec.palette, enumerable: false })
  return record
}

const recipes = [
  // ── Thanksgiving ──────────────────────────────────────────────────────────
  cocktail({
    id: 'cranberry-bourbon-sour',
    name: 'Cranberry Bourbon Sour',
    description:
      'Bourbon, cranberry, lemon and honey, shaken and poured over a big cube. A whiskey sour that tastes like the side dish.',
    history:
      'A house drink. Cranberries are the most American of Thanksgiving foods, and a whiskey sour is the most American of sours; this puts them together.',
    origin: 'House',
    whyItWorks:
      'Cranberry is tart and a little tannic, so it stands in for part of the lemon; honey rounds both and suits the bourbon’s caramel.',
    classifications: ['house', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['tart', 'fruity', 'oaky'],
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Lemon twist'],
    ingredients: [
      ing('bourbon', 2),
      ing('cranberry_juice', 1),
      ing('lemon_juice', 0.75),
      ing('honey_syrup', 0.5),
      ing('angostura_bitters', 1, 'dash'),
      garnish('lemon', 'Lemon twist'),
    ],
    steps: [
      'Shake everything except the garnish hard with ice.',
      'Strain over a large cube in a rocks glass.',
      'Express a lemon twist over the top.',
    ],
    recommendedBottles: [
      rec('henry-mckenna-10', 1, 'Bottled-in-bond proof stands up to the cranberry.'),
      rec('kirkland-bourbon', 2, 'A good mixing bourbon for a crowd.'),
      rec('angostura-aromatic', 3, 'A dash of spice.'),
    ],
    relatedCocktailIds: ['whiskey-sour', 'ward-eight', 'cranberry-margarita'],
    tags: ['bourbon', 'cranberry', 'sour', 'house', 'thanksgiving'],
    palette: { name: 'cranberry-red', hex: '#9E1B32' },
  }),
  cocktail({
    id: 'apple-pie-sour',
    name: 'Apple Pie Sour',
    description:
      'Apple vodka, brown-sugar-cinnamon syrup and lemon, shaken and served up. Tastes like pie filling, in a good way.',
    history:
      'A house drink built from what is on the shelf: Koskenkorva Apple for the fruit and the house brown-sugar-cinnamon syrup for the crust.',
    origin: 'House',
    whyItWorks:
      'The syrup carries the cinnamon and brown sugar of a pie; lemon keeps it a sour rather than dessert; bitters add the clove.',
    classifications: ['house', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['apple', 'cinnamon', 'tart'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Thin apple slice'],
    ingredients: [
      ing('apple_vodka', 2),
      ing('brown_sugar_cinnamon_syrup', 0.75),
      ing('lemon_juice', 0.75),
      ing('angostura_bitters', 1, 'dash'),
    ],
    steps: [
      'Shake everything hard with ice.',
      'Fine-strain into a chilled coupe.',
      'Perch a thin apple slice on the rim.',
    ],
    recommendedBottles: [
      rec('koskenkorva-apple', 1, 'The apple.'),
      rec('brown-sugar-cinnamon-syrup', 2, 'The pie spice.'),
    ],
    relatedCocktailIds: ['jack-rose', 'apple-vodka-sour', 'apple-pie-shot'],
    tags: ['vodka', 'apple-vodka', 'apple', 'cinnamon', 'sour', 'house', 'thanksgiving'],
    palette: { name: 'apple-pie-gold', hex: '#C98A3A' },
  }),
  cocktail({
    id: 'cranberry-toddy',
    name: 'Cranberry Toddy',
    description:
      'Spiced rum, cranberry, brown-sugar-cinnamon syrup and a squeeze of lemon, topped with hot water. For after the dishes are done.',
    history:
      'A house drink: a hot toddy with cranberry standing in for half the water, so it tastes of the holiday and is pink in the mug.',
    origin: 'House',
    whyItWorks:
      'Heat brings out the spiced rum’s vanilla and the syrup’s cinnamon; cranberry keeps the sweetness in check.',
    classifications: ['house', 'hot'],
    cocktailFamily: 'Toddy',
    flavorProfiles: ['warm', 'cinnamon', 'tart'],
    preparationTime: 5,
    strength: 'light',
    glassware: 'Glass mug',
    ice: 'None; served hot',
    garnish: ['Orange wheel'],
    ingredients: [
      ing('spiced_rum', 1.5),
      ing('cranberry_juice', 2),
      ing('brown_sugar_cinnamon_syrup', 0.5),
      ing('lemon_juice', 0.25),
      ing('hot_water', 2),
      garnish('orange', 'Orange wheel'),
    ],
    steps: [
      'Warm the mug with hot water, then empty it.',
      'Heat the cranberry until steaming but not boiling.',
      'Add rum, syrup and lemon to the mug, pour in the cranberry and hot water, and stir.',
      'Float an orange wheel.',
    ],
    techniqueNotes: ['Don’t boil the cranberry with the rum in it; heat only the juice.'],
    recommendedBottles: [
      rec('kraken-spiced', 1, 'Vanilla and spice that open up hot.'),
      rec('brown-sugar-cinnamon-syrup', 2, 'The cinnamon.'),
    ],
    relatedCocktailIds: ['hot-toddy', 'hot-buttered-rum'],
    seasonality: ['autumn', 'winter'],
    tags: ['rum', 'spiced-rum', 'cranberry', 'hot', 'house', 'thanksgiving'],
    palette: { name: 'warm-cranberry', hex: '#A3283A' },
  }),
  cocktail({
    id: 'harvest-punch',
    name: 'Harvest Punch',
    description:
      'Spiced rum, cranberry and orange with falernum and lemon, lengthened with ginger beer and prosecco. Make a bowl before the guests arrive.',
    history:
      'A house punch for Thanksgiving: rum, sour, sweet, spice and something sparkling, the old five-part punch shape.',
    origin: 'House',
    whyItWorks:
      'Falernum brings clove and lime, ginger beer the bite, prosecco the lift. Cranberry and orange keep it from tasting tropical.',
    classifications: ['house', 'punch'],
    cocktailFamily: 'Punch',
    flavorProfiles: ['fruity', 'spiced', 'sparkling'],
    preparationTime: 6,
    strength: 'light',
    glassware: 'Punch cup or rocks glass',
    ice: 'Large block in the bowl; cubes in the glass',
    garnish: ['Orange wheel'],
    ingredients: [
      ing('spiced_rum', 1.5),
      ing('cranberry_juice', 1.5),
      ing('orange_juice', 1, 'oz', { label: 'Fresh orange juice' }),
      ing('lemon_juice', 0.5),
      ing('falernum', 0.25),
      ing('ginger_beer', 2),
      ing('prosecco', 1),
      garnish('orange', 'Orange wheel'),
    ],
    steps: [
      'For a bowl, multiply by the number of guests. Stir rum, juices and falernum together and chill.',
      'Just before serving, add a large block of ice, then the ginger beer and prosecco.',
      'Float orange wheels and ladle over ice in each glass.',
    ],
    techniqueNotes: ['Add the bubbles last so the bowl stays lively.'],
    recommendedBottles: [
      rec('kraken-spiced', 1, 'The rum.'),
      rec('bitter-truth-falernum', 2, 'The spice.'),
    ],
    relatedCocktailIds: ['witchs-cauldron-punch', 'rum-punch', 'planters-punch'],
    tags: ['rum', 'spiced-rum', 'cranberry', 'punch', 'party', 'house', 'thanksgiving'],
    palette: { name: 'harvest-red', hex: '#B8462E' },
  }),

  // ── Christmas ─────────────────────────────────────────────────────────────
  cocktail({
    id: 'glogg',
    name: 'Gløgg',
    aliases: ['Glögg', 'Mulled wine'],
    description:
      'Red wine warmed with brown-sugar-cinnamon syrup and orange, fortified with aquavit. The Scandinavian Christmas mulled wine.',
    history:
      'Mulled wine is drunk across Northern Europe at Christmas; in Norway and Sweden it is gløgg or glögg, often fortified with aquavit or brandy. This quick version uses the house cinnamon syrup in place of whole spices.',
    origin: 'Scandinavia',
    whyItWorks:
      'Aquavit’s caraway and dill read as the spice cabinet; the syrup sweetens and adds cinnamon; orange brightens the wine.',
    classifications: ['classic', 'hot', 'wine'],
    cocktailFamily: 'Mulled wine',
    flavorProfiles: ['warm', 'spiced', 'fruity'],
    preparationTime: 8,
    strength: 'medium',
    glassware: 'Glass mug',
    ice: 'None; served hot',
    garnish: ['Orange peel'],
    ingredients: [
      ing('red_wine', 4),
      ing('aquavit', 1),
      ing('brown_sugar_cinnamon_syrup', 0.75),
      ing('orange_juice', 0.5),
      garnish('orange', 'Orange peel'),
    ],
    steps: [
      'Warm the wine, syrup and orange juice in a pan until steaming. Don’t let it boil.',
      'Take it off the heat and stir in the aquavit.',
      'Ladle into a warm mug and add an orange peel.',
    ],
    techniqueNotes: ['Scales to a pot easily; keep it on the lowest heat once warm.'],
    recommendedBottles: [
      rec('inderoy-aquavit', 1, 'Norwegian aquavit, as in Norwegian gløgg.'),
      rec('brown-sugar-cinnamon-syrup', 2, 'Spice and sweetness in one.'),
    ],
    relatedCocktailIds: ['hot-toddy', 'christmas-sangria'],
    seasonality: ['winter'],
    tags: ['wine', 'aquavit', 'hot', 'christmas'],
    palette: { name: 'mulled-garnet', hex: '#5E1424' },
  }),
  cocktail({
    id: 'mistletoe-mule',
    name: 'Mistletoe Mule',
    description:
      'Vodka, cranberry and lime topped with ginger beer in a copper mug. A Moscow Mule in Christmas colors.',
    history: 'A house riff on the 1941 Moscow Mule, with cranberry for color.',
    origin: 'House',
    whyItWorks: 'Cranberry adds tartness and color without fighting the ginger.',
    classifications: ['house', 'highball', 'buck'],
    cocktailFamily: 'Mule',
    flavorProfiles: ['ginger', 'tart', 'refreshing'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Copper mug',
    ice: 'Cubed ice',
    garnish: ['Lime wheel'],
    ingredients: [
      ing('vodka', 2),
      ing('cranberry_juice', 1),
      ing('lime_juice', 0.5),
      ing('ginger_beer', 3),
      garnish('lime', 'Lime wheel'),
    ],
    steps: [
      'Fill a copper mug with ice.',
      'Add vodka, cranberry and lime, top with ginger beer and stir once.',
      'Add a lime wheel.',
    ],
    recommendedBottles: [rec('titos', 1, 'Clean vodka.')],
    relatedCocktailIds: ['moscow-mule', 'cranberry-ginger-fizz', 'cape-codder'],
    seasonality: ['winter'],
    tags: ['vodka', 'cranberry', 'ginger', 'mule', 'house', 'christmas'],
    palette: { name: 'mistletoe-red', hex: '#C0283A' },
  }),
  cocktail({
    id: 'christmas-sangria',
    name: 'Christmas Sangria',
    description:
      'Red wine, Grand Marnier, cranberry and orange over ice, with a splash of soda. Make a pitcher.',
    history:
      'Sangria is Spanish red wine punch; this house version swaps summer fruit for cranberry and orange.',
    origin: 'House',
    whyItWorks:
      'Grand Marnier deepens the orange and adds a little backbone; cranberry gives tartness and color; soda keeps a pitcher from getting heavy.',
    classifications: ['house', 'wine', 'punch'],
    cocktailFamily: 'Sangria',
    flavorProfiles: ['fruity', 'tart', 'refreshing'],
    preparationTime: 5,
    strength: 'light',
    glassware: 'Wine glass',
    ice: 'Cubed ice',
    garnish: ['Orange slice'],
    ingredients: [
      ing('red_wine', 3),
      ing('grand_marnier', 0.5),
      ing('cranberry_juice', 1),
      ing('orange_juice', 1, 'oz', { label: 'Fresh orange juice' }),
      ing('club_soda', 1),
      garnish('orange', 'Orange slice'),
    ],
    steps: [
      'For a pitcher, multiply by the number of glasses. Stir wine, Grand Marnier and juices with orange slices and chill for an hour.',
      'Pour over ice and top each glass with soda.',
    ],
    recommendedBottles: [rec('grand-marnier', 1, 'The orange liqueur.')],
    relatedCocktailIds: ['glogg', 'poinsettia'],
    seasonality: ['winter'],
    tags: ['wine', 'cranberry', 'punch', 'party', 'house', 'christmas'],
    palette: { name: 'sangria-ruby', hex: '#7A1A2A' },
  }),
  cocktail({
    id: 'coquito',
    name: 'Coquito',
    aliases: ['Quick Coquito'],
    description:
      'White rum, cream of coconut and half-and-half with brown-sugar-cinnamon syrup, shaken cold. Puerto Rico’s Christmas drink, quick version.',
    history:
      'Coquito is the Puerto Rican Christmas drink, traditionally made in big batches with coconut milk, condensed milk, rum and cinnamon and given away in bottles. This shaken single serving uses what is on the shelf.',
    origin: 'Puerto Rico',
    whyItWorks:
      'Cream of coconut brings both the coconut and the sugar that condensed milk would; the syrup adds the cinnamon.',
    classifications: ['classic', 'creamy', 'dessert'],
    cocktailFamily: 'Flip',
    flavorProfiles: ['coconut', 'cinnamon', 'creamy'],
    strength: 'medium',
    glassware: 'Small rocks glass',
    ice: 'Shaken; served cold without ice',
    garnish: ['Ground cinnamon'],
    ingredients: [
      ing('white_rum', 1.5),
      ing('cream_of_coconut', 1.5),
      ing('heavy_cream', 1.5, 'oz', { label: 'Half-and-half' }),
      ing('brown_sugar_cinnamon_syrup', 0.25),
    ],
    steps: [
      'Shake everything hard with ice.',
      'Strain into a small chilled glass.',
      'Dust with cinnamon if you have it.',
    ],
    techniqueNotes: ['Stir the cream of coconut before measuring; it separates in the can.'],
    recommendedBottles: [
      rec('bacardi-superior', 1, 'Light Puerto Rican rum.'),
      rec('cream-of-coconut', 2, 'The coconut and the sweetness.'),
    ],
    relatedCocktailIds: ['holiday-nog-bourbon', 'pina-colada'],
    seasonality: ['winter'],
    tags: ['rum', 'coconut', 'creamy', 'christmas'],
    palette: { name: 'coquito-cream', hex: '#EFE3CC' },
  }),
  cocktail({
    id: 'peppermint-white-russian',
    name: 'Peppermint White Russian',
    description:
      'Vodka, Kahlúa and a little peppermint liqueur over ice, with half-and-half floated on top. A White Russian for December.',
    history:
      'A house riff. The Black Russian dates to 1949 in Brussels; cream made it white by the 1960s; peppermint makes it Christmas.',
    origin: 'House',
    whyItWorks: 'Mint and coffee is the candy-cane mocha flavor; a half ounce is enough to taste without turning it into toothpaste.',
    classifications: ['house', 'creamy', 'dessert'],
    cocktailFamily: 'Russian',
    flavorProfiles: ['coffee', 'mint', 'creamy'],
    preparationTime: 2,
    glassware: 'Rocks glass',
    ice: 'Cubed ice',
    garnish: [],
    ingredients: [
      ing('vodka', 1.5),
      ing('coffee_liqueur', 0.75),
      ing('peppermint_liqueur', 0.5),
      ing('heavy_cream', 1, 'oz', { label: 'Half-and-half' }),
    ],
    steps: [
      'Build vodka, Kahlúa and peppermint liqueur over ice and stir.',
      'Float the half-and-half on top.',
    ],
    recommendedBottles: [
      rec('kahlua', 1, 'The coffee.'),
      rec('berliner-luft', 2, 'Peppermint liqueur.'),
      rec('titos', 3, 'Clean vodka.'),
    ],
    relatedCocktailIds: ['white-russian', 'black-russian', 'grasshopper'],
    seasonality: ['winter'],
    tags: ['vodka', 'coffee', 'peppermint', 'creamy', 'house', 'christmas'],
    palette: { name: 'peppermint-mocha', hex: '#C9A98A' },
  }),
]

// Seasonal drinks already in the book.
const retag = {
  thanksgiving: [
    'ward-eight',
    'jack-rose',
    'brown-sugar-cinnamon-old-fashioned',
    'manhattan',
    'hot-toddy',
    'hot-buttered-rum',
    'champagne-cocktail',
    'cranberry-ginger-fizz',
  ],
  christmas: [
    'holiday-nog-bourbon',
    'poinsettia',
    'kir-royale-house',
    'cranberry-margarita',
    'grasshopper',
    'peppermint-bourbon',
    'baileys-peppermint',
    'peppermint-patty',
    'pink-squirrel',
    'hot-buttered-rum',
    'three-wise-men',
  ],
}

const sets = [
  {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    description:
      'Cranberry, apple, cinnamon and brown spirits for the fourth Thursday. A punch to have ready when people arrive, sours and stirred drinks for before dinner, and hot drinks for after.',
    drinks: [
      ['harvest-punch', 'Party bowl: scale to the guest count and add the bubbles last.'],
      ['cranberry-bourbon-sour', 'Henry McKenna over a big cube.'],
      ['apple-pie-sour', 'Koskenkorva Apple and the cinnamon syrup.'],
      ['ward-eight', 'Sazerac Rye.'],
      ['jack-rose', 'Koskenkorva Apple stands in for applejack.'],
      ['brown-sugar-cinnamon-old-fashioned'],
      ['manhattan', 'Before dinner.'],
      ['champagne-cocktail', 'For the toast.'],
      ['cranberry-ginger-fizz', 'No alcohol, for drivers and kids.'],
      ['cranberry-toddy', 'After dinner. Heat only the juice.'],
      ['hot-toddy', 'After dinner.'],
      ['hot-buttered-rum', 'After dinner.'],
    ],
  },
  {
    id: 'christmas',
    name: 'Christmas',
    description:
      'Warm drinks, creamy drinks, peppermint and cranberry. Gløgg or sangria for a crowd, sparkling drinks for Christmas morning, and something sweet by the tree.',
    drinks: [
      ['glogg', 'Make a pot; Inderøy aquavit, stirred in off the heat.'],
      ['christmas-sangria', 'Make a pitcher an hour ahead.'],
      ['mistletoe-mule', 'Copper mug.'],
      ['poinsettia', 'Christmas morning.'],
      ['kir-royale-house', 'Christmas morning. Griotte stands in for cassis.'],
      ['cranberry-margarita'],
      ['holiday-nog-bourbon', 'Blind Squirrel peanut-butter nog.'],
      ['coquito', 'Stir the cream of coconut first.'],
      ['peppermint-white-russian', 'Float the half-and-half last.'],
      ['grasshopper', 'After dinner.'],
      ['pink-squirrel', 'After dinner.'],
      ['peppermint-patty'],
      ['baileys-peppermint'],
      ['peppermint-bourbon'],
      ['hot-buttered-rum', 'By the fire.'],
      ['three-wise-men', 'Shot.'],
    ],
  },
]

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
for (const [tag, ids] of Object.entries(retag)) {
  for (const id of ids) if (!existingRecipes.has(id)) throw new Error(`retag ${tag}: unknown drink ${id}`)
}
for (const set of sets) {
  for (const [id] of set.drinks) if (!allRecipes.has(id)) throw new Error(`${set.id}: unknown drink ${id}`)
}

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

const addTag = (data, tag) => {
  data.tags = [...new Set([...(data.tags ?? []), tag])]
}
const addRelated = (data, extras) => {
  data.relatedCocktailIds = [...new Set([...(data.relatedCocktailIds ?? []), ...extras])]
}

for (const [tag, ids] of Object.entries(retag)) {
  for (const id of ids) patchCocktail(id, (data) => addTag(data, tag))
}
patchCocktail('whiskey-sour', (data) => addRelated(data, ['cranberry-bourbon-sour']))
patchCocktail('jack-rose', (data) => addRelated(data, ['apple-pie-sour']))
patchCocktail('hot-toddy', (data) => addRelated(data, ['cranberry-toddy', 'glogg']))
patchCocktail('moscow-mule', (data) => addRelated(data, ['mistletoe-mule']))
patchCocktail('white-russian', (data) => addRelated(data, ['peppermint-white-russian']))
patchCocktail('holiday-nog-bourbon', (data) => addRelated(data, ['coquito']))

for (const set of sets) {
  fs.writeFileSync(
    path.join(setsDir, `${set.id}.json`),
    `${JSON.stringify(
      {
        ...set,
        drinks: set.drinks.map(([drinkId, note]) => (note ? { drinkId, note } : { drinkId })),
      },
      null,
      2,
    )}\n`,
  )
}

// ── Illustration manifest ───────────────────────────────────────────────────
const glassId = (glassware) => {
  const value = glassware.toLowerCase()
  if (value.includes('copper')) return 'copper mug'
  if (value.includes('mug')) return 'glass mug'
  if (value.includes('wine')) return 'wine'
  if (value.includes('coupe')) return 'coupe'
  if (value.includes('flute')) return 'flute'
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
manifest.generatedFrom = `${manifest.generatedFrom ?? 'catalog'}; holidays 2026`
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Added ${recipes.length} recipes, retagged existing drinks, wrote ${sets.map((s) => s.id).join(' and ')} sets; catalog ${manifest.cocktailCount}.`)
