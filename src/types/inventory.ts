export type InventoryStatus = 'in_stock' | 'low' | 'out' | 'unknown'

export type IngredientCategory =
  | 'spirit'
  | 'liqueur'
  | 'bitter'
  | 'syrup'
  | 'juice'
  | 'mixer'
  | 'fresh'
  | 'garnish'
  | 'pantry'
  | 'supply'

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  subcategory?: string
  aliases: string[]
  tags: string[]
}

export interface Bottle {
  id: string
  brand: string
  productName: string
  ingredientIds: string[]
  category: IngredientCategory
  subcategory?: string
  bottleSizeMl?: number
  imageKey?: string
  tags: string[]
  notes?: string
}

export interface InventoryItem {
  id: string
  bottleId?: string
  ingredientId?: string
  status: InventoryStatus
  brand?: string
  productName?: string
  quantityNote?: string
  bottleSize?: string
  remainingPercent?: number
  opened?: boolean
  dateOpened?: string
  purchaseDate?: string
  preferredForMixing?: boolean
  preferredForSipping?: boolean
  notes?: string
  tags: string[]
}
