import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { bottleById, cocktailById, cocktails } from '../../data'
import { useUserData } from '../persistence/UserDataContext'

export function DrinkHistoryPage() {
  const { userData } = useUserData()

  const mostMade = useMemo(() => {
    const counts = new Map<string, number>()
    for (const entry of userData.history) {
      counts.set(entry.cocktailId, (counts.get(entry.cocktailId) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [userData.history])

  const highestRated = useMemo(() => {
    return Object.entries(userData.cocktailMeta)
      .filter(([, meta]) => typeof meta.rating === 'number')
      .sort((a, b) => (b[1].rating ?? 0) - (a[1].rating ?? 0))
      .slice(0, 8)
  }, [userData.cocktailMeta])

  const untried = useMemo(() => {
    const made = new Set(userData.history.map((h) => h.cocktailId))
    return cocktails.filter((c) => !made.has(c.id)).slice(0, 12)
  }, [userData.history])

  const bottleUsage = useMemo(() => {
    const counts = new Map<string, number>()
    for (const entry of userData.history) {
      if (!entry.bottleId) continue
      counts.set(entry.bottleId, (counts.get(entry.bottleId) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [userData.history])

  return (
    <div>
      <header className="page-header">
        <p className="page-header__eyebrow">Personal</p>
        <h1 className="page-header__title">History</h1>
        <p className="page-header__lede">
          What you have made, rated, and still want to try.
        </p>
      </header>

      <section className="inventory-section">
        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
          Recently made
        </h2>
        {userData.history.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>
            No drinks logged yet. Use “I made this” on a recipe.
          </p>
        ) : (
          <ul className="history-list">
            {userData.history.slice(0, 20).map((entry) => {
              const cocktail = cocktailById.get(entry.cocktailId)
              const bottle = entry.bottleId
                ? bottleById.get(entry.bottleId)
                : undefined
              return (
                <li key={entry.id} className="history-row">
                  <div>
                    {cocktail ? (
                      <Link to={`/cocktails/${cocktail.slug}`}>
                        {cocktail.name}
                      </Link>
                    ) : (
                      entry.cocktailId
                    )}
                    <div className="inventory-row__notes">
                      {new Date(entry.madeAt).toLocaleString()}
                      {bottle &&
                        ` · ${bottle.brand} ${bottle.productName}`}
                      {entry.rating ? ` · ${entry.rating}★` : ''}
                      {entry.modifications ? ` · ${entry.modifications}` : ''}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="home-stats" style={{ margin: '2rem 0' }}>
        <div className="home-stat">
          <strong>{userData.history.length}</strong>
          <span>Drinks logged</span>
        </div>
        <div className="home-stat">
          <strong>{mostMade.length}</strong>
          <span>Distinct recipes made</span>
        </div>
        <div className="home-stat">
          <strong>{untried.length}</strong>
          <span>Still untried (shown)</span>
        </div>
      </div>

      {mostMade.length > 0 && (
        <section className="inventory-section">
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
            Most made
          </h2>
          <ul className="history-list">
            {mostMade.map(([id, count]) => (
              <li key={id} className="history-row">
                <Link to={`/cocktails/${cocktailById.get(id)?.slug ?? id}`}>
                  {cocktailById.get(id)?.name ?? id}
                </Link>
                <span>{count}×</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {highestRated.length > 0 && (
        <section className="inventory-section">
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
            Highest rated
          </h2>
          <ul className="history-list">
            {highestRated.map(([id, meta]) => (
              <li key={id} className="history-row">
                <Link to={`/cocktails/${cocktailById.get(id)?.slug ?? id}`}>
                  {cocktailById.get(id)?.name ?? id}
                </Link>
                <span>{meta.rating}★</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {bottleUsage.length > 0 && (
        <section className="inventory-section">
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
            Bottle usage
          </h2>
          <ul className="history-list">
            {bottleUsage.map(([id, count]) => {
              const bottle = bottleById.get(id)
              return (
                <li key={id} className="history-row">
                  <Link to={`/bar/${id}`}>
                    {bottle
                      ? `${bottle.brand} ${bottle.productName}`
                      : id}
                  </Link>
                  <span>{count}×</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="inventory-section">
        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
          Untried
        </h2>
        <div className="related-links">
          {untried.map((c) => (
            <Link key={c.id} to={`/cocktails/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
