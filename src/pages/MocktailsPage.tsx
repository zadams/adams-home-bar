import { DrinkBrowser } from '../features/cocktails/DrinkBrowser'

export function MocktailsPage() {
  return (
    <DrinkBrowser
      kind="mocktail"
      eyebrow="Collection"
      title="Mocktails"
      lede="Zero-proof: nothing alcoholic, not even a dash of bitters. Search by name, ingredient, or flavor."
      crossKindLabel="Search the whole catalog"
    />
  )
}
