import type { Cocktail } from '../types/cocktail'
import type { Bottle, Ingredient, InventoryItem } from '../types/inventory'

import ingredientsJson from './ingredients/ingredients.json'
import bottlesJson from './bottles/bottles.json'
import inventoryJson from './inventory/seed-inventory.json'

const cocktailModules = import.meta.glob('./cocktails/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Cocktail>

export const ingredients = ingredientsJson as Ingredient[]
export const bottles = bottlesJson as Bottle[]
export const seedInventory = inventoryJson as InventoryItem[]

export const cocktails = Object.values(cocktailModules).sort((a, b) =>
  a.name.localeCompare(b.name),
)

export const ingredientById = new Map(ingredients.map((i) => [i.id, i]))
export const bottleById = new Map(bottles.map((b) => [b.id, b]))
export const cocktailById = new Map(cocktails.map((c) => [c.id, c]))
export const cocktailBySlug = new Map(cocktails.map((c) => [c.slug, c]))

export function getIngredientName(id: string): string {
  return ingredientById.get(id)?.name ?? id
}

export function getBottleLabel(id: string): string {
  const bottle = bottleById.get(id)
  if (!bottle) return id
  return `${bottle.brand} ${bottle.productName}`
}
