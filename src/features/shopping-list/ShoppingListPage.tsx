import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { cocktailById, seedInventory } from '../../data'
import {
  groupShoppingList,
  unlockCountForIngredients,
} from '../../services/shopping/shopping-list'
import { useUserData } from '../persistence/UserDataContext'

export function ShoppingListPage() {
  const {
    userData,
    toggleShoppingPurchased,
    removeShoppingItem,
    applyPurchasedToInventory,
    clearPurchasedShopping,
  } = useUserData()

  const active = userData.shoppingList.filter((i) => !i.purchased)
  const purchased = userData.shoppingList.filter((i) => i.purchased)
  const grouped = useMemo(() => groupShoppingList(active), [active])

  const unlockPreview = useMemo(() => {
    return unlockCountForIngredients(
      active.map((i) => i.ingredientId),
      seedInventory,
      userData.inventoryOverrides,
    )
  }, [active, userData.inventoryOverrides])

  return (
    <div>
      <header className="page-header">
        <p className="page-header__eyebrow">Shopping</p>
        <h1 className="page-header__title">Shopping List</h1>
        <p className="page-header__lede">
          Missing ingredients gathered from recipes. Buying everything open would
          unlock about <strong>{unlockPreview}</strong> additional cocktail
          {unlockPreview === 1 ? '' : 's'}.
        </p>
      </header>

      {userData.shoppingList.length === 0 ? (
        <div className="settings-panel">
          <p>
            Your list is empty. Open a recipe that is missing ingredients and tap
            “Add missing to shopping list.”
          </p>
          <Link className="btn" to="/cocktails">
            Browse cocktails
          </Link>
        </div>
      ) : (
        <>
          {[...grouped.entries()].map(([group, items]) => (
            <section key={group} className="inventory-section">
              <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
                {group}
              </h2>
              <ul className="inventory-list">
                {items.map((item) => {
                  const unlock = unlockCountForIngredients(
                    [item.ingredientId],
                    seedInventory,
                    userData.inventoryOverrides,
                  )
                  return (
                    <li key={item.id} className="inventory-row">
                      <label className="inventory-row__main shopping-check">
                        <input
                          type="checkbox"
                          checked={item.purchased}
                          onChange={() => toggleShoppingPurchased(item.id)}
                        />
                        <span>
                          <span className="inventory-row__name">{item.label}</span>
                          <span className="inventory-row__notes">
                            Unlocks ~{unlock} cocktail{unlock === 1 ? '' : 's'}
                            {item.sourceCocktailIds.length > 0 && (
                              <>
                                {' · From '}
                                {item.sourceCocktailIds
                                  .map((id) => cocktailById.get(id)?.name ?? id)
                                  .join(', ')}
                              </>
                            )}
                          </span>
                        </span>
                      </label>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => removeShoppingItem(item.id)}
                      >
                        Remove
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}

          {purchased.length > 0 && (
            <section className="settings-panel">
              <h2>Purchased ({purchased.length})</h2>
              <ul>
                {purchased.map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
              <div className="settings-actions">
                <button
                  type="button"
                  className="btn btn--amber"
                  onClick={() => applyPurchasedToInventory()}
                >
                  Mark purchased as in stock
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => clearPurchasedShopping()}
                >
                  Clear purchased
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
