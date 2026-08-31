import { describe, expect, it } from 'vitest'
import { ingredients, seedInventory } from '../../data'
import { findInventoryForIngredient, mergeInventory } from './effective'

describe('effective inventory catalog coverage', () => {
  it('exposes every catalog ingredient in My Bar', () => {
    for (const ingredient of ingredients) {
      expect(findInventoryForIngredient(ingredient.id, {})).toBeDefined()
    }
  })

  it('adds unowned catalog ingredients as out and accepts overrides', () => {
    const defaultItem = mergeInventory({}, seedInventory).find(
      (item) => item.ingredientId === 'mezcal',
    )
    expect(defaultItem?.effectiveStatus).toBe('out')

    const stockedItem = mergeInventory(
      { 'catalog-mezcal': { status: 'in_stock' } },
      seedInventory,
    ).find((item) => item.ingredientId === 'mezcal')
    expect(stockedItem?.effectiveStatus).toBe('in_stock')
  })
})
