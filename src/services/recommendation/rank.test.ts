import { describe, expect, it } from 'vitest'
import type { RankedCocktail } from './rank'
import { selectSurprisePick } from './rank'
import type { ReadinessState } from '../../types/cocktail'

function ranked(
  id: string,
  state: ReadinessState = 'ready',
): RankedCocktail {
  return {
    cocktail: { id, slug: id, name: id } as RankedCocktail['cocktail'],
    readiness: {
      state,
      missingRequired: [],
      missingOptional: [],
      confirmFresh: [],
      missingCount: 0,
      label: state,
    },
    score: 100,
    reasons: [],
  }
}

describe('selectSurprisePick', () => {
  const pool = [ranked('a'), ranked('b'), ranked('c')]

  it('returns one ready drink from the pool', () => {
    const pick = selectSurprisePick(pool)
    expect(pick).toBeDefined()
    expect(pool.map((item) => item.cocktail.id)).toContain(pick!.cocktail.id)
  })

  it('excludes the current drink so a reroll is different', () => {
    const pick = selectSurprisePick(pool, { excludeIds: ['a'], random: () => 0 })
    expect(pick?.cocktail.id).toBe('b')
  })

  it('wraps back to the excluded drink when it is the only ready option', () => {
    const pick = selectSurprisePick([ranked('a')], { excludeIds: ['a'] })
    expect(pick?.cocktail.id).toBe('a')
  })

  it('uses the provided random function', () => {
    const pick = selectSurprisePick(pool, { random: () => 0.99 })
    expect(pick?.cocktail.id).toBe('c')
  })

  it('prefers ready drinks over almost-ready ones', () => {
    const pick = selectSurprisePick(
      [ranked('almost', 'almost'), ranked('ready')],
      { random: () => 0 },
    )
    expect(pick?.cocktail.id).toBe('ready')
  })
})
