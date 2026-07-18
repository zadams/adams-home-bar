import { Link, useParams } from 'react-router-dom'
import { bottleById, seedInventory } from '../../data'
import {
  findInventoryForBottle,
  statusLabel,
} from '../../services/inventory/effective'
import { cocktailsUsingBottle } from '../../services/recommendation/rank'
import { useUserData } from '../persistence/UserDataContext'
import { CocktailCard } from '../cocktails/CocktailCard'
import type { InventoryStatus } from '../../types/inventory'

const STATUSES: InventoryStatus[] = ['in_stock', 'low', 'out', 'unknown']

export function BottleDetailPage() {
  const { bottleId } = useParams()
  const { userData, setInventoryStatus } = useUserData()
  const bottle = bottleId ? bottleById.get(bottleId) : undefined

  if (!bottle) {
    return (
      <div className="page-header">
        <h1 className="page-header__title">Bottle not found</h1>
        <Link className="btn" to="/bar">
          Back to My Bar
        </Link>
      </div>
    )
  }

  const inv = findInventoryForBottle(bottle.id, userData.inventoryOverrides)
  const matches = cocktailsUsingBottle(
    bottle.id,
    seedInventory,
    userData.inventoryOverrides,
  )

  return (
    <div>
      <p>
        <Link to="/bar" className="recipe-spread__back">
          ← My Bar
        </Link>
      </p>
      <header className="page-header">
        <p className="page-header__eyebrow">{bottle.brand}</p>
        <h1 className="page-header__title">{bottle.productName}</h1>
        <p className="page-header__lede">
          {bottle.notes ??
            `${bottle.category}${bottle.subcategory ? ` · ${bottle.subcategory}` : ''}`}
        </p>
      </header>

      <div
        className="bottle-hero"
        style={{
          width: 'min(12rem, 40%)',
          marginBottom: '1.5rem',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'var(--color-bg-panel)',
        }}
      >
        <img
          src={`/images/bottles/${bottle.id}.svg`}
          alt=""
          width={200}
          height={320}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        <span className="sr-only">
          {bottle.brand} {bottle.productName} bottle illustration
        </span>
      </div>

      {inv && (
        <div className="settings-panel" style={{ marginBottom: '2rem' }}>
          <h2>Inventory status</h2>
          <p>Current: {statusLabel(inv.effectiveStatus)}</p>
          <label className="select-field" style={{ maxWidth: '16rem' }}>
            <span className="sr-only">Update status</span>
            <select
              value={inv.effectiveStatus}
              onChange={(e) =>
                setInventoryStatus(inv.id, e.target.value as InventoryStatus)
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <div className="settings-actions" style={{ marginTop: '1rem' }}>
            <Link className="btn" to={`/make?bottle=${bottle.id}`}>
              Use this bottle
            </Link>
          </div>
        </div>
      )}

      <section>
        <h2 className="section-title">Cocktails that use it</h2>
        {matches.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>
            No Phase recipes require this bottle’s ingredients yet.
          </p>
        ) : (
          <div className="cocktail-grid">
            {matches.map(({ cocktail, readiness }) => (
              <CocktailCard
                key={cocktail.id}
                cocktail={cocktail}
                readiness={readiness}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
