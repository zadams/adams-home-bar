import { bottles, ingredients, seedInventory } from '../../data'
import type { InventoryItem, InventoryStatus } from '../../types/inventory'
import type {
  EffectiveInventoryItem,
  InventoryOverride,
} from '../../types/persistence'

export function mergeInventory(
  overrides: Record<string, InventoryOverride>,
  seed: InventoryItem[] = seedInventory,
): EffectiveInventoryItem[] {
  const mergedSeed = seed.map((item) => {
    const override = overrides[item.id]
    const merged = override ? { ...item, ...override } : item
    return {
      ...merged,
      effectiveStatus: merged.status,
    }
  })

  const representedIngredientIds = new Set<string>()
  for (const item of mergedSeed) {
    if (item.ingredientId) representedIngredientIds.add(item.ingredientId)
    if (item.bottleId) {
      const bottle = bottles.find((candidate) => candidate.id === item.bottleId)
      for (const ingredientId of bottle?.ingredientIds ?? []) {
        representedIngredientIds.add(ingredientId)
      }
    }
  }

  const catalogItems: EffectiveInventoryItem[] = ingredients
    .filter((ingredient) => !representedIngredientIds.has(ingredient.id))
    .map((ingredient) => {
      const id = `catalog-${ingredient.id}`
      const override = overrides[id]
      const status = override?.status ?? 'out'
      return {
        id,
        ingredientId: ingredient.id,
        productName: ingredient.name,
        status,
        tags: ingredient.tags,
        ...override,
        effectiveStatus: status,
      }
    })

  return [...mergedSeed, ...catalogItems]
}

export function getInventoryItemLabel(item: InventoryItem): string {
  if (item.brand && item.productName) {
    return `${item.brand} ${item.productName}`
  }
  return item.productName ?? item.brand ?? item.id
}

export function statusLabel(status: InventoryStatus): string {
  switch (status) {
    case 'in_stock':
      return 'In stock'
    case 'low':
      return 'Low'
    case 'out':
      return 'Out'
    case 'unknown':
      return 'Unknown'
  }
}

export function findInventoryForBottle(
  bottleId: string,
  overrides: Record<string, InventoryOverride>,
): EffectiveInventoryItem | undefined {
  return mergeInventory(overrides).find((item) => item.bottleId === bottleId)
}

export function findInventoryForIngredient(
  ingredientId: string,
  overrides: Record<string, InventoryOverride>,
): EffectiveInventoryItem | undefined {
  const items = mergeInventory(overrides)
  const direct = items.find((item) => item.ingredientId === ingredientId)
  if (direct) return direct
  return items.find((item) => {
    if (!item.bottleId) return false
    const bottle = bottles.find((b) => b.id === item.bottleId)
    return bottle?.ingredientIds.includes(ingredientId)
  })
}

export function inventoryByCategory(
  overrides: Record<string, InventoryOverride>,
): Map<string, EffectiveInventoryItem[]> {
  const map = new Map<string, EffectiveInventoryItem[]>()
  for (const item of mergeInventory(overrides)) {
    let category = 'Other'
    if (item.bottleId) {
      const bottle = bottles.find((b) => b.id === item.bottleId)
      category = bottle?.subcategory ?? bottle?.category ?? 'Bottles'
    } else if (item.ingredientId) {
      category = 'Fresh & pantry'
    }
    const list = map.get(category) ?? []
    list.push(item)
    map.set(category, list)
  }
  return map
}
