import { useState } from 'react'
import { getIngredientName } from '../data'
import ingredientImages from '../data/illustrations/ingredients.json'
import { assetUrl } from '../utils/assetUrl'
import { resolveIllustration } from '../utils/illustrationSystem'
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
  /** Prefer thumbnail path when available (cards) */
  preferThumb?: boolean
}

type IngredientImageEntry = {
  src: string
  name: string
  credit?: string
}

const ingredientRegistry = ingredientImages as Record<string, IngredientImageEntry>

/**
 * Drink art resolver:
 * editorial WebP (Bible system) → stock photo → painterly SVG placeholder.
 * Art direction lives in illustration-manifest.json; completed images are optional.
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
  preferThumb = false,
}: CocktailIllustrationProps) {
  const resolved = resolveIllustration(illustrationKey)
  const [failed, setFailed] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const palette = getPlaceholderPalette(
    illustrationKey,
    resolved.artDirection?.liquidPalette?.hex,
  )
  const style = resolveGlassStyle(
    glassware ?? resolved.artDirection?.sourceGlassware ?? resolved.artDirection?.glass,
  )
  const uid = illustrationKey.replace(/[^a-z0-9-]/gi, '')

  const primarySrc = preferThumb
    ? resolved.thumbSrc ?? resolved.src
    : resolved.src
  const rawSrc =
    useFallback && resolved.fallbackSrc ? resolved.fallbackSrc : primarySrc
  const imageSrc = assetUrl(rawSrc)
  const fallbackSrc = assetUrl(resolved.fallbackSrc)
  const isRaster =
    (resolved.kind === 'illustration' || resolved.kind === 'photo') &&
    !failed &&
    Boolean(imageSrc)

  const showImage = Boolean(imageSrc) && !failed && resolved.kind !== 'placeholder'

  const ingredientItems =
    ingredientIds?.map((id) => ({
      id,
      label: getIngredientName(id),
      src: assetUrl(ingredientRegistry[id]?.src),
    })) ??
    (ingredientLabels ?? []).map((label, index) => ({
      id: `label-${index}`,
      label: label.replace(/_/g, ' '),
      src: '' as string,
    }))

  const frameClass =
    resolved.kind === 'illustration' || resolved.artDirection
      ? 'drink-visual__frame--illustration'
      : resolved.kind === 'photo'
        ? 'drink-visual__frame--photo'
        : ''

  return (
    <figure className={`drink-visual ${className ?? ''}`.trim()}>
      <div className={`drink-visual__frame ${frameClass}`.trim()}>
        {showImage ? (
          <img
            src={imageSrc}
            alt={`${name} — ${resolved.kind === 'illustration' ? 'editorial illustration' : 'finished drink'}`}
            width={640}
            height={resolved.kind === 'photo' ? 480 : 640}
            loading="lazy"
            decoding="async"
            onError={() => {
              if (!useFallback && fallbackSrc && fallbackSrc !== imageSrc) {
                setUseFallback(true)
                return
              }
              setFailed(true)
            }}
            className="drink-visual__img"
            style={{
              aspectRatio:
                useFallback && resolved.fallbackSrc
                  ? '4 / 3'
                  : resolved.aspectRatio,
            }}
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

      {(credit || resolved.credit) && isRaster && (
        <p className="drink-visual__credit">{credit ?? resolved.credit}</p>
      )}
    </figure>
  )
}
