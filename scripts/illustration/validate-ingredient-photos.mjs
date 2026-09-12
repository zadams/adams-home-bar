#!/usr/bin/env node
/**
 * Verify every ingredient has a photo, that every registered photo exists on
 * disk, and that the registry has no entries for ingredients that are gone.
 *
 * Cocktail art has had a validator since the start; ingredient photos never
 * did, which is how the gap reached 50 unnoticed — nothing failed when an
 * ingredient was added without one.
 *
 * This is a ratchet, not a wall. Art we have already queued for generation is
 * listed in PENDING below and reported without failing, so the check can be
 * wired into CI today. Anything NOT on that list is a new gap and fails.
 *
 *   node scripts/illustration/validate-ingredient-photos.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const ingredientsPath = path.join(root, 'src/data/ingredients/ingredients.json')
const registryPath = path.join(root, 'src/data/illustrations/ingredients.json')
const photosDir = path.join(root, 'public/images/ingredients/photos')

/**
 * Known gaps with generation already queued — see
 * docs/illustration-system/ingredient-prompts/. Add an id here when art is
 * commissioned, and delete it when the art lands; the check then holds that
 * ingredient to the same standard as the rest.
 *
 * Empty, and worth keeping that way: every ingredient currently has a photo.
 */
const PENDING = new Set([])

const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'))
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
const ids = new Set(ingredients.map((i) => i.id))

const noEntry = []
const pendingSeen = []
for (const ing of ingredients) {
  if (registry[ing.id]) continue
  ;(PENDING.has(ing.id) ? pendingSeen : noEntry).push(ing)
}

// A registry entry is only worth anything if the file behind it is really there.
const brokenSrc = []
for (const [id, entry] of Object.entries(registry)) {
  const rel = String(entry.src ?? '').replace(/^\//, '')
  if (!rel) {
    brokenSrc.push([id, '(no src)'])
    continue
  }
  const onDisk = path.join(root, 'public', rel)
  if (!fs.existsSync(onDisk) || fs.statSync(onDisk).size < 1000) {
    brokenSrc.push([id, entry.src])
  }
}

const staleEntries = Object.keys(registry).filter((id) => !ids.has(id)).sort()

const referenced = new Set(
  Object.values(registry).map((e) => path.basename(String(e.src ?? ''))),
)
const orphanFiles = fs.existsSync(photosDir)
  ? fs.readdirSync(photosDir).filter((f) => !referenced.has(f)).sort()
  : []

console.log(`Ingredients:      ${ingredients.length}`)
console.log(`With a photo:     ${ingredients.length - noEntry.length - pendingSeen.length}`)
console.log(`Pending art:      ${pendingSeen.length}`)
console.log(`Missing (new):    ${noEntry.length}`)
console.log(`Broken src:       ${brokenSrc.length}`)
console.log(`Stale entries:    ${staleEntries.length}`)
console.log(`Orphan files:     ${orphanFiles.length}`)

if (pendingSeen.length) {
  console.log('\nPending generation (not a failure):')
  for (const i of pendingSeen) console.log(`  ${i.id.padEnd(22)} ${i.name}`)
}

if (noEntry.length) {
  console.log('\nNO PHOTO — add one, or add the id to PENDING with a prompt:')
  for (const i of noEntry) console.log(`  ${i.category.padEnd(9)} ${i.id.padEnd(22)} ${i.name}`)
  console.log('\n  npm run ingredients:photos    fetch what TheCocktailDB has')
  console.log('  npm run ingredients:prompts   write prompts for the rest')
}

if (brokenSrc.length) {
  console.log('\nREGISTERED BUT FILE MISSING:')
  for (const [id, src] of brokenSrc) console.log(`  ${id.padEnd(22)} ${src}`)
}

if (staleEntries.length) {
  console.log('\nREGISTRY ENTRY FOR AN INGREDIENT THAT NO LONGER EXISTS:')
  for (const id of staleEntries) console.log(`  ${id}`)
}

if (orphanFiles.length) {
  console.log('\nFiles on disk nothing references (not a failure):')
  for (const f of orphanFiles) console.log(`  ${f}`)
}

const failures = noEntry.length + brokenSrc.length + staleEntries.length
if (failures === 0) {
  console.log(
    `\nOK — ${pendingSeen.length ? `${pendingSeen.length} pending, ` : ''}no new gaps.`,
  )
}
process.exitCode = failures ? 1 : 0
