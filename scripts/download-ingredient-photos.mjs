#!/usr/bin/env node
/**
 * Fetch ingredient photos from TheCocktailDB for any ingredient that has no
 * entry in src/data/illustrations/ingredients.json, and register what lands.
 *
 * TheCocktailDB serves ingredient art at a predictable path keyed on the
 * ingredient's own name, so the work is mostly guessing the name it files a
 * thing under — hence SEARCH_NAMES below. Anything that misses every candidate
 * is reported at the end as needing generated art instead.
 *
 *   node scripts/download-ingredient-photos.mjs            # fetch and register
 *   node scripts/download-ingredient-photos.mjs --dry-run  # report only
 */
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const registryPath = path.join(root, 'src/data/illustrations/ingredients.json')
const photosDir = path.join(root, 'public/images/ingredients/photos')
const dryRun = process.argv.includes('--dry-run')

const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'))
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
fs.mkdirSync(photosDir, { recursive: true })

/**
 * Names TheCocktailDB is likely to file each ingredient under, most specific
 * first. Its library is branded where the bar is generic ("Midori" not "melon
 * liqueur"), so the catalog's own name is often the worst candidate.
 */
const SEARCH_NAMES = {
  amaretto: ['Amaretto'],
  jagermeister: ['Jagermeister', 'Jägermeister'],
  cinnamon_whisky: ['Firewater', 'Cinnamon Schnapps'],
  melon_liqueur: ['Midori melon liqueur', 'Midori'],
  butterscotch_schnapps: ['Butterscotch schnapps', 'Butterscotch Liqueur'],
  sour_apple_schnapps: ['Apple schnapps', 'Sour Apple Pucker'],
  southern_comfort: ['Southern Comfort'],
  sloe_gin: ['Sloe gin'],
  sambuca: ['Sambuca'],
  energy_drink: ['Red Bull', 'Energy drink'],
  lager_beer: ['Lager', 'Beer'],
  irish_stout: ['Guinness stout', 'Stout'],
  lemon_lime_soda: ['Sprite', '7-Up', 'Lemon-lime soda'],
  whipped_cream: ['Whipped cream'],
  heavy_cream: ['Heavy cream', 'Cream'],
  tomato_juice: ['Tomato juice'],
  cranberry_juice: ['Cranberry juice'],
  hot_sauce: ['Hot Sauce', 'Tabasco Sauce'],
  worcestershire_sauce: ['Worcestershire sauce'],
  grenadine: ['Grenadine'],
  raspberry_syrup: ['Raspberry syrup'],
  passion_fruit_syrup: ['Passion fruit syrup', 'Passion fruit juice'],
  cane_syrup: ['Sugar syrup', 'Sirup of Roses'],
  basil: ['Basil'],
  raspberry: ['Raspberry', 'Raspberries'],
  grape: ['Grapes', 'Grape'],
  celery_bitters: ['Bitters'],
  creme_de_violette: ['Creme De Violette', 'Violet Syrup'],
  yellow_chartreuse: ['Yellow Chartreuse'],
  cynar: ['Cynar'],
  fernet_branca: ['Fernet Branca'],
  amaro_averna: ['Averna', 'Amaro'],
  allspice_dram: ['Allspice Dram', 'Pimento Dram'],
  apricot_liqueur: ['Apricot brandy', 'Apricot Nectar'],
  dry_sherry: ['Dry Sherry', 'Sherry'],
  oloroso_sherry: ['Sherry'],
  port: ['Port', 'Ruby port'],
  genever: ['Jenever', 'Dutch gin'],
  irish_whiskey: ['Irish whiskey', 'Jameson'],
  jamaican_rum: ['Dark rum', 'Rum'],
  agricole_rum: ['Rhum', 'Light rum'],
  cachaca: ['Cachaca'],
  calvados: ['Calvados', 'Applejack'],
  pisco: ['Pisco'],
  mezcal: ['Mezcal'],
  reposado_tequila: ['Tequila'],
  rumchata: ['Rumchata', 'Horchata'],
  pickle_brine: ['Pickle Juice'],
  red_wine: ['Red wine'],
  hot_water: ['Water'],
}

function candidatesFor(ing) {
  const listed = SEARCH_NAMES[ing.id] ?? []
  return [...listed, ing.name, ...(ing.aliases ?? [])].filter(Boolean)
}

function imageUrl(name) {
  return `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(name)}.png`
}

function fetchBuffer(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 4) return reject(new Error('too many redirects'))
    https
      .get(url, { headers: { 'User-Agent': 'home-bar/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume()
          return fetchBuffer(res.headers.location, depth + 1).then(resolve, reject)
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const buf = Buffer.concat(chunks)
          // TheCocktailDB answers unknown names with a tiny placeholder rather
          // than a 404, so size is the real test of whether art came back.
          if (res.statusCode !== 200 || buf.length < 2000) {
            reject(new Error(`HTTP ${res.statusCode}, ${buf.length} bytes`))
            return
          }
          resolve(buf)
        })
      })
      .on('error', reject)
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const missing = ingredients.filter((i) => !registry[i.id])
console.log(
  `${ingredients.length} ingredients, ${Object.keys(registry).length} with photos, ${missing.length} without.\n`,
)

const fetched = []
const failed = []

for (const ing of missing) {
  const names = candidatesFor(ing)
  if (dryRun) {
    console.log(`  ${ing.id} → would try: ${names.join(', ')}`)
    continue
  }
  let got = null
  for (const name of names) {
    try {
      const buf = await fetchBuffer(imageUrl(name))
      got = { name, buf }
      break
    } catch {
      await sleep(120)
    }
  }
  if (!got) {
    failed.push(ing)
    console.log(`  ✗ ${ing.id}`)
    continue
  }
  fs.writeFileSync(path.join(photosDir, `${ing.id}.png`), got.buf)
  registry[ing.id] = {
    src: `/images/ingredients/photos/${ing.id}.png`,
    name: ing.name,
    credit: 'TheCocktailDB',
  }
  fetched.push({ id: ing.id, via: got.name, kb: Math.round(got.buf.length / 1024) })
  console.log(`  ✓ ${ing.id.padEnd(24)} via "${got.name}" (${Math.round(got.buf.length / 1024)} KB)`)
  await sleep(180)
}

if (!dryRun) {
  const sorted = Object.fromEntries(Object.keys(registry).sort().map((k) => [k, registry[k]]))
  fs.writeFileSync(registryPath, `${JSON.stringify(sorted, null, 2)}\n`)
  console.log(`\nfetched ${fetched.length}, still missing ${failed.length}`)
  if (failed.length) {
    console.log('\nNeeds generated art:')
    for (const f of failed) console.log(`  ${f.category.padEnd(9)} ${f.id.padEnd(24)} ${f.name}`)
  }
}
