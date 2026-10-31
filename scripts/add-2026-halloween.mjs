#!/usr/bin/env node
/**
 * Halloween 2026: eight spooky drinks ready from the bar, three that are one
 * purchase away, a `halloween` tag on the spooky classics already in the book,
 * and a Halloween set that gathers them into one menu.
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
  // ── Ready from the bar ────────────────────────────────────────────────────
  cocktail({
    id: 'satans-whiskers',
    name: 'Satan’s Whiskers',
    aliases: ['Satan’s Whiskers (Straight)'],
    description:
      'Gin, both vermouths, orange juice and Grand Marnier, shaken. A Bronx with an orange-liqueur kick and a better name.',
    history:
      'Printed in Harry Craddock’s Savoy Cocktail Book in 1930. The “Straight” version uses Grand Marnier; the “Curled” version swaps in orange curaçao.',
    origin: 'London',
    year: 1930,
    whyItWorks:
      'Two vermouths split the difference between sweet and dry, orange juice softens the gin, and Grand Marnier pulls the orange forward so the drink tastes like more than juice.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Bronx',
    flavorProfiles: ['orange', 'botanical', 'citrus'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Orange twist'],
    ingredients: [
      ing('gin', 0.75),
      ing('sweet_vermouth', 0.75),
      ing('dry_vermouth', 0.75),
      ing('orange_juice', 0.75, 'oz', { label: 'Fresh orange juice' }),
      ing('grand_marnier', 0.5),
      ing('orange_bitters', 1, 'dash'),
      garnish('orange', 'Orange twist'),
    ],
    steps: [
      'Shake everything except the garnish hard with ice.',
      'Fine-strain into a chilled coupe.',
      'Express an orange twist over the top.',
    ],
    techniqueNotes: ['Fresh orange juice only. Carton juice makes it taste flat.'],
    recommendedBottles: [
      rec('malfy-originale', 1, 'Citrus-forward gin that sits well with the orange.'),
      rec('grand-marnier', 2, 'The orange liqueur in the Savoy spec.'),
      rec('fee-brothers-orange', 3, 'Orange bitters.'),
    ],
    relatedCocktailIds: ['bronx', 'martini', 'corpse-reviver-no-2'],
    tags: ['gin', 'vermouth', 'classic', 'halloween'],
    palette: { name: 'devil-orange', hex: '#D9772B' },
  }),
  cocktail({
    id: 'witchs-brew',
    name: 'Witch’s Brew',
    aliases: ['Midori Sour'],
    description:
      'Melon liqueur, vodka, lemon and lime lengthened with soda. Bright green, with a drop of blue curaçao to make it murky.',
    history:
      'The Midori Sour dates to 1978, when Suntory launched Midori melon liqueur in the US with a party at Studio 54. This house version adds a spoon of blue curaçao so the green darkens as it sinks.',
    origin: 'United States',
    year: 1978,
    whyItWorks:
      'Melon liqueur is very sweet; two citruses cut it back to a sour, and soda makes it a long drink.',
    classifications: ['modern', 'sour', 'highball'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['melon', 'citrus', 'sweet'],
    preparationTime: 3,
    strength: 'light',
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lime wheel'],
    ingredients: [
      ing('melon_liqueur', 1),
      ing('vodka', 1),
      ing('lemon_juice', 0.5),
      ing('lime_juice', 0.5),
      ing('club_soda', 2, 'oz', { label: 'Club soda, to top' }),
      ing('blue_curacao', 1, 'tsp', { optional: true, label: 'Blue curaçao, for the murky swirl' }),
      garnish('lime', 'Lime wheel'),
    ],
    steps: [
      'Shake melon liqueur, vodka, lemon and lime with ice.',
      'Strain into a highball over fresh ice and top with soda.',
      'Drizzle the blue curaçao down the inside of the glass and leave it unstirred.',
    ],
    recommendedBottles: [
      rec('de-kuyper-melon', 1, 'The melon liqueur on the shelf.'),
      rec('titos', 2, 'Clean vodka.'),
      rec('blue-curacao', 3, 'For the swirl.'),
    ],
    relatedCocktailIds: ['melon-ball', 'swamp-water', 'alien-brain-hemorrhage'],
    tags: ['vodka', 'melon', 'sour', 'highball', 'halloween'],
    palette: { name: 'witch-green', hex: '#7BC043' },
  }),
  cocktail({
    id: 'vampires-kiss',
    name: 'Vampire’s Kiss',
    description:
      'Vodka and cranberry topped with sparkling wine, with cherry liqueur poured last so it bleeds down through the bubbles.',
    history: 'A house Halloween sparkler: a Kir Royale crossed with a Cosmopolitan.',
    origin: 'House',
    whyItWorks:
      'Cranberry keeps it tart, prosecco keeps it light, and the dense cherry liqueur sinks instead of mixing, so the glass goes from pink to blood-red at the bottom.',
    classifications: ['modern', 'sparkling'],
    cocktailFamily: 'Champagne Cocktail',
    flavorProfiles: ['cherry', 'berry', 'sparkling'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Champagne flute',
    ice: 'None',
    garnish: ['Cocktail cherry'],
    ingredients: [
      ing('vodka', 1),
      ing('cranberry_juice', 1),
      ing('prosecco', 3, 'oz', { label: 'Prosecco or dry sparkling wine' }),
      ing('cherry_liqueur', 0.25),
      garnish('cocktail_cherry', 'Cocktail cherry, dropped in'),
    ],
    steps: [
      'Pour cold vodka and cranberry into a chilled flute.',
      'Top slowly with prosecco.',
      'Pour the cherry liqueur in last, down the inside of the glass, so it sinks. Drop in a cherry.',
    ],
    techniqueNotes: ['Have everything cold before you start; there is no ice in this one.'],
    recommendedBottles: [
      rec('bozkov-griotte', 1, 'Dark cherry liqueur; this is what makes the red streak.'),
      rec('titos', 2, 'Clean vodka.'),
    ],
    relatedCocktailIds: ['kir-royale-house', 'cosmopolitan', 'french-75'],
    tags: ['vodka', 'sparkling', 'cherry', 'house', 'halloween'],
    palette: { name: 'blood-red', hex: '#8E1B2A' },
  }),
  cocktail({
    id: 'el-diablo',
    name: 'El Diablo',
    aliases: ['Mexican El Diablo'],
    description:
      'Tequila, lime and ginger beer, with a red liqueur that sinks to the bottom. Made here with cherry instead of cassis.',
    history:
      'Trader Vic printed it as the “Mexican El Diablo” in 1946, one of the first tequila drinks in an American bar book. The original uses crème de cassis.',
    origin: 'United States',
    year: 1946,
    creator: 'Victor “Trader Vic” Bergeron',
    whyItWorks:
      'Ginger and lime make a simple tequila buck; the dark fruit liqueur adds sweetness and color as it rises from the bottom.',
    classifications: ['classic', 'highball', 'buck'],
    cocktailFamily: 'Buck',
    flavorProfiles: ['ginger', 'agave', 'cherry'],
    preparationTime: 3,
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lime wedge'],
    ingredients: [
      ing('blanco_tequila', 1.5),
      ing('lime_juice', 0.5),
      ing('ginger_beer', 3),
      ing('cherry_liqueur', 0.5, 'oz', { label: 'Cherry liqueur (classic: crème de cassis)' }),
      garnish('lime', 'Lime wedge'),
    ],
    steps: [
      'Build tequila and lime over ice in a highball.',
      'Top with ginger beer.',
      'Pour the cherry liqueur over the top. It sinks; leave it unstirred.',
    ],
    techniqueNotes: ['With crème de cassis on the shelf, use it instead for the 1946 version.'],
    recommendedBottles: [
      rec('kirkland-tequila-other', 1, 'The blanco tequila in stock.'),
      rec('bozkov-griotte', 2, 'Stands in for cassis.'),
    ],
    substitutions: [
      {
        ingredientId: 'cherry_liqueur',
        alternatives: ['raspberry_syrup'],
        notes: 'Crème de cassis is the original; raspberry syrup gives a lighter, sweeter red.',
      },
    ],
    relatedCocktailIds: ['mexican-mule', 'moscow-mule', 'dark-n-stormy', 'paloma'],
    tags: ['tequila', 'ginger', 'highball', 'classic', 'halloween'],
    palette: { name: 'ember-red', hex: '#B5452B' },
  }),
  cocktail({
    id: 'smoke-and-bones',
    name: 'Smoke & Bones',
    aliases: ['Mezcal Blood and Sand'],
    description:
      'A Blood and Sand made with mezcal instead of Scotch: equal parts mezcal, sweet vermouth, cherry liqueur and orange juice.',
    history:
      'The Blood and Sand is named for the 1922 Rudolph Valentino bullfighting film. Mezcal swaps in for Scotch here, and its smoke takes the place of the peat.',
    origin: 'House',
    whyItWorks:
      'Equal parts is forgiving. Mezcal’s smoke and roasted agave stand up to cherry and vermouth the way a smoky Scotch does.',
    classifications: ['variation', 'sour'],
    cocktailFamily: 'Blood and Sand',
    flavorProfiles: ['smoky', 'cherry', 'orange'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Flamed orange peel'],
    ingredients: [
      ing('mezcal', 0.75),
      ing('sweet_vermouth', 0.75),
      ing('cherry_liqueur', 0.75),
      ing('orange_juice', 0.75, 'oz', { label: 'Fresh orange juice' }),
      garnish('orange', 'Flamed orange peel'),
    ],
    steps: [
      'Shake mezcal, vermouth, cherry liqueur and orange juice hard with ice.',
      'Fine-strain into a chilled coupe.',
      'Flame an orange peel over the glass and drop it in.',
    ],
    techniqueNotes: [
      'To flame the peel, hold a lit match between the peel and the glass and squeeze the peel so the oil sprays through the flame.',
    ],
    recommendedBottles: [
      rec('400-conejos-mezcal', 1, 'A mixing mezcal with moderate smoke.'),
      rec('bozkov-griotte', 2, 'The cherry liqueur.'),
      rec('sweet-vermouth', 3, 'Check it is fresh.'),
    ],
    relatedCocktailIds: ['blood-and-sand', 'mezcal-negroni', 'oaxaca-old-fashioned'],
    tags: ['mezcal', 'cherry', 'equal-parts', 'smoky', 'halloween'],
    palette: { name: 'smoke-blood', hex: '#9A3A2E' },
  }),
  cocktail({
    id: 'graveyard-old-fashioned',
    name: 'Graveyard Old Fashioned',
    description:
      'Kraken black spiced rum stirred with a little demerara and cocoa bitters. Nearly black in the glass.',
    history: 'A house Halloween Old Fashioned built on the darkest bottle on the shelf.',
    origin: 'House',
    whyItWorks:
      'Kraken is already sweet and spiced, so it needs less sugar than whiskey. Cocoa bitters add a dry chocolate note and Angostura keeps it from tasting like a liqueur.',
    classifications: ['spirit-forward', 'variation'],
    cocktailFamily: 'Old Fashioned',
    flavorProfiles: ['spiced', 'chocolate', 'molasses'],
    strength: 'spirit-forward',
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Orange peel'],
    ingredients: [
      ing('spiced_rum', 2, 'oz', { label: 'Black spiced rum' }),
      ing('demerara_sugar', 0.5, 'tsp', { label: 'Demerara sugar (or 1 barspoon syrup)' }),
      ing('cocoa_bitters', 2, 'dashes'),
      ing('angostura_bitters', 1, 'dash'),
      garnish('orange', 'Orange peel'),
    ],
    steps: [
      'Stir the sugar and bitters with a splash of water until the sugar dissolves.',
      'Add the rum and ice; stir until cold.',
      'Strain over a large cube and express an orange peel.',
    ],
    recommendedBottles: [
      rec('kraken-spiced', 1, 'The black rum the drink is named for.'),
      rec('angostura-cocoa', 2, 'Cocoa bitters.'),
      rec('angostura-aromatic', 3, 'One dash of aromatic bitters.'),
    ],
    relatedCocktailIds: ['old-fashioned', 'cocoa-old-fashioned', 'dark-n-stormy'],
    tags: ['rum', 'spiced-rum', 'old-fashioned', 'spirit-forward', 'house', 'halloween'],
    palette: { name: 'graveyard-black', hex: '#2B1A12' },
  }),
  cocktail({
    id: 'poison-apple',
    name: 'Poison Apple',
    description: 'Apple vodka, lemon and grenadine shaken and topped with sparkling wine. Apple-red, tart and fizzy.',
    history: 'A house Halloween sour, named for the apple in Snow White.',
    origin: 'House',
    whyItWorks:
      'Apple vodka and lemon make a crisp sour; grenadine supplies the sugar and the red; prosecco lifts it.',
    classifications: ['modern', 'sour', 'sparkling'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['apple', 'citrus', 'sparkling'],
    preparationTime: 3,
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Thin apple slice or cocktail cherry'],
    ingredients: [
      ing('apple_vodka', 1.5),
      ing('lemon_juice', 0.5),
      ing('grenadine', 0.5),
      ing('prosecco', 1.5, 'oz', { label: 'Prosecco, to top' }),
      garnish('cocktail_cherry', 'Cocktail cherry'),
    ],
    steps: [
      'Shake apple vodka, lemon and grenadine hard with ice.',
      'Strain into a chilled coupe.',
      'Top with prosecco and garnish.',
    ],
    recommendedBottles: [rec('koskenkorva-apple', 1, 'The apple vodka in stock.')],
    relatedCocktailIds: ['appletini', 'jack-rose', 'washington-apple', 'french-75'],
    tags: ['vodka', 'apple', 'sour', 'sparkling', 'house', 'halloween'],
    palette: { name: 'poison-red', hex: '#B3122E' },
  }),
  cocktail({
    id: 'the-ghost',
    name: 'The Ghost',
    description:
      'Vodka, Irish cream, white crème de cacao and half-and-half shaken until frothy. Pale, sweet, and the opposite of a Black Russian.',
    history: 'A house Halloween dessert drink.',
    origin: 'House',
    whyItWorks:
      'White crème de cacao adds chocolate without darkening the drink, Irish cream adds body, and a hard shake makes the froth.',
    classifications: ['dessert', 'creamy'],
    cocktailFamily: 'Alexander',
    flavorProfiles: ['cream', 'chocolate', 'sweet'],
    preparationTime: 3,
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Grated nutmeg'],
    ingredients: [
      ing('vodka', 1),
      ing('baileys', 1, 'oz', { label: 'Irish cream' }),
      ing('creme_de_cacao', 0.75, 'oz', { label: 'White crème de cacao' }),
      ing('heavy_cream', 0.75, 'oz', { label: 'Half-and-half or cream' }),
    ],
    steps: [
      'Shake everything hard with ice for 15 seconds.',
      'Strain into a chilled coupe.',
      'Grate a little nutmeg on top if you have it.',
    ],
    techniqueNotes: [
      'Half-and-half makes a lighter froth than heavy cream; shake longer to make up for it.',
      'Use white crème de cacao. Dark crème de cacao turns the drink brown.',
    ],
    recommendedBottles: [
      rec('kirkland-irish-cream', 1, 'The Irish cream in stock.'),
      rec('titos', 2, 'Clean vodka.'),
    ],
    relatedCocktailIds: ['white-russian', 'black-russian', 'pink-squirrel', 'grasshopper'],
    tags: ['vodka', 'cream', 'dessert', 'house', 'halloween'],
    palette: { name: 'ghost-white', hex: '#EDE6D6' },
  }),

  // ── One purchase away ─────────────────────────────────────────────────────
  cocktail({
    id: 'corpse-reviver-no-1',
    name: 'Corpse Reviver No. 1',
    description:
      'Cognac, calvados and sweet vermouth stirred. The darker, boozier sibling of the No. 2. Needs cognac and calvados.',
    history:
      'Harry Craddock’s Savoy Cocktail Book (1930) lists it as a “hair of the dog,” to be taken before 11 a.m. or whenever steam and energy are needed.',
    origin: 'London',
    year: 1930,
    whyItWorks:
      'Grape brandy and apple brandy together are rounder than either alone; sweet vermouth ties them together the way it does in a Manhattan.',
    classifications: ['classic', 'spirit-forward'],
    cocktailFamily: 'Manhattan',
    flavorProfiles: ['brandy', 'apple', 'bittersweet'],
    difficulty: 'medium',
    strength: 'spirit-forward',
    glassware: 'Coupe',
    ice: 'Stirred; up',
    garnish: ['Orange twist'],
    ingredients: [
      ing('cognac', 1.5),
      ing('calvados', 0.75),
      ing('sweet_vermouth', 0.75),
      garnish('orange', 'Orange twist'),
    ],
    steps: [
      'Stir cognac, calvados and sweet vermouth with ice until very cold.',
      'Strain into a chilled coupe and express an orange twist.',
    ],
    techniqueNotes: ['Until both brandies are in, make the Corpse Reviver No. 2 instead.'],
    recommendedBottles: [rec('sweet-vermouth', 1, 'The vermouth is already on the shelf.')],
    substitutions: [
      {
        ingredientId: 'calvados',
        alternatives: ['cognac'],
        notes: 'All cognac works if you only buy one bottle; it loses the apple.',
      },
    ],
    relatedCocktailIds: ['corpse-reviver-no-2', 'harvard', 'jack-rose', 'sidecar'],
    tags: ['cognac', 'calvados', 'classic', 'spirit-forward', 'inventory-gap', 'halloween'],
    palette: { name: 'brandy-amber', hex: '#9C5A24' },
  }),
  cocktail({
    id: 'death-in-the-afternoon',
    name: 'Death in the Afternoon',
    aliases: ['Hemingway Champagne'],
    description:
      'Absinthe topped with cold sparkling wine until it turns cloudy. Two ingredients; needs absinthe.',
    history:
      'Ernest Hemingway contributed it to the 1935 celebrity cocktail book So Red the Nose, naming it after his 1932 book on bullfighting. His instructions: pour one jigger of absinthe into a champagne glass and add iced champagne until it reaches the proper opalescent milkiness. Drink three to five slowly.',
    origin: 'United States',
    year: 1935,
    creator: 'Ernest Hemingway',
    whyItWorks:
      'Sparkling wine louches the absinthe the way water does, so the drink turns milky green and the anise softens.',
    classifications: ['classic', 'sparkling'],
    cocktailFamily: 'Champagne Cocktail',
    flavorProfiles: ['anise', 'herbal', 'sparkling'],
    preparationTime: 1,
    strength: 'strong',
    glassware: 'Coupe or flute',
    ice: 'None',
    garnish: [],
    ingredients: [
      ing('absinthe', 1),
      ing('prosecco', 4, 'oz', { label: 'Champagne or dry sparkling wine, very cold' }),
    ],
    steps: [
      'Pour the absinthe into a chilled coupe or flute.',
      'Top slowly with very cold sparkling wine until the drink turns cloudy.',
    ],
    techniqueNotes: [
      'Hemingway’s jigger was a full 1.5 oz. One ounce is plenty for most people.',
      'Brut Champagne or a dry cava works better than a sweet prosecco.',
    ],
    relatedCocktailIds: ['french-75', 'sazerac', 'corpse-reviver-no-2'],
    tags: ['absinthe', 'sparkling', 'classic', 'inventory-gap', 'halloween'],
    palette: { name: 'absinthe-opal', hex: '#B9C99A' },
  }),
  cocktail({
    id: 'black-widow',
    name: 'Black Widow',
    description:
      'Kraken, lemon and egg white shaken into a dark sour, with Peychaud’s drops drawn into a spider web on the foam. Needs eggs.',
    history: 'A house Halloween sour.',
    origin: 'House',
    whyItWorks:
      'Black spiced rum gives a dark base and vanilla spice; egg white makes a thick foam that holds a bitters pattern.',
    classifications: ['sour', 'variation'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['spiced', 'citrus', 'silky'],
    difficulty: 'medium',
    preparationTime: 5,
    glassware: 'Coupe',
    ice: 'Dry shake, then shaken; up',
    garnish: ['Peychaud’s bitters spider web'],
    ingredients: [
      ing('spiced_rum', 2, 'oz', { label: 'Black spiced rum' }),
      ing('lemon_juice', 0.75),
      ing('simple_syrup', 0.5),
      ing('egg_white', 1, 'piece', { scaleMode: 'linear', label: 'Egg white' }),
      ing('peychauds_bitters', 6, 'drop', { label: 'Peychaud’s bitters, for the web' }),
    ],
    steps: [
      'Shake rum, lemon, syrup and egg white without ice for 15 seconds.',
      'Add ice and shake again until cold.',
      'Fine-strain into a chilled coupe and let the foam settle.',
      'Drop the bitters in a spiral on the foam, then drag a toothpick from the center outward to make a web.',
    ],
    techniqueNotes: ['Carton egg whites work; use about 0.75 oz.'],
    recommendedBottles: [
      rec('kraken-spiced', 1, 'The black rum.'),
      rec('peychauds', 2, 'Red bitters for the web.'),
    ],
    relatedCocktailIds: ['whiskey-sour', 'graveyard-old-fashioned', 'dark-n-stormy'],
    tags: ['rum', 'spiced-rum', 'sour', 'egg-white', 'house', 'inventory-gap', 'halloween'],
    palette: { name: 'widow-black', hex: '#3A2418' },
  }),
]

// Spooky drinks already in the book.
const retag = [
  'zombie-house',
  'corpse-reviver-no-2',
  'blood-and-sand',
  'black-manhattan',
  'black-russian',
]

const halloweenSet = {
  id: 'halloween',
  name: 'Halloween',
  description:
    'Spooky drinks for the 31st. The first eight are ready from the bar; the next five are classics with a Halloween name; the last three need one more bottle (cognac and calvados, absinthe, or eggs).',
  drinks: [
    ['witchs-brew', 'Drizzle the blue curaçao in last and leave it unstirred.'],
    ['vampires-kiss', 'Everything cold; pour the Griotte last so it sinks.'],
    ['poison-apple', 'Koskenkorva Apple.'],
    ['el-diablo', 'Griotte stands in for cassis.'],
    ['satans-whiskers', 'Fresh orange juice only.'],
    ['smoke-and-bones', '400 Conejos. Flame the orange peel.'],
    ['graveyard-old-fashioned', 'Kraken over a big cube.'],
    ['the-ghost', 'Nightcap. Shake it hard.'],
    ['zombie-house'],
    ['corpse-reviver-no-2'],
    ['blood-and-sand'],
    ['black-manhattan'],
    ['black-russian'],
    ['brain-hemorrhage', 'Shot.'],
    ['alien-brain-hemorrhage', 'Shot.'],
    ['corpse-reviver-no-1', 'Needs cognac and calvados.'],
    ['death-in-the-afternoon', 'Needs absinthe.'],
    ['black-widow', 'Needs eggs.'],
  ],
}

// ── Validate ────────────────────────────────────────────────────────────────
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
for (const id of retag) if (!existingRecipes.has(id)) throw new Error(`retag: unknown drink ${id}`)
for (const [id] of halloweenSet.drinks) if (!allRecipes.has(id)) throw new Error(`set: unknown drink ${id}`)

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

for (const id of retag) patchCocktail(id, (data) => addTag(data, 'halloween'))
patchCocktail('blood-and-sand', (data) => addRelated(data, ['smoke-and-bones']))
patchCocktail('corpse-reviver-no-2', (data) => addRelated(data, ['corpse-reviver-no-1', 'death-in-the-afternoon']))
patchCocktail('black-russian', (data) => addRelated(data, ['the-ghost']))
patchCocktail('white-russian', (data) => addRelated(data, ['the-ghost']))
patchCocktail('melon-ball', (data) => addRelated(data, ['witchs-brew']))
patchCocktail('bronx', (data) => addRelated(data, ['satans-whiskers']))
patchCocktail('old-fashioned', (data) => addRelated(data, ['graveyard-old-fashioned']))

fs.writeFileSync(
  path.join(setsDir, 'halloween.json'),
  `${JSON.stringify(
    {
      ...halloweenSet,
      drinks: halloweenSet.drinks.map(([drinkId, note]) => (note ? { drinkId, note } : { drinkId })),
    },
    null,
    2,
  )}\n`,
)

// ── Illustration manifest ───────────────────────────────────────────────────
const glassId = (glassware) => {
  const value = glassware.toLowerCase()
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
manifest.generatedFrom = `${manifest.generatedFrom ?? 'catalog'}; halloween 2026`
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Added ${recipes.length} recipes, tagged ${retag.length} existing drinks, wrote the halloween set; catalog ${manifest.cocktailCount}.`)
