#!/usr/bin/env node
/**
 * Stock crème de cacao, blue curaçao, crème de noyaux, and sweet-and-sour mix,
 * then add the classics those bottles unlock.
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

const ingredientAdditions = [
  {
    id: 'blue_curacao',
    name: 'Blue curaçao',
    category: 'liqueur',
    subcategory: 'orange liqueur',
    aliases: ['blue curaçao', 'blue curacao', 'curaçao'],
    tags: ['orange', 'blue', 'citrus'],
  },
  {
    id: 'creme_de_noyaux',
    name: 'Crème de noyaux',
    category: 'liqueur',
    subcategory: 'almond liqueur',
    aliases: ['crème de noyeaux', 'noyaux', 'almond liqueur'],
    tags: ['almond', 'cherry-pit', 'pink'],
  },
  {
    id: 'sour_mix',
    name: 'Sweet and sour mix',
    category: 'mixer',
    subcategory: 'citrus mix',
    aliases: ['sour mix', 'sweet & sour', 'bar mix', 'lemon sour'],
    tags: ['citrus', 'sweet', 'mixer'],
  },
]

const ingredientIds = new Set(ingredients.map((item) => item.id))
for (const item of ingredientAdditions) {
  if (ingredientIds.has(item.id)) continue
  ingredients.push(item)
  ingredientIds.add(item.id)
}

const cacao = ingredients.find((item) => item.id === 'creme_de_cacao')
if (cacao) {
  const extraAliases = ['dark crème de cacao', 'chocolate liqueur']
  cacao.aliases = [...new Set([...(cacao.aliases ?? []), ...extraAliases])]
}

const bottleAdditions = [
  {
    id: 'creme-de-cacao',
    brand: 'House',
    productName: 'Crème de Cacao',
    ingredientIds: ['creme_de_cacao'],
    category: 'liqueur',
    subcategory: 'chocolate',
    tags: ['chocolate'],
  },
  {
    id: 'blue-curacao',
    brand: 'House',
    productName: 'Blue Curaçao',
    ingredientIds: ['blue_curacao'],
    category: 'liqueur',
    subcategory: 'orange',
    tags: ['orange', 'blue'],
  },
  {
    id: 'creme-de-noyaux',
    brand: 'House',
    productName: 'Crème de Noyaux',
    ingredientIds: ['creme_de_noyaux'],
    category: 'liqueur',
    subcategory: 'almond',
    tags: ['almond', 'pink'],
  },
  {
    id: 'sweet-and-sour-mix',
    brand: 'House',
    productName: 'Sweet and Sour Mix',
    ingredientIds: ['sour_mix'],
    category: 'mixer',
    subcategory: 'citrus',
    tags: ['citrus', 'mixer'],
    notes: 'Bar shortcut for lemon or lime plus sugar. Prefer fresh citrus when you have it.',
  },
]

const bottleIds = new Set(bottles.map((item) => item.id))
for (const bottle of bottleAdditions) {
  if (bottleIds.has(bottle.id)) continue
  bottles.push(bottle)
  bottleIds.add(bottle.id)
}

const inventoryAdditions = [
  {
    id: 'inv-creme-de-cacao',
    bottleId: 'creme-de-cacao',
    status: 'in_stock',
    brand: 'House',
    productName: 'Crème de Cacao',
    preferredForMixing: true,
    purchaseDate: '2026-09-06',
    tags: ['chocolate'],
    notes: 'Purchased 2026-09-06.',
  },
  {
    id: 'inv-blue-curacao',
    bottleId: 'blue-curacao',
    status: 'in_stock',
    brand: 'House',
    productName: 'Blue Curaçao',
    preferredForMixing: true,
    purchaseDate: '2026-09-06',
    tags: ['orange', 'blue'],
    notes: 'Purchased 2026-09-06.',
  },
  {
    id: 'inv-creme-de-noyaux',
    bottleId: 'creme-de-noyaux',
    status: 'in_stock',
    brand: 'House',
    productName: 'Crème de Noyaux',
    preferredForMixing: true,
    purchaseDate: '2026-09-06',
    tags: ['almond'],
    notes: 'Purchased 2026-09-06.',
  },
  {
    id: 'inv-sweet-and-sour-mix',
    bottleId: 'sweet-and-sour-mix',
    status: 'in_stock',
    brand: 'House',
    productName: 'Sweet and Sour Mix',
    preferredForMixing: true,
    purchaseDate: '2026-09-06',
    tags: ['citrus', 'mixer'],
    notes: 'Purchased 2026-09-06. Use for bar-style sours; fresh lemon or lime plus simple is still better when fruit is on hand.',
  },
]

const inventoryIds = new Set(inventory.map((item) => item.id))
for (const item of inventoryAdditions) {
  if (inventoryIds.has(item.id)) continue
  inventory.push(item)
  inventoryIds.add(item.id)
}

const ing = (ingredientId, amount, unit = 'oz', extra = {}) => ({
  ingredientId,
  amount,
  unit,
  scaleMode: extra.scaleMode ?? (unit === 'dashes' || unit === 'dash' ? 'fixed' : 'linear'),
  ...extra,
})

const rec = (bottleId, rank, rationale) => ({ bottleId, rank, rationale })

function cocktail(spec) {
  return {
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
}

const recipes = [
  cocktail({
    id: 'grasshopper',
    name: 'Grasshopper',
    description:
      'Mint, chocolate, and cream in equal parts—the after-dinner classic, built here with peppermint liqueur and Baileys.',
    history:
      'Usually credited to Tujague’s in New Orleans and popularized as a mid-century dessert cocktail. The classic is equal parts green crème de menthe, white crème de cacao, and cream.',
    origin: 'New Orleans',
    whyItWorks:
      'Mint cools chocolate sweetness; cream (or Irish cream) turns the pair into a drinkable after-dinner mint.',
    classifications: ['classic', 'dessert'],
    cocktailFamily: 'Dessert',
    flavorProfiles: ['mint', 'chocolate', 'creamy'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Fresh mint or grated chocolate'],
    ingredients: [
      ing('peppermint_liqueur', 1),
      ing('creme_de_cacao', 1),
      ing('baileys', 1, 'oz', { label: 'Baileys (cream stand-in)' }),
    ],
    steps: [
      'Shake peppermint liqueur, crème de cacao, and Baileys hard with ice.',
      'Fine-strain into a chilled coupe.',
      'Garnish with mint or a little grated chocolate if you have it.',
    ],
    techniqueNotes: [
      'Berliner Luft or Božkov peppermint stands in for green crème de menthe—expect a cooler, less herbal mint.',
      'If you buy heavy cream later, shake 1 oz cream instead of Baileys for the textbook version.',
    ],
    recommendedBottles: [
      rec('berliner-luft', 1, 'Cool peppermint in place of crème de menthe.'),
      rec('creme-de-cacao', 2, 'The chocolate half of the classic.'),
      rec('baileys', 3, 'Cream and sweetness when dairy is out.'),
      rec('bozkov-peppermint', 4, 'Backup mint liqueur from the same shelf.'),
    ],
    substitutions: [
      {
        ingredientId: 'baileys',
        alternatives: ['heavy_cream'],
        notes: 'Fresh cream is the original; Baileys makes a richer, sweeter house version.',
      },
    ],
    variations: [
      {
        id: 'after-dinner-mint',
        name: 'After Dinner Mint',
        notes: 'Skip the cacao and keep Baileys with peppermint.',
        relatedCocktailId: 'after-dinner-mint',
      },
    ],
    relatedCocktailIds: [
      'after-dinner-mint',
      'peppermint-patty',
      'alexander',
      'bourbon-alexander',
      'pink-squirrel',
    ],
    seasonality: ['year-round', 'winter'],
    tags: ['dessert', 'mint', 'chocolate', 'classic', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'bourbon-alexander',
    name: 'Bourbon Alexander',
    aliases: ['House Alexander'],
    description:
      'An Alexander you can make tonight: bourbon, crème de cacao, and Baileys in place of cognac and cream.',
    history:
      'The Alexander family starts as a gin or brandy cream drink from the early 20th century. This house version keeps the chocolate-and-cream shape and uses the whiskey already on the bar.',
    origin: 'House adaptation',
    whyItWorks:
      'Bourbon’s vanilla and oak sit naturally under chocolate; Irish cream supplies the dairy texture the classic gets from heavy cream.',
    classifications: ['modern', 'dessert'],
    cocktailFamily: 'Alexander',
    flavorProfiles: ['chocolate', 'oak', 'creamy'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Fresh nutmeg'],
    ingredients: [
      ing('bourbon', 1),
      ing('creme_de_cacao', 1),
      ing('baileys', 1),
    ],
    steps: [
      'Shake bourbon, crème de cacao, and Baileys hard with ice.',
      'Fine-strain into a chilled coupe.',
      'Grate nutmeg over the surface.',
    ],
    techniqueNotes: [
      'Eagle Rare or Penelope Architect stay polite under chocolate; a cask-strength pour will dominate.',
    ],
    recommendedBottles: [
      rec('eagle-rare', 1, 'Softer fruit and vanilla under cacao.'),
      rec('penelope-architect', 2, 'Polished oak for a dessert Old Fashioned energy.'),
      rec('creme-de-cacao', 3, 'Equal-parts chocolate.'),
      rec('baileys', 4, 'Cream stand-in from the shelf.'),
    ],
    substitutions: [
      {
        ingredientId: 'bourbon',
        alternatives: ['cognac', 'rye'],
        notes: 'Cognac is the Brandy Alexander; rye is drier and spicier.',
      },
    ],
    relatedCocktailIds: ['alexander', 'barbara', 'grasshopper', 'chocolate-old-fashioned'],
    tags: ['dessert', 'whiskey', 'chocolate', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'barbara',
    name: 'Barbara',
    aliases: ['Vodka Alexander'],
    description: 'The vodka Alexander—cacao and cream with a clean spirit base.',
    history:
      'A mid-century Alexander variation that swaps brandy or gin for vodka. Same dessert structure, lighter aroma.',
    origin: 'United States',
    whyItWorks:
      'Neutral vodka lets chocolate and cream lead. Baileys covers the cream when dairy is out.',
    classifications: ['classic', 'dessert'],
    cocktailFamily: 'Alexander',
    flavorProfiles: ['chocolate', 'creamy', 'sweet'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Fresh nutmeg'],
    ingredients: [
      ing('vodka', 1),
      ing('creme_de_cacao', 1),
      ing('baileys', 1, 'oz', { label: 'Baileys (cream stand-in)' }),
    ],
    steps: [
      'Shake vodka, crème de cacao, and Baileys with ice.',
      'Fine-strain into a chilled coupe.',
      'Grate nutmeg on top.',
    ],
    recommendedBottles: [
      rec('titos', 1, 'Neutral vodka for a dessert Alexander.'),
      rec('creme-de-cacao', 2, 'Chocolate body.'),
      rec('baileys', 3, 'Cream and sweetness.'),
    ],
    substitutions: [
      {
        ingredientId: 'baileys',
        alternatives: ['heavy_cream'],
        notes: 'Use cream for a lighter, less sweet Barbara.',
      },
    ],
    relatedCocktailIds: ['alexander', 'bourbon-alexander', 'chocolate-martini', 'grasshopper'],
    tags: ['dessert', 'vodka', 'chocolate', 'classic', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'chocolate-martini',
    name: 'Chocolate Martini',
    description: 'Vodka and crème de cacao, shaken cold, with a little orange liqueur for lift.',
    history:
      'A 1990s dessert-martini standard rather than a pre-Prohibition classic. Keep the cacao in check so it drinks like a cocktail, not syrup.',
    origin: 'United States',
    whyItWorks:
      'Vodka carries chocolate; a small orange-liqueur dose brightens the finish so the drink does not collapse into candy.',
    classifications: ['modern', 'dessert'],
    cocktailFamily: 'Martini',
    flavorProfiles: ['chocolate', 'sweet', 'orange'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Chocolate shavings or orange twist'],
    ingredients: [
      ing('vodka', 1.5),
      ing('creme_de_cacao', 1),
      ing('cointreau', 0.25),
    ],
    steps: [
      'Shake vodka, crème de cacao, and Cointreau hard with ice.',
      'Fine-strain into a chilled coupe.',
      'Garnish with chocolate or an orange twist.',
    ],
    techniqueNotes: [
      'For a creamier pour, add 0.5 oz Baileys and shake again.',
    ],
    recommendedBottles: [
      rec('titos', 1, 'Clean vodka under chocolate.'),
      rec('creme-de-cacao', 2, 'The drink’s reason for being.'),
      rec('cointreau', 3, 'A thin orange edge keeps it from tasting flat.'),
    ],
    relatedCocktailIds: ['barbara', 'bourbon-alexander', 'grasshopper'],
    seasonality: ['year-round', 'winter'],
    tags: ['dessert', 'vodka', 'chocolate', 'modern', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'chocolate-old-fashioned',
    name: 'Chocolate Old Fashioned',
    description: 'Bourbon Old Fashioned sweetened with crème de cacao and finished with cocoa bitters.',
    history:
      'A house dessert Old Fashioned using the new cacao bottle and the Angostura cocoa bitters already on the shelf.',
    origin: 'House adaptation',
    whyItWorks:
      'A small cacao dose replaces some sugar; cocoa bitters echo the chocolate without turning the drink into a dessert shot.',
    classifications: ['modern', 'spirit-forward'],
    cocktailFamily: 'Old Fashioned',
    flavorProfiles: ['chocolate', 'oak', 'bittersweet'],
    strength: 'spirit-forward',
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Orange twist'],
    ingredients: [
      ing('bourbon', 2),
      ing('creme_de_cacao', 0.25),
      ing('cocoa_bitters', 2, 'dashes'),
      ing('angostura_bitters', 1, 'dash', { optional: true }),
    ],
    steps: [
      'Stir bourbon, crème de cacao, and bitters with ice until cold.',
      'Strain over a large cube.',
      'Express an orange twist over the drink.',
    ],
    techniqueNotes: [
      'If the cacao is very sweet, drop to a barspoon and add a dash more bitters.',
    ],
    recommendedBottles: [
      rec('russells-reserve-10', 1, 'Balanced oak that can take chocolate.'),
      rec('woodford-reserve', 2, 'Familiar spice beside cacao.'),
      rec('angostura-cocoa', 3, 'Cocoa bitters keep the drink bitter-chocolate, not candy.'),
      rec('creme-de-cacao', 4, 'Just enough to sweeten and scent.'),
    ],
    relatedCocktailIds: ['old-fashioned', 'banana-old-fashioned', 'bourbon-alexander', 'noyaux-old-fashioned'],
    tags: ['whiskey', 'chocolate', 'spirit-forward', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'twentieth-century',
    name: 'Twentieth Century',
    aliases: ['20th Century'],
    description:
      'Gin, dry vermouth, crème de cacao, and lemon—a bright, surprising classic from the 1930s.',
    history:
      'Created by British bartender C.A. Tuck and published in 1937, named for the 20th Century Limited train. The original uses Lillet Blanc; dry vermouth is the house stand-in.',
    origin: 'United Kingdom',
    year: 1937,
    creator: 'C.A. Tuck',
    whyItWorks:
      'Lemon keeps chocolate from reading as dessert; gin botanicals and vermouth stop the cacao from turning the drink into candy.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['citrus', 'chocolate', 'botanical'],
    difficulty: 'medium',
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Lemon twist'],
    ingredients: [
      ing('gin', 1.5),
      ing('dry_vermouth', 0.75, 'oz', { label: 'Dry vermouth (Lillet stand-in)' }),
      ing('creme_de_cacao', 0.75),
      ing('lemon_juice', 0.75),
    ],
    steps: [
      'Shake gin, dry vermouth, crème de cacao, and lemon with ice.',
      'Fine-strain into a chilled coupe.',
      'Express a lemon twist.',
    ],
    techniqueNotes: [
      'If you later add Lillet Blanc, use it in place of dry vermouth for the original recipe.',
      'White cacao keeps the drink pale; dark cacao tastes similar but looks brown.',
    ],
    recommendedBottles: [
      rec('drumshanbo-gunpowder', 1, 'Citrus-forward gin that can stand up to cacao.'),
      rec('hendricks', 2, 'Softer floral gin for a gentler version.'),
      rec('dry-vermouth', 3, 'Lillet stand-in from the current shelf.'),
      rec('creme-de-cacao', 4, 'The unexpected chocolate note.'),
    ],
    substitutions: [
      {
        ingredientId: 'lemon_juice',
        alternatives: ['sour_mix'],
        notes: 'Sour mix works in a pinch; use 0.75 oz and skip any extra sugar.',
      },
    ],
    relatedCocktailIds: ['alexander', 'white-lady', 'chocolate-martini'],
    tags: ['classic', 'gin', 'chocolate', 'citrus', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'blue-hawaiian',
    name: 'Blue Hawaiian',
    description:
      'Rum, blue curaçao, pineapple, and cream of coconut—the turquoise colada Harry Yee built in Waikiki.',
    history:
      'Harry Yee at the Hilton Hawaiian Village created the Blue Hawaiian in 1957 after a curaçao salesman asked for a drink that showed the liqueur’s color. It is the coconut colada cousin of the Blue Hawaii.',
    origin: 'Honolulu',
    year: 1957,
    creator: 'Harry Yee',
    whyItWorks:
      'Coconut fat and pineapple acid need rum underneath; blue curaçao supplies orange sweetness and the color the drink is named for.',
    classifications: ['classic', 'tiki'],
    cocktailFamily: 'Colada',
    flavorProfiles: ['tropical', 'coconut', 'citrus'],
    glassware: 'Hurricane or tall glass',
    ice: 'Crushed or blended',
    garnish: ['Pineapple wedge', 'Cocktail cherry'],
    ingredients: [
      ing('white_rum', 1.5),
      ing('blue_curacao', 0.75),
      ing('pineapple_juice', 2),
      ing('cream_of_coconut', 1),
    ],
    steps: [
      'Shake rum, blue curaçao, pineapple, and cream of coconut hard with ice, or blend with crushed ice.',
      'Pour into a tall glass.',
      'Garnish with pineapple and a cherry.',
    ],
    techniqueNotes: [
      'Toasted coconut rum can replace part of the white rum if you want extra coconut.',
    ],
    recommendedBottles: [
      rec('havana-club-3', 1, 'Clean rum under coconut and pineapple.'),
      rec('blue-curacao', 2, 'Color and orange sweetness.'),
      rec('toasted-coconut-rum', 3, 'Optional extra coconut in place of some white rum.'),
      rec('cream-of-coconut', 4, 'The colada texture.'),
    ],
    relatedCocktailIds: ['pina-colada', 'blue-hawaii', 'swimming-pool', 'toasted-coconut-colada-rocks'],
    seasonality: ['summer', 'year-round'],
    tags: ['tiki', 'rum', 'tropical', 'classic', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'blue-hawaii',
    name: 'Blue Hawaii',
    description:
      'Rum, vodka, blue curaçao, pineapple, and sour mix—Harry Yee’s other 1957 turquoise highball, without coconut.',
    history:
      'Also created by Harry Yee in Waikiki in 1957. Often confused with the Blue Hawaiian; this one is a sour-and-pineapple highball, not a colada.',
    origin: 'Honolulu',
    year: 1957,
    creator: 'Harry Yee',
    whyItWorks:
      'Sour mix and pineapple keep the curaçao from tasting like orange candy; rum and vodka split the base so the drink stays light and long.',
    classifications: ['classic', 'tiki'],
    cocktailFamily: 'Tiki',
    flavorProfiles: ['tropical', 'citrus', 'pineapple'],
    glassware: 'Hurricane or tall glass',
    ice: 'Cubed or crushed ice',
    garnish: ['Pineapple wedge', 'Cocktail cherry'],
    ingredients: [
      ing('white_rum', 0.75),
      ing('vodka', 0.75),
      ing('blue_curacao', 0.75),
      ing('pineapple_juice', 3),
      ing('sour_mix', 1),
    ],
    steps: [
      'Shake rum, vodka, blue curaçao, pineapple, and sour mix with ice.',
      'Strain into a tall glass over fresh ice.',
      'Garnish with pineapple and a cherry.',
    ],
    recommendedBottles: [
      rec('havana-club-3', 1, 'White rum half of the split base.'),
      rec('titos', 2, 'Neutral vodka half.'),
      rec('blue-curacao', 3, 'The turquoise and the orange.'),
      rec('sweet-and-sour-mix', 4, 'The citrus the original called for.'),
    ],
    substitutions: [
      {
        ingredientId: 'sour_mix',
        alternatives: ['lemon_juice'],
        notes: 'If using fresh lemon, add 0.75 oz lemon and 0.25 oz simple syrup.',
      },
    ],
    relatedCocktailIds: ['blue-hawaiian', 'blue-lagoon', 'pina-colada', 'swimming-pool'],
    seasonality: ['summer', 'year-round'],
    tags: ['tiki', 'rum', 'vodka', 'tropical', 'classic', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'blue-lagoon',
    name: 'Blue Lagoon',
    description: 'Vodka, blue curaçao, and sweet-and-sour lengthened with soda—bright, cold, and unapologetically blue.',
    history:
      'Usually credited to Andy MacElhone at Harry’s New York Bar in Paris in the 1960s or 1970s, as a vodka-and-curaçao lemonade.',
    origin: 'Paris',
    whyItWorks:
      'Sour mix plays the lemonade role; soda keeps the orange liqueur from becoming sticky. Vodka stays out of the way.',
    classifications: ['classic', 'highball'],
    cocktailFamily: 'Highball',
    flavorProfiles: ['citrus', 'orange', 'refreshing'],
    strength: 'light',
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lemon wheel', 'Cocktail cherry'],
    ingredients: [
      ing('vodka', 1.5),
      ing('blue_curacao', 1),
      ing('sour_mix', 1.5),
      ing('club_soda', null, 'top', { scaleMode: 'top' }),
    ],
    steps: [
      'Shake vodka, blue curaçao, and sour mix with ice.',
      'Strain into an ice-filled highball.',
      'Top with club soda and garnish.',
    ],
    recommendedBottles: [
      rec('titos', 1, 'Neutral vodka.'),
      rec('blue-curacao', 2, 'Color and orange.'),
      rec('sweet-and-sour-mix', 3, 'The lemonade stand-in.'),
      rec('fever-tree-soda', 4, 'Keeps the drink long and cold.'),
    ],
    relatedCocktailIds: ['blue-hawaii', 'blue-kamikaze', 'adios-motherfucker'],
    seasonality: ['summer', 'year-round'],
    tags: ['vodka', 'highball', 'citrus', 'classic', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'blue-margarita',
    name: 'Blue Margarita',
    description: 'A Margarita that uses blue curaçao for the orange liqueur—same bones, different color.',
    history:
      'A late-20th-century color variation on the Margarita. Sour mix makes a bar-style version you can pour without juicing limes.',
    origin: 'United States',
    whyItWorks:
      'Curaçao is an orange liqueur, so it can take Cointreau’s job. Sour mix supplies lime-and-sugar in one bottle; salt still helps.',
    classifications: ['modern', 'sour'],
    cocktailFamily: 'Margarita',
    flavorProfiles: ['agave', 'citrus', 'orange'],
    glassware: 'Coupe or rocks glass',
    ice: 'Shaken; up or over ice',
    garnish: ['Lime wheel', 'Optional salt rim'],
    ingredients: [
      ing('blanco_tequila', 2),
      ing('blue_curacao', 1),
      ing('sour_mix', 1),
    ],
    steps: [
      'Salt the rim if you want it.',
      'Shake tequila, blue curaçao, and sour mix with ice.',
      'Strain up or over fresh ice and garnish.',
    ],
    techniqueNotes: [
      'For a fresher drink, use 1 oz lime juice and 0.25 oz simple instead of sour mix.',
    ],
    recommendedBottles: [
      rec('kirkland-cristalino', 1, 'Smooth tequila under curaçao.'),
      rec('blue-curacao', 2, 'Orange liqueur and the blue.'),
      rec('sweet-and-sour-mix', 3, 'Bar-style citrus and sugar.'),
    ],
    substitutions: [
      {
        ingredientId: 'sour_mix',
        alternatives: ['lime_juice'],
        notes: 'Fresh lime plus a little simple syrup is the better Margarita.',
      },
    ],
    relatedCocktailIds: ['margarita', 'bar-margarita', 'blue-kamikaze', 'kamikaze'],
    seasonality: ['summer', 'year-round'],
    tags: ['tequila', 'margarita', 'citrus', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'blue-kamikaze',
    name: 'Blue Kamikaze',
    description: 'Vodka, blue curaçao, and sour mix—the Kamikaze in color.',
    history:
      'A bar-menu color swap on the 1970s Kamikaze (vodka, orange liqueur, lime). Sour mix stands in for fresh lime.',
    origin: 'United States',
    whyItWorks:
      'Equal-parts sour structure: spirit, orange liqueur, citrus. Blue curaçao is the orange liqueur.',
    classifications: ['modern', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['citrus', 'orange', 'sharp'],
    glassware: 'Coupe or shot',
    ice: 'Shaken; up',
    garnish: ['Lime wheel'],
    ingredients: [
      ing('vodka', 1),
      ing('blue_curacao', 1),
      ing('sour_mix', 1),
    ],
    steps: [
      'Shake equal parts with ice.',
      'Strain into a chilled coupe, or serve as a short shot.',
    ],
    recommendedBottles: [
      rec('titos', 1, 'Neutral vodka.'),
      rec('blue-curacao', 2, 'Orange liqueur and color.'),
      rec('sweet-and-sour-mix', 3, 'Lime-and-sugar in one pour.'),
    ],
    relatedCocktailIds: ['kamikaze', 'blue-lagoon', 'blue-margarita'],
    tags: ['vodka', 'sour', 'equal-parts', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'swimming-pool',
    name: 'Swimming Pool',
    description:
      'Vodka, rum, blue curaçao, pineapple, and coconut—a disco-era colada that looks like pool water.',
    history:
      'A German nightclub drink from the early 1980s, close to a Blue Hawaiian with vodka in the mix. Serve tall and cold.',
    origin: 'Germany',
    whyItWorks:
      'Vodka thins the rum-and-coconut mix so the drink stays light; pineapple acid and curaçao keep it from tasting like sunscreen.',
    classifications: ['modern', 'tiki'],
    cocktailFamily: 'Colada',
    flavorProfiles: ['tropical', 'coconut', 'citrus'],
    glassware: 'Hurricane or tall glass',
    ice: 'Crushed or blended',
    garnish: ['Pineapple wedge'],
    ingredients: [
      ing('vodka', 1),
      ing('white_rum', 0.5),
      ing('blue_curacao', 0.5),
      ing('pineapple_juice', 2),
      ing('cream_of_coconut', 1),
    ],
    steps: [
      'Shake or blend everything with ice.',
      'Pour tall and garnish.',
    ],
    recommendedBottles: [
      rec('titos', 1, 'Vodka keeps the colada from getting heavy.'),
      rec('havana-club-3', 2, 'A little rum for cane character.'),
      rec('blue-curacao', 3, 'Pool-water color.'),
      rec('cream-of-coconut', 4, 'Colada texture.'),
    ],
    relatedCocktailIds: ['blue-hawaiian', 'pina-colada', 'blue-hawaii'],
    seasonality: ['summer', 'year-round'],
    tags: ['tiki', 'vodka', 'rum', 'tropical', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'pink-squirrel',
    name: 'Pink Squirrel',
    description:
      'Crème de noyaux, crème de cacao, and cream—the Milwaukee dessert classic, built with Baileys tonight.',
    history:
      'Credited to Bryant’s Cocktail Lounge in Milwaukee in the 1940s. The original is equal parts crème de noyaux, white crème de cacao, and cream. Noyaux is almond-and-stone-fruit, not cherry syrup.',
    origin: 'Milwaukee',
    whyItWorks:
      'Noyaux’s almond-cherry-pit note is the pink half; cacao is the chocolate half; cream (or Baileys) binds them into a grasshopper cousin.',
    classifications: ['classic', 'dessert'],
    cocktailFamily: 'Dessert',
    flavorProfiles: ['almond', 'chocolate', 'creamy'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Fresh nutmeg'],
    ingredients: [
      ing('creme_de_noyaux', 1),
      ing('creme_de_cacao', 1),
      ing('baileys', 1, 'oz', { label: 'Baileys (cream stand-in)' }),
    ],
    steps: [
      'Shake crème de noyaux, crème de cacao, and Baileys hard with ice.',
      'Fine-strain into a chilled coupe.',
      'Grate nutmeg over the top.',
    ],
    techniqueNotes: [
      'If you later stock heavy cream, use 1 oz cream instead of Baileys for the original.',
    ],
    recommendedBottles: [
      rec('creme-de-noyaux', 1, 'The almond-pink bottle the drink is named around.'),
      rec('creme-de-cacao', 2, 'Chocolate partner.'),
      rec('baileys', 3, 'Cream stand-in from the current bar.'),
    ],
    substitutions: [
      {
        ingredientId: 'baileys',
        alternatives: ['heavy_cream'],
        notes: 'Fresh cream is traditional and a little less sweet.',
      },
    ],
    relatedCocktailIds: ['grasshopper', 'alexander', 'almond-joy', 'bourbon-alexander'],
    seasonality: ['year-round', 'winter'],
    tags: ['dessert', 'almond', 'chocolate', 'classic', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'noyaux-rose',
    name: 'Noyaux Rose',
    aliases: ['Rose'],
    description:
      'Gin, dry vermouth, and crème de noyaux—a pale pink aperitif in the Rose-cocktail family.',
    history:
      'Several drinks have been called Rose. This house version follows the gin–vermouth–stone-fruit pattern, using crème de noyaux in place of kirsch or raspberry.',
    origin: 'House adaptation',
    whyItWorks:
      'Dry vermouth keeps almond sweetness in the aperitif range; gin botanicals stop noyaux from tasting like candy.',
    classifications: ['modern', 'aperitif'],
    cocktailFamily: 'Martini',
    flavorProfiles: ['almond', 'botanical', 'dry'],
    strength: 'strong',
    glassware: 'Nick & Nora',
    ice: 'Stirred; up',
    garnish: ['Lemon twist'],
    ingredients: [
      ing('gin', 1.5),
      ing('dry_vermouth', 1.5),
      ing('creme_de_noyaux', 0.5),
    ],
    steps: [
      'Stir gin, dry vermouth, and crème de noyaux with ice until cold.',
      'Strain into a chilled Nick & Nora or coupe.',
      'Express a lemon twist.',
    ],
    recommendedBottles: [
      rec('malfy-originale', 1, 'Clean gin that leaves room for almond.'),
      rec('hendricks', 2, 'Softer floral gin beside noyaux.'),
      rec('dry-vermouth', 3, 'The dry half of the Rose.'),
      rec('creme-de-noyaux', 4, 'Pink color and almond aroma.'),
    ],
    relatedCocktailIds: ['martini', 'pink-squirrel', 'noyaux-old-fashioned'],
    tags: ['gin', 'aperitif', 'almond', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'almond-joy',
    name: 'Almond Joy',
    description:
      'Coconut rum, crème de cacao, and crème de noyaux—the candy bar as a short dessert drink.',
    history:
      'A house candy-bar riff using toasted coconut rum plus the new cacao and noyaux bottles. Not a historic classic; it drinks like an Almond Joy.',
    origin: 'House adaptation',
    whyItWorks:
      'Coconut, chocolate, and almond are the candy’s three notes. Keep the pour short so it stays a digestif, not a milkshake.',
    classifications: ['modern', 'dessert'],
    cocktailFamily: 'Dessert',
    flavorProfiles: ['coconut', 'chocolate', 'almond'],
    glassware: 'Rocks or coupe',
    ice: 'Shaken; up or over ice',
    garnish: [],
    ingredients: [
      ing('coconut_rum', 1.5),
      ing('creme_de_cacao', 0.75),
      ing('creme_de_noyaux', 0.5),
    ],
    steps: [
      'Shake coconut rum, crème de cacao, and crème de noyaux with ice.',
      'Strain into a rocks glass over ice, or up into a coupe.',
    ],
    recommendedBottles: [
      rec('toasted-coconut-rum', 1, 'The coconut half of the candy bar.'),
      rec('creme-de-cacao', 2, 'Chocolate.'),
      rec('creme-de-noyaux', 3, 'Almond.'),
    ],
    relatedCocktailIds: ['pink-squirrel', 'toasted-coconut-colada-rocks', 'banshee'],
    tags: ['dessert', 'coconut', 'chocolate', 'almond', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'noyaux-old-fashioned',
    name: 'Noyaux Old Fashioned',
    description: 'Bourbon Old Fashioned sweetened with crème de noyaux instead of sugar.',
    history:
      'A house spirit-forward use for the new almond bottle. A barspoon is enough—noyaux is sweet and aromatic.',
    origin: 'House adaptation',
    whyItWorks:
      'Almond and cherry-pit notes sit next to bourbon the way amaretto does, but with a pink tint and less pastry sweetness.',
    classifications: ['modern', 'spirit-forward'],
    cocktailFamily: 'Old Fashioned',
    flavorProfiles: ['almond', 'oak', 'bittersweet'],
    strength: 'spirit-forward',
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Orange twist', 'Cocktail cherry'],
    ingredients: [
      ing('bourbon', 2),
      ing('creme_de_noyaux', 0.25),
      ing('angostura_bitters', 2, 'dashes'),
    ],
    steps: [
      'Stir bourbon, crème de noyaux, and bitters with ice.',
      'Strain over a large cube.',
      'Garnish with orange and a cherry.',
    ],
    recommendedBottles: [
      rec('eagle-rare', 1, 'Fruit-forward bourbon beside almond.'),
      rec('russells-reserve-10', 2, 'Drier oak if the noyaux reads sweet.'),
      rec('creme-de-noyaux', 3, 'A barspoon-plus of almond sweetness.'),
    ],
    relatedCocktailIds: ['old-fashioned', 'chocolate-old-fashioned', 'banana-old-fashioned', 'noyaux-rose'],
    tags: ['whiskey', 'almond', 'spirit-forward', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'bar-whiskey-sour',
    name: 'Whiskey Sour (Sour Mix)',
    aliases: ['Bar Whiskey Sour'],
    description:
      'Bourbon and sweet-and-sour mix—the weeknight sour when you do not want to juice lemons.',
    history:
      'American bars have used bottled sour mix in whiskey sours since the mid-20th century. Fresh lemon plus simple syrup is still the better drink; this is the honest shortcut.',
    origin: 'United States',
    whyItWorks:
      'Sour mix already contains citrus and sugar, so the only job left is choosing a bourbon that can stand up to it.',
    classifications: ['modern', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['citrus', 'oak', 'sweet'],
    glassware: 'Rocks glass',
    ice: 'Shaken; over ice',
    garnish: ['Lemon wheel', 'Cocktail cherry'],
    ingredients: [
      ing('bourbon', 2),
      ing('sour_mix', 1.5),
      ing('angostura_bitters', 1, 'dash', { optional: true }),
    ],
    steps: [
      'Shake bourbon and sour mix hard with ice.',
      'Strain over fresh ice.',
      'Garnish with lemon and a cherry; add a dash of bitters if you like.',
    ],
    techniqueNotes: [
      'If the mix is very sweet, cut it to 1 oz and add a squeeze of lemon.',
    ],
    recommendedBottles: [
      rec('russells-reserve-10', 1, 'Holds up to bottled citrus.'),
      rec('eagle-rare', 2, 'Softer fruit if the mix is sharp.'),
      rec('sweet-and-sour-mix', 3, 'The shortcut this recipe exists for.'),
    ],
    variations: [
      {
        id: 'whiskey-sour',
        name: 'Whiskey Sour',
        notes: 'Fresh lemon and simple syrup—the preferred version.',
        relatedCocktailId: 'whiskey-sour',
      },
    ],
    relatedCocktailIds: ['whiskey-sour', 'bar-margarita', 'gold-rush'],
    tags: ['whiskey', 'sour', 'bar', 'ready-from-new-stock'],
  }),
  cocktail({
    id: 'bar-margarita',
    name: 'Margarita (Sour Mix)',
    aliases: ['Bar Margarita'],
    description:
      'Tequila, orange liqueur, and sweet-and-sour mix—the party Margarita when limes are not on the counter.',
    history:
      'The sour-mix Margarita is how a lot of American bars actually pour the drink. Use Cointreau for a single cocktail; Finest Call triple sec is fine for a pitcher.',
    origin: 'United States',
    whyItWorks:
      'Sour mix replaces lime and sugar. Orange liqueur still matters—without it you just have tequila and mixer.',
    classifications: ['modern', 'sour'],
    cocktailFamily: 'Margarita',
    flavorProfiles: ['agave', 'citrus', 'orange'],
    glassware: 'Rocks glass',
    ice: 'Shaken; over ice',
    garnish: ['Lime wheel', 'Optional salt rim'],
    ingredients: [
      ing('blanco_tequila', 2),
      ing('cointreau', 1, 'oz', { label: 'Cointreau or triple sec' }),
      ing('sour_mix', 1.5),
    ],
    steps: [
      'Salt the rim if you want it.',
      'Shake tequila, orange liqueur, and sour mix with ice.',
      'Strain over fresh ice and garnish.',
    ],
    recommendedBottles: [
      rec('kirkland-cristalino', 1, 'Everyday tequila for a mixer Margarita.'),
      rec('cointreau', 2, 'Preferred orange liqueur for one drink.'),
      rec('finest-call-triple-sec', 3, 'Batching option.'),
      rec('sweet-and-sour-mix', 4, 'Lime-and-sugar shortcut.'),
    ],
    variations: [
      {
        id: 'margarita',
        name: 'Margarita',
        notes: 'Fresh lime is the better drink.',
        relatedCocktailId: 'margarita',
      },
      {
        id: 'blue-margarita',
        name: 'Blue Margarita',
        notes: 'Swap the orange liqueur for blue curaçao.',
        relatedCocktailId: 'blue-margarita',
      },
    ],
    relatedCocktailIds: ['margarita', 'blue-margarita', 'bar-whiskey-sour', 'tommys-margarita'],
    seasonality: ['summer', 'year-round'],
    tags: ['tequila', 'margarita', 'bar', 'ready-from-new-stock'],
  }),
]

const knownIngredients = new Set(ingredients.map((item) => item.id))
let written = 0
for (const recipe of recipes) {
  for (const line of recipe.ingredients) {
    if (!knownIngredients.has(line.ingredientId)) {
      throw new Error(`${recipe.name}: unknown ingredient ${line.ingredientId}`)
    }
  }
  const file = path.join(cocktailsDir, `${recipe.id}.json`)
  fs.writeFileSync(file, `${JSON.stringify(recipe, null, 2)}\n`)
  written += 1
}

function patchCocktail(id, mutate) {
  const file = path.join(cocktailsDir, `${id}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  mutate(data)
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}

patchCocktail('adios-motherfucker', (data) => {
  data.description =
    'The real AMF: vodka, gin, rum, tequila, and blue curaçao shaken with sour mix and lengthened with soda.'
  data.whyItWorks =
    'Five-spirit Long Island structure; blue curaçao supplies the orange liqueur and the color the house cola version was faking.'
  data.flavorProfiles = ['strong', 'citrus', 'orange']
  data.ice = 'Cubed ice'
  data.garnish = ['Lemon wedge']
  data.ingredients = [
    ing('vodka', 0.5),
    ing('gin', 0.5),
    ing('white_rum', 0.5),
    ing('blanco_tequila', 0.5),
    ing('blue_curacao', 0.5),
    ing('sour_mix', 1.5),
    ing('club_soda', null, 'top', { scaleMode: 'top' }),
  ]
  data.steps = [
    'Shake the spirits, blue curaçao, and sour mix with ice.',
    'Strain into an ice-filled tall glass.',
    'Top with club soda and garnish.',
  ]
  data.techniqueNotes = [
    'This is the version the house cola build was standing in for before blue curaçao arrived.',
    'A splash of cola instead of soda makes a bluer Long Island if you want that look.',
  ]
  data.recommendedBottles = [
    rec('titos', 1, 'Neutral vodka in the five-spirit base.'),
    rec('malfy-originale', 2, 'Clean gin under the mix.'),
    rec('havana-club-3', 3, 'White rum backbone.'),
    rec('kirkland-cristalino', 4, 'Tequila component.'),
    rec('blue-curacao', 5, 'The bottle that makes this an AMF instead of a Long Island.'),
    rec('sweet-and-sour-mix', 6, 'Bar citrus and sugar in one pour.'),
  ]
  data.substitutions = [
    {
      ingredientId: 'sour_mix',
      alternatives: ['lemon_juice'],
      notes: 'Fresh version: 0.75 oz lemon juice and 0.5 oz simple syrup.',
    },
    {
      ingredientId: 'club_soda',
      alternatives: ['cola'],
      notes: 'Cola is the house Long Island finish if you want it darker.',
    },
  ]
  data.variations = [
    {
      id: 'long-island-iced-tea',
      name: 'Long Island Iced Tea',
      notes: 'Orange liqueur plus cola instead of blue curaçao and soda.',
      relatedCocktailId: 'long-island-iced-tea',
    },
  ]
  data.relatedCocktailIds = [
    'long-island-iced-tea',
    'long-beach-iced-tea',
    'texas-tea',
    'blue-lagoon',
  ]
  data.tags = ['vodka', 'strong', 'party', 'popular', 'blue']
})

patchCocktail('alexander', (data) => {
  data.substitutions = [
    {
      ingredientId: 'cognac',
      alternatives: ['bourbon'],
      notes: 'No cognac on the shelf—use the Bourbon Alexander when you want this drink tonight.',
    },
    {
      ingredientId: 'heavy_cream',
      alternatives: ['baileys'],
      notes: 'Baileys covers cream and adds sweetness.',
    },
  ]
  data.variations = [
    {
      id: 'bourbon-alexander',
      name: 'Bourbon Alexander',
      notes: 'House version with bourbon and Baileys.',
      relatedCocktailId: 'bourbon-alexander',
    },
    {
      id: 'barbara',
      name: 'Barbara',
      notes: 'Vodka Alexander.',
      relatedCocktailId: 'barbara',
    },
  ]
  data.relatedCocktailIds = [
    'bourbon-alexander',
    'barbara',
    'grasshopper',
    'pink-squirrel',
  ]
  data.techniqueNotes = [
    'Cognac and cream are still out. Make a Bourbon Alexander or Barbara until they are restocked.',
  ]
})

patchCocktail('banshee', (data) => {
  data.description =
    'Crème de banane, crème de cacao, and Baileys—the mid-century Banshee, now with the chocolate the classic wants.'
  data.whyItWorks =
    'Banana and chocolate are the original pair; Irish cream stands in for heavy cream.'
  data.flavorProfiles = ['banana', 'chocolate', 'creamy']
  data.ingredients = [
    ing('creme_de_banane', 1),
    ing('creme_de_cacao', 1),
    ing('baileys', 1, 'oz', { label: 'Baileys (cream stand-in)' }),
    ing('vodka', 0.5, 'oz', { optional: true }),
  ]
  data.steps = [
    'Shake crème de banane, crème de cacao, and Baileys (plus optional vodka) with ice.',
    'Strain into a chilled coupe.',
  ]
  data.recommendedBottles = [
    rec('creme-de-banane', 1, 'Banana half of the classic.'),
    rec('creme-de-cacao', 2, 'The chocolate the house Banshee was missing.'),
    rec('baileys', 3, 'Cream stand-in.'),
  ]
  data.relatedCocktailIds = ['banana-baileys', 'baileys-martini', 'pink-squirrel', 'almond-joy']
  data.tags = ['banana', 'chocolate', 'baileys', 'dessert', 'popular']
})

function addSourMixSubstitution(id) {
  patchCocktail(id, (data) => {
    data.substitutions = data.substitutions ?? []
    if (data.substitutions.some((item) => item.alternatives?.includes('sour_mix'))) return
    const citrusId = data.ingredients.find((line) =>
      ['lemon_juice', 'lime_juice'].includes(line.ingredientId),
    )?.ingredientId
    if (!citrusId) return
    data.substitutions.push({
      ingredientId: citrusId,
      alternatives: ['sour_mix'],
      notes:
        'Sweet-and-sour mix is a bar shortcut. Use about 1.5 oz sour mix and skip the simple syrup so the drink does not go cloying.',
    })
    data.variations = data.variations ?? []
    if (id === 'whiskey-sour' && !data.variations.some((item) => item.id === 'bar-whiskey-sour')) {
      data.variations.push({
        id: 'bar-whiskey-sour',
        name: 'Whiskey Sour (Sour Mix)',
        notes: 'Bottled sour mix instead of lemon and sugar.',
        relatedCocktailId: 'bar-whiskey-sour',
      })
    }
    if (id === 'margarita' && !data.variations.some((item) => item.id === 'bar-margarita')) {
      data.variations.push({
        id: 'bar-margarita',
        name: 'Margarita (Sour Mix)',
        notes: 'Bottled sour mix instead of fresh lime.',
        relatedCocktailId: 'bar-margarita',
      })
      data.variations.push({
        id: 'blue-margarita',
        name: 'Blue Margarita',
        notes: 'Blue curaçao in place of Cointreau.',
        relatedCocktailId: 'blue-margarita',
      })
    }
    data.relatedCocktailIds = [...new Set([...(data.relatedCocktailIds ?? []), ...(id === 'whiskey-sour' ? ['bar-whiskey-sour'] : []), ...(id === 'margarita' ? ['bar-margarita', 'blue-margarita'] : []), ...(id === 'kamikaze' ? ['blue-kamikaze'] : [])])]
  })
}

for (const id of ['whiskey-sour', 'margarita', 'daiquiri', 'kamikaze']) {
  addSourMixSubstitution(id)
}

patchCocktail('after-dinner-mint', (data) => {
  data.relatedCocktailIds = [...new Set([...(data.relatedCocktailIds ?? []), 'grasshopper'])]
  data.variations = [
    {
      id: 'grasshopper',
      name: 'Grasshopper',
      notes: 'Add crème de cacao for the classic mint-chocolate cream drink.',
      relatedCocktailId: 'grasshopper',
    },
  ]
})

patchCocktail('peppermint-patty', (data) => {
  data.relatedCocktailIds = [...new Set([...(data.relatedCocktailIds ?? []), 'grasshopper'])]
})

patchCocktail('long-island-iced-tea', (data) => {
  data.relatedCocktailIds = [...new Set([...(data.relatedCocktailIds ?? []), 'adios-motherfucker'])]
})

fs.writeFileSync(ingredientsPath, `${JSON.stringify(ingredients, null, 2)}\n`)
fs.writeFileSync(bottlesPath, `${JSON.stringify(bottles, null, 2)}\n`)
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`)

const glassId = (glassware) => {
  const value = glassware.toLowerCase()
  if (value.includes('nick')) return 'nick-and-nora'
  if (value.includes('coupe')) return 'coupe'
  if (value.includes('hurricane')) return 'hurricane'
  if (value.includes('highball') || value.includes('collins') || value.includes('tall')) return 'highball'
  if (value.includes('wine')) return 'wine'
  return 'double-old-fashioned'
}

const paletteFor = (flavors) => {
  if (flavors.includes('mint')) return { name: 'mint-cream', hex: '#7BA68A' }
  if (flavors.includes('almond') && flavors.includes('creamy')) return { name: 'almond-rose', hex: '#C45B78' }
  if (flavors.includes('almond')) return { name: 'almond-rose', hex: '#C45B78' }
  if (flavors.includes('tropical') || flavors.includes('orange') || flavors.includes('pineapple')) {
    if (flavors.includes('coconut') || flavors.includes('tropical')) return { name: 'electric-blue', hex: '#1F6B9A' }
  }
  if (flavors.includes('refreshing') && flavors.includes('citrus')) return { name: 'electric-blue', hex: '#1F6B9A' }
  if (flavors.includes('chocolate') || flavors.includes('creamy')) return { name: 'cafe-cream', hex: '#A88162' }
  if (flavors.includes('agave')) return { name: 'electric-blue', hex: '#1F6B9A' }
  if (flavors.includes('citrus')) return { name: 'pale-citrus', hex: '#D7D39A' }
  return { name: 'warm-amber', hex: '#B06932' }
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const byId = new Map(manifest.cocktails.map((item) => [item.id, item]))

function upsertManifest(recipe) {
  const flavors = recipe.flavorProfiles
  const isBlue = ['blue-hawaiian', 'blue-hawaii', 'blue-lagoon', 'blue-margarita', 'blue-kamikaze', 'swimming-pool', 'adios-motherfucker'].includes(recipe.id)
  const entry = {
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    illustrationKey: recipe.illustrationKey,
    cocktailFamily: recipe.cocktailFamily,
    classifications: recipe.classifications,
    flavorProfiles: flavors,
    ingredientIds: recipe.ingredients.filter((item) => !item.optional).map((item) => item.ingredientId),
    artDirection: {
      template: recipe.cocktailFamily.toLowerCase().replaceAll(' ', '-'),
      glass: glassId(recipe.glassware),
      sourceGlassware: recipe.glassware,
      ice: recipe.ice,
      garnish: recipe.garnish.join(' and ') || 'none',
      liquidPalette: isBlue ? { name: 'electric-blue', hex: '#1F6B9A' } : paletteFor(flavors),
      composition: 'single centered hero cocktail, three-quarter view, generous safe area, no text, no bottle labels',
      background: 'deep emerald-to-charcoal matte backdrop above a dark walnut bar, restrained brass accents',
      lighting: 'warm amber key from upper left, soft neutral fill, subtle rim light, realistic shadow',
      output: {
        master: `cocktails/masters/${recipe.id}.png`,
        runtime: `cocktails/webp/${recipe.id}.webp`,
        thumbnail: `cocktails/thumbs/${recipe.id}.webp`,
      },
    },
  }
  byId.set(recipe.id, entry)
}

for (const recipe of recipes) upsertManifest(recipe)
upsertManifest(JSON.parse(fs.readFileSync(path.join(cocktailsDir, 'adios-motherfucker.json'), 'utf8')))
upsertManifest(JSON.parse(fs.readFileSync(path.join(cocktailsDir, 'banshee.json'), 'utf8')))

manifest.cocktails = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
manifest.cocktailCount = manifest.cocktails.length
manifest.generatedFrom = `${manifest.generatedFrom ?? 'catalog'}; 2026-09-06 supply expansion`
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(
  JSON.stringify(
    {
      ingredients: ingredients.length,
      bottles: bottles.length,
      inventory: inventory.length,
      recipesWritten: written,
      cocktailCount: manifest.cocktailCount,
    },
    null,
    2,
  ),
)
