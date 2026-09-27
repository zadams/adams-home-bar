import { describe, expect, it } from 'vitest'
import {
  cocktailById,
  cocktailBySlug,
  cocktails,
  drinkKind,
  drinkPath,
  drinkPathById,
  drinks,
  ingredientById,
  isShot,
  mocktails,
  shots,
} from './index'

describe('drink kind', () => {
  it('defaults an absent kind to cocktail', () => {
    const oldFashioned = cocktailById.get('old-fashioned')
    expect(oldFashioned).toBeDefined()
    expect(oldFashioned?.kind).toBeUndefined()
    expect(drinkKind(oldFashioned!)).toBe('cocktail')
    expect(isShot(oldFashioned!)).toBe(false)
  })

  it('reads an explicit shot kind', () => {
    const kamikaze = cocktailById.get('kamikaze-shot')
    expect(kamikaze?.kind).toBe('shot')
    expect(isShot(kamikaze!)).toBe(true)
  })

  it('partitions the catalog with no overlap and no loss', () => {
    expect(cocktails.length + shots.length + mocktails.length).toBe(drinks.length)
    const shotIds = new Set(shots.map((s) => s.id))
    expect(cocktails.some((c) => shotIds.has(c.id))).toBe(false)
    expect(shots.every(isShot)).toBe(true)
    expect(cocktails.every((c) => !isShot(c))).toBe(true)
  })

  it('keeps shots out of the cocktails collection', () => {
    expect(cocktails.find((c) => c.id === 'jagerbomb')).toBeUndefined()
    expect(shots.find((s) => s.id === 'jagerbomb')).toBeDefined()
  })

  it('resolves shots through the shared id and slug lookups', () => {
    // Detail pages and history links depend on these spanning every drink.
    expect(cocktailById.get('pickleback')?.name).toBe('Pickleback')
    expect(cocktailBySlug.get('pickleback')?.name).toBe('Pickleback')
  })
})

describe('drink paths', () => {
  it('routes cocktails and shots to their own sections', () => {
    expect(drinkPath(cocktailById.get('negroni')!)).toBe('/cocktails/negroni')
    expect(drinkPath(cocktailById.get('jagerbomb')!)).toBe('/shots/jagerbomb')
  })

  it('routes by id and falls back for unknown ids', () => {
    expect(drinkPathById('jagerbomb')).toBe('/shots/jagerbomb')
    expect(drinkPathById('negroni')).toBe('/cocktails/negroni')
    expect(drinkPathById('no-such-drink')).toBe('/cocktails/no-such-drink')
  })
})

describe('shot catalog integrity', () => {
  it('gives every shot a name, steps and at least one ingredient', () => {
    for (const shot of shots) {
      expect(shot.name, shot.id).toBeTruthy()
      expect(shot.ingredients.length, shot.id).toBeGreaterThan(0)
      expect(shot.steps.length, shot.id).toBeGreaterThan(0)
    }
  })

  it('has no drink related to itself', () => {
    for (const drink of drinks) {
      expect(drink.relatedCocktailIds, drink.id).not.toContain(drink.id)
    }
  })

  it('has no dangling related ids', () => {
    for (const drink of drinks) {
      for (const id of drink.relatedCocktailIds) {
        expect(cocktailById.has(id), `${drink.id} -> ${id}`).toBe(true)
      }
    }
  })

  it('keeps every mocktail free of anything alcoholic', () => {
    // Bitters count: a dash of Angostura is still 44.7% ABV.
    const alcoholicCategories = new Set(['spirit', 'liqueur', 'bitter'])
    const alcoholicMixers = new Set(['prosecco', 'red_wine', 'lager_beer', 'irish_stout'])
    expect(mocktails.length).toBeGreaterThan(10)
    for (const drink of mocktails) {
      for (const line of drink.ingredients) {
        const category = ingredientById.get(line.ingredientId)?.category ?? ''
        expect(
          alcoholicCategories.has(category) || alcoholicMixers.has(line.ingredientId),
          `${drink.id} contains ${line.ingredientId}`,
        ).toBe(false)
      }
    }
  })

  it('routes mocktails to their own section', () => {
    expect(drinkPath(cocktailById.get('virgin-mojito')!)).toBe('/mocktails/virgin-mojito')
  })
})
