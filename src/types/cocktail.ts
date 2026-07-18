export type ScaleMode = 'linear' | 'fixed' | 'garnish' | 'top'
export type Unit =
  | 'oz'
  | 'ml'
  | 'dash'
  | 'dashes'
  | 'drop'
  | 'tsp'
  | 'tbsp'
  | 'cup'
  | 'piece'
  | 'splash'
  | 'rinse'
  | 'to_taste'
  | 'top'

export type Difficulty = 'easy' | 'medium' | 'advanced'
export type Strength = 'light' | 'medium' | 'strong' | 'spirit-forward'
export type ReadinessState = 'ready' | 'almost' | 'nearly' | 'not_ready'

export interface CocktailIngredient {
  ingredientId: string
  amount: number | null
  unit: Unit
  label?: string
  optional?: boolean
  scaleMode?: ScaleMode
  notes?: string
}

export interface RecommendedBottle {
  bottleId: string
  rank: number
  rationale: string
}

export interface Substitution {
  ingredientId: string
  alternatives: string[]
  notes?: string
}

export interface Variation {
  id: string
  name: string
  notes: string
  relatedCocktailId?: string
}

export interface Cocktail {
  id: string
  slug: string
  name: string
  aliases: string[]
  description: string
  history?: string
  origin?: string
  year?: number
  creator?: string
  whyItWorks?: string
  classifications: string[]
  cocktailFamily: string
  flavorProfiles: string[]
  difficulty: Difficulty
  preparationTime: number
  strength: Strength
  glassware: string
  ice: string
  garnish: string[]
  illustrationKey: string
  featuredBottleImages?: string[]
  ingredients: CocktailIngredient[]
  steps: string[]
  techniqueNotes: string[]
  recommendedBottles: RecommendedBottle[]
  substitutions: Substitution[]
  variations: Variation[]
  relatedCocktailIds: string[]
  seasonality: string[]
  tags: string[]
}
