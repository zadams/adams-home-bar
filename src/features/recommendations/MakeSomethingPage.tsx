import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { bottles, seedInventory } from '../../data'
import { rankCocktails } from '../../services/recommendation/rank'
import { useUserData } from '../persistence/UserDataContext'
import { CocktailCard } from '../cocktails/CocktailCard'

export function MakeSomethingPage() {
  const { userData } = useUserData()
  const [params, setParams] = useSearchParams()
  const bottleId = params.get('bottle') ?? ''
  const modeParam = params.get('mode')
  const [mode, setMode] = useState<'ready' | 'almost' | 'all' | 'surprise'>(
    modeParam === 'surprise' ? 'surprise' : 'ready',
  )

  const favoriteIds = useMemo(() => {
    return new Set(
      Object.entries(userData.cocktailMeta)
        .filter(([, meta]) => meta.favorite)
        .map(([id]) => id),
    )
  }, [userData.cocktailMeta])

  const ranked = useMemo(() => {
    if (mode === 'surprise') {
      return rankCocktails({
        seedInventory,
        overrides: userData.inventoryOverrides,
        favoriteIds,
        bottleId: bottleId || undefined,
        surprise: true,
      })
    }
    return rankCocktails({
      seedInventory,
      overrides: userData.inventoryOverrides,
      favoriteIds,
      bottleId: bottleId || undefined,
      maxMissing: mode === 'ready' ? 0 : mode === 'almost' ? 1 : undefined,
    })
  }, [mode, bottleId, userData.inventoryOverrides, favoriteIds])

  const selectedBottle = bottleId ? bottles.find((b) => b.id === bottleId) : null

  return (
    <div>
      <header className="page-header">
        <p className="page-header__eyebrow">Recommendations</p>
        <h1 className="page-header__title">Make Something</h1>
        <p className="page-header__lede">
          Ranked from your current inventory. Pick a bottle to see what it unlocks.
        </p>
      </header>

      <div className="toolbar">
        <div className="home-actions">
          <button
            type="button"
            className={`btn ${mode === 'ready' ? 'btn--amber' : 'btn--ghost'}`}
            onClick={() => setMode('ready')}
          >
            Ready now
          </button>
          <button
            type="button"
            className={`btn ${mode === 'almost' ? 'btn--amber' : 'btn--ghost'}`}
            onClick={() => setMode('almost')}
          >
            Missing one
          </button>
          <button
            type="button"
            className={`btn ${mode === 'all' ? 'btn--amber' : 'btn--ghost'}`}
            onClick={() => setMode('all')}
          >
            All matches
          </button>
          <button
            type="button"
            className={`btn ${mode === 'surprise' ? 'btn--amber' : 'btn--ghost'}`}
            onClick={() => setMode('surprise')}
          >
            Surprise me
          </button>
        </div>
        <label className="select-field">
          <span className="sr-only">Use a specific bottle</span>
          <select
            value={bottleId}
            onChange={(e) => {
              const value = e.target.value
              if (value) setParams({ bottle: value })
              else setParams({})
            }}
          >
            <option value="">Any bottle</option>
            {bottles
              .filter((b) => b.category === 'spirit')
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.brand} {b.productName}
                </option>
              ))}
          </select>
        </label>
      </div>

      {selectedBottle && (
        <p className="alert-banner" style={{ marginBottom: '1.5rem' }}>
          Filtering for{' '}
          <strong>
            {selectedBottle.brand} {selectedBottle.productName}
          </strong>
          .{' '}
          <Link to="/make">Clear filter</Link>
        </p>
      )}

      <div className="cocktail-grid">
        {ranked.map(({ cocktail, readiness, reasons }) => (
          <div key={cocktail.id} className="ranked-card">
            <CocktailCard cocktail={cocktail} readiness={readiness} />
            <ul className="ranked-card__reasons">
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {ranked.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>
          Nothing matches this filter. Try “All matches” or clear the bottle filter.
        </p>
      )}
    </div>
  )
}
