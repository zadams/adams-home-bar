import {
  USER_DATA_VERSION,
  type CocktailPersonalization,
  type HistoryEntry,
  type InventoryOverride,
  type JourneyProgress,
  type PersistenceAdapter,
  type ShoppingListItem,
  type UserData,
} from '../../types/persistence'

const STORAGE_KEY = 'adams-home-bar:user-data'

export function createDefaultUserData(): UserData {
  return {
    version: USER_DATA_VERSION,
    inventoryOverrides: {},
    recentlyViewedCocktailIds: [],
    shoppingList: [],
    cocktailMeta: {},
    history: [],
    journey: { completedCocktailIds: [] },
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v) => typeof v === 'string') : []
}

function parseShoppingList(value: unknown): ShoppingListItem[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!isObject(item)) return []
    if (typeof item.id !== 'string' || typeof item.ingredientId !== 'string') {
      return []
    }
    return [
      {
        id: item.id,
        ingredientId: item.ingredientId,
        label: typeof item.label === 'string' ? item.label : item.ingredientId,
        sourceCocktailIds: asStringArray(item.sourceCocktailIds),
        purchased: Boolean(item.purchased),
        addedAt:
          typeof item.addedAt === 'string'
            ? item.addedAt
            : new Date().toISOString(),
      },
    ]
  })
}

function parseCocktailMeta(
  value: unknown,
): Record<string, CocktailPersonalization> {
  if (!isObject(value)) return {}
  const result: Record<string, CocktailPersonalization> = {}
  for (const [key, raw] of Object.entries(value)) {
    if (!isObject(raw)) continue
    const meta: CocktailPersonalization = {}
    if (typeof raw.favorite === 'boolean') meta.favorite = raw.favorite
    if (typeof raw.rating === 'number' && raw.rating >= 1 && raw.rating <= 5) {
      meta.rating = raw.rating
    }
    if (typeof raw.notes === 'string') meta.notes = raw.notes
    if (typeof raw.wouldMakeAgain === 'boolean') {
      meta.wouldMakeAgain = raw.wouldMakeAgain
    }
    result[key] = meta
  }
  return result
}

function parseHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!isObject(item)) return []
    if (typeof item.id !== 'string' || typeof item.cocktailId !== 'string') {
      return []
    }
    return [
      {
        id: item.id,
        cocktailId: item.cocktailId,
        madeAt:
          typeof item.madeAt === 'string'
            ? item.madeAt
            : new Date().toISOString(),
        bottleId: typeof item.bottleId === 'string' ? item.bottleId : undefined,
        modifications:
          typeof item.modifications === 'string'
            ? item.modifications
            : undefined,
        wouldMakeAgain:
          typeof item.wouldMakeAgain === 'boolean'
            ? item.wouldMakeAgain
            : undefined,
        rating:
          typeof item.rating === 'number' && item.rating >= 1 && item.rating <= 5
            ? item.rating
            : undefined,
      },
    ]
  })
}

function parseJourney(value: unknown): JourneyProgress {
  if (!isObject(value)) return { completedCocktailIds: [] }
  return { completedCocktailIds: asStringArray(value.completedCocktailIds) }
}

export function validateUserData(raw: unknown): UserData {
  if (!isObject(raw)) {
    throw new Error('Backup must be a JSON object.')
  }
  if (raw.version !== USER_DATA_VERSION) {
    throw new Error(
      `Unsupported backup version: ${String(raw.version)}. Expected ${USER_DATA_VERSION}.`,
    )
  }
  if (!isObject(raw.inventoryOverrides)) {
    throw new Error('Backup is missing inventoryOverrides.')
  }

  return {
    version: USER_DATA_VERSION,
    inventoryOverrides: raw.inventoryOverrides as Record<
      string,
      InventoryOverride
    >,
    recentlyViewedCocktailIds: asStringArray(raw.recentlyViewedCocktailIds),
    shoppingList: parseShoppingList(raw.shoppingList),
    cocktailMeta: parseCocktailMeta(raw.cocktailMeta),
    history: parseHistory(raw.history),
    journey: parseJourney(raw.journey),
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : undefined,
  }
}

export function createLocalStorageAdapter(
  getStorage: () => Storage = () => localStorage,
): PersistenceAdapter {
  const load = (): UserData => {
    try {
      const raw = getStorage().getItem(STORAGE_KEY)
      if (!raw) return createDefaultUserData()
      return validateUserData(JSON.parse(raw))
    } catch {
      return createDefaultUserData()
    }
  }

  const save = (data: UserData): void => {
    getStorage().setItem(STORAGE_KEY, JSON.stringify(data))
  }

  return {
    load,
    save,
    reset() {
      getStorage().removeItem(STORAGE_KEY)
    },
    exportJson() {
      const data: UserData = {
        ...load(),
        exportedAt: new Date().toISOString(),
      }
      return JSON.stringify(data, null, 2)
    },
    importJson(raw: string) {
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        throw new Error(
          'Invalid JSON — import aborted. Existing data unchanged.',
        )
      }
      const validated = validateUserData(parsed)
      save(validated)
      return validated
    },
  }
}

export const localPersistence = createLocalStorageAdapter()
