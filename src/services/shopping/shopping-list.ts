import { cocktails, ingredientById } from '../../data'
import { assessReadiness } from '../recommendation/readiness'
import type { InventoryItem } from '../../types/inventory'
import type { InventoryOverride, ShoppingListItem } from '../../types/persistence'

export function shoppingGroupForIngredient(ingredientId: string): string {
  const category = ingredientById.get(ingredientId)?.category
  switch (category) {
    case 'fresh':
    case 'juice':
      return 'Produce & juice'
    case 'spirit':
      return 'Spirits'
    case 'liqueur':
      return 'Liqueurs'
    case 'bitter':
      return 'Bitters'
    case 'syrup':
      return 'Syrups'
    case 'mixer':
      return 'Mixers'
    case 'garnish':
      return 'Garnishes'
    case 'pantry':
    case 'supply':
      return 'Pantry'
    default:
      return 'Other'
  }
}

/** How many cocktails would become ready if these ingredient IDs were in stock. */
export function unlockCountForIngredients(
  ingredientIds: string[],
  seedInventory: InventoryItem[],
  overrides: Record<string, InventoryOverride>,
): number {
  if (ingredientIds.length === 0) return 0

  const simulated: InventoryItem[] = [
    ...seedInventory,
    ...ingredientIds.map((ingredientId) => ({
      id: `sim-${ingredientId}`,
      ingredientId,
      status: 'in_stock' as const,
      productName: ingredientId,
      tags: [],
    })),
  ]

  // Also force matching seed items to in_stock via overrides
  const forcedOverrides: Record<string, InventoryOverride> = { ...overrides }
  for (const item of seedInventory) {
    if (
      item.ingredientId &&
      ingredientIds.includes(item.ingredientId) &&
      item.status !== 'in_stock'
    ) {
      forcedOverrides[item.id] = {
        ...forcedOverrides[item.id],
        status: 'in_stock',
      }
    }
  }

  let unlocked = 0
  for (const cocktail of cocktails) {
    const before = assessReadiness(cocktail, seedInventory, overrides)
    const after = assessReadiness(cocktail, simulated, forcedOverrides)
    if (before.state !== 'ready' && after.state === 'ready') unlocked += 1
  }
  return unlocked
}

export function groupShoppingList(items: ShoppingListItem[]) {
  const groups = new Map<string, ShoppingListItem[]>()
  for (const item of items) {
    const group = shoppingGroupForIngredient(item.ingredientId)
    const list = groups.get(group) ?? []
    list.push(item)
    groups.set(group, list)
  }
  return groups
}

export function createShoppingItem(
  ingredientId: string,
  cocktailId?: string,
): ShoppingListItem {
  return {
    id: `shop-${ingredientId}-${Date.now()}`,
    ingredientId,
    label: ingredientById.get(ingredientId)?.name ?? ingredientId,
    sourceCocktailIds: cocktailId ? [cocktailId] : [],
    purchased: false,
    addedAt: new Date().toISOString(),
  }
}
