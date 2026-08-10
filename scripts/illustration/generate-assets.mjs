#!/usr/bin/env node
/**
 * Generate cocktail illustrations from the illustration manifest.
 * Uses Pollinations (no API key) as the bootstrap generator.
 *
 *   node scripts/illustration/generate-assets.mjs --hero
 *   node scripts/illustration/generate-assets.mjs --all
 *   node scripts/illustration/generate-assets.mjs --keys negroni,martini
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(root, 'src/data/illustrations/illustration-manifest.json'),
    'utf8',
  ),
)

const webpDir = path.join(root, 'public/images/cocktails/webp')
const thumbsDir = path.join(root, 'public/images/cocktails/thumbs')
const mastersDir = path.join(root, 'public/images/cocktails/masters')
const tmpDir = path.join(root, 'tmp/illustration-gen')

for (const dir of [webpDir, thumbsDir, mastersDir, tmpDir]) {
  fs.mkdirSync(dir, { recursive: true })
}

const HERO_KEYS = [
  'old-fashioned',
  'negroni',
  'martini',
  'daiquiri',
  'whiskey-sour',
  'manhattan',
  'sazerac',
  'boulevardier',
  'aperol-spritz',
  'paloma',
  'margarita',
  'tom-collins',
  'southside',
  'mai-tai',
  'jungle-bird',
  'pina-colada',
  'mojito',
  'bees-knees',
  'blood-and-sand',
  'banana-old-fashioned',
]

function parseArgs(argv) {
  const opts = { hero: false, all: false, keys: [], force: false, limit: Infinity }
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--hero') opts.hero = true
    else if (a === '--all') opts.all = true
    else if (a === '--force') opts.force = true
    else if (a === '--limit') opts.limit = Number(argv[++i])
    else if (a === '--keys') {
      opts.keys = argv[++i].split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  return opts
}

function buildPrompt(c) {
  const a = c.artDirection
  return [
    `Editorial digital painting of a ${c.name} cocktail, single centered glass.`,
    'Painterly luxury cocktail-book illustration, not a photo, not 3D, not cartoon.',
    'Dark walnut surface, deep emerald charcoal matte background, no bottles, no people, no text.',
    'Warm amber light from upper left, three-quarter view slightly above.',
    `Glass: ${a.glass}. Ice: ${a.ice}. Garnish: ${a.garnish}.`,
    `Liquid color ${a.liquidPalette.name} ${a.liquidPalette.hex}. Family ${c.cocktailFamily}.`,
  ].join(' ')
}

async function fetchImage(prompt, outPath) {
  // Prefer explicit key when available (Pollinations enter.pollinations.ai / OpenAI-compatible).
  const apiKey = process.env.POLLINATIONS_API_KEY || process.env.OPENAI_API_KEY
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 90_000)

  try {
    if (apiKey && process.env.OPENAI_API_KEY && !process.env.POLLINATIONS_API_KEY) {
      // OpenAI Images API
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
          prompt,
          size: '1024x1024',
        }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`)
      const json = await res.json()
      const b64 = json.data?.[0]?.b64_json
      const url = json.data?.[0]?.url
      if (b64) {
        fs.writeFileSync(outPath, Buffer.from(b64, 'base64'))
        return
      }
      if (url) {
        const img = await fetch(url, { signal: controller.signal })
        if (!img.ok) throw new Error(`OpenAI image download ${img.status}`)
        fs.writeFileSync(outPath, Buffer.from(await img.arrayBuffer()))
        return
      }
      throw new Error('OpenAI response missing image')
    }

    const url =
      'https://image.pollinations.ai/prompt/' +
      encodeURIComponent(prompt) +
      '?width=1024&height=1024&nologo=true&nofeed=true'
    const headers = { 'User-Agent': 'adams-home-bar-illustration/1.0' }
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`

    const res = await fetch(url, { headers, signal: controller.signal })
    const buf = Buffer.from(await res.arrayBuffer())
    if (!res.ok) {
      const msg = buf.toString('utf8').slice(0, 240)
      throw new Error(`HTTP ${res.status} ${msg}`)
    }
    if (buf.length < 5000) throw new Error(`Tiny image for ${path.basename(outPath)}`)
    fs.writeFileSync(outPath, buf)
  } finally {
    clearTimeout(timer)
  }
}

function convertAssets(key, sourcePath) {
  const masterPng = path.join(mastersDir, `${key}.png`)
  const runtimeWebp = path.join(webpDir, `${key}.webp`)
  const thumbWebp = path.join(thumbsDir, `${key}.webp`)

  // Master PNG 2048²
  let r = spawnSync(
    'magick',
    [sourcePath, '-resize', '2048x2048^', '-gravity', 'center', '-extent', '2048x2048', masterPng],
    { encoding: 'utf8' },
  )
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || 'master convert failed')

  // Runtime WebP 1536² q~85
  r = spawnSync(
    'magick',
    [masterPng, '-resize', '1536x1536', '-quality', '85', runtimeWebp],
    { encoding: 'utf8' },
  )
  if (r.status !== 0) throw new Error(r.stderr || 'runtime convert failed')

  // Thumb WebP 512² q~78
  r = spawnSync(
    'magick',
    [masterPng, '-resize', '512x512', '-quality', '78', thumbWebp],
    { encoding: 'utf8' },
  )
  if (r.status !== 0) throw new Error(r.stderr || 'thumb convert failed')
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

const opts = parseArgs(process.argv)
const byKey = new Map(manifest.cocktails.map((c) => [c.illustrationKey, c]))

let keys
if (opts.keys.length) keys = opts.keys
else if (opts.hero) keys = HERO_KEYS
else if (opts.all) keys = manifest.cocktails.map((c) => c.illustrationKey)
else {
  console.error('Usage: --hero | --all | --keys a,b,c [--force] [--limit N]')
  process.exit(1)
}

keys = keys.slice(0, opts.limit)

let ok = 0
let skipped = 0
let failed = 0

for (const key of keys) {
  const cocktail = byKey.get(key)
  if (!cocktail) {
    console.error(`Unknown key: ${key}`)
    failed += 1
    continue
  }

  const runtimeWebp = path.join(webpDir, `${key}.webp`)
  if (!opts.force && fs.existsSync(runtimeWebp) && fs.statSync(runtimeWebp).size > 1000) {
    skipped += 1
    process.stdout.write('.')
    continue
  }

  const prompt = buildPrompt(cocktail)
  const tmpFile = path.join(tmpDir, `${key}.jpg`)

  try {
    process.stdout.write(`\n→ ${key} `)
    let lastErr
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        await fetchImage(prompt, tmpFile)
        lastErr = null
        break
      } catch (err) {
        lastErr = err
        const msg = String(err.message || '')
        const rateLimited = msg.includes('429') || msg.includes('402') || msg.includes('Queue full')
        process.stdout.write(`retry${attempt} `)
        await sleep(rateLimited ? 60_000 * attempt : 8_000 * attempt)
      }
    }
    if (lastErr) throw lastErr
    convertAssets(key, tmpFile)
    ok += 1
    process.stdout.write('ok')
    // Anonymous Pollinations allows only 1 queued request — pace gently.
    await sleep(8_000)
  } catch (err) {
    failed += 1
    process.stdout.write(`FAIL ${err.message}`)
    await sleep(15_000)
  }
}

console.log('\n')
console.log(JSON.stringify({ ok, skipped, failed, total: keys.length }, null, 2))
process.exitCode = failed ? 1 : 0
