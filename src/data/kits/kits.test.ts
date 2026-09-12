import { describe, expect, it } from 'vitest'
import { drinks, isShot } from '../index'
import { kitCanMake, kitEntries, kitIngredientIds, kitInventory, partyKit } from './index'
import { assessReadiness } from '../../services/recommendation/readiness'
import { ingredientById } from '../index'

describe('party kit', () => {
  it('matches literally, not by substitution', () => {
    const carried = kitIngredientIds(partyKit)
    // Blanco is in the bag and the engine's substitution groups would let it
    // stand in for anejo. The kit view must not make that claim.
    expect(carried.has('blanco_tequila')).toBe(true)
    expect(carried.has('anejo_tequila')).toBe(false)
    const anejo = drinks.find((d) => d.id === 'anejo_tequila-of-build')
    expect(anejo).toBeDefined()
    expect(kitCanMake(anejo!, carried)).toBe(false)
  })

  it('ignores optional lines when deciding', () => {
    const carried = kitIngredientIds(partyKit)
    const daiquiri = drinks.find((d) => d.id === 'daiquiri')!
    // Daiquiri's lime garnish is optional; the drink still counts.
    expect(kitCanMake(daiquiri, carried)).toBe(true)
  })

  it('names only real ingredients', () => {
    for (const entry of kitEntries(partyKit)) {
      expect(ingredientById.has(entry.ingredientId), entry.ingredientId).toBe(true)
    }
  })

  it('does not list anything twice', () => {
    const ids = kitEntries(partyKit).map((e) => e.ingredientId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('never claims a drink needing something not in the bag', () => {
    // Named ingredients the bar has at home but is not carrying. The kit view
    // must never claim a drink that needs one, however the matcher evolves.
    const notCarried = ['campari', 'aperol', 'prosecco', 'maraschino', 'sweet_vermouth', 'mint']
    const carried = kitIngredientIds(partyKit)
    for (const id of notCarried) {
      expect(ingredientById.has(id), id).toBe(true)
      expect(carried.has(id), id).toBe(false)
    }
    for (const drink of drinks.filter((d) => kitCanMake(d, carried))) {
      for (const line of drink.ingredients.filter((l) => !l.optional)) {
        expect(carried.has(line.ingredientId), `${drink.id} needs ${line.ingredientId}`).toBe(true)
      }
    }
  })

  it('makes both cocktails and shots', () => {
    const inventory = kitInventory(partyKit)
    const ready = drinks.filter(
      (d) => assessReadiness(d, inventory).state === 'ready',
    )
    expect(ready.filter(isShot).length).toBeGreaterThan(5)
    expect(ready.filter((d) => !isShot(d)).length).toBeGreaterThan(50)
  })

  it('makes the drinks the kit was chosen for', () => {
    const inventory = kitInventory(partyKit)
    const readyIds = new Set(
      drinks
        .filter((d) => assessReadiness(d, inventory).state === 'ready')
        .map((d) => d.id),
    )
    // Mojito and Bourbon Manhattan left this list when mint and sweet vermouth
    // came out of the bag; Cosmopolitan and Long Island stand in their place.
    for (const id of [
      'old-fashioned',
      'margarita',
      'daiquiri',
      'whiskey-sour',
      'martini',
      'gin-and-tonic',
      'moscow-mule',
      'espresso-martini',
      'cosmopolitan',
      'long-island-iced-tea',
    ]) {
      expect(readyIds.has(id), id).toBe(true)
    }
  })
})
