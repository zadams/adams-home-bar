/** Where a recipe's back link should go, carried in router location state. */
export interface BackTo {
  path: string
  label: string
}

/** Location state is untyped and survives reloads, so check its shape. */
export function readBackTo(state: unknown): BackTo | undefined {
  const backTo = (state as { backTo?: unknown } | null)?.backTo as
    | Partial<BackTo>
    | undefined
  if (typeof backTo?.path !== 'string' || typeof backTo.label !== 'string') {
    return undefined
  }
  return { path: backTo.path, label: backTo.label }
}
