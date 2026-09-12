import { describe, expect, it } from 'vitest'
import { assessReadiness } from './readiness'
import { drinks, seedInventory } from '../../data'
import type { Cocktail } from '../../types/cocktail'
import type { InventoryItem } from '../../types/inventory'

function cocktail(id: string): Cocktail {
  const found = drinks.find((c) => c.id === id)
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
    // Built explicitly rather than leaning on the seed: lime juice is stocked
    // now, and this is a test of the engine, not of what is in the bar today.
    const inventory: InventoryItem[] = seedInventory.map((item) =>
      item.ingredientId === 'lime_juice'
        ? { ...item, status: 'unknown' as const }
        : item,
    )
    const result = assessReadiness(cocktail('daiquiri'), inventory)
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

  it('marks new-stock classics ready once cacao, curaçao, noyaux, and sour mix are seeded', () => {
    const unlocked = [
      'grasshopper',
      'bourbon-alexander',
      'barbara',
      'chocolate-martini',
      'chocolate-old-fashioned',
      'twentieth-century',
      'pink-squirrel',
      'blue-hawaiian',
      'blue-hawaii',
      'blue-lagoon',
      'blue-margarita',
      'blue-kamikaze',
      'swimming-pool',
      'noyaux-rose',
      'almond-joy',
      'noyaux-old-fashioned',
      'bar-whiskey-sour',
      'bar-margarita',
      'adios-motherfucker',
      'banshee',
      'army-navy',
      'bay-breeze',
      'mai-tai',
      'trinidad-sour',
      'cosmopolitan',
      'cape-codder',
      'sea-breeze',
      'port-light',
      'poinsettia',
      'cranberry-margarita',
    ]
    for (const id of unlocked) {
      const result = assessReadiness(cocktail(id), seedInventory)
      expect({ id, state: result.state, missing: result.missingRequired.map((m) => m.ingredientId) }).toEqual({
        id,
        state: 'ready',
        missing: [],
      })
    }
  })

  it('leaves the Alexander short of cognac alone once cacao and cream are stocked', () => {
    // Dairy is stocked now, so cognac is the only gap and the state improves
    // from 'nearly' (two missing) to 'almost' (one).
    const result = assessReadiness(cocktail('alexander'), seedInventory)
    expect(result.state).toBe('almost')
    expect(result.missingRequired.map((m) => m.ingredientId).sort()).toEqual([
      'cognac',
    ])
  })

  it('marks gap classics almost or nearly ready from seed inventory', () => {
    const almost = [
      ['sidecar', 'cognac'],
      ['aviation', 'creme_de_violette'],
      ['chartreuse-swizzle', 'green_chartreuse'],
      ['mezcal-negroni', 'mezcal'],
      ['fanciulli', 'fernet_branca'],
    ] as const
    for (const [id, missing] of almost) {
      const result = assessReadiness(cocktail(id), seedInventory)
      expect({ id, state: result.state, missing: result.missingRequired.map((m) => m.ingredientId) }).toEqual({
        id,
        state: 'almost',
        missing: [missing],
      })
    }

    // Brave Bull left this list when Kahlua was stocked for the class party.
    expect(assessReadiness(cocktail('brave-bull'), seedInventory).state).toBe(
      'ready',
    )

    const champs = assessReadiness(cocktail('champs-elysees'), seedInventory)
    expect(champs.state).toBe('nearly')
    expect(champs.missingRequired.map((m) => m.ingredientId).sort()).toEqual([
      'cognac',
      'green_chartreuse',
    ])
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
