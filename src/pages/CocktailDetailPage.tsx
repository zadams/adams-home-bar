import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cocktailBySlug, seedInventory } from '../data'
import { assessReadiness } from '../services/recommendation/readiness'
import { useUserData } from '../features/persistence/UserDataContext'
import { RecipeView } from '../features/cocktails/RecipeView'

export function CocktailDetailPage() {
  const { slug } = useParams()
  const { userData, trackView } = useUserData()
  const cocktail = slug ? cocktailBySlug.get(slug) : undefined

  useEffect(() => {
    if (cocktail) trackView(cocktail.id)
  }, [cocktail, trackView])

  if (!cocktail) {
    return (
      <div className="page-header">
        <h1 className="page-header__title">Cocktail not found</h1>
        <p className="page-header__lede">
          That recipe is not in the Phase 1 collection.
        </p>
        <Link className="btn" to="/cocktails">
          Back to cocktails
        </Link>
      </div>
    )
  }

  const readiness = assessReadiness(
    cocktail,
    seedInventory,
    userData.inventoryOverrides,
  )

  return <RecipeView cocktail={cocktail} readiness={readiness} />
}
