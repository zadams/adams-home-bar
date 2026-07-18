import type { InventoryItem, InventoryStatus } from './inventory'

export const USER_DATA_VERSION = 1 as const

export interface InventoryOverride {
  status?: InventoryStatus
  remainingPercent?: number
  notes?: string
  preferredForMixing?: boolean
  preferredForSipping?: boolean
}

export interface ShoppingListItem {
  id: string
  ingredientId: string
  label: string
  sourceCocktailIds: string[]
  purchased: boolean
  addedAt: string
}

export interface CocktailPersonalization {
  favorite?: boolean
  rating?: number
  notes?: string
  wouldMakeAgain?: boolean
}

export interface HistoryEntry {
  id: string
  cocktailId: string
  madeAt: string
  bottleId?: string
  modifications?: string
  wouldMakeAgain?: boolean
  rating?: number
}

export interface JourneyProgress {
  completedCocktailIds: string[]
}

export interface UserData {
  version: typeof USER_DATA_VERSION
  inventoryOverrides: Record<string, InventoryOverride>
  recentlyViewedCocktailIds: string[]
  shoppingList: ShoppingListItem[]
  cocktailMeta: Record<string, CocktailPersonalization>
  history: HistoryEntry[]
  journey: JourneyProgress
  exportedAt?: string
}

export interface PersistenceAdapter {
  load(): UserData
  save(data: UserData): void
  reset(): void
  exportJson(): string
  importJson(raw: string): UserData
}

export type EffectiveInventoryItem = InventoryItem & {
  effectiveStatus: InventoryStatus
}
