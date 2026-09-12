import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { drinks, seedInventory } from '../../data'
import { assessReadiness } from '../../services/recommendation/readiness'
import { useUserData } from '../persistence/UserDataContext'
import { CocktailCard } from '../cocktails/CocktailCard'

export function FavoritesPage() {
  const { userData } = useUserData()

  const favorites = useMemo(() => {
    // Spans every drink: a favorited shot belongs here too.
    return drinks
      .filter((c) => userData.cocktailMeta[c.id]?.favorite)
      .map((cocktail) => ({
        cocktail,
        readiness: assessReadiness(
          cocktail,
          seedInventory,
          userData.inventoryOverrides,
        ),
        rating: userData.cocktailMeta[cocktail.id]?.rating,
      }))
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.cocktail.name.localeCompare(b.cocktail.name))
  }, [userData])

  return (
    <div>
      <header className="page-header">
        <p className="page-header__eyebrow">Personal</p>
        <h1 className="page-header__title">Favorites</h1>
        <p className="page-header__lede">
          Cocktails you have starred from the recipe page.
        </p>
      </header>

      {favorites.length === 0 ? (
        <div className="settings-panel">
          <p>No favorites yet. Open a recipe and tap the star.</p>
          <Link className="btn" to="/cocktails">
            Browse cocktails
          </Link>
        </div>
      ) : (
        <div className="cocktail-grid">
          {favorites.map(({ cocktail, readiness }) => (
            <CocktailCard
              key={cocktail.id}
              cocktail={cocktail}
              readiness={readiness}
              showKindBadge
            />
          ))}
        </div>
      )}
    </div>
  )
}
