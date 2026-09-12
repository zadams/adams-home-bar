import { Link } from 'react-router-dom'
import type { Cocktail } from '../../types/cocktail'
import type { ReadinessResult } from '../../services/recommendation/readiness'
import { ingredientById, isShot } from '../../data'
import { CocktailIllustration } from '../../components/CocktailIllustration'
import { readinessClass } from '../../utils/illustrations'

interface CocktailCardProps {
  cocktail: Cocktail
  readiness: ReadinessResult
  /**
   * Show a "Shot" chip on the name. Only set when the card appears somewhere
   * its kind is not implied — a cross-kind search result, favorites, history.
   */
  showKindBadge?: boolean
}

/**
 * The card's third meta slot: whatever base spirit the drink leads with,
 * falling back to the family when it has none (a spritz, a cream shot).
 */
function keyIngredientLabel(cocktail: Cocktail): string {
  const base = cocktail.ingredients.find(
    (i) => ingredientById.get(i.ingredientId)?.category === 'spirit',
  )
  if (!base) return cocktail.cocktailFamily
  return (
    base.label ?? ingredientById.get(base.ingredientId)?.name ?? cocktail.cocktailFamily
  )
}

export function CocktailCard({
  cocktail,
  readiness,
  showKindBadge = false,
}: CocktailCardProps) {
  const keySpirit = keyIngredientLabel(cocktail)
  const shot = isShot(cocktail)

  return (
    <Link
      to={`/${shot ? 'shots' : 'cocktails'}/${cocktail.slug}`}
      className="cocktail-card"
    >
      <CocktailIllustration
          illustrationKey={cocktail.illustrationKey}
          name={cocktail.name}
          glassware={cocktail.glassware}
          className="cocktail-card__art"
          showIngredients={false}
          preferThumb
        />
      <div className="cocktail-card__body">
        <h2 className="cocktail-card__name">
          {cocktail.name}
          {showKindBadge && shot && (
            <span className="cocktail-card__kind">Shot</span>
          )}
        </h2>
        <div className="cocktail-card__meta">
          <span>{cocktail.classifications[0] ?? cocktail.cocktailFamily}</span>
          <span>{cocktail.difficulty}</span>
          <span>{keySpirit}</span>
        </div>
        <span className={readinessClass(readiness.state)}>{readiness.label}</span>
        {readiness.missingRequired.length > 0 && (
          <p className="cocktail-card__missing">
            Missing: {readiness.missingRequired.map((m) => m.name).join(', ')}
          </p>
        )}
      </div>
    </Link>
  )
}
