import { describe, expect, it } from 'vitest'
import { assessReadiness } from './readiness'
import { cocktails, seedInventory } from '../../data'
import type { Cocktail } from '../../types/cocktail'
import type { InventoryItem } from '../../types/inventory'

function cocktail(id: string): Cocktail {
  const found = cocktails.find((c) => c.id === id)
  if (!found) throw new Error(`Missing cocktail ${id}`)
  return found
}

describe('readiness engine', () => {
  it('marks Old Fashioned ready with seeded bourbon inventory', () => {
    const result = assessReadiness(cocktail('old-fashioned'), seedInventory)
    expect(result.state).toBe('ready')
    expect(result.missingRequired).toHaveLength(0)
  })

  it('treats optional garnishes as non-blocking', () => {
    const inventory = seedInventory.map((item) =>
      item.ingredientId === 'orange'
        ? { ...item, status: 'out' as const }
        : item,
    )
    const result = assessReadiness(cocktail('old-fashioned'), inventory)
    expect(result.state).toBe('ready')
    expect(result.missingOptional.some((m) => m.ingredientId === 'orange')).toBe(
      true,
    )
  })

  it('counts a missing required ingredient as almost ready', () => {
    const inventory = seedInventory.map((item) => {
      if (item.bottleId === 'campari') {
        return { ...item, status: 'out' as const }
      }
      return item
    })
    const result = assessReadiness(cocktail('negroni'), inventory)
    expect(result.state).toBe('almost')
    expect(result.missingRequired.map((m) => m.ingredientId)).toContain('campari')
  })

  it('accepts Cointreau as covering triple-sec-class orange liqueur needs', () => {
    const result = assessReadiness(cocktail('margarita'), seedInventory)
    expect(result.missingRequired.find((m) => m.ingredientId === 'cointreau')).toBeUndefined()
  })

  it('treats unknown fresh juice as available but flagged', () => {
    const result = assessReadiness(cocktail('daiquiri'), seedInventory)
    expect(result.state).toBe('ready')
    expect(result.confirmFresh.some((c) => c.ingredientId === 'lime_juice')).toBe(
      true,
    )
  })

  it('does not block Sazerac when absinthe is out (optional rinse)', () => {
    const result = assessReadiness(cocktail('sazerac'), seedInventory)
    expect(result.state).toBe('ready')
    expect(result.missingOptional.some((m) => m.ingredientId === 'absinthe')).toBe(
      true,
    )
  })

  it('marks Paloma almost ready when grapefruit soda is out', () => {
    const inventory: InventoryItem[] = seedInventory.map((item) =>
      item.bottleId === 'grapefruit-soda' || item.ingredientId === 'grapefruit_soda'
        ? { ...item, status: 'out' }
        : item,
    )
    const result = assessReadiness(cocktail('paloma'), inventory)
    expect(result.state).toBe('almost')
  })
})
