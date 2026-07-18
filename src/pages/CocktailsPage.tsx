import { useMemo, useState } from 'react'
import { cocktails, ingredientById, seedInventory } from '../data'
import { assessReadiness, readinessSortKey } from '../services/recommendation/readiness'
import { useUserData } from '../features/persistence/UserDataContext'
import { CocktailCard } from '../features/cocktails/CocktailCard'
import type { ReadinessState } from '../types/cocktail'

type SortMode = 'readiness' | 'name' | 'difficulty'

export function CocktailsPage() {
  const { userData } = useUserData()
  const [query, setQuery] = useState('')
  const [readinessFilter, setReadinessFilter] = useState<'all' | ReadinessState>('all')
  const [sort, setSort] = useState<SortMode>('readiness')

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const difficultyRank = { easy: 0, medium: 1, advanced: 2 }

    return cocktails
      .map((cocktail) => ({
        cocktail,
        readiness: assessReadiness(
          cocktail,
          seedInventory,
          userData.inventoryOverrides,
        ),
      }))
      .filter(({ cocktail, readiness }) => {
        if (readinessFilter !== 'all' && readiness.state !== readinessFilter) {
          return false
        }
        if (!q) return true
        const ingredientNames = cocktail.ingredients
          .map((ing) => ingredientById.get(ing.ingredientId)?.name ?? ing.ingredientId)
          .join(' ')
        const haystack = [
          cocktail.name,
          cocktail.description,
          cocktail.cocktailFamily,
          ...cocktail.classifications,
          ...cocktail.flavorProfiles,
          ...cocktail.tags,
          ...cocktail.aliases,
          ingredientNames,
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
      .sort((a, b) => {
        if (sort === 'name') return a.cocktail.name.localeCompare(b.cocktail.name)
        if (sort === 'difficulty') {
          return (
            difficultyRank[a.cocktail.difficulty] -
            difficultyRank[b.cocktail.difficulty]
          )
        }
        const byReady =
          readinessSortKey(a.readiness.state) - readinessSortKey(b.readiness.state)
        return byReady || a.cocktail.name.localeCompare(b.cocktail.name)
      })
  }, [query, readinessFilter, sort, userData.inventoryOverrides])

  return (
    <div>
      <header className="page-header">
        <p className="page-header__eyebrow">Collection</p>
        <h1 className="page-header__title">Cocktails</h1>
        <p className="page-header__lede">
          Twelve foundational recipes. Search by name, ingredient, flavor, or family.
        </p>
      </header>

      <div className="toolbar">
        <label className="search-field">
          <span className="sr-only">Search cocktails</span>
          <input
            type="search"
            placeholder="Search name, ingredient, flavor…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="select-field">
          <span className="sr-only">Filter by readiness</span>
          <select
            value={readinessFilter}
            onChange={(e) =>
              setReadinessFilter(e.target.value as 'all' | ReadinessState)
            }
          >
            <option value="all">All readiness</option>
            <option value="ready">Ready</option>
            <option value="almost">Almost ready</option>
            <option value="nearly">Nearly ready</option>
            <option value="not_ready">Not ready</option>
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">Sort cocktails</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
          >
            <option value="readiness">Best inventory match</option>
            <option value="name">Name</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </label>
      </div>

      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        Showing {items.length} of {cocktails.length}
      </p>

      <div className="cocktail-grid">
        {items.map(({ cocktail, readiness }) => (
          <CocktailCard
            key={cocktail.id}
            cocktail={cocktail}
            readiness={readiness}
          />
        ))}
      </div>
    </div>
  )
}
