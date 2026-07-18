import type { Cocktail, CocktailIngredient, Unit } from '../../types/cocktail'

export interface ScaledIngredient extends CocktailIngredient {
  scaledAmount: number | null
  display: string
}

function formatAmount(amount: number): string {
  if (Number.isInteger(amount)) return String(amount)
  const rounded = Math.round(amount * 100) / 100
  // Prefer common bar fractions
  const fractions: Array<[number, string]> = [
    [0.25, '¼'],
    [0.33, '⅓'],
    [0.5, '½'],
    [0.67, '⅔'],
    [0.75, '¾'],
  ]
  for (const [value, label] of fractions) {
    if (Math.abs(rounded - value) < 0.02) return label
    const whole = Math.floor(rounded)
    const rem = rounded - whole
    if (whole > 0 && Math.abs(rem - value) < 0.02) return `${whole}${label}`
  }
  return String(rounded)
}

function unitLabel(unit: Unit, amount: number | null): string {
  if (amount === null) return ''
  switch (unit) {
    case 'dashes':
      return amount === 1 ? 'dash' : 'dashes'
    case 'dash':
      return amount === 1 ? 'dash' : 'dashes'
    case 'drop':
      return amount === 1 ? 'drop' : 'drops'
    case 'piece':
      return amount === 1 ? 'pc' : 'pcs'
    case 'to_taste':
      return 'to taste'
    case 'rinse':
      return 'rinse'
    case 'top':
      return 'top'
    default:
      return unit
  }
}

export function scaleAmount(
  amount: number | null,
  scaleMode: CocktailIngredient['scaleMode'] = 'linear',
  servings: number,
): number | null {
  if (amount === null) return null
  if (servings <= 0) return amount
  switch (scaleMode) {
    case 'fixed':
    case 'garnish':
    case 'top':
      return amount
    case 'linear':
    default:
      return amount * servings
  }
}

export function formatIngredientDisplay(
  ingredient: CocktailIngredient,
  servings: number,
): string {
  const mode = ingredient.scaleMode ?? 'linear'
  const scaled = scaleAmount(ingredient.amount, mode, servings)

  if (ingredient.unit === 'to_taste' || ingredient.unit === 'rinse') {
    return ingredient.label ?? ingredient.unit.replace('_', ' ')
  }

  if (scaled === null) {
    return ingredient.label ?? 'as needed'
  }

  if (mode === 'top') {
    const base = `${formatAmount(scaled)} ${unitLabel(ingredient.unit, scaled)}`
    return servings > 1 ? `${base} (per drink; top each)` : `${base} to top`
  }

  if (mode === 'garnish') {
    return ingredient.label ?? `${formatAmount(scaled)} ${unitLabel(ingredient.unit, scaled)}`
  }

  return `${formatAmount(scaled)} ${unitLabel(ingredient.unit, scaled)}`
}

export function scaleCocktailIngredients(
  cocktail: Cocktail,
  servings: number,
): ScaledIngredient[] {
  return cocktail.ingredients.map((ingredient) => {
    const mode = ingredient.scaleMode ?? 'linear'
    const scaledAmount = scaleAmount(ingredient.amount, mode, servings)
    return {
      ...ingredient,
      scaledAmount,
      display: formatIngredientDisplay(ingredient, servings),
    }
  })
}
