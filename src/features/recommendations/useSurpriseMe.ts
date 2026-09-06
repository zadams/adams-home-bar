import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { seedInventory } from '../../data'
import { rankCocktails } from '../../services/recommendation/rank'
import { useUserData } from '../persistence/UserDataContext'

/** Navigate to a random ready cocktail, skipping the current drink when possible. */
export function useSurpriseMe() {
  const navigate = useNavigate()
  const { userData } = useUserData()

  return useCallback(
    (excludeId?: string) => {
      const [pick] = rankCocktails({
        seedInventory,
        overrides: userData.inventoryOverrides,
        surprise: true,
        excludeIds: excludeId ? [excludeId] : undefined,
      })
      if (!pick) return
      navigate(`/cocktails/${pick.cocktail.slug}`)
    },
    [navigate, userData.inventoryOverrides],
  )
}
