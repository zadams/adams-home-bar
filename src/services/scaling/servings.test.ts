import { describe, expect, it } from 'vitest'
import { scaleAmount, formatIngredientDisplay } from './servings'
import type { CocktailIngredient } from '../../types/cocktail'

describe('serving scaling', () => {
  it('scales linear ingredients by servings', () => {
    expect(scaleAmount(2, 'linear', 2)).toBe(4)
    expect(scaleAmount(0.75, 'linear', 3)).toBe(2.25)
  })

  it('does not scale bitters (fixed)', () => {
    expect(scaleAmount(2, 'fixed', 4)).toBe(2)
  })

  it('does not scale garnishes or top-with amounts', () => {
    expect(scaleAmount(1, 'garnish', 3)).toBe(1)
    expect(scaleAmount(4, 'top', 2)).toBe(4)
  })

  it('formats top ingredients as per-drink tops when scaled', () => {
    const ingredient: CocktailIngredient = {
      ingredientId: 'tonic_water',
      amount: 4,
      unit: 'oz',
      scaleMode: 'top',
    }
    expect(formatIngredientDisplay(ingredient, 1)).toContain('top')
    expect(formatIngredientDisplay(ingredient, 2)).toContain('per drink')
  })
})
