import { describe, expect, it } from 'vitest'
import { unlockCountForIngredients } from './shopping-list'
import { cocktails, seedInventory } from '../../data'
import { assessReadiness } from '../recommendation/readiness'

describe('shopping unlock counts', () => {
  it('returns 0 when no ingredients are provided', () => {
    expect(unlockCountForIngredients([], seedInventory, {})).toBe(0)
  })

  it('counts cocktails unlocked by stocking a missing ingredient', () => {
    // Force Campari out, then simulate restocking
    const overrides = Object.fromEntries(
      seedInventory
        .filter((i) => i.bottleId === 'campari')
        .map((i) => [i.id, { status: 'out' as const }]),
    )
    const negroni = cocktails.find((c) => c.id === 'negroni')
    if (!negroni) throw new Error('missing negroni')
    const before = assessReadiness(negroni, seedInventory, overrides)
    expect(before.state).not.toBe('ready')

    const unlocked = unlockCountForIngredients(
      ['campari'],
      seedInventory,
      overrides,
    )
    expect(unlocked).toBeGreaterThan(0)
  })
})
