import { Link } from 'react-router-dom'
import { cocktailById } from '../../data'
import { journeyStages } from '../../data/journey'
import { assessReadiness } from '../../services/recommendation/readiness'
import { seedInventory } from '../../data'
import { useUserData } from '../persistence/UserDataContext'
import { readinessClass } from '../../utils/illustrations'

export function JourneyPage() {
  const { userData, markJourneyComplete } = useUserData()
  const completed = new Set(userData.journey.completedCocktailIds)

  return (
    <div>
      <header className="page-header">
        <p className="page-header__eyebrow">Learning</p>
        <h1 className="page-header__title">The Cocktail Journey</h1>
        <p className="page-header__lede">
          A guided path through foundations, builds, and advanced classics.
          Completion is tracked locally when you make a drink or mark a stage
          cocktail done.
        </p>
      </header>

      {journeyStages.map((stage) => {
        const doneCount = stage.cocktailIds.filter((id) => completed.has(id)).length
        return (
          <section key={stage.id} className="journey-stage">
            <div className="journey-stage__header">
              <h2>{stage.title}</h2>
              <p>
                {doneCount}/{stage.cocktailIds.length} complete
              </p>
            </div>
            <p className="journey-stage__desc">{stage.description}</p>
            <ul className="journey-list">
              {stage.cocktailIds.map((id) => {
                const cocktail = cocktailById.get(id)
                const isDone = completed.has(id)
                if (!cocktail) {
                  return (
                    <li key={id} className="journey-item journey-item--locked">
                      <span>{id.replace(/-/g, ' ')}</span>
                      <span className="recipe-chip">Coming in expansion</span>
                    </li>
                  )
                }
                const readiness = assessReadiness(
                  cocktail,
                  seedInventory,
                  userData.inventoryOverrides,
                )
                return (
                  <li key={id} className="journey-item">
                    <div>
                      <Link to={`/cocktails/${cocktail.slug}`}>{cocktail.name}</Link>
                      <div className="inventory-row__notes">
                        <span className={readinessClass(readiness.state)}>
                          {readiness.label}
                        </span>
                        {isDone && ' · Completed'}
                      </div>
                    </div>
                    {!isDone && (
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => markJourneyComplete(id)}
                      >
                        Mark done
                      </button>
                    )}
                    {isDone && <span className="recipe-chip">Done</span>}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <p style={{ color: 'var(--color-text-muted)' }}>
        Tip: logging “I made this” on a recipe also marks it complete on the
        journey. Missing stage drinks unlock as the collection expands.
      </p>
    </div>
  )
}
