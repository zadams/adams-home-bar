import { bottles, cocktails } from '../../data'
import { assessReadiness, readinessSortKey } from '../recommendation/readiness'
import type { Cocktail, ReadinessState } from '../../types/cocktail'
import type { InventoryItem } from '../../types/inventory'
import type { InventoryOverride } from '../../types/persistence'
import type { ReadinessResult } from '../recommendation/readiness'

export interface RankedCocktail {
  cocktail: Cocktail
  readiness: ReadinessResult
  score: number
  reasons: string[]
}

export function cocktailsUsingBottle(
  bottleId: string,
  seedInventory: InventoryItem[],
  overrides: Record<string, InventoryOverride>,
): RankedCocktail[] {
  const bottle = bottles.find((b) => b.id === bottleId)
  if (!bottle) return []

  const ingredientSet = new Set(bottle.ingredientIds)
  return cocktails
    .filter((cocktail) =>
      cocktail.ingredients.some(
        (line) => !line.optional && ingredientSet.has(line.ingredientId),
      ),
    )
    .map((cocktail) => {
      const readiness = assessReadiness(cocktail, seedInventory, overrides)
      const reasons = [
        `Uses ${bottle.brand} ${bottle.productName}`.trim(),
        readiness.label,
      ]
      const preferred = cocktail.recommendedBottles.some(
        (r) => r.bottleId === bottleId,
      )
      if (preferred) reasons.push('Recommended bottle for this recipe')
      return {
        cocktail,
        readiness,
        score:
          (preferred ? 100 : 0) +
          (4 - readinessSortKey(readiness.state)) * 10,
        reasons,
      }
    })
    .sort((a, b) => b.score - a.score || a.cocktail.name.localeCompare(b.cocktail.name))
}

export function selectSurprisePick(
  list: RankedCocktail[],
  options: {
    excludeIds?: Iterable<string>
    random?: () => number
  } = {},
): RankedCocktail | undefined {
  const exclude = new Set(options.excludeIds ?? [])
  const random = options.random ?? Math.random
  const ready = list.filter((item) => item.readiness.state === 'ready')
  const pool = ready.length > 0 ? ready : list
  const unused = pool.filter((item) => !exclude.has(item.cocktail.id))
  const choices = unused.length > 0 ? unused : pool
  if (choices.length === 0) return undefined
  const pick = choices[Math.floor(random() * choices.length)]
  return {
    ...pick,
    reasons: [...pick.reasons, 'Surprise pick from your bar'],
  }
}

export function rankCocktails(options: {
  seedInventory: InventoryItem[]
  overrides: Record<string, InventoryOverride>
  favoriteIds?: Set<string>
  bottleId?: string
  maxMissing?: number
  surprise?: boolean
  excludeIds?: Iterable<string>
}): RankedCocktail[] {
  const {
    seedInventory,
    overrides,
    favoriteIds = new Set(),
    bottleId,
    maxMissing,
    surprise,
    excludeIds,
  } = options

  let list = bottleId
    ? cocktailsUsingBottle(bottleId, seedInventory, overrides)
    : cocktails.map((cocktail) => {
        const readiness = assessReadiness(cocktail, seedInventory, overrides)
        const reasons: string[] = [readiness.label]
        if (favoriteIds.has(cocktail.id)) reasons.push('On your favorites list')
        if (readiness.missingRequired.length > 0) {
          reasons.push(
            `Missing: ${readiness.missingRequired.map((m) => m.name).join(', ')}`,
          )
        }
        if (readiness.confirmFresh.length > 0) {
          reasons.push(
            `Confirm fresh: ${readiness.confirmFresh.map((m) => m.name).join(', ')}`,
          )
        }
        const score =
          (4 - readinessSortKey(readiness.state)) * 20 +
          (favoriteIds.has(cocktail.id) ? 15 : 0) +
          (cocktail.seasonality.includes('year-round') ? 2 : 0)
        return { cocktail, readiness, score, reasons }
      })

  if (typeof maxMissing === 'number') {
    list = list.filter((item) => item.readiness.missingCount <= maxMissing)
  }

  if (surprise) {
    const pick = selectSurprisePick(list, { excludeIds })
    return pick ? [pick] : []
  }

  return list.sort(
    (a, b) => b.score - a.score || a.cocktail.name.localeCompare(b.cocktail.name),
  )
}

export function readinessFilterMatch(
  state: ReadinessState,
  filter: ReadinessState | 'all',
): boolean {
  return filter === 'all' || state === filter
}
