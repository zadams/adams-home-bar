import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { localPersistence } from '../../services/persistence/local-storage'
import { createShoppingItem } from '../../services/shopping/shopping-list'
import { overridesForPurchasedIngredients } from '../../services/shopping/apply-purchases'
import type {
  CocktailPersonalization,
  HistoryEntry,
  InventoryOverride,
  UserData,
} from '../../types/persistence'
import type { InventoryStatus } from '../../types/inventory'

interface UserDataContextValue {
  userData: UserData
  trackView: (cocktailId: string) => void
  setInventoryOverride: (
    itemId: string,
    override: InventoryOverride,
  ) => void
  setInventoryStatus: (itemId: string, status: InventoryStatus) => void
  addToShoppingList: (ingredientId: string, cocktailId?: string) => void
  addMissingToShoppingList: (
    ingredientIds: string[],
    cocktailId?: string,
  ) => void
  toggleShoppingPurchased: (itemId: string) => void
  removeShoppingItem: (itemId: string) => void
  applyPurchasedToInventory: () => number
  clearPurchasedShopping: () => void
  toggleFavorite: (cocktailId: string) => void
  setCocktailMeta: (
    cocktailId: string,
    meta: Partial<CocktailPersonalization>,
  ) => void
  logMade: (entry: Omit<HistoryEntry, 'id' | 'madeAt'> & { madeAt?: string }) => void
  markJourneyComplete: (cocktailId: string) => void
  exportJson: () => string
  importJson: (raw: string) => void
  resetData: () => void
}

const UserDataContext = createContext<UserDataContextValue | null>(null)

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(() => localPersistence.load())

  useEffect(() => {
    localPersistence.save(userData)
  }, [userData])

  const trackView = useCallback((cocktailId: string) => {
    setUserData((prev) => {
      const next = [
        cocktailId,
        ...prev.recentlyViewedCocktailIds.filter((id) => id !== cocktailId),
      ].slice(0, 12)
      return { ...prev, recentlyViewedCocktailIds: next }
    })
  }, [])

  const setInventoryOverride = useCallback(
    (itemId: string, override: InventoryOverride) => {
      setUserData((prev) => ({
        ...prev,
        inventoryOverrides: {
          ...prev.inventoryOverrides,
          [itemId]: { ...prev.inventoryOverrides[itemId], ...override },
        },
      }))
    },
    [],
  )

  const setInventoryStatus = useCallback(
    (itemId: string, status: InventoryStatus) => {
      setInventoryOverride(itemId, { status })
    },
    [setInventoryOverride],
  )

  const addToShoppingList = useCallback(
    (ingredientId: string, cocktailId?: string) => {
      setUserData((prev) => {
        const existing = prev.shoppingList.find(
          (item) => item.ingredientId === ingredientId && !item.purchased,
        )
        if (existing) {
          if (!cocktailId || existing.sourceCocktailIds.includes(cocktailId)) {
            return prev
          }
          return {
            ...prev,
            shoppingList: prev.shoppingList.map((item) =>
              item.id === existing.id
                ? {
                    ...item,
                    sourceCocktailIds: [
                      ...item.sourceCocktailIds,
                      cocktailId,
                    ],
                  }
                : item,
            ),
          }
        }
        return {
          ...prev,
          shoppingList: [
            ...prev.shoppingList,
            createShoppingItem(ingredientId, cocktailId),
          ],
        }
      })
    },
    [],
  )

  const addMissingToShoppingList = useCallback(
    (ingredientIds: string[], cocktailId?: string) => {
      for (const id of ingredientIds) addToShoppingList(id, cocktailId)
    },
    [addToShoppingList],
  )

  const toggleShoppingPurchased = useCallback((itemId: string) => {
    setUserData((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.map((item) =>
        item.id === itemId ? { ...item, purchased: !item.purchased } : item,
      ),
    }))
  }, [])

  const removeShoppingItem = useCallback((itemId: string) => {
    setUserData((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.filter((item) => item.id !== itemId),
    }))
  }, [])

  const applyPurchasedToInventory = useCallback(() => {
    let applied = 0
    setUserData((prev) => {
      const purchased = prev.shoppingList.filter((s) => s.purchased)
      applied = purchased.length
      if (applied === 0) return prev
      const ingredientIds = purchased.map((s) => s.ingredientId)
      return {
        ...prev,
        inventoryOverrides: overridesForPurchasedIngredients(
          ingredientIds,
          prev.inventoryOverrides,
        ),
        shoppingList: prev.shoppingList.filter((s) => !s.purchased),
      }
    })
    return applied
  }, [])

  const clearPurchasedShopping = useCallback(() => {
    setUserData((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.filter((s) => !s.purchased),
    }))
  }, [])

  const toggleFavorite = useCallback((cocktailId: string) => {
    setUserData((prev) => {
      const current = prev.cocktailMeta[cocktailId]
      return {
        ...prev,
        cocktailMeta: {
          ...prev.cocktailMeta,
          [cocktailId]: {
            ...current,
            favorite: !current?.favorite,
          },
        },
      }
    })
  }, [])

  const setCocktailMeta = useCallback(
    (cocktailId: string, meta: Partial<CocktailPersonalization>) => {
      setUserData((prev) => {
        const current = { ...prev.cocktailMeta[cocktailId] }
        for (const [key, value] of Object.entries(meta)) {
          if (value === undefined) {
            delete current[key as keyof CocktailPersonalization]
          } else {
            ;(current as Record<string, unknown>)[key] = value
          }
        }
        return {
          ...prev,
          cocktailMeta: {
            ...prev.cocktailMeta,
            [cocktailId]: current,
          },
        }
      })
    },
    [],
  )

  const logMade = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'madeAt'> & { madeAt?: string }) => {
      const id = `hist-${entry.cocktailId}-${Date.now()}`
      const madeAt = entry.madeAt ?? new Date().toISOString()
      setUserData((prev) => {
        const history: HistoryEntry[] = [
          { ...entry, id, madeAt },
          ...prev.history,
        ].slice(0, 200)
        const journeyIds = prev.journey.completedCocktailIds.includes(
          entry.cocktailId,
        )
          ? prev.journey.completedCocktailIds
          : [...prev.journey.completedCocktailIds, entry.cocktailId]
        const cocktailMeta = {
          ...prev.cocktailMeta,
          [entry.cocktailId]: {
            ...prev.cocktailMeta[entry.cocktailId],
            ...(typeof entry.rating === 'number'
              ? { rating: entry.rating }
              : {}),
            ...(typeof entry.wouldMakeAgain === 'boolean'
              ? { wouldMakeAgain: entry.wouldMakeAgain }
              : {}),
          },
        }
        return {
          ...prev,
          history,
          cocktailMeta,
          journey: { completedCocktailIds: journeyIds },
        }
      })
    },
    [],
  )

  const markJourneyComplete = useCallback((cocktailId: string) => {
    setUserData((prev) => {
      if (prev.journey.completedCocktailIds.includes(cocktailId)) return prev
      return {
        ...prev,
        journey: {
          completedCocktailIds: [
            ...prev.journey.completedCocktailIds,
            cocktailId,
          ],
        },
      }
    })
  }, [])

  const exportJson = useCallback(() => localPersistence.exportJson(), [])

  const importJson = useCallback((raw: string) => {
    const imported = localPersistence.importJson(raw)
    setUserData(imported)
  }, [])

  const resetData = useCallback(() => {
    localPersistence.reset()
    setUserData(localPersistence.load())
  }, [])

  const value = useMemo(
    () => ({
      userData,
      trackView,
      setInventoryOverride,
      setInventoryStatus,
      addToShoppingList,
      addMissingToShoppingList,
      toggleShoppingPurchased,
      removeShoppingItem,
      applyPurchasedToInventory,
      clearPurchasedShopping,
      toggleFavorite,
      setCocktailMeta,
      logMade,
      markJourneyComplete,
      exportJson,
      importJson,
      resetData,
    }),
    [
      userData,
      trackView,
      setInventoryOverride,
      setInventoryStatus,
      addToShoppingList,
      addMissingToShoppingList,
      toggleShoppingPurchased,
      removeShoppingItem,
      applyPurchasedToInventory,
      clearPurchasedShopping,
      toggleFavorite,
      setCocktailMeta,
      logMade,
      markJourneyComplete,
      exportJson,
      importJson,
      resetData,
    ],
  )

  return (
    <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
  )
}

export function useUserData(): UserDataContextValue {
  const ctx = useContext(UserDataContext)
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider')
  return ctx
}
