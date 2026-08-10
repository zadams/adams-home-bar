#!/usr/bin/env node
/**
 * Rebuild src/data/illustrations/registry.json from:
 * - illustration-manifest.json (art direction + keys)
 * - public/images/cocktails/webp/*.webp (editorial, preferred)
 * - existing registry / photos/*.jpg (stock photo fallback)
 *
 *   npm run illustrations:sync-registry
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const manifestPath = path.join(
  root,
  'src/data/illustrations/illustration-manifest.json',
)
const registryPath = path.join(root, 'src/data/illustrations/registry.json')
const webpDir = path.join(root, 'public/images/cocktails/webp')
const flatWebpDir = path.join(root, 'public/images/cocktails')
const photosDir = path.join(root, 'public/images/cocktails/photos')

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const existing = fs.existsSync(registryPath)
  ? JSON.parse(fs.readFileSync(registryPath, 'utf8'))
  : {}

function existsAsset(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 500
}

function resolveWebp(key) {
  const nested = path.join(webpDir, `${key}.webp`)
  if (existsAsset(nested)) {
    return `/images/cocktails/webp/${key}.webp`
  }
  const flat = path.join(flatWebpDir, `${key}.webp`)
  if (existsAsset(flat)) {
    return `/images/cocktails/${key}.webp`
  }
  return null
}

function resolvePhoto(key, prev) {
  const disk = path.join(photosDir, `${key}.jpg`)
  if (existsAsset(disk)) return `/images/cocktails/photos/${key}.jpg`
  if (typeof prev?.src === 'string' && prev.src.includes('/photos/')) {
    const local = path.join(root, 'public', prev.src.replace(/^\//, ''))
    if (existsAsset(local)) return prev.src
  }
  if (typeof prev?.fallbackSrc === 'string') {
    const local = path.join(root, 'public', prev.fallbackSrc.replace(/^\//, ''))
    if (existsAsset(local)) return prev.fallbackSrc
  }
  return null
}

const registry = {}
let editorial = 0
let photo = 0
let pending = 0

for (const cocktail of manifest.cocktails) {
  const key = cocktail.illustrationKey
  const prev = existing[key] ?? {}
  const ingredients = cocktail.ingredientIds?.slice(0, 4) ?? prev.ingredients
  const glassware =
    cocktail.artDirection?.sourceGlassware ?? prev.glassware ?? 'Rocks glass'
  const webp = resolveWebp(key)

  if (webp) {
    editorial += 1
    registry[key] = {
      src: webp,
      kind: 'illustration',
      glassware,
      aspectRatio: '1 / 1',
      credit: 'Adams Home Bar editorial illustration',
      ingredients,
      artTemplate: cocktail.artDirection?.template,
      liquidPalette: cocktail.artDirection?.liquidPalette,
      ...(prev.fallbackSrc ? { fallbackSrc: prev.fallbackSrc } : {}),
    }
    continue
  }

  const photoPath = resolvePhoto(key, prev)
  if (photoPath) {
    photo += 1
    registry[key] = {
      src: photoPath,
      kind: 'photo',
      glassware,
      aspectRatio: '4 / 3',
      credit: prev.credit ?? 'TheCocktailDB',
      ingredients,
      ...(prev.fallbackSrc && prev.fallbackSrc !== photoPath
        ? { fallbackSrc: prev.fallbackSrc }
        : {}),
    }
    continue
  }

  // Keep prior entry if it still points somewhere useful
  if (prev.src && prev.kind === 'photo') {
    photo += 1
    registry[key] = {
      ...prev,
      glassware,
      ingredients,
    }
    continue
  }

  pending += 1
  registry[key] = {
    src: `/images/cocktails/webp/${key}.webp`,
    kind: 'illustration',
    glassware,
    aspectRatio: '1 / 1',
    credit: 'Illustration pending',
    ingredients,
    pending: true,
    artTemplate: cocktail.artDirection?.template,
    liquidPalette: cocktail.artDirection?.liquidPalette,
  }
}

for (const [key, value] of Object.entries(existing)) {
  if (!registry[key]) registry[key] = value
}

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n')
console.log(
  JSON.stringify(
    {
      total: Object.keys(registry).length,
      editorial,
      photo,
      pending,
      path: path.relative(root, registryPath),
    },
    null,
    2,
  ),
)
