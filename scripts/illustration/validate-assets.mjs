#!/usr/bin/env node
/**
 * Verify every illustrationKey has a runtime WebP asset.
 *
 * Expected layout (Illustration Bible / manifest):
 *   public/images/cocktails/webp/{illustrationKey}.webp
 *
 * Also accepts flat:
 *   public/images/cocktails/{illustrationKey}.webp
 *
 *   npm run illustrations:validate
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const manifestPath =
  process.argv[2] ??
  path.join(root, 'src/data/illustrations/illustration-manifest.json')
const cocktailsImageRoot =
  process.argv[3] ?? path.join(root, 'public/images/cocktails')

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const expectedKeys = manifest.cocktails.map((c) => c.illustrationKey)

function hasWebp(key) {
  const candidates = [
    path.join(cocktailsImageRoot, 'webp', `${key}.webp`),
    path.join(cocktailsImageRoot, `${key}.webp`),
  ]
  return candidates.some((p) => fs.existsSync(p) && fs.statSync(p).size > 500)
}

function listWebpKeys(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith('.webp'))
    .map((name) => name.replace(/\.webp$/i, ''))
}

const foundKeys = new Set([
  ...listWebpKeys(path.join(cocktailsImageRoot, 'webp')),
  ...listWebpKeys(cocktailsImageRoot),
])

const missing = expectedKeys.filter((key) => !hasWebp(key)).sort()
const orphaned = [...foundKeys].filter((key) => !expectedKeys.includes(key)).sort()
const found = expectedKeys.length - missing.length

console.log(`Expected: ${expectedKeys.length}`)
console.log(`Found: ${found}`)
console.log(`Missing: ${missing.length}`)
console.log(`Orphaned: ${orphaned.length}`)

if (missing.length) {
  console.log('\nMissing files:')
  for (const key of missing.slice(0, 40)) {
    console.log(`- webp/${key}.webp`)
  }
  if (missing.length > 40) console.log(`… and ${missing.length - 40} more`)
}

if (orphaned.length) {
  console.log('\nOrphaned files:')
  for (const key of orphaned) console.log(`- ${key}.webp`)
}

process.exitCode = missing.length ? 1 : 0
