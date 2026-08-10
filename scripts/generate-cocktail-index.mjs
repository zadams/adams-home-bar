#!/usr/bin/env node
/**
 * Rebuild src/data/cocktail-index.json from src/data/cocktails/*.json
 *
 *   node scripts/generate-cocktail-index.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'src/data/cocktails')
const outPath = path.join(root, 'src/data/cocktail-index.json')

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
const index = files
  .map((file) => {
    const c = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      file,
      cocktailFamily: c.cocktailFamily,
      classifications: c.classifications ?? [],
      flavorProfiles: c.flavorProfiles ?? [],
      difficulty: c.difficulty,
      strength: c.strength,
      glassware: c.glassware,
      illustrationKey: c.illustrationKey,
      tags: c.tags ?? [],
      ingredientIds: (c.ingredients ?? [])
        .filter((i) => !i.optional)
        .map((i) => i.ingredientId),
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const out = {
  generatedAt: new Date().toISOString(),
  count: index.length,
  cocktails: index,
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n')
console.log(`Wrote ${index.length} cocktails → ${path.relative(root, outPath)}`)
