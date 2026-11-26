import { describe, expect, it } from 'vitest'
import { cocktailById } from '../index'
import { drinkSetById, drinkSets, setDrinks, setNotesFor } from './index'
import { kitCanMake } from '../kits'

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

  it('keeps the World’s Top 50 at fifty, Negroni first', () => {
    const top = drinkSets.find((s) => s.id === 'worlds-top-50')
    expect(top?.drinks).toHaveLength(50)
    expect(top?.drinks[0].drinkId).toBe('negroni')
  })

  it('collects a drink’s notes from every set it is in', () => {
    expect(setNotesFor('blood-and-sand').map((n) => n.set.id)).toEqual(['saturday-mix'])
    expect(setNotesFor('witchs-brew')).toEqual([
      expect.objectContaining({ note: expect.stringContaining('blue curaçao') }),
    ])
    expect(setNotesFor('black-russian')).toEqual([])
  })

  it('makes all of Thanksgiving To Go from the one bag it describes', () => {
    // Four bottles and a red, plus Angostura, syrups, cider, juices and ginger beer. Hot water
    // is the host's kettle. Literal matching, as for kits: no substitutions.
    const bag = new Set([
      'bourbon',
      'apple_vodka',
      'sweet_vermouth',
      'prosecco',
      'angostura_bitters',
      'brown_sugar_cinnamon_syrup',
      'honey_syrup',
      'demerara_sugar',
      'cranberry_juice',
      'orange_juice',
      'lemon_juice',
      'lime_juice',
      'ginger_beer',
      'hot_water',
      'red_wine',
      'maple_syrup',
      'apple_cider',
    ])
    const set = drinkSetById.get('thanksgiving-to-go')!
    const drinks = setDrinks(set)
    expect(drinks).toHaveLength(set.drinks.length)
    for (const drink of drinks) {
      const missing = drink.ingredients
        .filter((line) => !line.optional && !bag.has(line.ingredientId))
        .map((line) => line.ingredientId)
      expect(missing, drink.id).toEqual([])
      expect(kitCanMake(drink, bag), drink.id).toBe(true)
    }
    expect(drinks.filter((d) => d.tags.includes('batch')).length).toBeGreaterThanOrEqual(4)
  })
})
