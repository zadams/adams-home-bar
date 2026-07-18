import { useState } from 'react'
import registry from '../data/illustrations/registry.json'
import ingredientImages from '../data/illustrations/ingredients.json'
import { getIngredientName } from '../data'
import { getPlaceholderPalette, resolveGlassStyle } from '../utils/illustrations'

interface CocktailIllustrationProps {
  illustrationKey: string
  name: string
  glassware?: string
  /** Ingredient IDs for photo strip (preferred) */
  ingredientIds?: string[]
  /** Fallback text labels when IDs unavailable */
  ingredientLabels?: string[]
  className?: string
  showIngredients?: boolean
  credit?: string
}

type RegistryEntry = {
  src: string
  kind?: 'photo' | 'illustration'
  glassware?: string
  aspectRatio?: string
  credit?: string
  ingredients?: string[]
  fallbackSrc?: string
}

type IngredientImageEntry = {
  src: string
  name: string
  credit?: string
}

const illustrationRegistry = registry as Record<string, RegistryEntry>
const ingredientRegistry = ingredientImages as Record<string, IngredientImageEntry>

/**
 * Photo-first drink art with optional ingredient photo strip.
 * Swap files under public/images/cocktails/photos/ and
 * public/images/ingredients/photos/ — registries pick them up.
 */
export function CocktailIllustration({
  illustrationKey,
  name,
  glassware,
  ingredientIds,
  ingredientLabels,
  className,
  showIngredients = false,
  credit,
}: CocktailIllustrationProps) {
  const entry = illustrationRegistry[illustrationKey]
  const [failed, setFailed] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const palette = getPlaceholderPalette(illustrationKey)
  const style = resolveGlassStyle(glassware ?? entry?.glassware)
  const uid = illustrationKey.replace(/[^a-z0-9-]/gi, '')
  const imageSrc =
    useFallback && entry?.fallbackSrc ? entry.fallbackSrc : entry?.src
  const isPhoto = entry?.kind === 'photo' && !failed && Boolean(imageSrc)

  const ingredientItems =
    ingredientIds?.map((id) => ({
      id,
      label: getIngredientName(id),
      src: ingredientRegistry[id]?.src,
    })) ??
    (ingredientLabels ?? entry?.ingredients ?? []).map((label, index) => ({
      id: `label-${index}`,
      label: label.replace(/_/g, ' '),
      src: undefined as string | undefined,
    }))

  return (
    <figure className={`drink-visual ${className ?? ''}`.trim()}>
      <div className={`drink-visual__frame ${isPhoto ? 'drink-visual__frame--photo' : ''}`}>
        {imageSrc && !failed ? (
          <img
            src={imageSrc}
            alt={`${name} — finished drink`}
            width={640}
            height={480}
            loading="lazy"
            decoding="async"
            onError={() => {
              if (!useFallback && entry?.fallbackSrc && entry.fallbackSrc !== imageSrc) {
                setUseFallback(true)
                return
              }
              setFailed(true)
            }}
            className="drink-visual__img"
            style={{ aspectRatio: entry?.aspectRatio ?? (isPhoto ? '4 / 3' : '1 / 1') }}
          />
        ) : (
          <div
            className="drink-visual__fallback"
            role="img"
            aria-label={`${name} illustration`}
          >
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={palette.from} />
                  <stop offset="100%" stopColor={palette.to} />
                </linearGradient>
                <linearGradient id={`liq-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={palette.accent} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={palette.to} stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <rect width="400" height="400" fill={`url(#bg-${uid})`} />
              <path d={style.liquid} fill={`url(#liq-${uid})`} />
              <g fill="none" stroke={palette.accent} strokeWidth="3">
                <path d={style.bowl} />
                {style.stem ? <path d={style.stem} /> : null}
                {style.base ? <path d={style.base} /> : null}
              </g>
            </svg>
          </div>
        )}
      </div>

      {showIngredients && ingredientItems.length > 0 && (
        <figcaption className="drink-visual__ingredients">
          <span className="drink-visual__ingredients-label">In the glass</span>
          <ul>
            {ingredientItems.map((item) => (
              <li key={item.id} className={item.src ? 'has-photo' : undefined}>
                {item.src ? (
                  <img
                    src={item.src}
                    alt=""
                    width={72}
                    height={72}
                    loading="lazy"
                    decoding="async"
                    className="drink-visual__ingredient-img"
                  />
                ) : null}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </figcaption>
      )}

      {(credit || entry?.credit) && (
        <p className="drink-visual__credit">{credit ?? entry?.credit}</p>
      )}
    </figure>
  )
}
