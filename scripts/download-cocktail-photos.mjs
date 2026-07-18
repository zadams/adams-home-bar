#!/usr/bin/env node
/**
 * Download CocktailDB photos for new recipes; copy family fallbacks when missing.
 */
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const photosDir = path.join(root, 'public/images/cocktails/photos')
const registryPath = path.join(root, 'src/data/illustrations/registry.json')
const jobsPath = path.join(root, 'scripts/photo-jobs.json')

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
const jobs = fs.existsSync(jobsPath)
  ? JSON.parse(fs.readFileSync(jobsPath, 'utf8'))
  : Object.keys(registry).map((id) => ({
      id,
      search: id.replace(/-/g, ' '),
      family: registry[id].photoFamily,
    }))

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'home-bar/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchJson(res.headers.location).then(resolve, reject)
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}`))
            return
          }
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
          } catch (e) {
            reject(e)
          }
        })
      })
      .on('error', reject)
  })
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'home-bar/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchBuffer(res.headers.location).then(resolve, reject)
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const buf = Buffer.concat(chunks)
          if (res.statusCode !== 200 || buf.length < 1000) {
            reject(new Error(`HTTP ${res.statusCode}`))
            return
          }
          resolve(buf)
        })
      })
      .on('error', reject)
  })
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function resolveFamilyFile(family) {
  if (!family) return null
  const candidates = [
    path.join(photosDir, `${family}.jpg`),
    path.join(photosDir, `${family}.png`),
  ]
  // also try registry src
  const reg = registry[family]
  if (reg?.src) {
    const local = path.join(root, 'public', reg.src.replace(/^\//, ''))
    candidates.unshift(local)
  }
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).size > 1000) return c
  }
  return null
}

let downloaded = 0
let copied = 0
let skipped = 0
let failed = 0

for (const job of jobs) {
  const dest = path.join(photosDir, `${job.id}.jpg`)
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    skipped++
    continue
  }

  let got = false
  const searchTerms = [
    job.search,
    job.search?.replace(/\{S\}/g, ''),
    job.family?.replace(/-/g, ' '),
  ].filter(Boolean)

  for (const term of searchTerms) {
    try {
      const data = await fetchJson(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`,
      )
      const drink = data?.drinks?.[0]
      if (!drink?.strDrinkThumb) continue
      const buf = await fetchBuffer(`${drink.strDrinkThumb}/large`)
      fs.writeFileSync(dest, buf)
      downloaded++
      got = true
      process.stdout.write('+')
      break
    } catch {
      // try next
    }
    await sleep(60)
  }

  if (!got) {
    const familyFile = resolveFamilyFile(job.family)
    if (familyFile) {
      fs.copyFileSync(familyFile, dest)
      copied++
      got = true
      process.stdout.write('c')
    } else {
      failed++
      process.stdout.write('x')
      // point registry at fallback if available
      if (registry[job.id]?.fallbackSrc) {
        registry[job.id].src = registry[job.id].fallbackSrc
      }
    }
  }

  await sleep(40)
}

// Ensure every registry entry with missing file uses fallbackSrc
for (const [id, entry] of Object.entries(registry)) {
  const local = path.join(root, 'public', entry.src.replace(/^\//, ''))
  if ((!fs.existsSync(local) || fs.statSync(local).size < 1000) && entry.fallbackSrc) {
    entry.src = entry.fallbackSrc
  }
  // strip generator metadata from runtime registry
  delete entry.photoSearch
  delete entry.photoFamily
}

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n')
console.log('')
console.log({ downloaded, copied, skipped, failed, registryEntries: Object.keys(registry).length })
