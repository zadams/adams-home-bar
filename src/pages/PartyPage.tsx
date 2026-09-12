import { useMemo, useState } from 'react'
import { drinks, getIngredientName, isShot } from '../data'
import {
  kitCanMake,
  kitEntries,
  kitIngredientIds,
  kitInventory,
  partyKit,
} from '../data/kits'
import { assessReadiness } from '../services/recommendation/readiness'
import { CocktailCard } from '../features/cocktails/CocktailCard'
import type { Cocktail } from '../types/cocktail'

type Lens = 'all' | 'cocktails' | 'shots'

export function PartyPage() {
  const [lens, setLens] = useState<Lens>('all')
  const [query, setQuery] = useState('')

  // Readiness against the bag alone — the home bar deliberately does not count.
  const inventory = useMemo(() => kitInventory(partyKit), [])

  const carried = useMemo(() => kitIngredientIds(partyKit), [])

  const makeable = useMemo(() => {
    return drinks
      .filter((cocktail) => kitCanMake(cocktail, carried))
      .map((cocktail) => ({
        cocktail,
        readiness: assessReadiness(cocktail, inventory),
      }))
      .sort((a, b) => a.cocktail.name.localeCompare(b.cocktail.name))
  }, [inventory, carried])

  const shots = makeable.filter(({ cocktail }) => isShot(cocktail))
  const cocktails = makeable.filter(({ cocktail }) => !isShot(cocktail))

  const shown = useMemo(() => {
    const pool =
      lens === 'shots' ? shots : lens === 'cocktails' ? cocktails : makeable
    const q = query.trim().toLowerCase()
    if (!q) return pool
    return pool.filter(({ cocktail }) =>
      `${cocktail.name} ${cocktail.description} ${cocktail.cocktailFamily}`
        .toLowerCase()
        .includes(q),
    )
  }, [lens, query, makeable, cocktails, shots])

  const carrying = kitEntries(partyKit).length

  return (
    <div>
      <header className="page-header">
        <p className="page-header__eyebrow">{partyKit.subtitle}</p>
        <h1 className="page-header__title">{partyKit.name}</h1>
        <p className="page-header__lede">{partyKit.description}</p>
      </header>

      <div className="party-figures">
        <div className="party-figure">
          <b>{makeable.length}</b>
          <span>drinks from the bag</span>
        </div>
        <div className="party-figure">
          <b>{cocktails.length}</b>
          <span>cocktails</span>
        </div>
        <div className="party-figure">
          <b>{shots.length}</b>
          <span>shots</span>
        </div>
        <div className="party-figure">
          <b>{carrying}</b>
          <span>things carried</span>
        </div>
      </div>

      <section className="party-manifest">
        <h2 className="section-title">Packing</h2>
        <div className="party-groups">
          <div>
            <p className="party-group-label">Bottles</p>
            <p className="party-group-items">
              {partyKit.bottles.map((b) => b.label).join(' · ')}
            </p>
          </div>
          <div>
            <p className="party-group-label">Pantry</p>
            <p className="party-group-items">
              {partyKit.pantry.map((b) => b.label).join(' · ')}
            </p>
          </div>
          <div>
            <p className="party-group-label">Mixers &amp; fruit</p>
            <p className="party-group-items">
              {partyKit.mixers.map((b) => b.label).join(' · ')}
            </p>
          </div>
        </div>
      </section>

      <div className="toolbar">
        <div className="lens-switch" role="group" aria-label="Filter by kind">
          {(
            [
              ['all', `All ${makeable.length}`],
              ['cocktails', `Cocktails ${cocktails.length}`],
              ['shots', `Shots ${shots.length}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                lens === value ? 'lens-switch__btn is-on' : 'lens-switch__btn'
              }
              aria-pressed={lens === value}
              onClick={() => setLens(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="search-field">
          <span className="sr-only">Search the party list</span>
          <input
            type="search"
            placeholder="Search what you can make…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <p className="browse-count">
        Showing {shown.length}
        {shown.length !== makeable.length ? ` of ${makeable.length}` : ''}
      </p>

      <div className="cocktail-grid">
        {shown.map(({ cocktail, readiness }) => (
          <CocktailCard
            key={cocktail.id}
            cocktail={cocktail}
            readiness={readiness}
            showKindBadge
          />
        ))}
      </div>

      <section className="party-left-home">
        <h2 className="section-title">Left at home on purpose</h2>
        <ul className="party-omissions">
          {partyKit.deliberatelyLeftHome.map((o) => (
            <li key={o.ingredientId}>
              <b>{getIngredientName(o.ingredientId)}</b>
              <span>{o.cost}</span>
            </li>
          ))}
        </ul>
        <p className="party-note">
          Worth knowing before someone orders one — these are in the home bar but
          not in the bag.
        </p>
      </section>
    </div>
  )
}

export type { Cocktail }
