import { seedInventory } from '../../data'
import type { InventoryOverride } from '../../types/persistence'

/** Apply purchased shopping ingredients onto matching seed inventory rows. */
export function overridesForPurchasedIngredients(
  ingredientIds: string[],
  existing: Record<string, InventoryOverride>,
): Record<string, InventoryOverride> {
  const next = { ...existing }
  for (const ingredientId of ingredientIds) {
    const matches = seedInventory.filter(
      (item) => item.ingredientId === ingredientId,
    )
    if (matches.length === 0) {
      const invId = `inv-${ingredientId}`
      next[invId] = { ...next[invId], status: 'in_stock' }
      continue
    }
    for (const match of matches) {
      next[match.id] = { ...next[match.id], status: 'in_stock' }
    }
  }
  return next
}
