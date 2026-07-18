import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { cocktailById, cocktails, seedInventory } from '../data'
import { assessReadiness, readinessSortKey } from '../services/recommendation/readiness'
import { useUserData } from '../features/persistence/UserDataContext'
import { CocktailCard } from '../features/cocktails/CocktailCard'
import { journeyStages } from '../data/journey'

export function HomePage() {
  const { userData } = useUserData()

  const ranked = useMemo(() => {
    return cocktails
      .map((cocktail) => ({
        cocktail,
        readiness: assessReadiness(
          cocktail,
          seedInventory,
          userData.inventoryOverrides,
        ),
      }))
      .sort(
        (a, b) =>
          readinessSortKey(a.readiness.state) -
            readinessSortKey(b.readiness.state) ||
          a.cocktail.name.localeCompare(b.cocktail.name),
      )
  }, [userData.inventoryOverrides])

  const ready = ranked.filter((r) => r.readiness.state === 'ready')
  const almost = ranked.filter((r) => r.readiness.state === 'almost')
  const favorites = ranked.filter(
    (r) => userData.cocktailMeta[r.cocktail.id]?.favorite,
  )
  const recentlyViewed = userData.recentlyViewedCocktailIds
    .map((id) => ranked.find((r) => r.cocktail.id === id))
    .filter(Boolean)
    .slice(0, 4) as typeof ranked
  const recentlyMade = userData.history
    .map((h) => ranked.find((r) => r.cocktail.id === h.cocktailId))
    .filter(Boolean)
    .filter(
      (item, index, arr) =>
        arr.findIndex((x) => x!.cocktail.id === item!.cocktail.id) === index,
    )
    .slice(0, 4) as typeof ranked

  const journeyDone = userData.journey.completedCocktailIds.length
  const journeyTotal = journeyStages.reduce(
    (n, s) => n + s.cocktailIds.filter((id) => cocktailById.has(id)).length,
    0,
  )
  const bottleCount = seedInventory.filter((i) => i.bottleId).length
  const lowOrOut = seedInventory.filter((item) => {
    const status =
      userData.inventoryOverrides[item.id]?.status ?? item.status
    return status === 'low' || status === 'out'
  }).length

  return (
    <div>
      <header className="home-hero">
        <div>
          <h1 className="home-hero__brand">The Adams Home Bar</h1>
          <p className="home-hero__sub">
            A Personal Cocktail Manual for the Spirits You Own
          </p>
        </div>
        <p className="home-hero__lede">
          What should you make? Start from what is ready, finish one ingredient,
          or pour from a bottle you want to use tonight.
        </p>
        <div className="home-actions">
          <Link className="btn btn--amber" to="/make">
            Make Something Now
          </Link>
          <Link className="btn btn--ghost" to="/make?mode=surprise">
            Surprise Me
          </Link>
          <Link className="btn btn--ghost" to="/journey">
            Cocktail Journey
          </Link>
        </div>
        <div className="home-stats" aria-label="Bar summary">
          <div className="home-stat">
            <strong>{bottleCount}</strong>
            <span>Bottles</span>
          </div>
          <div className="home-stat">
            <strong>{ready.length}</strong>
            <span>Available cocktails</span>
          </div>
          <div className="home-stat">
            <strong>{almost.length}</strong>
            <span>Missing one</span>
          </div>
          <div className="home-stat">
            <strong>{lowOrOut}</strong>
            <span>Low or out</span>
          </div>
        </div>
      </header>

      <section className="home-section">
        <div className="home-section__head">
          <h2 className="section-title">Ready to make</h2>
          <Link to="/make">See all</Link>
        </div>
        <div className="cocktail-grid">
          {ready.slice(0, 4).map(({ cocktail, readiness }) => (
            <CocktailCard
              key={cocktail.id}
              cocktail={cocktail}
              readiness={readiness}
            />
          ))}
        </div>
      </section>

      {almost.length > 0 && (
        <section className="home-section">
          <div className="home-section__head">
            <h2 className="section-title">Missing one ingredient</h2>
            <Link to="/shopping">Shopping list</Link>
          </div>
          <div className="cocktail-grid">
            {almost.slice(0, 4).map(({ cocktail, readiness }) => (
              <CocktailCard
                key={cocktail.id}
                cocktail={cocktail}
                readiness={readiness}
              />
            ))}
          </div>
        </section>
      )}

      <section className="home-section">
        <div className="home-section__head">
          <h2 className="section-title">Use a specific bottle</h2>
          <Link to="/bar">My Bar</Link>
        </div>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Open My Bar, pick a bottle, and tap “Use this bottle” to see matching
          recipes.
        </p>
      </section>

      {favorites.length > 0 && (
        <section className="home-section">
          <div className="home-section__head">
            <h2 className="section-title">Favorites</h2>
            <Link to="/favorites">All favorites</Link>
          </div>
          <div className="cocktail-grid">
            {favorites.slice(0, 4).map(({ cocktail, readiness }) => (
              <CocktailCard
                key={cocktail.id}
                cocktail={cocktail}
                readiness={readiness}
              />
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="home-section">
          <h2 className="section-title">Recently viewed</h2>
          <div className="cocktail-grid">
            {recentlyViewed.map(({ cocktail, readiness }) => (
              <CocktailCard
                key={cocktail.id}
                cocktail={cocktail}
                readiness={readiness}
              />
            ))}
          </div>
        </section>
      )}

      {recentlyMade.length > 0 && (
        <section className="home-section">
          <div className="home-section__head">
            <h2 className="section-title">Recently made</h2>
            <Link to="/history">History</Link>
          </div>
          <div className="cocktail-grid">
            {recentlyMade.map(({ cocktail, readiness }) => (
              <CocktailCard
                key={cocktail.id}
                cocktail={cocktail}
                readiness={readiness}
              />
            ))}
          </div>
        </section>
      )}

      <section className="home-section settings-panel">
        <h2 className="section-title" style={{ fontSize: '1.75rem' }}>
          Continue the Cocktail Journey
        </h2>
        <p>
          {journeyDone} of {journeyTotal} available stage cocktails complete.
        </p>
        <Link className="btn" to="/journey">
          Open journey
        </Link>
      </section>
    </div>
  )
}
