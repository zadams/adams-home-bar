import type { Cocktail } from '../../types/cocktail'
import { cocktailById } from '../index'

export interface DrinkSetEntry {
  drinkId: string
  /** What to reach for or watch out for when making it from this set. */
  note?: string
}

/**
 * A hand-picked list of drinks — a night's menu, a theme. Unlike a kit it says
 * nothing about inventory; readiness still comes from the home bar.
 */
export interface DrinkSet {
  id: string
  name: string
  description: string
  drinks: DrinkSetEntry[]
}

const setModules = import.meta.glob('./*.json', {
  eager: true,
  import: 'default',
}) as Record<string, DrinkSet>

export const drinkSets = Object.values(setModules).sort((a, b) =>
  a.name.localeCompare(b.name),
)

export const drinkSetById = new Map(drinkSets.map((s) => [s.id, s]))

/** The set's drinks in menu order, skipping any id that no longer resolves. */
export function setDrinks(set: DrinkSet): Cocktail[] {
  return set.drinks
    .map((entry) => cocktailById.get(entry.drinkId))
    .filter((d): d is Cocktail => d !== undefined)
}
