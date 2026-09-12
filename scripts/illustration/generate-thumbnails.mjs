#!/usr/bin/env node
/**
 * Build any missing card thumbnail from the full-size runtime WebP.
 *
 * Cards render with preferThumb, so they request
 * /images/cocktails/thumbs/{key}.webp first. Art delivered as a full-size webp
 * with no thumbnail therefore shows a placeholder even though the art exists —
 * which is exactly what happened to 33 drinks. generate-assets.mjs only makes
 * thumbnails as a side effect of generating art from a master PNG, so art that
 * arrives by any other route never gets one.
 *
 * Deriving from the runtime webp rather than the master means this works for
 * art from any source, masters having moved out of the repo.
 *
 *   node scripts/illustration/generate-thumbnails.mjs           # fill gaps
 *   node scripts/illustration/generate-thumbnails.mjs --force   # rebuild all
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const webpDir = path.join(root, 'public/images/cocktails/webp')
const thumbsDir = path.join(root, 'public/images/cocktails/thumbs')
const force = process.argv.includes('--force')

// Matches the thumbnails already in the repo: 512 square, quality 78.
const SIZE = '512x512'
const QUALITY = '78'

fs.mkdirSync(thumbsDir, { recursive: true })

const magick = spawnSync('magick', ['-version'], { encoding: 'utf8' })
if (magick.status !== 0) {
  console.error('ImageMagick (magick) is required: brew install imagemagick')
  process.exitCode = 1
} else {
  const sources = fs
    .readdirSync(webpDir)
    .filter((f) => f.toLowerCase().endsWith('.webp'))
    .sort()

  const built = []
  const failed = []

  for (const file of sources) {
    const key = file.replace(/\.webp$/i, '')
    const out = path.join(thumbsDir, `${key}.webp`)
    if (!force && fs.existsSync(out) && fs.statSync(out).size > 500) continue

    const r = spawnSync(
      'magick',
      [path.join(webpDir, file), '-resize', SIZE, '-quality', QUALITY, out],
      { encoding: 'utf8' },
    )
    if (r.status !== 0 || !fs.existsSync(out)) {
      failed.push([key, (r.stderr || 'convert failed').trim().split('\n')[0]])
      continue
    }
    built.push([key, Math.round(fs.statSync(out).size / 1024)])
  }

  console.log(`Sources: ${sources.length}`)
  console.log(`Built:   ${built.length}`)
  console.log(`Failed:  ${failed.length}`)

  for (const [key, kb] of built) console.log(`  ✓ ${key.padEnd(30)} ${kb} KB`)
  for (const [key, err] of failed) console.log(`  ✗ ${key.padEnd(30)} ${err}`)

  if (!built.length && !failed.length) console.log('\nNothing to do — every thumbnail is present.')
  process.exitCode = failed.length ? 1 : 0
}
