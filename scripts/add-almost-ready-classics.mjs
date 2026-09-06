#!/usr/bin/env node
/**
 * Add well-known classics that are one or two ingredients short of seed inventory.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const cocktailsDir = path.join(root, 'src/data/cocktails')
const manifestPath = path.join(root, 'src/data/illustrations/illustration-manifest.json')

const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'))
const knownIngredients = new Set(ingredients.map((item) => item.id))

const ing = (ingredientId, amount, unit = 'oz', extra = {}) => ({
  ingredientId,
  amount,
  unit,
  scaleMode: extra.scaleMode ?? (unit === 'dashes' || unit === 'dash' || unit === 'rinse' ? 'fixed' : 'linear'),
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
    year: spec.year,
    creator: spec.creator,
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
    id: 'sidecar',
    name: 'Sidecar',
    description: 'Cognac, orange liqueur, and lemon—the foundational brandy sour. One bottle of cognac away from ready.',
    history: 'A World War I–era classic, usually credited to Paris or London around 1920. The drink is a brandy sour with curaçao; Cointreau is the modern standard.',
    origin: 'Paris / London',
    whyItWorks: 'Lemon cuts cognac’s richness; orange liqueur supplies both sugar and aroma. A sugar rim is optional, not structural.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Sidecar',
    flavorProfiles: ['citrus', 'brandy', 'orange'],
    difficulty: 'medium',
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Orange twist', 'Optional sugar rim'],
    ingredients: [
      ing('cognac', 2),
      ing('cointreau', 0.75),
      ing('lemon_juice', 0.75),
    ],
    steps: [
      'Sugar the rim if you want it.',
      'Shake cognac, Cointreau, and lemon hard with ice.',
      'Fine-strain into a chilled coupe and express orange oil.',
    ],
    techniqueNotes: [
      'Until cognac is stocked, pour the Bourbon Sidecar already in the book.',
    ],
    recommendedBottles: [
      rec('cointreau', 1, 'The orange half is already on the shelf.'),
      rec('grand-marnier', 2, 'Richer orange if you want more cognac character before buying brandy.'),
    ],
    substitutions: [
      {
        ingredientId: 'cognac',
        alternatives: ['bourbon'],
        notes: 'Bourbon Sidecar is the house version you can make tonight.',
      },
    ],
    variations: [
      {
        id: 'sidecar-bourbon',
        name: 'Bourbon Sidecar',
        notes: 'Ready now with Eagle Rare or Russell’s.',
        relatedCocktailId: 'sidecar-bourbon',
      },
    ],
    relatedCocktailIds: ['sidecar-bourbon', 'white-lady', 'brandy-crusta', 'between-the-sheets'],
    tags: ['classic', 'cognac', 'sour', 'inventory-gap'],
  }),
  cocktail({
    id: 'brandy-old-fashioned',
    name: 'Brandy Old Fashioned',
    description: 'The Wisconsin-style idea in classic form: cognac, sugar, and bitters. Missing only cognac.',
    history: 'An Old Fashioned built on brandy instead of whiskey. In Wisconsin the drink is often muddled with fruit and topped with soda; this is the spirit-forward version.',
    origin: 'United States',
    whyItWorks: 'Cognac already tastes like dessert oak; a little sugar and bitters are enough.',
    classifications: ['classic', 'spirit-forward'],
    cocktailFamily: 'Old Fashioned',
    flavorProfiles: ['brandy', 'oak', 'bittersweet'],
    strength: 'spirit-forward',
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Orange twist'],
    ingredients: [
      ing('cognac', 2),
      ing('demerara_sugar', 1, 'tsp'),
      ing('angostura_bitters', 2, 'dashes'),
      ing('orange_bitters', 1, 'dash', { optional: true }),
    ],
    steps: [
      'Muddle sugar with bitters and a splash of water.',
      'Add cognac and ice; stir until cold.',
      'Strain over a large cube and express orange oil.',
    ],
    recommendedBottles: [
      rec('angostura-aromatic', 1, 'The bitters are ready.'),
    ],
    relatedCocktailIds: ['old-fashioned', 'sidecar', 'harvard'],
    tags: ['classic', 'cognac', 'spirit-forward', 'inventory-gap'],
  }),
  cocktail({
    id: 'harvard',
    name: 'Harvard',
    description: 'A Manhattan built on cognac instead of rye—sweet vermouth and bitters, one bottle short.',
    history: 'A late-19th-century Ivy League cocktail, the brandy counterpart to the Manhattan / Metropolitan family.',
    origin: 'United States',
    whyItWorks: 'Sweet vermouth and cognac share grape and spice; bitters keep it from becoming a cordial.',
    classifications: ['classic', 'spirit-forward'],
    cocktailFamily: 'Manhattan',
    flavorProfiles: ['brandy', 'bittersweet', 'aromatic'],
    strength: 'spirit-forward',
    glassware: 'Nick & Nora',
    ice: 'Stirred; up',
    garnish: ['Lemon twist', 'Cocktail cherry'],
    ingredients: [
      ing('cognac', 2),
      ing('sweet_vermouth', 1),
      ing('angostura_bitters', 2, 'dashes'),
    ],
    steps: [
      'Stir cognac, sweet vermouth, and bitters with ice.',
      'Strain into a chilled glass.',
      'Garnish with lemon and a cherry.',
    ],
    recommendedBottles: [
      rec('sweet-vermouth', 1, 'The vermouth half is already stocked.'),
      rec('angostura-aromatic', 2, 'Aromatic bitters from the shelf.'),
    ],
    relatedCocktailIds: ['manhattan', 'brandy-old-fashioned', 'sidecar'],
    tags: ['classic', 'cognac', 'spirit-forward', 'inventory-gap'],
  }),
  cocktail({
    id: 'aviation',
    name: 'Aviation',
    description: 'Gin, lemon, maraschino, and crème de violette—the pale-sky sour. Missing only violette.',
    history: 'Hugo Ensslin’s 1916 recipe from the Hotel Wallick in New York. Crème de violette disappeared from American bars for decades; without it the drink is just a gin–maraschino sour.',
    origin: 'New York',
    year: 1916,
    creator: 'Hugo Ensslin',
    whyItWorks: 'Maraschino and lemon make a crisp sour; a small violette dose adds floral color without perfume overload.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['floral', 'citrus', 'botanical'],
    difficulty: 'medium',
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Brandied cherry or lemon twist'],
    ingredients: [
      ing('gin', 2),
      ing('lemon_juice', 0.75),
      ing('maraschino', 0.5),
      ing('creme_de_violette', 0.25),
    ],
    steps: [
      'Shake gin, lemon, maraschino, and violette hard with ice.',
      'Fine-strain into a chilled coupe.',
      'Garnish with a cherry or lemon twist.',
    ],
    techniqueNotes: [
      'Keep violette to a quarter ounce or the drink turns gray-purple and soapy.',
    ],
    recommendedBottles: [
      rec('drumshanbo-gunpowder', 1, 'Citrus-forward gin under floral liqueur.'),
      rec('luxardo-maraschino', 2, 'The maraschino is already on the bar.'),
      rec('hendricks', 3, 'Softer floral gin if you want more violet echo.'),
    ],
    relatedCocktailIds: ['last-word', 'white-lady', 'corpse-reviver-no-2', 'blue-moon'],
    tags: ['classic', 'gin', 'floral', 'inventory-gap'],
  }),
  cocktail({
    id: 'blue-moon',
    name: 'Blue Moon',
    description: 'Gin, crème de violette, and lemon—Aviation’s simpler cousin. Same missing bottle.',
    history: 'A pre-Prohibition gin sour colored with violet liqueur. Recipes vary; this is the three-ingredient version.',
    origin: 'United States',
    whyItWorks: 'Without maraschino the violette has to do more work, so the pour stays small and lemon stays bright.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['floral', 'citrus', 'botanical'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Lemon twist'],
    ingredients: [
      ing('gin', 2),
      ing('creme_de_violette', 0.5),
      ing('lemon_juice', 0.75),
      ing('simple_syrup', 0.25, 'oz', { optional: true }),
    ],
    steps: [
      'Shake gin, violette, lemon, and optional syrup with ice.',
      'Fine-strain into a chilled coupe.',
      'Express a lemon twist.',
    ],
    recommendedBottles: [
      rec('malfy-originale', 1, 'Clean gin that leaves room for violet.'),
      rec('drumshanbo-gunpowder', 2, 'More citrus if the violette reads sweet.'),
    ],
    relatedCocktailIds: ['aviation', 'southside', 'white-lady'],
    tags: ['classic', 'gin', 'floral', 'inventory-gap'],
  }),
  cocktail({
    id: 'army-navy',
    name: 'Army & Navy',
    description: 'Gin, lemon, and orgeat—a three-ingredient sour waiting on almond syrup.',
    history: 'A mid-century gin sour from David A. Embury’s circle; orgeat stands in for simple syrup and adds almond.',
    origin: 'United States',
    whyItWorks: 'Orgeat sweetens and perfumes; lemon keeps gin from tasting like dessert.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['almond', 'citrus', 'botanical'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Lemon twist'],
    ingredients: [
      ing('gin', 2),
      ing('lemon_juice', 0.75),
      ing('orgeat', 0.5),
      ing('angostura_bitters', 1, 'dash', { optional: true }),
    ],
    steps: [
      'Shake gin, lemon, and orgeat hard with ice.',
      'Fine-strain into a chilled coupe.',
      'Express lemon oil; add a dash of bitters if you like.',
    ],
    recommendedBottles: [
      rec('hendricks', 1, 'Soft gin beside almond.'),
      rec('drumshanbo-gunpowder', 2, 'Brighter gin if the orgeat is rich.'),
    ],
    relatedCocktailIds: ['mai-tai', 'japanese-cocktail', 'gimlet', 'bees-knees'],
    tags: ['classic', 'gin', 'almond', 'inventory-gap'],
  }),
  cocktail({
    id: 'bay-breeze',
    name: 'Bay Breeze',
    description: 'Vodka, pineapple, and cranberry—the Sea Breeze’s pineapple cousin. Missing only cranberry.',
    history: 'A 1980s highball in the Cape Codder family. Sea Breeze uses grapefruit; Bay Breeze uses pineapple, which you already have.',
    origin: 'United States',
    whyItWorks: 'Pineapple sweetness needs cranberry’s tart dry edge so the drink does not taste like juice.',
    classifications: ['classic', 'highball'],
    cocktailFamily: 'Highball',
    flavorProfiles: ['tropical', 'tart', 'pineapple'],
    strength: 'light',
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Lime wedge'],
    ingredients: [
      ing('vodka', 1.5),
      ing('pineapple_juice', 3),
      ing('cranberry_juice', 1.5),
    ],
    steps: [
      'Build vodka and juices over ice.',
      'Stir briefly and garnish with lime.',
    ],
    recommendedBottles: [
      rec('titos', 1, 'Neutral vodka under juice.'),
    ],
    relatedCocktailIds: ['sea-breeze', 'madras', 'cape-codder', 'woo-woo'],
    seasonality: ['summer', 'year-round'],
    tags: ['vodka', 'highball', 'cranberry', 'inventory-gap'],
  }),
  cocktail({
    id: 'paradise',
    name: 'Paradise',
    description: 'Gin, apricot liqueur, and orange juice—Harry Craddock’s equal-parts sour. Missing apricot.',
    history: 'Published in the 1930 Savoy Cocktail Book. The original is equal parts; modern pours often lean on gin.',
    origin: 'London',
    year: 1930,
    creator: 'Harry Craddock',
    whyItWorks: 'Apricot sits between gin botanicals and orange juice; without it you just have a gin screwdriver.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['apricot', 'orange', 'botanical'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Orange twist'],
    ingredients: [
      ing('gin', 1.5),
      ing('apricot_liqueur', 0.75),
      ing('orange_juice', 0.75),
    ],
    steps: [
      'Shake gin, apricot, and orange juice with ice.',
      'Fine-strain into a chilled coupe.',
      'Express an orange twist.',
    ],
    recommendedBottles: [
      rec('malfy-originale', 1, 'Clean gin for a fruit-forward sour.'),
      rec('hendricks', 2, 'Softer floral gin beside apricot.'),
    ],
    relatedCocktailIds: ['angel-face', 'hotel-nacional', 'hotel-nacional-classic', 'bees-knees'],
    tags: ['classic', 'gin', 'apricot', 'inventory-gap'],
  }),
  cocktail({
    id: 'hotel-nacional-classic',
    name: 'Hotel Nacional',
    aliases: ['Hotel Nacional Special'],
    description: 'Rum, apricot, pineapple, and lime—the Havana classic. Missing only apricot liqueur.',
    history: 'Created at the Hotel Nacional de Cuba in the 1930s, usually credited to Wil P. Taylor. The house book currently uses peach liqueur as a stand-in.',
    origin: 'Havana',
    creator: 'Wil P. Taylor',
    whyItWorks: 'Apricot deepens pineapple and lime the way peach cannot quite do; rum keeps it a daiquiri, not punch.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Daiquiri',
    flavorProfiles: ['apricot', 'pineapple', 'citrus'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Lime wheel'],
    ingredients: [
      ing('gold_rum', 1.5),
      ing('apricot_liqueur', 0.5),
      ing('pineapple_juice', 1),
      ing('lime_juice', 0.5),
    ],
    steps: [
      'Shake rum, apricot, pineapple, and lime with ice.',
      'Fine-strain into a chilled coupe.',
      'Garnish with lime.',
    ],
    recommendedBottles: [
      rec('havana-club-especial', 1, 'Gold rum for the Havana profile.'),
      rec('havana-club-3', 2, 'Lighter rum if you want it closer to a daiquiri.'),
    ],
    variations: [
      {
        id: 'hotel-nacional',
        name: 'Hotel Nacional (House)',
        notes: 'Peach liqueur stand-in—ready now.',
        relatedCocktailId: 'hotel-nacional',
      },
    ],
    relatedCocktailIds: ['hotel-nacional', 'paradise', 'daiquiri', 'angel-face'],
    tags: ['classic', 'rum', 'apricot', 'inventory-gap'],
  }),
  cocktail({
    id: 'brave-bull',
    name: 'Brave Bull',
    description: 'Tequila and coffee liqueur—the Black Russian’s agave cousin. Missing only coffee liqueur.',
    history: 'A mid-century two-ingredient drink from the same family as the Black Russian and Godfather.',
    origin: 'United States / Mexico borderlands',
    whyItWorks: 'Coffee bitterness tames tequila’s heat; no citrus needed.',
    classifications: ['classic', 'spirit-forward'],
    cocktailFamily: 'Russian',
    flavorProfiles: ['coffee', 'agave', 'bittersweet'],
    strength: 'strong',
    glassware: 'Rocks glass',
    ice: 'Cubed ice',
    garnish: [],
    ingredients: [
      ing('blanco_tequila', 2),
      ing('coffee_liqueur', 1),
    ],
    steps: [
      'Build tequila and coffee liqueur over ice.',
      'Stir briefly.',
    ],
    recommendedBottles: [
      rec('kirkland-cristalino', 1, 'Smooth tequila waiting on Kahlúa or similar.'),
    ],
    relatedCocktailIds: ['black-russian', 'revolver', 'mudslide', 'sombrero'],
    tags: ['tequila', 'coffee', 'inventory-gap'],
  }),
  cocktail({
    id: 'sombrero',
    name: 'Sombrero',
    aliases: ['Kahlúa and Cream'],
    description: 'Coffee liqueur and cream—two pantry items away from a dessert pour.',
    history: 'A bar-simple coffee-and-cream drink; the name is older American restaurant-menu language for Kahlúa and cream.',
    origin: 'United States',
    whyItWorks: 'Cream softens coffee bitterness. Baileys can stand in for cream if you only buy the coffee liqueur.',
    classifications: ['classic', 'dessert'],
    cocktailFamily: 'Dessert',
    flavorProfiles: ['coffee', 'creamy', 'sweet'],
    strength: 'light',
    glassware: 'Rocks glass',
    ice: 'Cubed ice',
    garnish: [],
    ingredients: [
      ing('coffee_liqueur', 1.5),
      ing('heavy_cream', 1.5),
    ],
    steps: [
      'Build coffee liqueur over ice.',
      'Float or stir in cream.',
    ],
    substitutions: [
      {
        ingredientId: 'heavy_cream',
        alternatives: ['baileys'],
        notes: 'Baileys covers cream and adds sweetness if dairy stays out.',
      },
    ],
    recommendedBottles: [
      rec('baileys', 1, 'Use as the cream half if you stock coffee liqueur first.'),
    ],
    relatedCocktailIds: ['white-russian', 'black-russian', 'brave-bull', 'mudslide'],
    tags: ['coffee', 'dessert', 'inventory-gap'],
  }),
  cocktail({
    id: 'frisco-sour',
    name: 'Frisco Sour',
    description: 'Rye, Bénédictine, and lemon—a spicy sour waiting on one herbal liqueur.',
    history: 'A pre-Prohibition rye sour sweetened with Bénédictine instead of plain sugar. Close to the Monte Carlo, with lemon.',
    origin: 'United States',
    whyItWorks: 'Bénédictine’s honey-herb sweetness is the sugar; lemon and rye keep it a sour, not a digestif.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['herbal', 'citrus', 'spicy'],
    glassware: 'Coupe or rocks',
    ice: 'Shaken; up or over ice',
    garnish: ['Lemon twist'],
    ingredients: [
      ing('rye', 2),
      ing('benedictine', 0.75),
      ing('lemon_juice', 0.75),
    ],
    steps: [
      'Shake rye, Bénédictine, and lemon with ice.',
      'Strain up or over fresh ice.',
      'Express a lemon twist.',
    ],
    recommendedBottles: [
      rec('sazerac-rye', 1, 'Spicy rye for a herbal sour.'),
      rec('elijah-craig-rye', 2, 'Backup rye from the same shelf.'),
    ],
    relatedCocktailIds: ['monte-carlo', 'bobby-burns', 'whiskey-sour', 'singapore-sling'],
    tags: ['classic', 'rye', 'herbal', 'inventory-gap'],
  }),
  cocktail({
    id: 'singapore-sling',
    name: 'Singapore Sling',
    aliases: ['Raffles Singapore Sling'],
    description: 'Gin, cherry, Bénédictine, pineapple, and lime—the tall Raffles sling. Missing only Bénédictine.',
    history: 'Associated with the Long Bar at Raffles Hotel, Singapore, in the early 20th century. The house book already has a Bénédictine-free version; this is the fuller pineapple sling.',
    origin: 'Singapore',
    whyItWorks: 'Bénédictine is the herbal hinge between cherry, gin, and pineapple. Without it the drink is still pleasant; with it, it is a Sling.',
    classifications: ['classic', 'highball'],
    cocktailFamily: 'Sling',
    flavorProfiles: ['cherry', 'pineapple', 'herbal'],
    difficulty: 'medium',
    glassware: 'Highball glass',
    ice: 'Cubed ice',
    garnish: ['Pineapple wedge', 'Cocktail cherry'],
    ingredients: [
      ing('gin', 1.5),
      ing('cherry_liqueur', 0.5),
      ing('cointreau', 0.25),
      ing('benedictine', 0.25),
      ing('pineapple_juice', 2),
      ing('lime_juice', 0.5),
      ing('grenadine', 0.25),
      ing('angostura_bitters', 1, 'dash'),
      ing('club_soda', null, 'top', { scaleMode: 'top', optional: true }),
    ],
    steps: [
      'Shake everything except soda with ice.',
      'Strain into a tall glass over fresh ice.',
      'Top with a splash of soda if you want it longer; garnish.',
    ],
    recommendedBottles: [
      rec('drumshanbo-gunpowder', 1, 'Gin that can stand up to pineapple.'),
      rec('bozkov-griotte', 2, 'Cherry liqueur already on the bar.'),
      rec('cointreau', 3, 'Orange liqueur from the shelf.'),
    ],
    variations: [
      {
        id: 'singapore-sling-house',
        name: 'Singapore Sling (House)',
        notes: 'Ready now without Bénédictine.',
        relatedCocktailId: 'singapore-sling-house',
      },
    ],
    relatedCocktailIds: ['singapore-sling-house', 'frisco-sour', 'tom-collins'],
    seasonality: ['summer', 'year-round'],
    tags: ['classic', 'gin', 'tropical', 'inventory-gap'],
  }),
  cocktail({
    id: 'alaska',
    name: 'Alaska',
    description: 'Gin and yellow Chartreuse with orange bitters—a stirred classic missing yellow Chartreuse.',
    history: 'A Savoy-era Martini variation. Yellow Chartreuse is sweeter and less aggressive than green; the drink should stay pale and cold.',
    origin: 'United States / London',
    whyItWorks: 'Chartreuse plays the vermouth role with more honey and herb; orange bitters tie gin juniper to the liqueur.',
    classifications: ['classic', 'spirit-forward'],
    cocktailFamily: 'Martini',
    flavorProfiles: ['herbal', 'botanical', 'honeyed'],
    strength: 'strong',
    glassware: 'Nick & Nora',
    ice: 'Stirred; up',
    garnish: ['Lemon twist'],
    ingredients: [
      ing('gin', 2),
      ing('yellow_chartreuse', 0.75),
      ing('orange_bitters', 1, 'dash'),
    ],
    steps: [
      'Stir gin, yellow Chartreuse, and bitters with ice.',
      'Strain into a chilled glass.',
      'Express a lemon twist.',
    ],
    recommendedBottles: [
      rec('drumshanbo-gunpowder', 1, 'Juniper-citrus gin beside Chartreuse.'),
      rec('fee-brothers-orange', 2, 'Orange bitters already stocked.'),
    ],
    relatedCocktailIds: ['greenpoint', 'bijou', 'martini', 'last-word'],
    tags: ['classic', 'gin', 'herbal', 'inventory-gap'],
  }),
  cocktail({
    id: 'chartreuse-swizzle',
    name: 'Chartreuse Swizzle',
    description: 'Green Chartreuse, pineapple, lime, and falernum—crushed-ice tiki. Missing only Chartreuse.',
    history: 'A modern tiki classic from Marcovaldo Dionysos (San Francisco, 2003). Falernum and pineapple are already on this bar.',
    origin: 'San Francisco',
    year: 2003,
    creator: 'Marcovaldo Dionysos',
    whyItWorks: 'Chartreuse’s herbal heat needs pineapple and lime the way rum does; falernum adds clove and lime-leaf spice.',
    classifications: ['modern-classic', 'tiki'],
    cocktailFamily: 'Swizzle',
    flavorProfiles: ['herbal', 'pineapple', 'spice'],
    difficulty: 'medium',
    glassware: 'Collins or tiki',
    ice: 'Crushed ice',
    garnish: ['Mint sprig'],
    ingredients: [
      ing('green_chartreuse', 1.5),
      ing('pineapple_juice', 1.5),
      ing('lime_juice', 0.75),
      ing('falernum', 0.5),
    ],
    steps: [
      'Add everything to a tall glass with crushed ice.',
      'Swizzle until the glass frosts.',
      'Cap with more crushed ice and mint.',
    ],
    recommendedBottles: [
      rec('bitter-truth-falernum', 1, 'Falernum is already stocked.'),
    ],
    relatedCocktailIds: ['last-word', 'queens-park-swizzle', 'rum-swizzle', 'cloister'],
    seasonality: ['summer', 'year-round'],
    tags: ['modern-classic', 'tiki', 'chartreuse', 'inventory-gap'],
  }),
  cocktail({
    id: 'cloister',
    name: 'Cloister',
    description: 'Gin, green Chartreuse, grapefruit, and lemon—a pale monastic sour. Missing Chartreuse.',
    history: 'A 1970s sour from the same Chartreuse-and-citrus family as the Last Word, usually served up.',
    origin: 'United States',
    whyItWorks: 'Grapefruit and lemon give Chartreuse somewhere to land; gin botanicals keep it from tasting like a liqueur sour.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Sour',
    flavorProfiles: ['herbal', 'citrus', 'grapefruit'],
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Grapefruit twist'],
    ingredients: [
      ing('gin', 1.5),
      ing('green_chartreuse', 0.5),
      ing('grapefruit_juice', 0.5),
      ing('lemon_juice', 0.25),
      ing('simple_syrup', 0.25),
    ],
    steps: [
      'Shake all ingredients with ice.',
      'Fine-strain into a chilled coupe.',
      'Express grapefruit oil.',
    ],
    recommendedBottles: [
      rec('hendricks', 1, 'Soft gin under Chartreuse and grapefruit.'),
      rec('drumshanbo-gunpowder', 2, 'More citrus if you want it drier.'),
    ],
    relatedCocktailIds: ['last-word', 'chartreuse-swizzle', 'white-lady', 'bijou'],
    tags: ['classic', 'gin', 'herbal', 'inventory-gap'],
  }),
  cocktail({
    id: 'mezcal-negroni',
    name: 'Mezcal Negroni',
    description: 'Mezcal, Campari, and sweet vermouth—the Negroni with smoke. Missing only mezcal.',
    history: 'A 21st-century Negroni variation. Same equal-parts structure; mezcal replaces gin.',
    origin: 'International',
    whyItWorks: 'Smoke and Campari bitterness lock together; sweet vermouth keeps the drink from turning into an ashtray.',
    classifications: ['modern', 'spirit-forward'],
    cocktailFamily: 'Negroni',
    flavorProfiles: ['smoky', 'bitter', 'herbal'],
    strength: 'strong',
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: ['Orange twist'],
    ingredients: [
      ing('mezcal', 1),
      ing('campari', 1),
      ing('sweet_vermouth', 1),
    ],
    steps: [
      'Stir equal parts with ice.',
      'Strain over a large cube.',
      'Express an orange twist.',
    ],
    recommendedBottles: [
      rec('campari', 1, 'Campari is already on the bar.'),
      rec('sweet-vermouth', 2, 'Sweet vermouth from the shelf.'),
    ],
    relatedCocktailIds: ['negroni', 'division-bell', 'mezcal-margarita', 'oaxaca-old-fashioned'],
    tags: ['modern', 'mezcal', 'bitter', 'inventory-gap'],
  }),
  cocktail({
    id: 'mezcal-margarita',
    name: 'Mezcal Margarita',
    description: 'Mezcal, orange liqueur, and lime—the Margarita with smoke. Missing only mezcal.',
    history: 'A contemporary agave sour. Same bones as a Margarita; mezcal replaces or splits the tequila.',
    origin: 'Mexico / United States',
    whyItWorks: 'Lime and Cointreau do the same job they do in a Margarita; smoke is the only new note.',
    classifications: ['modern', 'sour'],
    cocktailFamily: 'Margarita',
    flavorProfiles: ['smoky', 'citrus', 'agave'],
    glassware: 'Coupe or rocks glass',
    ice: 'Shaken; up or over ice',
    garnish: ['Lime wheel', 'Optional salt rim'],
    ingredients: [
      ing('mezcal', 2),
      ing('cointreau', 0.75),
      ing('lime_juice', 0.75),
    ],
    steps: [
      'Salt the rim if you want it.',
      'Shake mezcal, Cointreau, and lime with ice.',
      'Strain up or over fresh ice.',
    ],
    recommendedBottles: [
      rec('cointreau', 1, 'Orange liqueur is ready.'),
      rec('kirkland-cristalino', 2, 'Split 1 oz mezcal / 1 oz tequila if you want it milder later.'),
    ],
    relatedCocktailIds: ['margarita', 'division-bell', 'mezcal-negroni', 'tommys-margarita'],
    seasonality: ['summer', 'year-round'],
    tags: ['modern', 'mezcal', 'margarita', 'inventory-gap'],
  }),
  cocktail({
    id: 'fanciulli',
    name: 'Fanciulli',
    description: 'A Manhattan with Fernet-Branca in place of some vermouth. Missing only fernet.',
    history: 'An early-20th-century New York Manhattan variation. The name is usually tied to a racing journalist; the drink is rye, sweet vermouth, and fernet.',
    origin: 'New York',
    whyItWorks: 'Fernet’s menthol-bitter snap cuts a sweet Manhattan. A half-ounce is plenty.',
    classifications: ['classic', 'spirit-forward'],
    cocktailFamily: 'Manhattan',
    flavorProfiles: ['bitter', 'minty', 'oak'],
    strength: 'spirit-forward',
    glassware: 'Nick & Nora',
    ice: 'Stirred; up',
    garnish: ['Lemon twist'],
    ingredients: [
      ing('rye', 2),
      ing('sweet_vermouth', 0.75),
      ing('fernet_branca', 0.25),
    ],
    steps: [
      'Stir rye, vermouth, and fernet with ice.',
      'Strain into a chilled glass.',
      'Express a lemon twist.',
    ],
    recommendedBottles: [
      rec('sazerac-rye', 1, 'Spicy rye for a bitter Manhattan.'),
      rec('sweet-vermouth', 2, 'Sweet vermouth is stocked.'),
    ],
    relatedCocktailIds: ['manhattan', 'hanky-panky', 'toronto-classic', 'toronto'],
    tags: ['classic', 'rye', 'fernet', 'inventory-gap'],
  }),
  cocktail({
    id: 'toronto-classic',
    name: 'Toronto',
    aliases: ['Classic Toronto'],
    description: 'Rye, Fernet-Branca, sugar, and bitters—the real Toronto. Missing only fernet.',
    history: 'A Canadian Old Fashioned variation using Fernet instead of, or in addition to, a plain bitter. The house book currently fakes fernet with Campari.',
    origin: 'Canada',
    whyItWorks: 'Fernet is the drink. Sugar and rye keep the menthol-bitter from taking over.',
    classifications: ['classic', 'spirit-forward'],
    cocktailFamily: 'Old Fashioned',
    flavorProfiles: ['bitter', 'minty', 'oak'],
    strength: 'spirit-forward',
    glassware: 'Coupe or rocks',
    ice: 'Stirred',
    garnish: ['Orange twist'],
    ingredients: [
      ing('rye', 2),
      ing('fernet_branca', 0.25),
      ing('simple_syrup', 0.25),
      ing('angostura_bitters', 2, 'dashes'),
    ],
    steps: [
      'Stir rye, fernet, syrup, and bitters with ice.',
      'Strain up or over a large cube.',
      'Express orange oil.',
    ],
    recommendedBottles: [
      rec('sazerac-rye', 1, 'The rye is ready.'),
      rec('angostura-aromatic', 2, 'Bitters from the shelf.'),
    ],
    variations: [
      {
        id: 'toronto',
        name: 'Toronto (House)',
        notes: 'Campari stand-in—ready now.',
        relatedCocktailId: 'toronto',
      },
    ],
    relatedCocktailIds: ['toronto', 'fanciulli', 'old-fashioned', 'hanky-panky'],
    tags: ['classic', 'rye', 'fernet', 'inventory-gap'],
  }),
  cocktail({
    id: 'bocce-ball',
    name: 'Bocce Ball',
    description: 'Amaretto and orange juice over ice—a two-ingredient highball missing amaretto.',
    history: 'An Italian-American bar highball, sometimes lengthened with soda. Close to a screwdriver with almond liqueur.',
    origin: 'United States',
    whyItWorks: 'Orange juice and amaretto share stone-fruit sweetness; soda, if you add it, keeps the drink from going sticky.',
    classifications: ['classic', 'highball'],
    cocktailFamily: 'Highball',
    flavorProfiles: ['almond', 'orange', 'sweet'],
    strength: 'light',
    glassware: 'Highball',
    ice: 'Cubed ice',
    garnish: ['Orange wheel'],
    ingredients: [
      ing('amaretto', 1.5),
      ing('orange_juice', 4),
      ing('club_soda', null, 'top', { scaleMode: 'top', optional: true }),
    ],
    steps: [
      'Build amaretto and orange juice over ice.',
      'Top with soda if you want it longer.',
      'Garnish with orange.',
    ],
    recommendedBottles: [
      rec('fever-tree-soda', 1, 'Optional soda lengthener, already stocked.'),
    ],
    relatedCocktailIds: ['amaretto-sour', 'godfather', 'godmother', 'screwdriver'],
    seasonality: ['summer', 'year-round'],
    tags: ['amaretto', 'highball', 'inventory-gap'],
  }),
  cocktail({
    id: 'champs-elysees',
    name: 'Champs-Élysées',
    aliases: ['Champs Elysees'],
    description: 'Cognac, green Chartreuse, lemon, and bitters—two bottles short of a French sour.',
    history: 'A Savoy-era brandy sour with Chartreuse in place of some orange liqueur. Needs both cognac and green Chartreuse.',
    origin: 'London / Paris',
    whyItWorks: 'Chartreuse plays sugar and herb; lemon keeps cognac from tasting heavy; bitters finish it like a Crusta.',
    classifications: ['classic', 'sour'],
    cocktailFamily: 'Sidecar',
    flavorProfiles: ['herbal', 'brandy', 'citrus'],
    difficulty: 'medium',
    glassware: 'Coupe',
    ice: 'Shaken; up',
    garnish: ['Lemon twist'],
    ingredients: [
      ing('cognac', 2),
      ing('green_chartreuse', 0.5),
      ing('lemon_juice', 0.75),
      ing('simple_syrup', 0.25, 'oz', { optional: true }),
      ing('angostura_bitters', 1, 'dash'),
    ],
    steps: [
      'Shake cognac, Chartreuse, lemon, optional syrup, and bitters with ice.',
      'Fine-strain into a chilled coupe.',
      'Express a lemon twist.',
    ],
    recommendedBottles: [
      rec('angostura-aromatic', 1, 'Bitters are ready; the two missing bottles do the rest.'),
    ],
    relatedCocktailIds: ['sidecar', 'brandy-crusta', 'last-word', 'chartreuse-swizzle'],
    tags: ['classic', 'cognac', 'chartreuse', 'inventory-gap'],
  }),
  cocktail({
    id: 'french-connection-classic',
    name: 'French Connection (Classic)',
    aliases: ['French Connection'],
    description: 'Equal parts cognac and amaretto—the real digestif. Two bottles short.',
    history: 'A two-ingredient after-dinner drink named for the 1971 film. The house book currently uses bourbon and Grand Marnier.',
    origin: 'United States',
    whyItWorks: 'Cognac and amaretto share almond, vanilla, and grape; no citrus, no dilution beyond ice.',
    classifications: ['classic', 'spirit-forward'],
    cocktailFamily: 'Dessert',
    flavorProfiles: ['almond', 'brandy', 'rich'],
    strength: 'strong',
    glassware: 'Rocks glass',
    ice: 'Large cube',
    garnish: [],
    ingredients: [
      ing('cognac', 1.5),
      ing('amaretto', 1.5),
    ],
    steps: [
      'Build cognac and amaretto over a large cube.',
      'Stir briefly.',
    ],
    variations: [
      {
        id: 'french-connection',
        name: 'French Connection (House)',
        notes: 'Bourbon and Grand Marnier—ready now.',
        relatedCocktailId: 'french-connection',
      },
    ],
    relatedCocktailIds: ['french-connection', 'godfather', 'sidecar', 'amaretto-sour'],
    tags: ['classic', 'cognac', 'amaretto', 'inventory-gap'],
  }),
]

for (const recipe of recipes) {
  for (const line of recipe.ingredients) {
    if (!knownIngredients.has(line.ingredientId)) {
      throw new Error(`${recipe.name}: unknown ingredient ${line.ingredientId}`)
    }
  }
  if (recipe.recommendedBottles) {
    const bottles = JSON.parse(fs.readFileSync(path.join(root, 'src/data/bottles/bottles.json'), 'utf8'))
    const bottleIds = new Set(bottles.map((item) => item.id))
    for (const recItem of recipe.recommendedBottles) {
      if (!bottleIds.has(recItem.bottleId)) {
        throw new Error(`${recipe.name}: unknown bottle ${recItem.bottleId}`)
      }
    }
  }
}

let written = 0
for (const recipe of recipes) {
  fs.writeFileSync(path.join(cocktailsDir, `${recipe.id}.json`), `${JSON.stringify(recipe, null, 2)}\n`)
  written += 1
}

function patchCocktail(id, mutate) {
  const file = path.join(cocktailsDir, `${id}.json`)
  if (!fs.existsSync(file)) return
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  mutate(data)
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}

function addRelated(id, extras) {
  patchCocktail(id, (data) => {
    data.relatedCocktailIds = [...new Set([...(data.relatedCocktailIds ?? []), ...extras])]
  })
}

addRelated('sidecar-bourbon', ['sidecar'])
addRelated('toronto', ['toronto-classic'])
addRelated('hotel-nacional', ['hotel-nacional-classic', 'paradise'])
addRelated('french-connection', ['french-connection-classic'])
addRelated('singapore-sling-house', ['singapore-sling'])
addRelated('black-russian', ['brave-bull', 'sombrero'])
addRelated('sea-breeze', ['bay-breeze'])
addRelated('last-word', ['aviation', 'chartreuse-swizzle', 'cloister'])
addRelated('mai-tai', ['army-navy'])
addRelated('negroni', ['mezcal-negroni'])
addRelated('margarita', ['mezcal-margarita'])
addRelated('manhattan', ['fanciulli', 'harvard'])
addRelated('amaretto-sour', ['bocce-ball', 'french-connection-classic'])
addRelated('old-fashioned', ['brandy-old-fashioned', 'toronto-classic'])

const glassId = (glassware) => {
  const value = glassware.toLowerCase()
  if (value.includes('nick')) return 'nick-and-nora'
  if (value.includes('coupe')) return 'coupe'
  if (value.includes('hurricane') || value.includes('tiki') || value.includes('collins')) return 'highball'
  if (value.includes('highball')) return 'highball'
  return 'double-old-fashioned'
}

const paletteFor = (flavors, id) => {
  if (id === 'aviation' || id === 'blue-moon') return { name: 'violet-sky', hex: '#6B5B8A' }
  if (flavors.includes('smoky')) return { name: 'smoke-amber', hex: '#8A5A32' }
  if (flavors.includes('coffee')) return { name: 'cafe-cream', hex: '#A88162' }
  if (flavors.includes('herbal')) return { name: 'herbal-gold', hex: '#9A8B45' }
  if (flavors.includes('pineapple') || flavors.includes('tropical')) return { name: 'warm-amber', hex: '#B06932' }
  if (flavors.includes('floral')) return { name: 'violet-sky', hex: '#6B5B8A' }
  if (flavors.includes('citrus')) return { name: 'pale-citrus', hex: '#D7D39A' }
  if (flavors.includes('almond')) return { name: 'almond-rose', hex: '#C45B78' }
  return { name: 'warm-amber', hex: '#B06932' }
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
      liquidPalette: paletteFor(recipe.flavorProfiles, recipe.id),
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
manifest.generatedFrom = `${manifest.generatedFrom ?? 'catalog'}; almost-ready classics`
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(JSON.stringify({ recipesWritten: written, cocktailCount: manifest.cocktailCount }, null, 2))
