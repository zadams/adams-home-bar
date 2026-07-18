import { Link } from 'react-router-dom'
import type { Cocktail } from '../../types/cocktail'
import type { ReadinessResult } from '../../services/recommendation/readiness'
import { CocktailIllustration } from '../../components/CocktailIllustration'
import { readinessClass } from '../../utils/illustrations'

interface CocktailCardProps {
  cocktail: Cocktail
  readiness: ReadinessResult
}

export function CocktailCard({ cocktail, readiness }: CocktailCardProps) {
  const keySpirit =
    cocktail.ingredients.find((i) =>
      ['bourbon', 'rye', 'gin', 'vodka', 'white_rum', 'gold_rum', 'blanco_tequila', 'cristalino_tequila'].includes(
        i.ingredientId,
      ),
    )?.label ??
    cocktail.cocktailFamily

  return (
    <Link to={`/cocktails/${cocktail.slug}`} className="cocktail-card">
      <CocktailIllustration
          illustrationKey={cocktail.illustrationKey}
          name={cocktail.name}
          glassware={cocktail.glassware}
          className="cocktail-card__art"
          showIngredients={false}
        />
      <div className="cocktail-card__body">
        <h2 className="cocktail-card__name">{cocktail.name}</h2>
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
