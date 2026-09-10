import { useMemo, useState } from 'react'
import { cocktails, drinks, ingredientById, isShot, seedInventory, shots } from '../../data'
import {
  assessReadiness,
  readinessSortKey,
} from '../../services/recommendation/readiness'
import { useUserData } from '../persistence/UserDataContext'
import { CocktailCard } from './CocktailCard'
import type { Cocktail, DrinkKind, ReadinessState } from '../../types/cocktail'

type SortMode = 'readiness' | 'name' | 'difficulty'

const DIFFICULTY_RANK = { easy: 0, medium: 1, advanced: 2 } as const

interface DrinkBrowserProps {
  /** Which half of the catalog this page browses. */
  kind: DrinkKind
  eyebrow: string
  title: string
  lede: string
  /** Label for the checkbox that widens a search past this page's kind. */
  crossKindLabel: string
}

function searchHaystack(drink: Cocktail): string {
  const ingredientNames = drink.ingredients
    .map((ing) => ingredientById.get(ing.ingredientId)?.name ?? ing.ingredientId)
    .join(' ')
  return [
    drink.name,
    drink.description,
    drink.cocktailFamily,
    ...drink.classifications,
    ...drink.flavorProfiles,
    ...drink.tags,
    ...drink.aliases,
    ingredientNames,
  ]
    .join(' ')
    .toLowerCase()
}

export function DrinkBrowser({
  kind,
  eyebrow,
  title,
  lede,
  crossKindLabel,
}: DrinkBrowserProps) {
  const { userData } = useUserData()
  const [query, setQuery] = useState('')
  const [readinessFilter, setReadinessFilter] = useState<'all' | ReadinessState>(
    'all',
  )
  const [sort, setSort] = useState<SortMode>('readiness')
  const [searchEverything, setSearchEverything] = useState(false)

  const scoped = kind === 'shot' ? shots : cocktails
  const q = query.trim().toLowerCase()

  // The toggle only widens an active search; with an empty box the page always
  // browses its own kind, which is the whole point of separating them.
  const searchingAcrossKinds = searchEverything && q.length > 0
  const pool = searchingAcrossKinds ? drinks : scoped

  const items = useMemo(() => {
    return pool
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
        return searchHaystack(cocktail).includes(q)
      })
      .sort((a, b) => {
        if (sort === 'name') return a.cocktail.name.localeCompare(b.cocktail.name)
        if (sort === 'difficulty') {
          return (
            DIFFICULTY_RANK[a.cocktail.difficulty] -
            DIFFICULTY_RANK[b.cocktail.difficulty]
          )
        }
        const byReady =
          readinessSortKey(a.readiness.state) - readinessSortKey(b.readiness.state)
        return byReady || a.cocktail.name.localeCompare(b.cocktail.name)
      })
  }, [pool, q, readinessFilter, sort, userData.inventoryOverrides])

  const offKind = items.filter(
    ({ cocktail }) => (isShot(cocktail) ? 'shot' : 'cocktail') !== kind,
  ).length

  return (
    <div>
      <header className="page-header">
        <p className="page-header__eyebrow">{eyebrow}</p>
        <h1 className="page-header__title">{title}</h1>
        <p className="page-header__lede">{lede}</p>
      </header>

      <div className="toolbar">
        <label className="search-field">
          <span className="sr-only">Search {title.toLowerCase()}</span>
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
          <span className="sr-only">Sort results</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
            <option value="readiness">Best inventory match</option>
            <option value="name">Name</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={searchEverything}
            onChange={(e) => setSearchEverything(e.target.checked)}
          />
          <span>{crossKindLabel}</span>
        </label>
      </div>

      <p className="browse-count">
        Showing {items.length} of {pool.length}
        {searchingAcrossKinds && offKind > 0
          ? ` · ${offKind} from outside ${title}`
          : ''}
      </p>

      {items.length === 0 ? (
        <p className="browse-empty">
          Nothing matches “{query}”
          {!searchEverything && ` in ${title}`}.
          {!searchEverything && ' Try searching the whole catalog.'}
        </p>
      ) : (
        <div className="cocktail-grid">
          {items.map(({ cocktail, readiness }) => (
            <CocktailCard
              key={cocktail.id}
              cocktail={cocktail}
              readiness={readiness}
              showKindBadge={isShot(cocktail) && kind !== 'shot'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
