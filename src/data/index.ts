import type { Cocktail, DrinkKind } from '../types/cocktail'
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

/** Every drink in the catalog: cocktails and shots together. */
export const drinks = Object.values(cocktailModules).sort((a, b) =>
  a.name.localeCompare(b.name),
)

/**
 * A record's kind, resolving the absent-means-cocktail default in one place so
 * callers never test `c.kind` directly.
 */
export function drinkKind(drink: Cocktail): DrinkKind {
  return drink.kind ?? 'cocktail'
}

export function isShot(drink: Cocktail): boolean {
  return drinkKind(drink) === 'shot'
}

/** Route for a drink's detail page, so links never hardcode the wrong section. */
export function drinkPath(drink: Cocktail): string {
  return `/${isShot(drink) ? 'shots' : 'cocktails'}/${drink.slug}`
}

/** Route for a drink id, falling back to the cocktails section if unknown. */
export function drinkPathById(id: string): string {
  const drink = cocktailById.get(id)
  return drink ? drinkPath(drink) : `/cocktails/${id}`
}

/** Cocktails only — shots are excluded. Use `drinks` when you mean everything. */
export const cocktails = drinks.filter((d) => !isShot(d))

/** Shots only. */
export const shots = drinks.filter((d) => isShot(d))

export const ingredientById = new Map(ingredients.map((i) => [i.id, i]))
export const bottleById = new Map(bottles.map((b) => [b.id, b]))
// Lookups span every drink: a shot must resolve by id and slug like anything else.
export const cocktailById = new Map(drinks.map((c) => [c.id, c]))
export const cocktailBySlug = new Map(drinks.map((c) => [c.slug, c]))

export function getIngredientName(id: string): string {
  return ingredientById.get(id)?.name ?? id
}

export function getBottleLabel(id: string): string {
  const bottle = bottleById.get(id)
  if (!bottle) return id
  return `${bottle.brand} ${bottle.productName}`
}
