export interface LiquidPalette {
  name: string
  hex: string
}

export interface IllustrationOutputPaths {
  master: string
  runtime: string
  thumbnail: string
}

export interface CocktailArtDirection {
  template: string
  glass: string
  sourceGlassware: string
  ice: string
  garnish: string
  liquidPalette: LiquidPalette
  composition: string
  background: string
  lighting: string
  output: IllustrationOutputPaths
}

export interface IllustrationManifestEntry {
  id: string
  slug: string
  name: string
  illustrationKey: string
  cocktailFamily: string
  classifications: string[]
  flavorProfiles: string[]
  ingredientIds: string[]
  artDirection: CocktailArtDirection
}

export interface IllustrationManifest {
  schemaVersion: number
  generatedFrom: string
  cocktailCount: number
  cocktails: IllustrationManifestEntry[]
}

export type IllustrationKind = 'illustration' | 'photo' | 'placeholder'

export interface ResolvedIllustration {
  kind: IllustrationKind
  src?: string
  thumbSrc?: string
  fallbackSrc?: string
  aspectRatio: string
  credit?: string
  artDirection?: CocktailArtDirection
  pending?: boolean
}
