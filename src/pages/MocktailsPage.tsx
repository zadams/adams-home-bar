import { DrinkBrowser } from '../features/cocktails/DrinkBrowser'

export function MocktailsPage() {
  return (
    <DrinkBrowser
      kind="mocktail"
      eyebrow="Collection"
      title="Mocktails"
      lede="No spirits, liqueurs or wine. A few take dashes of bitters, marked “contains bitters”. Search by name, ingredient, or flavor."
      crossKindLabel="Search the whole catalog"
    />
  )
}
