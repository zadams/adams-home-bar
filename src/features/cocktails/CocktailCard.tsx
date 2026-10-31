import { Link } from 'react-router-dom'
import type { Cocktail } from '../../types/cocktail'
import type { ReadinessResult } from '../../services/recommendation/readiness'
import { drinkKind, drinkPath, ingredientById } from '../../data'
import { CocktailIllustration } from '../../components/CocktailIllustration'
import { readinessClass } from '../../utils/illustrations'
import { useUserData } from '../persistence/UserDataContext'
import type { BackTo } from './backTo'

interface CocktailCardProps {
  cocktail: Cocktail
  readiness: ReadinessResult
  /**
   * Show a "Shot" or "Mocktail" chip on the name. Only set when the card appears somewhere
   * its kind is not implied — a cross-kind search result, favorites, history.
   */
  showKindBadge?: boolean
  /** The list this card sits in, so the recipe's back link returns to it. */
  backTo?: BackTo
  /** Place in a ranked set, shown over the art. */
  rank?: number
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
  backTo,
  rank,
}: CocktailCardProps) {
  const keySpirit = keyIngredientLabel(cocktail)
  const kind = drinkKind(cocktail)
  const timesMade = useUserData().madeCounts.get(cocktail.id) ?? 0

  return (
    <Link
      to={drinkPath(cocktail)}
      state={backTo ? { backTo } : undefined}
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
      {rank !== undefined && (
        <span className="cocktail-card__rank" aria-label={`Number ${rank}`}>
          #{rank}
        </span>
      )}
      {timesMade > 0 && (
        <span
          className="cocktail-card__made"
          title={timesMade === 1 ? 'Made once' : `Made ${timesMade} times`}
        >
          ✓ Made{timesMade > 1 && ` ×${timesMade}`}
        </span>
      )}
      <div className="cocktail-card__body">
        <h2 className="cocktail-card__name">
          {cocktail.name}
          {showKindBadge && kind !== 'cocktail' && (
            <span className="cocktail-card__kind">
              {kind === 'shot' ? 'Shot' : 'Mocktail'}
            </span>
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
