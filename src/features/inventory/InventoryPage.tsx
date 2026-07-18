import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { bottles } from '../../data'
import {
  getInventoryItemLabel,
  inventoryByCategory,
  statusLabel,
} from '../../services/inventory/effective'
import { useUserData } from '../persistence/UserDataContext'
import type { EffectiveInventoryItem } from '../../types/persistence'
import type { InventoryStatus } from '../../types/inventory'

const STATUSES: InventoryStatus[] = ['in_stock', 'low', 'out', 'unknown']

export function InventoryPage() {
  const { userData, setInventoryStatus } = useUserData()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | InventoryStatus>('all')

  const grouped = useMemo(() => {
    const map = inventoryByCategory(userData.inventoryOverrides)
    const q = query.trim().toLowerCase()
    const filtered = new Map<string, EffectiveInventoryItem[]>()

    for (const [category, items] of map) {
      const next = items.filter((item) => {
        if (statusFilter !== 'all' && item.effectiveStatus !== statusFilter) {
          return false
        }
        if (!q) return true
        const label = getInventoryItemLabel(item).toLowerCase()
        const bottle = item.bottleId
          ? bottles.find((b) => b.id === item.bottleId)
          : undefined
        const hay = [
          label,
          item.notes ?? '',
          ...(bottle?.tags ?? []),
          ...(item.tags ?? []),
        ]
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
      if (next.length) filtered.set(category, next)
    }
    return filtered
  }, [userData.inventoryOverrides, query, statusFilter])

  const total = [...grouped.values()].reduce((n, items) => n + items.length, 0)

  return (
    <div>
      <header className="page-header">
        <p className="page-header__eyebrow">Inventory</p>
        <h1 className="page-header__title">My Bar</h1>
        <p className="page-header__lede">
          Update what you have on the shelf. Fresh items default to unknown —
          confirm them when you are ready to mix.
        </p>
      </header>

      <div className="toolbar">
        <label className="search-field">
          <span className="sr-only">Search inventory</span>
          <input
            type="search"
            placeholder="Search bottles and ingredients…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="select-field">
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | InventoryStatus)
            }
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        Showing {total} items
      </p>

      {[...grouped.entries()].map(([category, items]) => (
        <section key={category} className="inventory-section">
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
            {category}
          </h2>
          <ul className="inventory-list">
            {items.map((item) => {
              const bottle = item.bottleId
                ? bottles.find((b) => b.id === item.bottleId)
                : undefined
              return (
                <li key={item.id} className="inventory-row">
                  <div className="inventory-row__main">
                    {bottle ? (
                      <Link
                        to={`/bar/${bottle.id}`}
                        className="inventory-row__name"
                      >
                        {getInventoryItemLabel(item)}
                      </Link>
                    ) : (
                      <span className="inventory-row__name">
                        {getInventoryItemLabel(item)}
                      </span>
                    )}
                    {item.notes && (
                      <p className="inventory-row__notes">{item.notes}</p>
                    )}
                  </div>
                  <label className="inventory-row__status">
                    <span className="sr-only">
                      Status for {getInventoryItemLabel(item)}
                    </span>
                    <select
                      value={item.effectiveStatus}
                      onChange={(e) =>
                        setInventoryStatus(
                          item.id,
                          e.target.value as InventoryStatus,
                        )
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
