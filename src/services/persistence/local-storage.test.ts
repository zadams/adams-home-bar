import { describe, expect, it } from 'vitest'
import {
  createDefaultUserData,
  validateUserData,
} from './local-storage'
import { USER_DATA_VERSION } from '../../types/persistence'

describe('import/export validation', () => {
  it('accepts a valid v1 backup', () => {
    const data = validateUserData({
      version: USER_DATA_VERSION,
      inventoryOverrides: { 'inv-campari': { status: 'low' } },
      recentlyViewedCocktailIds: ['negroni'],
    })
    expect(data.inventoryOverrides['inv-campari']?.status).toBe('low')
    expect(data.shoppingList).toEqual([])
    expect(data.history).toEqual([])
  })

  it('rejects malformed imports without applying them', () => {
    expect(() => validateUserData({ version: 99 })).toThrow(/Unsupported/)
    expect(() => validateUserData('nope')).toThrow(/JSON object/)
    expect(() => validateUserData({ version: 1 })).toThrow(/inventoryOverrides/)
  })

  it('creates empty default user data', () => {
    const data = createDefaultUserData()
    expect(data.version).toBe(1)
    expect(data.recentlyViewedCocktailIds).toEqual([])
  })
})
