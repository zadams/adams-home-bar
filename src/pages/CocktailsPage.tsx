import { DrinkBrowser } from '../features/cocktails/DrinkBrowser'

export function CocktailsPage() {
  return (
    <DrinkBrowser
      kind="cocktail"
      eyebrow="Collection"
      title="Cocktails"
      lede="Search by name, ingredient, flavor, or family."
      crossKindLabel="Search shots too"
    />
  )
}
