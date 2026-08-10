import { describe, expect, it } from 'vitest'
import { getPlaceholderPalette } from './illustrations'
import {
  editorialRuntimePath,
  getArtDirection,
  resolveIllustration,
} from './illustrationSystem'

describe('illustrationSystem', () => {
  it('loads art direction from the manifest', () => {
    const negroni = getArtDirection('negroni')
    expect(negroni?.name).toBe('Negroni')
    expect(negroni?.artDirection.template).toBe('rocks-spirit-forward')
    expect(negroni?.artDirection.liquidPalette.hex).toMatch(/^#/)
  })

  it('points editorial assets at the WebP runtime path', () => {
    expect(editorialRuntimePath('old-fashioned')).toBe(
      '/images/cocktails/webp/old-fashioned.webp',
    )
  })

  it('resolves a known cocktail without throwing', () => {
    const resolved = resolveIllustration('negroni')
    expect(['illustration', 'photo', 'placeholder']).toContain(resolved.kind)
    expect(resolved.artDirection?.glass).toBeTruthy()
  })
})

describe('getPlaceholderPalette', () => {
  it('uses liquid hex from the illustration bible when provided', () => {
    const palette = getPlaceholderPalette('negroni', '#7D1827')
    expect(palette.accent.toLowerCase()).toBe('#7d1827')
  })
})
