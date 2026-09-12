import { DrinkBrowser } from '../features/cocktails/DrinkBrowser'

export function ShotsPage() {
  return (
    <DrinkBrowser
      kind="shot"
      eyebrow="Collection"
      title="Shots"
      lede="Bar calls, bombs, layered shots and chasers. Search by name, ingredient, or flavor."
      crossKindLabel="Search cocktails too"
    />
  )
}
