import { bottles, ingredientById } from '../../data'
import type { Cocktail, ReadinessState } from '../../types/cocktail'
import type { InventoryItem, InventoryStatus } from '../../types/inventory'
import type { InventoryOverride } from '../../types/persistence'

export interface IngredientAvailability {
  ingredientId: string
  name: string
  optional: boolean
  available: boolean
  status: InventoryStatus | 'missing'
  confirmFresh: boolean
  matchedBy: string[]
}

export interface ReadinessResult {
  state: ReadinessState
  missingRequired: IngredientAvailability[]
  missingOptional: IngredientAvailability[]
  confirmFresh: IngredientAvailability[]
  missingCount: number
  label: string
}

function isAvailableStatus(status: InventoryStatus): boolean {
  return status === 'in_stock' || status === 'low' || status === 'unknown'
}

function resolveEffectiveItems(
  seed: InventoryItem[],
  overrides: Record<string, InventoryOverride>,
): InventoryItem[] {
  return seed.map((item) => {
    const override = overrides[item.id]
    if (!override) return item
    return { ...item, ...override }
  })
}

function ingredientIdsCoveredByInventory(items: InventoryItem[]): Map<
  string,
  { status: InventoryStatus; sources: string[] }
> {
  const map = new Map<string, { status: InventoryStatus; sources: string[] }>()

  const rank = (s: InventoryStatus) =>
    ({ in_stock: 4, low: 3, unknown: 2, out: 1 })[s]

  const upsert = (
    ingredientId: string,
    status: InventoryStatus,
    source: string,
  ) => {
    const existing = map.get(ingredientId)
    if (!existing) {
      map.set(ingredientId, { status, sources: [source] })
      return
    }
    if (rank(status) > rank(existing.status)) {
      map.set(ingredientId, {
        status,
        sources: [...existing.sources, source],
      })
    } else {
      existing.sources.push(source)
    }
  }

  for (const item of items) {
    if (item.ingredientId) {
      upsert(
        item.ingredientId,
        item.status,
        item.productName ?? item.ingredientId,
      )
    }
    if (item.bottleId) {
      const bottle = bottles.find((b) => b.id === item.bottleId)
      if (bottle) {
        for (const ingredientId of bottle.ingredientIds) {
          upsert(
            ingredientId,
            item.status,
            `${bottle.brand} ${bottle.productName}`,
          )
        }
      }
    }
  }

  return map
}

/** Acceptable soft substitutions for readiness matching */
const SUBSTITUTION_GROUPS: string[][] = [
  ['cointreau', 'triple_sec', 'grand_marnier'],
  ['white_rum', 'gold_rum', 'coconut_rum'],
  ['blanco_tequila', 'cristalino_tequila', 'anejo_tequila'],
  ['bourbon', 'rye'],
]

function expandWithSubstitutions(ingredientId: string): string[] {
  const group = SUBSTITUTION_GROUPS.find((g) => g.includes(ingredientId))
  return group ? [...group] : [ingredientId]
}

export function assessReadiness(
  cocktail: Cocktail,
  seedInventory: InventoryItem[],
  overrides: Record<string, InventoryOverride> = {},
): ReadinessResult {
  const items = resolveEffectiveItems(seedInventory, overrides)
  const coverage = ingredientIdsCoveredByInventory(items)

  const requiredChecks: IngredientAvailability[] = []
  const optionalChecks: IngredientAvailability[] = []
  const confirmFresh: IngredientAvailability[] = []
  const seen = new Set<string>()

  for (const line of cocktail.ingredients) {
    const key = `${line.ingredientId}:${line.optional ? 'opt' : 'req'}`
    if (seen.has(key)) continue
    seen.add(key)

    const candidates = expandWithSubstitutions(line.ingredientId)
    let best: { status: InventoryStatus; sources: string[] } | undefined
    for (const candidate of candidates) {
      const hit = coverage.get(candidate)
      if (!hit) continue
      if (!best || isAvailableStatus(hit.status)) {
        best = hit
        if (isAvailableStatus(hit.status)) break
      }
    }

    const name =
      line.label ??
      ingredientById.get(line.ingredientId)?.name ??
      line.ingredientId

    const status = best?.status ?? 'missing'
    const available = status !== 'missing' && isAvailableStatus(status)
    const meta = ingredientById.get(line.ingredientId)
    const isFresh =
      meta?.category === 'fresh' || meta?.tags.includes('fresh') === true

    const entry: IngredientAvailability = {
      ingredientId: line.ingredientId,
      name,
      optional: Boolean(line.optional),
      available,
      status: status === 'missing' ? 'missing' : status,
      confirmFresh: Boolean(available && isFresh && status === 'unknown'),
      matchedBy: best?.sources ?? [],
    }

    if (entry.confirmFresh) confirmFresh.push(entry)

    if (line.optional) optionalChecks.push(entry)
    else requiredChecks.push(entry)
  }

  const missingRequired = requiredChecks.filter((c) => !c.available)
  const missingOptional = optionalChecks.filter((c) => !c.available)
  const missingCount = missingRequired.length

  let state: ReadinessState
  if (missingCount === 0) state = 'ready'
  else if (missingCount === 1) state = 'almost'
  else if (missingCount === 2) state = 'nearly'
  else state = 'not_ready'

  const labels: Record<ReadinessState, string> = {
    ready: 'Ready to make',
    almost: 'Missing one ingredient',
    nearly: 'Missing two ingredients',
    not_ready: 'Not ready',
  }

  return {
    state,
    missingRequired,
    missingOptional,
    confirmFresh,
    missingCount,
    label: labels[state],
  }
}

export function readinessSortKey(state: ReadinessState): number {
  return { ready: 0, almost: 1, nearly: 2, not_ready: 3 }[state]
}
