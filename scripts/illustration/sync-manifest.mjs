#!/usr/bin/env node
/** Add missing cocktail records to the illustration manifest without changing existing art direction. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const cocktailsDir = path.join(root, 'src/data/cocktails')
const manifestPath = path.join(root, 'src/data/illustrations/illustration-manifest.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const known = new Set(manifest.cocktails.map((item) => item.illustrationKey))

function glassId(glassware) {
  const value = glassware.toLowerCase()
  if (value.includes('shot') && value.includes('beer')) return 'shot-and-beer'
  if (value.includes('two shot')) return 'two-shot-glasses'
  if (value.includes('shot')) return 'shot-glass'
  if (value.includes('nick')) return 'nick-and-nora'
  if (value.includes('coupe')) return 'coupe'
  if (value.includes('wine')) return 'wine'
  if (value.includes('highball')) return 'highball'
  if (value.includes('collins')) return 'collins'
  return 'double-old-fashioned'
}

function palette(cocktail) {
  const flavors = cocktail.flavorProfiles ?? []
  const ingredients = cocktail.ingredients.map((item) => item.ingredientId)
  if (ingredients.includes('blue_curacao')) return { name: 'electric-blue', hex: '#168DB5' }
  if (ingredients.includes('melon_liqueur') || ingredients.includes('green_chartreuse')) {
    return { name: 'herbal-green', hex: '#7FA34A' }
  }
  if (ingredients.includes('cranberry_juice') || ingredients.includes('grenadine')) {
    return { name: 'ruby-red', hex: '#9E2434' }
  }
  if (flavors.includes('cream') || flavors.includes('dessert')) {
    return { name: 'cafe-cream', hex: '#A88162' }
  }
  if (flavors.includes('bitter') || flavors.includes('coffee')) {
    return { name: 'deep-amber', hex: '#6A351E' }
  }
  if (flavors.includes('floral')) return { name: 'violet', hex: '#8C729E' }
  if (flavors.includes('citrus')) return { name: 'pale-citrus', hex: '#D7D39A' }
  return { name: 'warm-amber', hex: '#B06932' }
}

let added = 0
for (const filename of fs.readdirSync(cocktailsDir).filter((file) => file.endsWith('.json'))) {
  const cocktail = JSON.parse(fs.readFileSync(path.join(cocktailsDir, filename), 'utf8'))
  if (known.has(cocktail.illustrationKey)) continue
  const key = cocktail.illustrationKey
  manifest.cocktails.push({
    id: cocktail.id,
    slug: cocktail.slug,
    name: cocktail.name,
    illustrationKey: key,
    cocktailFamily: cocktail.cocktailFamily,
    classifications: cocktail.classifications,
    flavorProfiles: cocktail.flavorProfiles,
    ingredientIds: cocktail.ingredients.filter((item) => !item.optional).map((item) => item.ingredientId),
    artDirection: {
      template: cocktail.classifications.includes('shot') ? 'shot' : cocktail.cocktailFamily.toLowerCase().replaceAll(' ', '-'),
      glass: glassId(cocktail.glassware),
      sourceGlassware: cocktail.glassware,
      ice: cocktail.ice,
      garnish: cocktail.garnish.join(' and ') || 'none',
      liquidPalette: palette(cocktail),
      composition: 'single centered hero drink, three-quarter view, generous safe area, no text or labels',
      background: 'deep emerald-to-charcoal matte backdrop above a dark walnut bar',
      lighting: 'warm key from upper left, soft neutral fill, subtle rim light, realistic shadow',
      output: {
        master: `cocktails/masters/${key}.png`,
        runtime: `cocktails/webp/${key}.webp`,
        thumbnail: `cocktails/thumbs/${key}.webp`,
      },
    },
  })
  known.add(key)
  added += 1
}

manifest.cocktails.sort((a, b) => a.name.localeCompare(b.name))
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({ total: manifest.cocktails.length, added }, null, 2))
