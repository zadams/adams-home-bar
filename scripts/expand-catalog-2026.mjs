#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const cocktailsDir = path.join(root, 'src/data/cocktails')
const manifestPath = path.join(root, 'src/data/illustrations/illustration-manifest.json')

const additions = [
  ['mezcal', 'Mezcal', 'spirit', 'agave', ['mezcal'], ['agave', 'smoky']],
  ['reposado_tequila', 'Reposado tequila', 'spirit', 'tequila', ['reposado'], ['agave', 'aged']],
  ['pisco', 'Pisco', 'spirit', 'brandy', ['Peruvian brandy'], ['grape', 'brandy']],
  ['cachaca', 'Cachaça', 'spirit', 'cane spirit', ['cachaca'], ['sugarcane', 'Brazil']],
  ['genever', 'Genever', 'spirit', 'gin', ['jenever'], ['malt', 'botanical']],
  ['irish_whiskey', 'Irish whiskey', 'spirit', 'whiskey', ['Irish whisky'], ['whiskey', 'Ireland']],
  ['calvados', 'Calvados', 'spirit', 'brandy', ['apple brandy'], ['apple', 'brandy']],
  ['jamaican_rum', 'Jamaican rum', 'spirit', 'rum', ['Jamaica rum'], ['rum', 'funky']],
  ['agricole_rum', 'Rhum agricole', 'spirit', 'rum', ['rhum agricole'], ['rum', 'grassy']],
  ['dry_sherry', 'Dry sherry', 'liqueur', 'fortified wine', ['fino sherry', 'manzanilla'], ['sherry', 'fortified-wine']],
  ['oloroso_sherry', 'Oloroso sherry', 'liqueur', 'fortified wine', ['oloroso'], ['sherry', 'nutty']],
  ['port', 'Ruby port', 'liqueur', 'fortified wine', ['port wine', 'ruby port'], ['port', 'fortified-wine']],
  ['red_wine', 'Dry red wine', 'mixer', 'wine', ['red wine'], ['wine']],
  ['amaro_averna', 'Averna amaro', 'liqueur', 'amaro', ['Averna'], ['amaro', 'bittersweet']],
  ['cynar', 'Cynar', 'liqueur', 'amaro', ['artichoke amaro'], ['amaro', 'vegetal']],
  ['fernet_branca', 'Fernet-Branca', 'liqueur', 'amaro', ['fernet'], ['amaro', 'bitter']],
  ['yellow_chartreuse', 'Yellow Chartreuse', 'liqueur', 'herbal liqueur', [], ['herbal']],
  ['creme_de_cacao', 'Crème de cacao', 'liqueur', 'chocolate liqueur', ['white crème de cacao'], ['chocolate']],
  ['creme_de_violette', 'Crème de violette', 'liqueur', 'floral liqueur', ['violet liqueur'], ['floral']],
  ['apricot_liqueur', 'Apricot liqueur', 'liqueur', 'fruit liqueur', ['apricot brandy'], ['apricot']],
  ['raspberry_syrup', 'Raspberry syrup', 'syrup', 'fruit syrup', ['raspberry cordial'], ['raspberry']],
  ['passion_fruit_syrup', 'Passion fruit syrup', 'syrup', 'fruit syrup', ['passionfruit syrup'], ['tropical']],
  ['cane_syrup', 'Cane syrup', 'syrup', 'sugar syrup', ['sugar cane syrup'], ['cane']],
  ['allspice_dram', 'Allspice dram', 'liqueur', 'spiced liqueur', ['pimento dram'], ['spice', 'allspice']],
  ['tomato_juice', 'Tomato juice', 'juice', undefined, [], ['savory']],
  ['celery_bitters', 'Celery bitters', 'bitter', undefined, [], ['savory', 'bitters']],
  ['worcestershire_sauce', 'Worcestershire sauce', 'pantry', undefined, [], ['savory']],
  ['hot_sauce', 'Hot sauce', 'pantry', undefined, [], ['spicy']],
  ['raspberry', 'Fresh raspberries', 'fresh', undefined, ['raspberries'], ['berry']],
  ['grape', 'Fresh grapes', 'fresh', undefined, ['grapes'], ['fruit']],
  ['basil', 'Fresh basil', 'fresh', undefined, [], ['herb']],
]

const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'))
const ingredientIds = new Set(ingredients.map((item) => item.id))
for (const [id, name, category, subcategory, aliases, tags] of additions) {
  if (ingredientIds.has(id)) continue
  ingredients.push({ id, name, category, ...(subcategory ? { subcategory } : {}), aliases, tags })
}
fs.writeFileSync(ingredientsPath, `${JSON.stringify(ingredients, null, 2)}\n`)

const ing = (ingredientId, amount, unit = 'oz', extra = {}) => ({
  ingredientId,
  amount,
  unit,
  scaleMode: extra.scaleMode ?? 'linear',
  ...extra,
})

const recipes = [
  ['alexander', 'Alexander', 'A silky cognac, cacao, and cream classic.', 'Brandy', ['creamy', 'chocolate', 'rich'], 'Coupe', 'Shaken; up', ['Fresh nutmeg'], [ing('cognac',1),ing('creme_de_cacao',1),ing('heavy_cream',1)], ['Shake hard with ice.','Fine-strain into a chilled coupe.','Grate nutmeg over the surface.']],
  ['angel-face', 'Angel Face', 'Gin, apricot, and apple brandy in an equal-parts classic.', 'Martini', ['fruity', 'strong', 'aromatic'], 'Coupe', 'Shaken; up', [], [ing('gin',1),ing('apricot_liqueur',1),ing('calvados',1)], ['Shake with ice.','Strain into a chilled coupe.']],
  ['bamboo', 'Bamboo', 'A low-proof, savory aperitif of sherry and dry vermouth.', 'Aperitif', ['dry', 'nutty', 'herbal'], 'Nick & Nora', 'Stirred; up', ['Lemon twist'], [ing('dry_sherry',1.5),ing('dry_vermouth',1.5),ing('orange_bitters',2,'dashes',{scaleMode:'fixed'}),ing('angostura_bitters',1,'dash',{scaleMode:'fixed'})], ['Stir with ice until chilled.','Strain into a chilled Nick & Nora.','Express a lemon twist.']],
  ['bijou', 'Bijou', 'Gin, sweet vermouth, and green Chartreuse make a jewel-toned classic.', 'Martini', ['herbal', 'rich', 'botanical'], 'Nick & Nora', 'Stirred; up', ['Orange twist'], [ing('gin',1),ing('sweet_vermouth',1),ing('green_chartreuse',1),ing('orange_bitters',1,'dash',{scaleMode:'fixed'})], ['Stir with ice.','Strain into a chilled glass.','Express the orange twist.']],
  ['black-manhattan', 'Black Manhattan', 'Averna replaces vermouth for a darker, bittersweet Manhattan.', 'Manhattan', ['bittersweet', 'oak', 'herbal'], 'Nick & Nora', 'Stirred; up', ['Cocktail cherry'], [ing('rye',2),ing('amaro_averna',1),ing('angostura_bitters',1,'dash',{scaleMode:'fixed'}),ing('orange_bitters',1,'dash',{scaleMode:'fixed'})], ['Stir with ice until cold.','Strain into a chilled glass.','Garnish with a cherry.']],
  ['bloody-mary', 'Bloody Mary', 'The essential savory vodka highball.', 'Savory', ['savory', 'spicy', 'tomato'], 'Highball', 'Cubed ice', ['Celery stalk or lemon wedge'], [ing('vodka',1.5),ing('tomato_juice',3),ing('lemon_juice',0.5),ing('worcestershire_sauce',2,'dashes',{scaleMode:'fixed'}),ing('hot_sauce',2,'dashes',{scaleMode:'fixed'}),ing('salt',null,'to_taste',{scaleMode:'fixed'})], ['Roll gently with ice to combine.','Pour into an ice-filled highball.','Garnish simply.']],
  ['brandy-crusta', 'Brandy Crusta', 'A foundational nineteenth-century brandy sour with curaçao and maraschino.', 'Sour', ['citrus', 'brandy', 'aromatic'], 'Wine glass', 'Shaken; up', ['Long lemon peel', 'Sugar rim'], [ing('cognac',2),ing('cointreau',0.25),ing('maraschino',0.25),ing('lemon_juice',0.5),ing('simple_syrup',0.25),ing('angostura_bitters',2,'dashes',{scaleMode:'fixed'})], ['Prepare a partial sugar rim and long lemon peel.','Shake liquid ingredients with ice.','Strain into the prepared glass.']],
  ['caipirinha', 'Caipirinha', 'Brazil’s cachaça, lime, and sugar classic.', 'Caipirinha', ['lime', 'cane', 'refreshing'], 'Rocks glass', 'Crushed ice', ['Lime'], [ing('cachaca',2),ing('lime',1,'piece',{scaleMode:'fixed'}),ing('demerara_sugar',2,'tsp')], ['Muddle lime pieces gently with sugar.','Add cachaça and crushed ice.','Churn briefly and cap with more ice.']],
  ['canchanchara', 'Canchánchara', 'Cuban aguardiente-style rum brightened with honey and lime.', 'Sour', ['honey', 'lime', 'cane'], 'Rocks glass', 'Cubed ice', ['Lime wedge'], [ing('white_rum',2),ing('honey_syrup',0.5),ing('lime_juice',0.5)], ['Shake with ice.','Strain over fresh ice.','Garnish with lime.']],
  ['clover-club', 'Clover Club', 'A pre-Prohibition gin sour with raspberry and a soft foam cap.', 'Sour', ['raspberry', 'citrus', 'silky'], 'Coupe', 'Shaken; up', ['Fresh raspberries'], [ing('gin',1.5),ing('raspberry_syrup',0.5),ing('lemon_juice',0.5),ing('egg_white',0.5)], ['Dry-shake without ice.','Shake again with ice.','Fine-strain into a chilled coupe.']],
  ['division-bell', 'Division Bell', 'Mezcal, Aperol, maraschino, and lime in a smoky modern sour.', 'Last Word', ['smoky', 'bitter', 'citrus'], 'Coupe', 'Shaken; up', ['Grapefruit twist'], [ing('mezcal',1),ing('aperol',0.75),ing('maraschino',0.5),ing('lime_juice',0.75)], ['Shake with ice.','Fine-strain into a chilled coupe.','Express grapefruit oil.']],
  ['enzoni', 'Enzoni', 'A Negroni-meets-gin-sour with muddled grapes.', 'Sour', ['bitter', 'grape', 'citrus'], 'Rocks glass', 'Large cube', ['Fresh grape'], [ing('gin',1),ing('campari',1),ing('lemon_juice',0.75),ing('simple_syrup',0.5),ing('grape',5,'piece',{optional:true,scaleMode:'fixed'})], ['Muddle grapes with syrup.','Shake with remaining ingredients and ice.','Fine-strain over fresh ice.']],
  ['fernandito', 'Fernandito', 'Argentina’s bracing combination of fernet and cola.', 'Highball', ['bitter', 'cola', 'herbal'], 'Highball', 'Cubed ice', [], [ing('fernet_branca',1.5),ing('cola',null,'top',{scaleMode:'top'})], ['Fill a highball with ice.','Add fernet and top slowly with cola.','Stir once.']],
  ['final-ward', 'Final Ward', 'A rye-and-lemon variation on the Last Word.', 'Last Word', ['herbal', 'citrus', 'spicy'], 'Coupe', 'Shaken; up', [], [ing('rye',0.75),ing('green_chartreuse',0.75),ing('maraschino',0.75),ing('lemon_juice',0.75)], ['Shake equal parts with ice.','Fine-strain into a chilled coupe.']],
  ['hanky-panky', 'Hanky Panky', 'A Martinez-like gin cocktail sharpened by Fernet-Branca.', 'Martini', ['herbal', 'bitter', 'rich'], 'Nick & Nora', 'Stirred; up', ['Orange twist'], [ing('gin',1.5),ing('sweet_vermouth',1.5),ing('fernet_branca',0.25)], ['Stir with ice.','Strain into a chilled glass.','Express an orange twist.']],
  ['japanese-cocktail', 'Japanese Cocktail', 'Cognac, orgeat, and bitters—simple, nutty, and aromatic.', 'Old Fashioned', ['nutty', 'brandy', 'aromatic'], 'Coupe', 'Shaken; up', ['Lemon twist'], [ing('cognac',2),ing('orgeat',0.5),ing('angostura_bitters',2,'dashes',{scaleMode:'fixed'})], ['Shake with ice.','Fine-strain into a chilled coupe.','Express lemon oil.']],
  ['naked-and-famous', 'Naked and Famous', 'Equal parts mezcal, yellow Chartreuse, Aperol, and lime.', 'Last Word', ['smoky', 'herbal', 'citrus'], 'Coupe', 'Shaken; up', [], [ing('mezcal',0.75),ing('yellow_chartreuse',0.75),ing('aperol',0.75),ing('lime_juice',0.75)], ['Shake equal parts with ice.','Fine-strain into a chilled coupe.']],
  ['new-york-sour', 'New York Sour', 'A whiskey sour finished with a dramatic red-wine float.', 'Sour', ['citrus', 'wine', 'oak'], 'Rocks glass', 'Large cube', ['Lemon twist'], [ing('rye',2),ing('lemon_juice',0.75),ing('simple_syrup',0.75),ing('egg_white',0.5,'oz',{optional:true}),ing('red_wine',0.5)], ['Shake everything except wine with ice.','Strain over a large cube.','Float the red wine over the back of a spoon.']],
  ['oaxaca-old-fashioned', 'Oaxaca Old Fashioned', 'Reposado tequila and mezcal recast the Old Fashioned.', 'Old Fashioned', ['agave', 'smoky', 'bittersweet'], 'Rocks glass', 'Large cube', ['Orange twist'], [ing('reposado_tequila',1.5),ing('mezcal',0.5),ing('agave_syrup',0.25),ing('angostura_bitters',2,'dashes',{scaleMode:'fixed'})], ['Stir with ice.','Strain over a large cube.','Express an orange twist.']],
  ['old-cuban', 'Old Cuban', 'An aged-rum mint sour lengthened with sparkling wine.', 'Fizz', ['mint', 'citrus', 'sparkling'], 'Coupe', 'Shaken; up', ['Mint leaf'], [ing('gold_rum',1.5),ing('lime_juice',0.75),ing('simple_syrup',0.75),ing('angostura_bitters',2,'dashes',{scaleMode:'fixed'}),ing('mint',6,'piece',{scaleMode:'fixed'}),ing('prosecco',2,'oz',{scaleMode:'top'})], ['Shake everything except sparkling wine with ice.','Double-strain into a coupe.','Top with sparkling wine and garnish.']],
  ['pisco-sour', 'Pisco Sour', 'Pisco, citrus, sugar, and egg white with aromatic bitters.', 'Sour', ['grape', 'citrus', 'silky'], 'Coupe', 'Shaken; up', ['Bitters on foam'], [ing('pisco',2),ing('lemon_juice',1),ing('simple_syrup',0.75),ing('egg_white',1,'piece',{scaleMode:'fixed'}),ing('angostura_bitters',3,'dashes',{optional:true,scaleMode:'fixed'})], ['Dry-shake without ice.','Shake again with ice.','Strain and dot bitters over the foam.']],
  ['porto-flip', 'Porto Flip', 'Port, cognac, and egg in a rich nineteenth-century flip.', 'Flip', ['rich', 'wine', 'spiced'], 'Coupe', 'Shaken; up', ['Fresh nutmeg'], [ing('cognac',0.5),ing('port',1.5),ing('egg_white',1,'piece',{label:'Whole egg',scaleMode:'fixed'})], ['Shake without ice to emulsify.','Shake hard with ice.','Fine-strain and grate nutmeg on top.']],
  ['revolver', 'Revolver', 'Bourbon and coffee liqueur with orange bitters.', 'Old Fashioned', ['coffee', 'oak', 'orange'], 'Nick & Nora', 'Stirred; up', ['Flamed orange peel'], [ing('bourbon',2),ing('coffee_liqueur',0.5),ing('orange_bitters',2,'dashes',{scaleMode:'fixed'})], ['Stir with ice.','Strain into a chilled glass.','Express orange oil over the drink.']],
  ['saturn', 'Saturn', 'A bright gin tiki drink with passion fruit, falernum, and orgeat.', 'Tiki', ['tropical', 'citrus', 'spiced'], 'Coupe', 'Shaken; up', ['Lemon peel'], [ing('gin',1.25),ing('lemon_juice',0.5),ing('passion_fruit_syrup',0.5),ing('falernum',0.25),ing('orgeat',0.25)], ['Shake with crushed ice.','Open-pour or fine-strain into a chilled glass.','Garnish with lemon peel.']],
  ['sherry-cobbler', 'Sherry Cobbler', 'A refreshing nineteenth-century mix of sherry, sugar, citrus, and crushed ice.', 'Cobbler', ['nutty', 'citrus', 'refreshing'], 'Wine glass', 'Crushed ice', ['Seasonal berries', 'Orange slice'], [ing('oloroso_sherry',3),ing('simple_syrup',0.5),ing('orange',2,'piece',{label:'Orange half-wheels',scaleMode:'fixed'})], ['Shake briefly with ice.','Strain over crushed ice.','Garnish with fruit.']],
  ['trinidad-sour', 'Trinidad Sour', 'Angostura bitters lead this unusually spicy, almond-rich sour.', 'Sour', ['spiced', 'almond', 'citrus'], 'Coupe', 'Shaken; up', [], [ing('angostura_bitters',1.5),ing('orgeat',1),ing('lemon_juice',0.75),ing('rye',0.5)], ['Shake hard with ice.','Fine-strain into a chilled coupe.']],
]

const knownIngredients = new Set(ingredients.map((item) => item.id))
const existingFiles = new Set(fs.readdirSync(cocktailsDir))
let written = 0
for (const [id,name,description,family,flavors,glassware,ice,garnish,recipeIngredients,steps] of recipes) {
  const file = `${id}.json`
  if (existingFiles.has(file)) continue
  for (const item of recipeIngredients) {
    if (!knownIngredients.has(item.ingredientId)) {
      throw new Error(`${name}: unknown ingredient ${item.ingredientId}`)
    }
  }
  const data = {
    id, slug:id, name, aliases:[], description,
    history:'An established classic or modern-classic recipe added during the 2026 catalog expansion.',
    origin:'International', whyItWorks:'Each ingredient has a distinct structural role: base, modifier, sweetness, acidity, dilution, or aroma.',
    classifications:['classic'], cocktailFamily:family, flavorProfiles:flavors,
    difficulty:'medium', preparationTime:5, strength:'medium', glassware, ice, garnish,
    illustrationKey:id, featuredBottleImages:[], ingredients:recipeIngredients, steps,
    techniqueNotes:[], recommendedBottles:[], substitutions:[], variations:[], relatedCocktailIds:[],
    seasonality:['year-round'], tags:[family.toLowerCase().replaceAll(' ','-'), ...flavors],
  }
  fs.writeFileSync(path.join(cocktailsDir,file), `${JSON.stringify(data,null,2)}\n`)
  written += 1
}
console.log(JSON.stringify({ ingredients: ingredients.length, recipesAdded: written }, null, 2))

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const manifestKeys = new Set(manifest.cocktails.map((item) => item.illustrationKey))
const glassId = (glassware) => {
  const value = glassware.toLowerCase()
  if (value.includes('nick')) return 'nick-and-nora'
  if (value.includes('coupe')) return 'coupe'
  if (value.includes('highball')) return 'highball'
  if (value.includes('wine')) return 'wine'
  return 'double-old-fashioned'
}
const paletteFor = (flavors) => {
  if (flavors.includes('tomato')) return { name: 'savory-red', hex: '#A7372C' }
  if (flavors.includes('creamy') || flavors.includes('rich')) return { name: 'cafe-cream', hex: '#A88162' }
  if (flavors.includes('raspberry') || flavors.includes('wine')) return { name: 'deep-garnet', hex: '#742833' }
  if (flavors.includes('herbal')) return { name: 'herbal-gold', hex: '#9A8B45' }
  if (flavors.includes('lime') || flavors.includes('citrus')) return { name: 'pale-citrus', hex: '#D7D39A' }
  return { name: 'warm-amber', hex: '#B06932' }
}
for (const [id] of recipes) {
  if (manifestKeys.has(id)) continue
  const cocktail = JSON.parse(fs.readFileSync(path.join(cocktailsDir, `${id}.json`), 'utf8'))
  manifest.cocktails.push({
    id: cocktail.id,
    slug: cocktail.slug,
    name: cocktail.name,
    illustrationKey: cocktail.illustrationKey,
    cocktailFamily: cocktail.cocktailFamily,
    classifications: cocktail.classifications,
    flavorProfiles: cocktail.flavorProfiles,
    ingredientIds: cocktail.ingredients.filter((item) => !item.optional).map((item) => item.ingredientId),
    artDirection: {
      template: cocktail.cocktailFamily.toLowerCase().replaceAll(' ', '-'),
      glass: glassId(cocktail.glassware),
      sourceGlassware: cocktail.glassware,
      ice: cocktail.ice,
      garnish: cocktail.garnish.join(' and ') || 'none',
      liquidPalette: paletteFor(cocktail.flavorProfiles),
      composition: 'single centered hero cocktail, three-quarter view, generous safe area, no text, no bottle labels',
      background: 'deep emerald-to-charcoal matte backdrop above a dark walnut bar, restrained brass accents',
      lighting: 'warm amber key from upper left, soft neutral fill, subtle rim light, realistic shadow',
      output: {
        master: `cocktails/masters/${id}.png`,
        runtime: `cocktails/webp/${id}.webp`,
        thumbnail: `cocktails/thumbs/${id}.webp`,
      },
    },
  })
}
manifest.cocktails.sort((a, b) => a.name.localeCompare(b.name))
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
