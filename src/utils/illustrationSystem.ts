import type {
  IllustrationManifest,
  IllustrationManifestEntry,
  ResolvedIllustration,
} from '../types/illustration'
import manifestJson from '../data/illustrations/illustration-manifest.json'
import registryJson from '../data/illustrations/registry.json'

type RegistryEntry = {
  src: string
  kind?: 'photo' | 'illustration'
  glassware?: string
  aspectRatio?: string
  credit?: string
  ingredients?: string[]
  fallbackSrc?: string
  pending?: boolean
}

const manifest = manifestJson as IllustrationManifest
const registry = registryJson as Record<string, RegistryEntry>

export const illustrationManifest = manifest

export const illustrationManifestByKey = new Map(
  manifest.cocktails.map((entry) => [entry.illustrationKey, entry]),
)

export const illustrationManifestByCocktailId = new Map(
  manifest.cocktails.map((entry) => [entry.id, entry]),
)

export function getArtDirection(
  illustrationKey: string,
): IllustrationManifestEntry | undefined {
  return illustrationManifestByKey.get(illustrationKey)
}

/** Canonical runtime path for editorial WebP (Bible + manifest). */
export function editorialRuntimePath(illustrationKey: string): string {
  return `/images/cocktails/webp/${illustrationKey}.webp`
}

export function editorialThumbPath(illustrationKey: string): string {
  return `/images/cocktails/thumbs/${illustrationKey}.webp`
}

/**
 * Resolve drink art with preference order:
 * 1. Editorial illustration WebP (when present / registered)
 * 2. Stock photo from registry
 * 3. Placeholder (no src)
 */
export function resolveIllustration(
  illustrationKey: string,
): ResolvedIllustration {
  const art = illustrationManifestByKey.get(illustrationKey)
  const entry = registry[illustrationKey]
  const editorialSrc = editorialRuntimePath(illustrationKey)
  const thumbSrc = editorialThumbPath(illustrationKey)

  if (entry?.kind === 'illustration') {
    if (entry.pending) {
      return {
        kind: 'placeholder',
        aspectRatio: '1 / 1',
        artDirection: art?.artDirection,
        pending: true,
      }
    }
    return {
      kind: 'illustration',
      src: entry.src || editorialSrc,
      thumbSrc: entry.src?.includes('/thumbs/') ? entry.src : thumbSrc,
      fallbackSrc: entry.fallbackSrc,
      aspectRatio: entry.aspectRatio ?? '1 / 1',
      credit: entry.credit ?? 'Adams Home Bar editorial illustration',
      artDirection: art?.artDirection,
    }
  }

  if (entry?.src) {
    return {
      kind: entry.kind === 'photo' ? 'photo' : 'illustration',
      src: entry.src,
      thumbSrc: entry.src,
      fallbackSrc: entry.fallbackSrc,
      aspectRatio: entry.aspectRatio ?? (entry.kind === 'photo' ? '4 / 3' : '1 / 1'),
      credit: entry.credit,
      artDirection: art?.artDirection,
    }
  }

  return {
    kind: 'placeholder',
    aspectRatio: '1 / 1',
    artDirection: art?.artDirection,
  }
}
