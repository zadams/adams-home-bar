#!/usr/bin/env node
/**
 * Stock St-Germain, Green Chartreuse, Kirkland Irish Cream, Old Fitzgerald 7
 * Year Bottled-in-Bond, Myers's dark rum, Disaronno, and 400 Conejos mezcal;
 * point existing recipes at them and add the drinks they unlock.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const bottlesPath = path.join(root, 'src/data/bottles/bottles.json')
const inventoryPath = path.join(root, 'src/data/inventory/seed-inventory.json')
const cocktailsDir = path.join(root, 'src/data/cocktails')
const manifestPath = path.join(root, 'src/data/illustrations/illustration-manifest.json')

const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'))
const bottles = JSON.parse(fs.readFileSync(bottlesPath, 'utf8'))
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))

const PURCHASED = '2026-10-24'

const ingredientAdditions = [
  {
    id: 'elderflower_liqueur',
    name: 'Elderflower liqueur',
    category: 'liqueur',
    subcategory: 'floral',
    aliases: ['St-Germain', 'St. Germain', 'elderflower'],
    tags: ['floral', 'elderflower', 'sweet'],
  },
  {
    id: 'dark_rum',
    name: 'Dark rum',
    category: 'spirit',
    subcategory: 'rum',
    aliases: ['black rum', 'Myers’s', 'dark Jamaican rum'],
    tags: ['rum', 'molasses', 'dark'],
  },
]

const ingredientIds = new Set(ingredients.map((item) => item.id))
for (const item of ingredientAdditions) {
  if (ingredientIds.has(item.id)) continue
  ingredients.push(item)
  ingredientIds.add(item.id)
}

const extraAliases = {
  green_chartreuse: ['Chartreuse', 'Chartreuse Verte'],
  amaretto: ['Disaronno'],
  baileys: ['Irish cream liqueur'],
  mezcal: ['mezcal joven', 'espadín'],
}
for (const [id, aliases] of Object.entries(extraAliases)) {
  const item = ingredients.find((candidate) => candidate.id === id)
  if (!item) throw new Error(`missing ingredient ${id}`)
  item.aliases = [...new Set([...(item.aliases ?? []), ...aliases])]
}

const bottleAdditions = [
  {
    id: 'st-germain',
    brand: 'St-Germain',
    productName: 'Elderflower Liqueur',
    ingredientIds: ['elderflower_liqueur'],
    category: 'liqueur',
    subcategory: 'floral',
    tags: ['elderflower', 'floral'],
  },
  {
    id: 'green-chartreuse',
    brand: 'Chartreuse',
    productName: 'Green Chartreuse',
    ingredientIds: ['green_chartreuse'],
    category: 'liqueur',
    subcategory: 'herbal',
    tags: ['herbal', 'alpine'],
    notes: '55% ABV. Allocated and hard to replace; save it for drinks where it is the point.',
  },
  {
    id: 'kirkland-irish-cream',
    brand: 'Kirkland Signature',
    productName: 'Irish Cream',
    ingredientIds: ['baileys'],
    category: 'liqueur',
    subcategory: 'cream',
    tags: ['cream'],
  },
  {
    id: 'old-fitzgerald-bib-7',
    brand: 'Old Fitzgerald',
    productName: '7 Year Bottled-in-Bond',
    ingredientIds: ['bourbon'],
    category: 'spirit',
    subcategory: 'bourbon',
    tags: ['bourbon', 'bottled-in-bond', 'wheated'],
    notes: 'Wheated, 100 proof. Soft enough for a julep, strong enough to hold up in a sour.',
  },
  {
    id: 'myers-dark-rum',
    brand: 'Myers’s',
    productName: 'Original Dark Rum',
    ingredientIds: ['dark_rum', 'jamaican_rum'],
    category: 'spirit',
    subcategory: 'rum',
    tags: ['rum', 'dark', 'jamaican'],
    notes: 'Jamaican, molasses-rich and sweet. Covers Jamaican rum, but without the pot-still funk of Smith & Cross or Hamilton.',
  },
  {
    id: 'disaronno',
    brand: 'Disaronno',
    productName: 'Originale',
    ingredientIds: ['amaretto'],
    category: 'liqueur',
    subcategory: 'almond',
    tags: ['almond', 'amaretto'],
  },
  {
    id: '400-conejos-mezcal',
    brand: '400 Conejos',
    productName: 'Mezcal Joven Espadín',
    ingredientIds: ['mezcal'],
    category: 'spirit',
    subcategory: 'mezcal',
    tags: ['mezcal', 'smoky', 'espadín'],
    notes: 'Moderate smoke; a mixing mezcal, not a sipper.',
  },
]

const bottleIds = new Set(bottles.map((item) => item.id))
for (const bottle of bottleAdditions) {
  if (bottleIds.has(bottle.id)) continue
  bottles.push(bottle)
  bottleIds.add(bottle.id)
}

const inventoryIds = new Set(inventory.map((item) => item.id))
for (const bottle of bottleAdditions) {
  const id = `inv-${bottle.id}`
  if (inventoryIds.has(id)) continue
  inventory.push({
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
  scaleMode:
    extra.scaleMode ?? (unit === 'dashes' || unit === 'dash' || unit === 'pinch' ? 'fixed' : 'linear'),
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
  if (spec.kind) record.kind = spec.kind
  if (spec.year) record.year = spec.year
  if (spec.creator) record.creator = spec.creator
  // Art direction travels with the spec so each drink gets a real liquid color.
  Object.defineProperty(record, 'palette', { value: spec.palette, enumerable: false })
  return record
}

const recipes = [
  // ── St-Germain ──────────────────────────────────────────────────────────
  cocktail({
    id: 'hugo',
    name: 'Hugo',
    aliases: ['Hugo Spritz'],
    description:
      'The Alpine spritz: prosecco, elderflower, soda and lime over ice in a wine glass. Lighter and less bitter than an Aperol Spritz.',
    history:
      'Roland Gruber created it in 2005 at San Zeno bar in Naturns, South Tyrol, first with lemon-balm syrup. Elderflower took over as it spread through northern Italy, Austria and Germany, and it is now the default summer spritz across the Alps.',
    origin: 'South Tyrol, Italy',
    year: 2005,
    creator: 'Roland Gruber',
    whyItWorks:
      'Elderflower gives prosecco a floral, lychee-and-pear sweetness; lime and soda keep it from cloying. Mint is the traditional finish when you have it.',
    classifications: ['modern-classic', 'spritz', 'low-abv'],
    cocktailFamily: 'Spritz',
    flavorProfiles: ['floral', 'bubbly', 'refreshing'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Wine glass',
    ice: 'Cubed ice',
    garnish: ['Lime wheel', 'Mint sprig'],
    ingredients: [
      ing('prosecco', 4),
      ing('elderflower_liqueur', 0.75),
      ing('club_soda', 1),
      ing('lime', 2, 'piece', { label: 'Lime wedges', scaleMode: 'linear' }),
      garnish('mint', 'Mint sprig'),
    ],
    steps: [
      'Squeeze two lime wedges into a wine glass and drop them in.',
      'Add St-Germain and fill with ice.',
      'Top with prosecco, then soda, and stir once gently.',
      'Slap a mint sprig and tuck it in, if you have mint.',
    ],
    techniqueNotes: [
      'St-Germain is sweeter than the elderflower syrup most Italian bars use, so 0.75 oz is plenty.',
    ],
    recommendedBottles: [rec('st-germain', 1, 'The elderflower.')],
    relatedCocktailIds: ['st-germain-cocktail', 'aperol-spritz', 'campari-spritz'],
    seasonality: ['spring', 'summer'],
    tags: ['spritz', 'elderflower', 'prosecco', 'low-abv', 'ready-from-new-stock'],
    palette: { name: 'pale-straw-sparkle', hex: '#E4DCA0' },
  }),
  cocktail({
    id: 'st-germain-cocktail',
    name: 'St-Germain Cocktail',
    aliases: ['St-Germain Spritz', 'Elderflower Spritz'],
    description:
      'St-Germain, sparkling wine and soda in a tall glass with a lemon twist. The bottle’s own serve, and the best way to learn what it tastes like.',
    history:
      'Printed on the bottle since St-Germain launched in 2007. The brand calls for brut champagne or a dry white wine; prosecco is the common home version.',
    origin: 'United States',
    year: 2007,
    whyItWorks:
      'More liqueur than a Hugo, so elderflower leads. Soda and wine stretch it into a long, dry-enough highball.',
    classifications: ['modern', 'spritz', 'low-abv'],
    cocktailFamily: 'Spritz',
    flavorProfiles: ['floral', 'bubbly', 'citrus'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Collins glass',
    ice: 'Cubed ice',
    garnish: ['Lemon twist'],
    ingredients: [
      ing('elderflower_liqueur', 1.5),
      ing('prosecco', 2),
      ing('club_soda', 2),
      garnish('lemon', 'Lemon twist'),
    ],
    steps: [
      'Fill a collins glass with ice.',
      'Add St-Germain, then prosecco, then soda.',
      'Stir once and express a lemon twist over the top.',
    ],
    recommendedBottles: [rec('st-germain', 1, 'It is the drink.')],
    relatedCocktailIds: ['hugo', 'white-linen', 'aperol-spritz'],
    seasonality: ['spring', 'summer'],
    tags: ['spritz', 'elderflower', 'prosecco', 'low-abv', 'ready-from-new-stock'],
    palette: { name: 'pale-straw-sparkle', hex: '#E8E0A8' },
  }),
  cocktail({
    id: 'elder-fashioned',
    name: 'Elder Fashioned',
    description:
      'A gin Old Fashioned sweetened with St-Germain instead of sugar, with orange bitters and a grapefruit twist.',
    history:
      'Phil Ward’s drink from Death & Co in New York, one of the first bartender classics built on St-Germain after its 2007 launch.',
    origin: 'New York',
    creator: 'Phil Ward',
    whyItWorks:
      'Elderflower is both sweetener and botanical, so it slots into the Old Fashioned template without fighting the gin. Grapefruit oil sharpens the floral edge.',
    classifications: ['modern-classic', 'spirit-forward'],
    cocktailFamily: 'Old Fashioned',
    flavorProfiles: ['floral', 'botanical', 'citrus'],
    preparationTime: 3,
    strength: 'spirit-forward',
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Grapefruit twist'],
    ingredients: [
      ing('gin', 2),
      ing('elderflower_liqueur', 0.5),
      ing('orange_bitters', 2, 'dashes'),
      garnish('grapefruit', 'Grapefruit twist'),
    ],
    steps: [
      'Stir gin, St-Germain and orange bitters with ice until cold.',
      'Strain over a large cube in a rocks glass.',
      'Express a grapefruit twist over the top and drop it in.',
    ],
    techniqueNotes: [
      'The original used Plymouth. Of what is here, Hendrick’s leans into the floral side; Drumshanbo is greener and sharper.',
    ],
    recommendedBottles: [
      rec('hendricks', 1, 'Rose and cucumber meet the elderflower halfway.'),
      rec('st-germain', 2, 'Sweetener and botanical in one.'),
      rec('drumshanbo-gunpowder', 3, 'Brighter, tea-and-citrus version.'),
    ],
    relatedCocktailIds: ['gin-old-fashioned', 'white-linen', 'old-fashioned'],
    tags: ['gin', 'elderflower', 'stirred', 'modern-classic', 'ready-from-new-stock'],
    palette: { name: 'pale-gold', hex: '#D9C77E' },
  }),
  cocktail({
    id: 'white-linen',
    name: 'White Linen',
    description:
      'Gin, St-Germain, lemon and muddled cucumber, lengthened with soda. A Collins for hot afternoons.',
    history:
      'A cucumber-and-elderflower Collins that spread with St-Germain in the late 2000s. The name is a nod to summer whites.',
    origin: 'Modern cocktail bars',
    whyItWorks:
      'Cucumber and elderflower are both green and soft; lemon gives the structure and gin the backbone. Soda keeps it long and dry.',
    classifications: ['modern', 'highball'],
    cocktailFamily: 'Collins',
    flavorProfiles: ['floral', 'refreshing', 'citrus'],
    preparationTime: 4,
    glassware: 'Collins glass',
    ice: 'Cubed ice',
    garnish: ['Cucumber ribbon'],
    ingredients: [
      ing('gin', 1.5),
      ing('elderflower_liqueur', 0.75),
      ing('lemon_juice', 0.75),
      ing('simple_syrup', 0.25),
      ing('cucumber', 3, 'piece', { label: 'Cucumber slices' }),
      ing('club_soda', 2),
    ],
    steps: [
      'Muddle three cucumber slices in a shaker.',
      'Add gin, St-Germain, lemon and simple syrup; shake with ice.',
      'Double-strain into an ice-filled collins glass and top with soda.',
      'Garnish with a cucumber ribbon.',
    ],
    recommendedBottles: [
      rec('hendricks', 1, 'Already a cucumber gin.'),
      rec('st-germain', 2, 'The floral half.'),
    ],
    relatedCocktailIds: ['tom-collins', 'cucumber-gin-cooler', 'st-germain-cocktail', 'elder-fashioned'],
    seasonality: ['spring', 'summer'],
    tags: ['gin', 'elderflower', 'cucumber', 'highball', 'ready-from-new-stock'],
    palette: { name: 'cucumber-pale', hex: '#D8E2B8' },
  }),

  // ── Green Chartreuse ────────────────────────────────────────────────────
  cocktail({
    id: 'swamp-water',
    name: 'Swamp Water',
    description:
      'Green Chartreuse, pineapple juice and lime in a tall glass. A 1970s ski-lodge drink that bartenders have quietly kept making.',
    history:
      'Chartreuse’s American importer pushed it in the 1970s, and it became a fixture in Colorado ski towns. It never went fully out of style there.',
    origin: 'Colorado, United States',
    whyItWorks:
      'Pineapple is sweet and broad enough to carry 130 herbs; lime pulls it back from candy. The 55% Chartreuse means it still has weight at this length.',
    classifications: ['retro', 'highball'],
    cocktailFamily: 'Highball',
    flavorProfiles: ['herbal', 'pineapple', 'tropical'],
    preparationTime: 2,
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lime wheel'],
    ingredients: [
      ing('green_chartreuse', 1.5),
      ing('pineapple_juice', 4),
      ing('lime_juice', 0.5),
      garnish('lime', 'Lime wheel'),
    ],
    steps: [
      'Build Chartreuse, pineapple and lime in an ice-filled highball.',
      'Stir and garnish with a lime wheel.',
    ],
    recommendedBottles: [rec('green-chartreuse', 1, 'Nothing else tastes like it.')],
    relatedCocktailIds: ['chartreuse-swizzle', 'chartreuse-tonic', 'chartreuse-shot'],
    tags: ['chartreuse', 'herbal', 'pineapple', 'retro', 'ready-from-new-stock'],
    palette: { name: 'pale-chartreuse', hex: '#C9CF6A' },
  }),
  cocktail({
    id: 'nuclear-daiquiri',
    name: 'Nuclear Daiquiri',
    description:
      'Overproof rum and green Chartreuse in equal measure with lime and falernum. Bright green, very strong, and better balanced than it has any right to be.',
    history:
      'Gregor de Gruyther created it at LAB in London around 2005, built on Wray & Nephew white overproof. It has since become a bartenders’ shift drink.',
    origin: 'London',
    year: 2005,
    creator: 'Gregor de Gruyther',
    whyItWorks:
      'Two high-proof spirits with a lot of flavor cancel each other’s rough edges. Falernum’s clove and lime pull them toward a daiquiri.',
    classifications: ['modern-classic', 'sour'],
    cocktailFamily: 'Daiquiri',
    flavorProfiles: ['herbal', 'citrus', 'heat'],
    preparationTime: 3,
    strength: 'strong',
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Lime wheel'],
    ingredients: [
      ing('overproof_rum', 0.75),
      ing('green_chartreuse', 0.75),
      ing('falernum', 0.5),
      ing('lime_juice', 0.75),
    ],
    steps: [
      'Shake everything hard with ice.',
      'Fine-strain into a chilled coupe.',
      'Float a lime wheel.',
    ],
    techniqueNotes: [
      'Stroh 160 is 80% and spiced, hotter than Wray & Nephew’s 63%. Pour 0.5 oz Stroh and add 0.25 oz Bacardi to keep the balance.',
    ],
    recommendedBottles: [
      rec('green-chartreuse', 1, 'Half the drink.'),
      rec('stroh-160', 2, 'The overproof on the shelf; cut it back as noted.'),
      rec('bitter-truth-falernum', 3, 'Clove and lime binder.'),
    ],
    relatedCocktailIds: ['daiquiri', 'overproof-daiquiri', 'last-word'],
    tags: ['rum', 'chartreuse', 'overproof', 'modern-classic', 'ready-from-new-stock'],
    palette: { name: 'neon-chartreuse', hex: '#B9C94A' },
  }),
  cocktail({
    id: 'mezcal-last-word',
    name: 'Mezcal Last Word',
    description:
      'The Last Word with mezcal in place of gin: equal parts mezcal, green Chartreuse, maraschino and lime.',
    history:
      'The Last Word was revived by Murray Stenson in Seattle in 2004 and quickly became a template for equal-parts riffs. Swapping in mezcal is one of the most common.',
    origin: 'Modern cocktail bars',
    whyItWorks:
      'Smoke replaces juniper as the thing that keeps Chartreuse and maraschino from tasting sweet. The structure is identical, so it stays balanced.',
    classifications: ['modern', 'sour'],
    cocktailFamily: 'Last Word',
    flavorProfiles: ['smoky', 'herbal', 'citrus'],
    preparationTime: 3,
    strength: 'strong',
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: [],
    ingredients: [
      ing('mezcal', 0.75),
      ing('green_chartreuse', 0.75),
      ing('maraschino', 0.75),
      ing('lime_juice', 0.75),
    ],
    steps: ['Shake everything hard with ice.', 'Fine-strain into a chilled coupe.'],
    recommendedBottles: [
      rec('400-conejos-mezcal', 1, 'Moderate smoke that won’t bury the herbs.'),
      rec('green-chartreuse', 2, 'The anchor of every Last Word.'),
      rec('luxardo-maraschino', 3, 'Funky cherry sweetness.'),
    ],
    relatedCocktailIds: ['last-word', 'final-ward', 'naked-and-famous'],
    tags: ['mezcal', 'chartreuse', 'equal-parts', 'ready-from-new-stock'],
    palette: { name: 'pale-chartreuse', hex: '#C8CB82' },
  }),
  cocktail({
    id: 'chartreuse-tonic',
    name: 'Chartreuse Tonic',
    description: 'Green Chartreuse and tonic over ice with a lime wedge. The après-ski highball.',
    history:
      'A long-standing serve in the French Alps, where Chartreuse is made, and one the producer promotes as the easiest way into the bottle.',
    origin: 'French Alps',
    whyItWorks:
      'Quinine’s bitterness meets Chartreuse’s sweetness; the bubbles open up the herbs the way water opens up whisky.',
    classifications: ['highball'],
    cocktailFamily: 'Highball',
    flavorProfiles: ['herbal', 'bitter', 'bubbly'],
    preparationTime: 1,
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lime wedge'],
    ingredients: [
      ing('green_chartreuse', 1.5),
      ing('tonic_water', 4),
      garnish('lime', 'Lime wedge'),
    ],
    steps: ['Build Chartreuse and tonic in an ice-filled highball.', 'Squeeze in a lime wedge.'],
    recommendedBottles: [
      rec('green-chartreuse', 1, 'The whole drink.'),
      rec('fever-tree-tonic', 2, 'Clean quinine.'),
    ],
    relatedCocktailIds: ['swamp-water', 'chartreuse-shot', 'gin-and-tonic'],
    tags: ['chartreuse', 'herbal', 'highball', 'ready-from-new-stock'],
    palette: { name: 'pale-chartreuse', hex: '#D3D896' },
  }),

  // ── Disaronno / Irish cream ─────────────────────────────────────────────
  cocktail({
    id: 'italian-margarita',
    name: 'Italian Margarita',
    description:
      'A margarita with amaretto alongside the orange liqueur and a splash of orange juice. Rounder and nuttier than the classic.',
    history:
      'A chain-restaurant staple of the 1990s and 2000s; Olive Garden’s menu made the name famous.',
    origin: 'United States',
    whyItWorks:
      'Amaretto’s almond and apricot-kernel sweetness fills in where the agave is thin, and orange juice softens the lime.',
    classifications: ['modern', 'sour'],
    cocktailFamily: 'Margarita',
    flavorProfiles: ['almond', 'citrus', 'agave'],
    glassware: 'Rocks glass',
    ice: 'Cubed ice',
    garnish: ['Orange wheel', 'Salt rim (optional)'],
    ingredients: [
      ing('blanco_tequila', 1.5),
      ing('amaretto', 0.75),
      ing('cointreau', 0.5),
      ing('lime_juice', 1),
      ing('orange_juice', 0.5),
      garnish('orange', 'Orange wheel'),
      ing('salt', 1, 'pinch', { label: 'Salt rim', optional: true, scaleMode: 'garnish' }),
    ],
    steps: [
      'Salt half the rim of a rocks glass if you like and fill it with ice.',
      'Shake tequila, amaretto, Cointreau, lime and orange juice with ice.',
      'Strain over the fresh ice and garnish with an orange wheel.',
    ],
    recommendedBottles: [
      rec('disaronno', 1, 'The Italian half.'),
      rec('cointreau', 2, 'Dry orange backbone.'),
      rec('kirkland-cristalino', 3, 'Soft, slightly aged tequila that sits well with almond.'),
    ],
    relatedCocktailIds: ['margarita', 'amaretto-sour', 'cadillac-margarita'],
    tags: ['tequila', 'amaretto', 'margarita', 'popular', 'ready-from-new-stock'],
    palette: { name: 'amber-citrus', hex: '#E0B45A' },
  }),
  cocktail({
    id: 'amaretto-stone-sour',
    name: 'Amaretto Stone Sour',
    description:
      'Amaretto, orange juice and lemon over ice. The Amaretto Sour with orange juice standing in for some of the sweetener.',
    history:
      'A “stone sour” is any sour with orange juice added; the style was a 1970s and ’80s bar standby, and amaretto was its most popular base.',
    origin: 'United States',
    whyItWorks:
      'Orange juice makes the drink longer and fruitier without more sugar, so the almond reads as flavor, not sweetness.',
    classifications: ['retro', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['almond', 'citrus', 'orange'],
    glassware: 'Rocks glass',
    ice: 'Cubed ice',
    garnish: ['Orange wheel', 'Cocktail cherry'],
    ingredients: [
      ing('amaretto', 1.5),
      ing('orange_juice', 1),
      ing('lemon_juice', 0.75),
      ing('simple_syrup', 0.25),
      garnish('cocktail_cherry', 'Cocktail cherry'),
    ],
    steps: [
      'Shake amaretto, orange juice, lemon and simple syrup with ice.',
      'Strain over fresh ice in a rocks glass.',
      'Garnish with an orange wheel and a cherry.',
    ],
    recommendedBottles: [rec('disaronno', 1, 'The almond base.')],
    relatedCocktailIds: ['amaretto-sour', 'italian-margarita', 'bocce-ball'],
    tags: ['amaretto', 'sour', 'retro', 'ready-from-new-stock'],
    palette: { name: 'amber-citrus', hex: '#E3A84C' },
  }),
  cocktail({
    id: 'godchild',
    name: 'Godchild',
    description: 'Vodka, amaretto and cream shaken and served up. The creamy end of the Godfather family.',
    history:
      'Once the Godfather (Scotch and amaretto) and Godmother (vodka and amaretto) were standard in the 1970s, cream made the Godchild.',
    origin: 'United States',
    whyItWorks:
      'Cream turns amaretto’s marzipan note into something close to almond milk; vodka keeps it from being dessert alone.',
    classifications: ['retro', 'dessert'],
    cocktailFamily: 'Dessert',
    flavorProfiles: ['almond', 'creamy', 'sweet'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Fresh nutmeg'],
    ingredients: [ing('vodka', 1), ing('amaretto', 1), ing('heavy_cream', 1)],
    steps: [
      'Shake vodka, amaretto and cream hard with ice.',
      'Strain into a chilled coupe and grate nutmeg on top.',
    ],
    recommendedBottles: [
      rec('disaronno', 1, 'Almond and apricot-kernel.'),
      rec('titos', 2, 'Neutral base.'),
    ],
    relatedCocktailIds: ['godmother', 'godfather', 'toasted-almond', 'barbara'],
    seasonality: ['year-round', 'winter'],
    tags: ['vodka', 'amaretto', 'dessert', 'creamy', 'ready-from-new-stock'],
    palette: { name: 'almond-cream', hex: '#E6D3B4' },
  }),
  cocktail({
    id: 'italian-surfer',
    name: 'Italian Surfer',
    kind: 'shot',
    description: 'Amaretto, coconut rum and pineapple juice, shaken and strained into a shot glass.',
    history: 'A beach-bar shooter from the 1990s that also gets served long over ice.',
    origin: 'United States',
    whyItWorks: 'Almond, coconut and pineapple are a natural piña colada-adjacent trio.',
    classifications: ['shot'],
    cocktailFamily: 'Shot',
    flavorProfiles: ['almond', 'coconut', 'tropical'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Shot glass',
    ice: 'Shaken; up',
    garnish: [],
    ingredients: [
      ing('amaretto', 0.5),
      ing('coconut_rum', 0.5),
      ing('pineapple_juice', 0.75),
    ],
    steps: ['Shake everything with ice.', 'Strain into a shot glass.'],
    recommendedBottles: [
      rec('disaronno', 1, 'The almond.'),
      rec('toasted-coconut-rum', 2, 'The house coconut rum.'),
    ],
    relatedCocktailIds: ['pina-colada', 'bocce-ball', 'almond-joy'],
    tags: ['shot', 'amaretto', 'tropical', 'ready-from-new-stock'],
    palette: { name: 'pineapple-gold', hex: '#E8C866' },
  }),
  cocktail({
    id: 'orgasm-shot',
    name: 'Orgasm',
    kind: 'shot',
    description: 'Equal parts amaretto, coffee liqueur and Irish cream, shaken cold.',
    history:
      'A 1980s party shot. Add vodka and it becomes the Screaming Orgasm.',
    origin: 'United States',
    whyItWorks: 'Almond, coffee and cream: a tiramisu-ish dessert in one mouthful.',
    classifications: ['shot'],
    cocktailFamily: 'Shot',
    flavorProfiles: ['almond', 'coffee', 'creamy'],
    preparationTime: 2,
    strength: 'light',
    glassware: 'Shot glass',
    ice: 'Shaken; up',
    garnish: [],
    ingredients: [
      ing('amaretto', 0.5),
      ing('coffee_liqueur', 0.5),
      ing('baileys', 0.5),
    ],
    steps: ['Shake everything with ice.', 'Strain into a shot glass.'],
    recommendedBottles: [
      rec('disaronno', 1, 'Almond.'),
      rec('kahlua', 2, 'Coffee.'),
      rec('kirkland-irish-cream', 3, 'Cream.'),
    ],
    relatedCocktailIds: ['screaming-orgasm', 'mudslide-shot', 'nutty-irishman'],
    tags: ['shot', 'amaretto', 'creamy', 'party', 'ready-from-new-stock'],
    palette: { name: 'cafe-cream', hex: '#A88162' },
  }),

  // ── 400 Conejos ─────────────────────────────────────────────────────────
  cocktail({
    id: 'mezcal-mule',
    name: 'Mezcal Mule',
    description: 'Mezcal, lime and muddled cucumber topped with ginger beer.',
    history:
      'Jim Meehan’s version at PDT in New York, with passion fruit and agave, made it a modern classic. This one leaves out the passion fruit.',
    origin: 'New York',
    whyItWorks:
      'Ginger and smoke both read as heat; cucumber and lime cool them down. Mezcal gives the mule a savory floor vodka never could.',
    classifications: ['modern-classic', 'highball'],
    cocktailFamily: 'Mule',
    flavorProfiles: ['smoky', 'ginger', 'refreshing'],
    glassware: 'Copper mug',
    ice: 'Cubed ice',
    garnish: ['Cucumber slice', 'Lime wheel'],
    ingredients: [
      ing('mezcal', 1.5),
      ing('lime_juice', 0.75),
      ing('agave_syrup', 0.25),
      ing('cucumber', 2, 'piece', { label: 'Cucumber slices' }),
      ing('ginger_beer', 3),
    ],
    steps: [
      'Muddle two cucumber slices in a shaker.',
      'Add mezcal, lime and agave; shake with ice.',
      'Strain into an ice-filled mug and top with ginger beer.',
      'Garnish with cucumber and lime.',
    ],
    techniqueNotes: ['For the PDT version, add 0.75 oz passion fruit purée and drop the agave.'],
    recommendedBottles: [rec('400-conejos-mezcal', 1, 'Mixing mezcal with enough smoke to show through ginger.')],
    relatedCocktailIds: ['moscow-mule', 'mexican-mule', 'mezcal-paloma'],
    tags: ['mezcal', 'mule', 'ginger', 'ready-from-new-stock'],
    palette: { name: 'pale-ginger', hex: '#D9C99A' },
  }),
  cocktail({
    id: 'mezcal-paloma',
    name: 'Mezcal Paloma',
    description: 'Mezcal, lime and a pinch of salt topped with grapefruit soda over ice.',
    history:
      'The Paloma is Mexico’s everyday highball; swapping tequila for mezcal is how it is often poured in Oaxaca.',
    origin: 'Mexico',
    whyItWorks:
      'Grapefruit’s bitterness and smoke are an old pairing; salt makes both pop.',
    classifications: ['highball'],
    cocktailFamily: 'Highball',
    flavorProfiles: ['smoky', 'grapefruit', 'refreshing'],
    preparationTime: 2,
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lime wedge', 'Tajín rim (optional)'],
    ingredients: [
      ing('mezcal', 2),
      ing('lime_juice', 0.5),
      ing('salt', 1, 'pinch'),
      ing('grapefruit_soda', 4),
      ing('tajin', 1, 'pinch', { label: 'Tajín rim', optional: true, scaleMode: 'garnish' }),
    ],
    steps: [
      'Rim a highball with Tajín if you like and fill it with ice.',
      'Add mezcal, lime and salt, then top with grapefruit soda.',
      'Stir once and garnish with a lime wedge.',
    ],
    recommendedBottles: [rec('400-conejos-mezcal', 1, 'Smoke under grapefruit.'), rec('grapefruit-soda', 2, 'The top.')],
    relatedCocktailIds: ['paloma', 'tequila-paloma-fresh', 'mezcal-mule'],
    seasonality: ['spring', 'summer'],
    tags: ['mezcal', 'grapefruit', 'highball', 'ready-from-new-stock'],
    palette: { name: 'pink-grapefruit', hex: '#E8BFA8' },
  }),
  cocktail({
    id: 'tia-mia',
    name: 'Tia Mia',
    description:
      'Half a Mai Tai, half a mezcal drink: mezcal and Jamaican rum with orange curaçao, orgeat and lime over crushed ice.',
    history:
      'Ivy Mix’s Mai Tai riff from her time behind the bar at Lani Kai in New York. She later opened Leyenda in Brooklyn.',
    origin: 'New York',
    creator: 'Ivy Mix',
    whyItWorks:
      'Mezcal’s smoke stands in for the hogo of aged Jamaican rum, and the two together cover more ground than either one. Orgeat ties them to the citrus.',
    classifications: ['modern-classic', 'tiki'],
    cocktailFamily: 'Mai Tai',
    flavorProfiles: ['smoky', 'almond', 'citrus'],
    preparationTime: 4,
    strength: 'strong',
    glassware: 'Rocks glass',
    ice: 'Crushed ice',
    garnish: ['Lime wheel', 'Mint sprig'],
    ingredients: [
      ing('mezcal', 1),
      ing('jamaican_rum', 1, 'oz', { label: 'Aged Jamaican rum' }),
      ing('grand_marnier', 0.5, 'oz', { label: 'Orange curaçao' }),
      ing('orgeat', 0.75),
      ing('lime_juice', 0.75),
      garnish('mint', 'Mint sprig'),
    ],
    steps: [
      'Shake everything with a few cubes, briefly.',
      'Pour into a rocks glass and pack with crushed ice.',
      'Garnish with a lime wheel, and mint if you have it.',
    ],
    techniqueNotes: [
      'The original uses Appleton 12 and Pierre Ferrand Dry Curaçao. Myers’s is sweeter, so taste and add a little more lime if it runs rich.',
    ],
    recommendedBottles: [
      rec('400-conejos-mezcal', 1, 'The smoky half.'),
      rec('myers-dark-rum', 2, 'Jamaican molasses depth.'),
      rec('grand-marnier', 3, 'Cognac-based orange, closest to dry curaçao.'),
    ],
    relatedCocktailIds: ['mai-tai', 'division-bell', 'mezcal-last-word'],
    tags: ['mezcal', 'rum', 'tiki', 'modern-classic', 'ready-from-new-stock'],
    palette: { name: 'amber-orgeat', hex: '#D8A860' },
  }),
  cocktail({
    id: 'mezcal-con-naranja',
    name: 'Mezcal con Naranja',
    kind: 'shot',
    description:
      'A pour of mezcal sipped with orange slices dusted in chili salt. The Oaxacan way to drink it.',
    history:
      'In Oaxaca, mezcal comes with orange and sal de gusano (worm salt with chili). Tajín is the easy stand-in.',
    origin: 'Oaxaca, Mexico',
    whyItWorks:
      'Sweet orange and salty chili reset the palate between sips and pull fruit out of the smoke.',
    classifications: ['shot'],
    cocktailFamily: 'Shot',
    flavorProfiles: ['smoky', 'orange', 'heat'],
    preparationTime: 2,
    strength: 'spirit-forward',
    glassware: 'Shot glass',
    ice: 'None',
    garnish: ['Orange slices with Tajín'],
    ingredients: [
      ing('mezcal', 1.5),
      ing('orange', 2, 'piece', { label: 'Orange slices', scaleMode: 'linear' }),
      ing('tajin', 1, 'pinch', { label: 'Tajín (for the orange)' }),
    ],
    steps: [
      'Pour mezcal into a shot glass or small copita.',
      'Dust orange slices with Tajín and serve alongside.',
      'Sip, don’t shoot; bite the orange between sips.',
    ],
    recommendedBottles: [rec('400-conejos-mezcal', 1, 'Easygoing espadín.')],
    relatedCocktailIds: ['mexican-candy-shot', 'tequila-slammer', 'mezcal-paloma'],
    tags: ['shot', 'mezcal', 'neat', 'ready-from-new-stock'],
    palette: { name: 'clear-agave', hex: '#EDE6CF' },
  }),

  // ── Myers's ─────────────────────────────────────────────────────────────
  cocktail({
    id: 'navy-grog',
    name: 'Navy Grog',
    description:
      'Three rums with lime, grapefruit, honey and a splash of soda over crushed ice. Don the Beachcomber’s strong, dry tiki standard.',
    history:
      'Created by Donn Beach at Don the Beachcomber in Hollywood in the early 1940s, and later copied by Trader Vic. It was famously one of Richard Nixon’s favorite drinks.',
    origin: 'Hollywood, California',
    creator: 'Donn Beach',
    whyItWorks:
      'Honey and grapefruit are drier than the usual tiki sugar, so the three rums — dark, aged and light — come through.',
    classifications: ['classic', 'tiki'],
    cocktailFamily: 'Tiki',
    flavorProfiles: ['grapefruit', 'honey', 'tropical'],
    preparationTime: 4,
    strength: 'strong',
    glassware: 'Double old fashioned',
    ice: 'Crushed ice',
    garnish: ['Lime wheel'],
    ingredients: [
      ing('dark_rum', 1),
      ing('gold_rum', 1, 'oz', { label: 'Aged rum (stands in for Demerara)' }),
      ing('white_rum', 1),
      ing('lime_juice', 0.75),
      ing('grapefruit_juice', 0.75),
      ing('honey_syrup', 0.75),
      ing('club_soda', 1),
    ],
    steps: [
      'Shake everything except the soda with ice.',
      'Strain into a glass packed with crushed ice and top with soda.',
      'Garnish with a lime wheel.',
    ],
    techniqueNotes: [
      'The original calls for Demerara rum. Havana Club Especial is lighter, so the Myers’s does more of the heavy lifting here.',
    ],
    recommendedBottles: [
      rec('myers-dark-rum', 1, 'The Jamaican rum.'),
      rec('havana-club-especial', 2, 'Aged rum in place of Demerara.'),
      rec('bacardi-superior', 3, 'Light rum.'),
    ],
    relatedCocktailIds: ['zombie-house', 'planters-punch', 'jungle-bird'],
    tags: ['rum', 'tiki', 'classic', 'honey', 'ready-from-new-stock'],
    palette: { name: 'pale-gold', hex: '#D9B66A' },
  }),
  cocktail({
    id: 'bushwacker',
    name: 'Bushwacker',
    description:
      'Dark rum, coffee liqueur, crème de cacao, cream of coconut and cream blended with ice. A boozy milkshake from the Virgin Islands.',
    history:
      'Usually traced to the Ship’s Store at Sapphire Beach on St. Thomas in 1975. It became the signature drink of the Florida Panhandle’s beach bars soon after.',
    origin: 'St. Thomas, U.S. Virgin Islands',
    year: 1975,
    whyItWorks:
      'Coconut, coffee and chocolate are all at home with dark rum’s molasses. Blending with ice keeps it cold and light enough to drink.',
    classifications: ['classic', 'frozen', 'dessert'],
    cocktailFamily: 'Frozen',
    flavorProfiles: ['chocolate', 'coconut', 'creamy'],
    preparationTime: 5,
    glassware: 'Hurricane glass',
    ice: 'Blended',
    garnish: ['Fresh nutmeg'],
    ingredients: [
      ing('dark_rum', 1),
      ing('coffee_liqueur', 1),
      ing('creme_de_cacao', 0.75),
      ing('cream_of_coconut', 1.5),
      ing('heavy_cream', 1.5),
    ],
    steps: [
      'Blend everything with about a cup of ice until smooth.',
      'Pour into a hurricane glass and grate nutmeg over the top.',
    ],
    techniqueNotes: [
      'Many beach bars add 0.5 oz amaretto. Disaronno is on the shelf if you want it.',
      'Float 0.5 oz Myers’s on top for the Pensacola version.',
    ],
    recommendedBottles: [
      rec('myers-dark-rum', 1, 'Molasses depth under the chocolate.'),
      rec('kahlua', 2, 'Coffee.'),
      rec('creme-de-cacao', 3, 'Chocolate.'),
      rec('cream-of-coconut', 4, 'Coconut and body.'),
    ],
    relatedCocktailIds: ['mudslide', 'painkiller', 'pina-colada'],
    seasonality: ['summer'],
    tags: ['rum', 'frozen', 'dessert', 'coconut', 'ready-from-new-stock'],
    palette: { name: 'cafe-cream', hex: '#A88162' },
  }),
]

// ── Point existing recipes at the new bottles ─────────────────────────────

function readRecipe(id) {
  const file = path.join(cocktailsDir, `${id}.json`)
  if (!fs.existsSync(file)) throw new Error(`missing recipe ${id}`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

/** Insert a recommendation at `rank`, pushing later ranks down. No-op if present. */
function addRec(recipe, bottleId, rank, rationale) {
  if (recipe.recommendedBottles.some((r) => r.bottleId === bottleId)) return false
  const at = Math.min(rank, recipe.recommendedBottles.length + 1)
  for (const r of recipe.recommendedBottles) if (r.rank >= at) r.rank += 1
  recipe.recommendedBottles.push(rec(bottleId, at, rationale))
  recipe.recommendedBottles.sort((a, b) => a.rank - b.rank)
  return true
}

const uses = (recipe, ingredientId) => recipe.ingredients.some((line) => line.ingredientId === ingredientId)

const newIds = new Set(recipes.map((r) => r.id))
const existing = fs
  .readdirSync(cocktailsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .filter((id) => !newIds.has(id))

const touched = new Map()
const touch = (recipe) => touched.set(recipe.id, recipe)
const load = (id) => touched.get(id) ?? readRecipe(id)

for (const id of existing) {
  const recipe = load(id)
  let changed = false
  if (uses(recipe, 'amaretto')) changed = addRec(recipe, 'disaronno', 1, 'The amaretto on the shelf.') || changed
  if (uses(recipe, 'green_chartreuse')) changed = addRec(recipe, 'green-chartreuse', 1, 'The real thing; there is no substitute.') || changed
  if (uses(recipe, 'mezcal')) changed = addRec(recipe, '400-conejos-mezcal', 1, 'Espadín with moderate smoke.') || changed
  if (uses(recipe, 'baileys')) {
    const baileysRank = recipe.recommendedBottles.find((r) => r.bottleId === 'baileys')?.rank
    changed =
      addRec(recipe, 'kirkland-irish-cream', baileysRank ?? recipe.recommendedBottles.length + 1, 'The Irish cream in stock.') ||
      changed
  }
  if (changed) touch(recipe)
}

// Myers's is the classic Planter's Punch and a proper dark rum for the Stormy.
for (const [id, label] of [
  ['planters-punch', 'Dark Jamaican rum'],
  ['dark-n-stormy', 'Dark rum'],
]) {
  const recipe = load(id)
  const line = recipe.ingredients.find((l) => l.ingredientId === 'gold_rum')
  if (line) {
    line.ingredientId = 'dark_rum'
    line.label = label
    recipe.substitutions = [
      ...(recipe.substitutions ?? []).filter((s) => s.ingredientId !== 'dark_rum'),
      { ingredientId: 'dark_rum', alternatives: ['gold_rum'], notes: 'Aged gold rum makes a lighter, drier version.' },
    ]
  }
  addRec(recipe, 'myers-dark-rum', 1, id === 'planters-punch' ? 'Myers’s is the brand most associated with Planter’s Punch.' : 'Rich, dark molasses rum; Gosling’s is the trademarked original.')
  touch(recipe)
}

const myersRecs = {
  'jungle-bird': [1, 'The 1978 original used dark Jamaican rum; it stands up to Campari.'],
  painkiller: [1, 'Dark rum is the classic Painkiller base.'],
  'mai-tai': [2, 'Half an ounce floated on top for extra depth.'],
  'rum-swizzle': [2, 'Dark rum in place of Gosling’s.'],
  'hot-buttered-rum': [1, 'Molasses depth for a winter drink.'],
  'corn-n-oil': [1, 'Closest thing on the shelf to blackstrap.'],
  'kingston-negroni': [2, 'Jamaican, but molasses-rich rather than funky; a gentler Kingston Negroni.'],
  'bahama-mama': [2, 'Dark rum for the aged-rum half.'],
}
for (const [id, [rank, rationale]] of Object.entries(myersRecs)) {
  const recipe = load(id)
  if (addRec(recipe, 'myers-dark-rum', rank, rationale)) touch(recipe)
}

const fitzRecs = {
  'old-fashioned': [2, 'Wheated and 100 proof: soft but not thin.'],
  'whiskey-sour': [1, 'Bonded proof keeps the whiskey forward under lemon.'],
  'gold-rush': [2, 'Wheated bourbon and honey are a natural match.'],
  'mint-julep': [1, 'Wheated bonded bourbon is the julep standard.'],
  'brown-derby': [2, 'Soft wheat lets the grapefruit and honey through.'],
  'amaretto-sour': [2, 'Strong bonded bourbon for the float.'],
  boulevardier: [3, 'Enough proof to stand up to Campari.'],
}
for (const [id, [rank, rationale]] of Object.entries(fitzRecs)) {
  const recipe = load(id)
  if (addRec(recipe, 'old-fitzgerald-bib-7', rank, rationale)) touch(recipe)
}

// ── Write ─────────────────────────────────────────────────────────────────

const knownIngredients = new Set(ingredients.map((item) => item.id))
const knownBottles = new Set(bottles.map((item) => item.id))
const knownRecipes = new Set([...existing, ...newIds])

for (const recipe of [...recipes, ...touched.values()]) {
  for (const line of recipe.ingredients) {
    if (!knownIngredients.has(line.ingredientId)) {
      throw new Error(`${recipe.name}: unknown ingredient ${line.ingredientId}`)
    }
  }
  for (const r of recipe.recommendedBottles) {
    if (!knownBottles.has(r.bottleId)) throw new Error(`${recipe.name}: unknown bottle ${r.bottleId}`)
  }
  for (const related of recipe.relatedCocktailIds) {
    if (!knownRecipes.has(related)) throw new Error(`${recipe.name}: unknown related drink ${related}`)
  }
}

for (const recipe of [...recipes, ...touched.values()]) {
  fs.writeFileSync(path.join(cocktailsDir, `${recipe.id}.json`), `${JSON.stringify(recipe, null, 2)}\n`)
}
fs.writeFileSync(ingredientsPath, `${JSON.stringify(ingredients, null, 2)}\n`)
fs.writeFileSync(bottlesPath, `${JSON.stringify(bottles, null, 2)}\n`)
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`)

// ── Illustration manifest ─────────────────────────────────────────────────

const glassId = (glassware) => {
  const value = glassware.toLowerCase()
  if (value.includes('nick')) return 'nick-and-nora'
  if (value.includes('coupe')) return 'coupe'
  if (value.includes('hurricane')) return 'hurricane'
  if (value.includes('copper') || value.includes('mug')) return 'copper-mug'
  if (value.includes('shot')) return 'shot-glass'
  if (value.includes('collins')) return 'collins'
  if (value.includes('highball') || value.includes('tall')) return 'highball'
  if (value.includes('wine')) return 'wine'
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
manifest.generatedFrom = `${manifest.generatedFrom ?? 'catalog'}; 2026-10-24 bottle additions`
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(
  JSON.stringify(
    {
      ingredients: ingredients.length,
      bottles: bottles.length,
      inventory: inventory.length,
      recipesAdded: recipes.length,
      recipesUpdated: touched.size,
      cocktailCount: manifest.cocktailCount,
    },
    null,
    2,
  ),
)
