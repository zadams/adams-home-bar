import partyKitJson from './party-kit.json'
import type { Cocktail } from '../../types/cocktail'
import type { InventoryItem } from '../../types/inventory'

export interface KitEntry {
  ingredientId: string
  label: string
}

/**
 * A travel bar: the subset of the home bar going somewhere. Readiness for a kit
 * is deliberately *not* the same question as readiness at home — the whole point
 * is what can be made from the bag and nothing else.
 */
export interface Kit {
  id: string
  name: string
  subtitle: string
  description: string
  bottles: KitEntry[]
  pantry: KitEntry[]
  mixers: KitEntry[]
}

export const partyKit = partyKitJson as Kit

export function kitEntries(kit: Kit): KitEntry[] {
  return [...kit.bottles, ...kit.pantry, ...kit.mixers]
}

/**
 * Synthesise an inventory containing only what the kit holds, so the existing
 * readiness engine can answer kit questions without knowing kits exist.
 */
export function kitInventory(kit: Kit): InventoryItem[] {
  return kitEntries(kit).map((entry) => ({
    id: `kit-${kit.id}-${entry.ingredientId}`,
    ingredientId: entry.ingredientId,
    status: 'in_stock' as const,
    productName: entry.label,
    tags: ['kit'],
  }))
}

/**
 * Can this drink be made from the bag, literally?
 *
 * Deliberately stricter than assessReadiness, which applies soft substitution
 * groups — blanco tequila standing in for añejo, white rum for gold. That is
 * right for the home bar, where the question is "could I manage it?". It is
 * wrong here: a kit page that answers "what is in the bag" must not list an
 * Añejo Old Fashioned because there is blanco in the bag. Every required
 * ingredient has to be present by name.
 */
export function kitCanMake(drink: Cocktail, carried: Set<string>): boolean {
  return drink.ingredients
    .filter((line) => !line.optional)
    .every((line) => carried.has(line.ingredientId))
}

export function kitIngredientIds(kit: Kit): Set<string> {
  return new Set(kitEntries(kit).map((e) => e.ingredientId))
}
