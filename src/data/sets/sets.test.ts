import { describe, expect, it } from 'vitest'
import { cocktailById } from '../index'
import { drinkSets } from './index'

describe('drink sets', () => {
  it('have unique ids', () => {
    const ids = drinkSets.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('name only real drinks, each once', () => {
    for (const set of drinkSets) {
      const ids = set.drinks.map((e) => e.drinkId)
      expect(new Set(ids).size, set.id).toBe(ids.length)
      for (const id of ids) {
        expect(cocktailById.has(id), `${set.id}: ${id}`).toBe(true)
      }
    }
  })
})
