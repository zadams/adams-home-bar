import { describe, expect, it } from 'vitest'
import { cocktailById } from '../index'
import { drinkSets, setNotesFor } from './index'

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
})
