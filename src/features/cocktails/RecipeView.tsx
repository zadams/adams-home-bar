import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Cocktail } from '../../types/cocktail'
import type { ReadinessResult } from '../../services/recommendation/readiness'
import { scaleCocktailIngredients } from '../../services/scaling/servings'
import { bottleById, cocktailById, getIngredientName } from '../../data'
import ingredientImages from '../../data/illustrations/ingredients.json'
import { CocktailIllustration } from '../../components/CocktailIllustration'
import { readinessClass } from '../../utils/illustrations'
import { assetUrl } from '../../utils/assetUrl'
import { useUserData } from '../persistence/UserDataContext'
import '../../styles/recipe-spread.css'

interface RecipeViewProps {
  cocktail: Cocktail
  readiness: ReadinessResult
}

export function RecipeView({ cocktail, readiness }: RecipeViewProps) {
  const {
    userData,
    toggleFavorite,
    setCocktailMeta,
    logMade,
    addMissingToShoppingList,
    addToShoppingList,
  } = useUserData()
  const meta = userData.cocktailMeta[cocktail.id]
  const [servings, setServings] = useState(1)
  const [madeNote, setMadeNote] = useState('')
  const [selectedBottleId, setSelectedBottleId] = useState(
    cocktail.recommendedBottles[0]?.bottleId ?? '',
  )
  const [justLogged, setJustLogged] = useState(false)

  const scaled = useMemo(
    () => scaleCocktailIngredients(cocktail, servings),
    [cocktail, servings],
  )

  const recommended = cocktail.recommendedBottles
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .map((rec) => ({
      ...rec,
      bottle: bottleById.get(rec.bottleId),
    }))

  return (
    <article className="recipe-spread">
      <div className="recipe-spread__left">
        <Link to="/cocktails" className="recipe-spread__back">
          ← All cocktails
        </Link>

        <CocktailIllustration
          illustrationKey={cocktail.illustrationKey}
          name={cocktail.name}
          glassware={cocktail.glassware}
          className="recipe-hero"
          showIngredients
          ingredientIds={cocktail.ingredients
            .filter((i) => !i.optional)
            .map((i) => i.ingredientId)}
        />

        <div>
          <h1 className="recipe-spread__name">{cocktail.name}</h1>
          <div
            className="recipe-spread__classifications"
            style={{ marginTop: '0.75rem' }}
          >
            {cocktail.classifications.map((c) => (
              <span key={c} className="recipe-chip">
                {c}
              </span>
            ))}
          </div>
        </div>

        <span className={readinessClass(readiness.state)}>{readiness.label}</span>

        <p className="recipe-description">{cocktail.description}</p>

        <dl className="recipe-facts">
          <div className="recipe-fact">
            <dt>Flavor</dt>
            <dd>{cocktail.flavorProfiles.join(' · ')}</dd>
          </div>
          <div className="recipe-fact">
            <dt>Difficulty</dt>
            <dd>{cocktail.difficulty}</dd>
          </div>
          <div className="recipe-fact">
            <dt>Time</dt>
            <dd>{cocktail.preparationTime} min</dd>
          </div>
          <div className="recipe-fact">
            <dt>Strength</dt>
            <dd>{cocktail.strength}</dd>
          </div>
          <div className="recipe-fact">
            <dt>Glass</dt>
            <dd>{cocktail.glassware}</dd>
          </div>
          <div className="recipe-fact">
            <dt>Ice</dt>
            <dd>{cocktail.ice}</dd>
          </div>
          <div className="recipe-fact" style={{ gridColumn: '1 / -1' }}>
            <dt>Garnish</dt>
            <dd>{cocktail.garnish.join(' · ')}</dd>
          </div>
        </dl>

        <div>
          <h2 className="recipe-panel-title">From your bar</h2>
          <ul className="bottle-list">
            {recommended.map((rec) => (
              <li key={rec.bottleId}>
                <div className="bottle-list__rank">#{rec.rank}</div>
                <div className="bottle-list__name">
                  {rec.bottle ? (
                    <Link to={`/bar/${rec.bottleId}`}>
                      {rec.bottle.brand} {rec.bottle.productName}
                    </Link>
                  ) : (
                    rec.bottleId
                  )}
                </div>
                <p className="bottle-list__note">{rec.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="recipe-spread__right">
        {readiness.missingRequired.length > 0 && (
          <div className="alert-banner alert-banner--missing" role="status">
            <div>
              Missing: {readiness.missingRequired.map((m) => m.name).join(', ')}
            </div>
            <div className="settings-actions" style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() =>
                  addMissingToShoppingList(
                    readiness.missingRequired.map((m) => m.ingredientId),
                    cocktail.id,
                  )
                }
              >
                Add missing to shopping list
              </button>
            </div>
          </div>
        )}
        {readiness.confirmFresh.length > 0 && (
          <div className="alert-banner alert-banner--warn" role="status">
            Confirm fresh:{' '}
            {readiness.confirmFresh.map((m) => m.name).join(', ')}
          </div>
        )}

        <div className="personal-panel">
          <button
            type="button"
            className={`btn ${meta?.favorite ? 'btn--amber' : 'btn--ghost'}`}
            aria-pressed={Boolean(meta?.favorite)}
            onClick={() => toggleFavorite(cocktail.id)}
          >
            {meta?.favorite ? '★ Favorited' : '☆ Favorite'}
          </button>
          <label className="rating-control">
            <span>Rating</span>
            <select
              value={meta?.rating ?? ''}
              onChange={(e) => {
                const value = e.target.value
                setCocktailMeta(cocktail.id, {
                  rating: value ? Number(value) : undefined,
                })
              }}
            >
              <option value="">—</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}★
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="notes-field">
          <span className="recipe-panel-title">Tasting notes</span>
          <textarea
            rows={3}
            value={meta?.notes ?? ''}
            placeholder="What worked, what you’d change…"
            onChange={(e) =>
              setCocktailMeta(cocktail.id, { notes: e.target.value })
            }
          />
        </label>

        <div className="made-it-panel">
          <h2 className="recipe-panel-title">I made this</h2>
          <label className="select-field">
            <span className="sr-only">Bottle used</span>
            <select
              value={selectedBottleId}
              onChange={(e) => setSelectedBottleId(e.target.value)}
            >
              <option value="">Bottle used (optional)</option>
              {recommended.map((rec) => (
                <option key={rec.bottleId} value={rec.bottleId}>
                  {rec.bottle
                    ? `${rec.bottle.brand} ${rec.bottle.productName}`
                    : rec.bottleId}
                </option>
              ))}
            </select>
          </label>
          <input
            type="text"
            placeholder="Personal modifications (optional)"
            value={madeNote}
            onChange={(e) => setMadeNote(e.target.value)}
          />
          <button
            type="button"
            className="btn btn--amber"
            onClick={() => {
              logMade({
                cocktailId: cocktail.id,
                bottleId: selectedBottleId || undefined,
                modifications: madeNote || undefined,
                rating: meta?.rating,
                wouldMakeAgain: true,
              })
              setJustLogged(true)
              setMadeNote('')
            }}
          >
            Log drink
          </button>
          {justLogged && (
            <p className="settings-message settings-message--ok" role="status">
              Logged to history and Cocktail Journey.
            </p>
          )}
        </div>

        <div className="servings-control" aria-label="Serving size">
          <span className="servings-control__label">Servings</span>
          <button
            type="button"
            aria-label="Decrease servings"
            disabled={servings <= 1}
            onClick={() => setServings((s) => Math.max(1, s - 1))}
          >
            −
          </button>
          <span className="servings-control__value" aria-live="polite">
            {servings}
          </span>
          <button
            type="button"
            aria-label="Increase servings"
            disabled={servings >= 8}
            onClick={() => setServings((s) => Math.min(8, s + 1))}
          >
            +
          </button>
        </div>

        <div>
          <h2 className="recipe-panel-title">Ingredients</h2>
          <table className="ingredient-table">
            <thead>
              <tr>
                <th scope="col">Amount</th>
                <th scope="col">Ingredient</th>
              </tr>
            </thead>
            <tbody>
              {scaled.map((line, index) => {
                const ingPhoto = (
                  ingredientImages as Record<string, { src: string }>
                )[line.ingredientId]
                return (
                <tr key={`${line.ingredientId}-${index}`}>
                  <td className="ingredient-table__amount">{line.display}</td>
                  <td>
                    <span className="ingredient-table__name">
                      {ingPhoto ? (
                        <img
                          src={assetUrl(ingPhoto.src)}
                          alt=""
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          className="ingredient-table__thumb"
                        />
                      ) : null}
                      <span>
                    {line.label ?? getIngredientName(line.ingredientId)}
                    {line.optional && (
                      <>
                        {' '}
                        <span className="ingredient-table__optional">
                          optional
                        </span>
                      </>
                    )}
                      </span>
                    </span>
                    {line.notes && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--color-text-dim)',
                        }}
                      >
                        {line.notes}
                      </div>
                    )}
                    {!line.optional &&
                      readiness.missingRequired.some(
                        (m) => m.ingredientId === line.ingredientId,
                      ) && (
                        <div>
                          <button
                            type="button"
                            className="linkish"
                            onClick={() =>
                              addToShoppingList(line.ingredientId, cocktail.id)
                            }
                          >
                            Add to shopping list
                          </button>
                        </div>
                      )}
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="recipe-panel-title">Preparation</h2>
          <ol className="steps-list">
            {cocktail.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        {cocktail.techniqueNotes.length > 0 && (
          <div>
            <h2 className="recipe-panel-title">Technique</h2>
            <ul className="steps-list" style={{ listStyle: 'disc' }}>
              {cocktail.techniqueNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="recipe-details">
          {cocktail.history && (
            <details>
              <summary>History</summary>
              <p>{cocktail.history}</p>
            </details>
          )}
          {cocktail.whyItWorks && (
            <details>
              <summary>Why it works</summary>
              <p>{cocktail.whyItWorks}</p>
            </details>
          )}
          {cocktail.substitutions.length > 0 && (
            <details>
              <summary>Substitutions</summary>
              <ul>
                {cocktail.substitutions.map((sub) => (
                  <li key={sub.ingredientId}>
                    <strong>{getIngredientName(sub.ingredientId)}</strong>
                    {' → '}
                    {sub.alternatives.map(getIngredientName).join(', ')}
                    {sub.notes ? ` — ${sub.notes}` : ''}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {cocktail.variations.length > 0 && (
            <details>
              <summary>Variations</summary>
              <ul>
                {cocktail.variations.map((variation) => {
                  const linked = variation.relatedCocktailId
                    ? cocktailById.get(variation.relatedCocktailId)
                    : undefined
                  return (
                    <li key={variation.id}>
                      {linked ? (
                        <Link to={`/cocktails/${linked.slug}`}>
                          {variation.name}
                        </Link>
                      ) : (
                        <strong>{variation.name}</strong>
                      )}
                      {variation.notes ? ` — ${variation.notes}` : ''}
                    </li>
                  )
                })}
              </ul>
            </details>
          )}
          {cocktail.relatedCocktailIds.length > 0 && (
            <details open>
              <summary>Related cocktails</summary>
              <div className="related-links">
                {cocktail.relatedCocktailIds.map((id) => {
                  const related = cocktailById.get(id)
                  if (!related) return null
                  return (
                    <Link key={id} to={`/cocktails/${related.slug}`}>
                      {related.name}
                    </Link>
                  )
                })}
              </div>
            </details>
          )}
        </div>
      </div>
    </article>
  )
}
