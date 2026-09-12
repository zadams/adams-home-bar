#!/usr/bin/env node
/**
 * Verify every illustrationKey has a runtime WebP asset, and that the registry
 * telling the app where to find art is telling the truth.
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

const registryPath = path.join(root, 'src/data/illustrations/registry.json')

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const registry = fs.existsSync(registryPath)
  ? JSON.parse(fs.readFileSync(registryPath, 'utf8'))
  : {}
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

const isPending = (key) => Boolean(registry[key]?.pending)

// Pending keys are art deliberately not made yet — the runtime renders a
// placeholder for them by design, so they are reported rather than failed.
const missing = expectedKeys
  .filter((key) => !hasWebp(key) && !isPending(key))
  .sort()
const orphaned = [...foundKeys].filter((key) => !expectedKeys.includes(key)).sort()
const found = expectedKeys.length - missing.length

/**
 * The registry is what resolveIllustration() actually reads. A key can have a
 * file on disk and still render a placeholder if nothing registers it, and an
 * entry can name a file that was never produced -- which costs the viewer a
 * 404 on every card. Neither shows up in a file-count check, so check both.
 *
 * Entries flagged `pending` are art deliberately not made yet; the runtime
 * renders a placeholder for them on purpose, so they are reported, not failed.
 */
const expectedSet = new Set(expectedKeys)

const pendingEntries = Object.keys(registry)
  .filter((key) => registry[key]?.pending)
  .sort()

const brokenSrc = Object.entries(registry)
  .filter(([, entry]) => !entry?.pending)
  .map(([key, entry]) => [key, String(entry?.src ?? '')])
  .filter(([, src]) => {
    if (!src) return true
    const onDisk = path.join(root, 'public', src.replace(/^\//, ''))
    return !fs.existsSync(onDisk) || fs.statSync(onDisk).size <= 500
  })
  .sort()

const staleEntries = Object.keys(registry)
  .filter((key) => !expectedSet.has(key))
  .sort()

// Art that exists but nothing points at: invisible in the app until synced.
const unregistered = expectedKeys
  .filter((key) => hasWebp(key) && !registry[key])
  .sort()

console.log(`Expected:            ${expectedKeys.length}`)
console.log(`Found:               ${found}`)
console.log(`Missing:             ${missing.length}`)
console.log(`Orphaned:            ${orphaned.length}`)
console.log(`Registry entries:    ${Object.keys(registry).length}`)
console.log(`Pending art:         ${pendingEntries.length}`)
console.log(`Broken registry src: ${brokenSrc.length}`)
console.log(`Stale entries:       ${staleEntries.length}`)
console.log(`Unregistered art:    ${unregistered.length}`)

if (missing.length) {
  console.log('\nNO EDITORIAL WEBP:')
  for (const key of missing.slice(0, 40)) {
    const entry = registry[key]
    const via = entry?.src && !entry.src.includes('/webp/')
      ? `  (falling back to ${entry.src})`
      : ''
    console.log(`- webp/${key}.webp${via}`)
  }
  if (missing.length > 40) console.log(`… and ${missing.length - 40} more`)
}

if (orphaned.length) {
  console.log('\nOrphaned files:')
  for (const key of orphaned) console.log(`- ${key}.webp`)
}

if (pendingEntries.length) {
  console.log('\nPending art (not a failure):')
  for (const key of pendingEntries) console.log(`- ${key}`)
}

if (brokenSrc.length) {
  console.log('\nREGISTRY POINTS AT A FILE THAT IS NOT THERE:')
  console.log('(every card for these costs the viewer a 404 before falling back)')
  for (const [key, src] of brokenSrc) console.log(`- ${key} -> ${src || '(no src)'}`)
}

if (staleEntries.length) {
  console.log('\nREGISTRY ENTRY FOR A KEY NO MANIFEST CLAIMS:')
  for (const key of staleEntries) console.log(`- ${key}`)
}

if (unregistered.length) {
  console.log('\nART ON DISK THAT NOTHING REGISTERS (renders a placeholder):')
  console.log('  npm run illustrations:sync-registry')
  for (const key of unregistered) console.log(`- ${key}`)
}

const failures =
  missing.length + brokenSrc.length + staleEntries.length + unregistered.length

if (failures === 0) {
  console.log(
    `\nOK — ${pendingEntries.length ? `${pendingEntries.length} pending, ` : ''}nothing missing or mis-registered.`,
  )
}

process.exitCode = failures ? 1 : 0
