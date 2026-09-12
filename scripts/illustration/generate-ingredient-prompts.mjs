#!/usr/bin/env node
/**
 * Write one prompt .txt per ingredient that needs generated art, either because
 * TheCocktailDB has no image for it or because the closest image it has is the
 * wrong thing (a generic "Bitters" bottle standing in for celery bitters).
 *
 * Ingredient art is product photography, not the editorial style the cocktail
 * illustrations use — the existing 126 photos are single bottles on a plain
 * light ground, and anything generated has to sit beside them without looking
 * out of place.
 *
 *   node scripts/illustration/generate-ingredient-prompts.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const outputDir = path.join(root, 'docs/illustration-system/ingredient-prompts')

const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'))
const byId = Object.fromEntries(ingredients.map((i) => [i.id, i]))
fs.mkdirSync(outputDir, { recursive: true })

/** id → what the picture needs to show. */
const JOBS = {
  // No image exists in TheCocktailDB at all.
  genever: {
    reason: 'no source image',
    subject:
      'a squat stone or ceramic crock bottle of oude genever, the traditional Dutch malt-wine gin vessel, tan-grey glaze with a short neck',
  },
  raspberry: {
    reason: 'no source image',
    subject:
      'a small heap of six or seven fresh raspberries, deep red, one turned to show the hollow centre',
  },
  rumchata: {
    reason: 'no source image',
    subject:
      'a tall frosted-white bottle of horchata cream liqueur, opaque pale cream liquid, cinnamon-toned label area left blank',
  },
  pickle_brine: {
    reason: 'no source image',
    subject:
      'a short glass tumbler of cloudy pale-green dill pickle brine beside a single dill sprig, no pickles in frame',
  },

  // An image was fetched, but it is the wrong subject — replace when generated.
  agricole_rum: {
    reason: 'fetched image is a generic light rum, not agricole',
    subject:
      'a slim clear bottle of rhum agricole blanc from Martinique, water-clear spirit, tall shoulders, blank label panel',
  },
  celery_bitters: {
    reason: 'fetched image is a generic bitters bottle',
    subject:
      'a small 4 oz dasher bottle of celery bitters, amber glass, narrow dasher top, a pale celery-green label panel',
  },
  cinnamon_whisky: {
    reason: 'fetched image is Firewater, a different brand',
    subject:
      'a bottle of cinnamon whisky, warm red-amber liquid, broad shoulders, a cinnamon stick resting at the base',
  },
  jamaican_rum: {
    reason: 'fetched image is a generic dark rum',
    subject:
      'a bottle of Jamaican pot-still rum, deep mahogany liquid, squat heavy-shouldered bottle, blank label panel',
  },
}

function buildPrompt(id, job) {
  const ing = byId[id]
  if (!ing) throw new Error(`Unknown ingredient: ${id}`)
  return `Product photograph of a single bar ingredient: ${ing.name}.

SUBJECT
${job.subject}

HOUSE STYLE — match the existing ingredient photo set exactly:
- One object, centred, shot straight on at eye level.
- Plain near-white seamless background, no surface texture, no bar scene.
- Soft even studio lighting, gentle falloff, one soft shadow directly beneath.
- The object fills roughly 70% of the frame height with clear margin all round.
- Square crop.
- NO text, NO brand names, NO logos, NO lettering of any kind on the label —
  leave label panels blank or abstractly coloured. This is important: these
  images sit next to real brand photography and must not imitate a brand.
- No hands, no people, no props beyond what the subject line names.
- Photographic, not illustrated. No painterly or editorial treatment.

CONTEXT
- Category: ${ing.category}${ing.subcategory ? ` / ${ing.subcategory}` : ''}
- Known as: ${[ing.name, ...(ing.aliases ?? [])].join(', ')}
- Why it is being generated: ${job.reason}

OUTPUT
Save as ${id}.png, square, at least 600x600, transparent or near-white background.
`
}

const written = []
for (const [id, job] of Object.entries(JOBS)) {
  const prompt = buildPrompt(id, job)
  fs.writeFileSync(path.join(outputDir, `${id}.txt`), prompt, 'utf8')
  written.push(id)
}

console.log(`Wrote ${written.length} ingredient prompts to ${path.relative(root, outputDir)}`)
console.log('\nMissing entirely:')
for (const [id, job] of Object.entries(JOBS)) {
  if (job.reason === 'no source image') console.log(`  ${id}`)
}
console.log('\nFetched but wrong subject — replace when generated:')
for (const [id, job] of Object.entries(JOBS)) {
  if (job.reason !== 'no source image') console.log(`  ${id.padEnd(16)} ${job.reason}`)
}
console.log(
  '\nDrop finished PNGs in public/images/ingredients/photos/ named <id>.png;',
)
console.log('registry entries already exist for the replacements, and')
console.log('download-ingredient-photos.mjs will register any new ones it finds missing.')
