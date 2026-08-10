# The Adams Home Bar Illustration Bible

**Version 1.0**  
**Scope:** 322 cocktail illustrations  
**Primary use:** Installable landscape iPad cocktail-book PWA

## 1. Purpose

This document is the visual constitution for every cocktail illustration in The Adams Home Bar. Every asset should look as though it was commissioned from one illustrator for one premium publication.

The source index contains 322 cocktails, each with a stable `illustrationKey`. The generated manifest preserves those keys as output filenames.

## 2. Creative North Star

The collection combines:

- The warmth of an intimate walnut-and-brass cocktail lounge
- The clarity of a premium illustrated reference book
- The restraint of modern editorial design
- The tactile beauty of hand-painted commercial illustration

The result should feel sophisticated, warm, collectible, and timeless.

### Required style

- Semi-realistic luxury editorial digital painting
- Carefully observed glass, ice, liquid, garnish, shadow, and condensation
- Painterly enough to remain cohesive across hundreds of assets
- Realistic enough that the drink is immediately recognizable
- No photorealistic product-advertising look
- No cartoon, flat clip-art, watercolor wash, neon cyberpunk, or generic 3D-render look

## 3. Fixed Global Composition

Every master illustration uses the same visual grammar:

- One drink only
- Centered hero composition
- Three-quarter camera view
- Slightly above table height, approximately 15–20 degrees downward
- Approximately 50 mm visual perspective
- Dark walnut surface
- Deep emerald-to-charcoal matte background
- Restrained, defocused brass accents
- Warm amber key light from upper left
- Soft neutral fill
- Subtle rim light
- Rich but plausible contact shadow
- Generous negative space and crop-safe margins
- No text, labels, brand marks, bottles, hands, people, tools, or unrelated props

The drink is always the hero.

## 4. Master Canvas and Delivery

### Archival master

- 2048 × 2048 pixels
- PNG
- sRGB
- Full background composition
- Highest practical quality
- Filename: `{illustrationKey}.png`

### Runtime image

- 1536 × 1536 WebP
- Quality target: 82–88
- Preserve fine glass edges and garnish texture
- Filename: `{illustrationKey}.webp`

### Thumbnail

- 512 × 512 WebP
- Quality target: 75–82
- Filename: `{illustrationKey}.webp`
- Crop must retain the complete rim and base of the glass

### Optional cutout

- Transparent PNG or WebP
- Use only after a successful background-removal QA pass
- Maintain the original contact shadow separately where needed

## 5. Safe Area

Keep all essential drink geometry within the central 72% of the canvas.

- Glass rim must not enter the outer 12%
- Glass base must remain at least 8% above the lower edge
- Tall garnish must remain at least 10% below the upper edge
- Avoid important detail in the extreme corners
- Never crop stems, rims, handles, garnish tips, or ice

## 6. Glassware Library

Canonical glass IDs:

- `double-old-fashioned`
- `single-old-fashioned`
- `highball`
- `collins`
- `coupe`
- `nick-and-nora`
- `martini`
- `wine`
- `flute`
- `hurricane`
- `copper-mug`
- `tiki-mug`
- `irish-coffee`
- `snifter`
- `glencairn`

Glass rules:

- Geometry must be physically plausible and symmetrical
- Stemware bases must be complete and level
- Refraction should be subtle and consistent
- Rim thickness should remain believable
- Avoid warped stems, doubled rims, melted handles, floating bases, or impossible reflections

## 7. Ice Library

Canonical treatments:

- `none`
- `single-large-cube`
- `two-large-cubes`
- `stacked-clear-cubes`
- `collins-spear`
- `cracked-ice`
- `pebble-ice`
- `crushed-ice`
- `frosted-glass`

Ice rules:

- Ice displacement must match the liquid level
- Clear ice may include subtle internal fissures, never cloudy plastic texture
- Do not create impossible overlapping cubes
- Crushed and pebble ice should read as many discrete pieces
- Sparkling drinks should show restrained, realistic bubbles

## 8. Garnish Library

Canonical garnish vocabulary:

- expressed orange peel
- expressed lemon twist
- expressed grapefruit peel
- lime wheel
- lime wedge
- lemon wheel
- orange half-wheel
- grapefruit half-wheel
- cocktail cherry
- olive
- mint bouquet
- cucumber ribbon
- pineapple wedge
- pineapple fronds
- cinnamon stick
- grated nutmeg
- cocoa dust
- salt rim
- sugar rim
- Tajín rim
- dehydrated citrus wheel

Rules:

- One deliberate garnish treatment unless the recipe explicitly requires more
- Garnish must look fresh, edible, and correctly scaled
- Citrus peel should have plausible thickness and curl
- Mint must not resemble basil or plastic leaves
- Cherries must not float impossibly
- Never add decorative garnish just to fill space

## 9. Family Templates

### `rocks-spirit-forward`

Used for Old Fashioned, Negroni, Boulevardier, and related drinks.

- Double Old Fashioned glass
- One large clear cube by default
- Dense, jewel-like liquid
- Strong reflection and warm rim light
- Expressed citrus peel when recipe appropriate

### `stemmed-spirit-forward`

Used for Martini, Manhattan, and related drinks.

- Martini, coupe, or Nick & Nora according to metadata
- No finished-drink ice
- Crisp, elegant silhouette
- Slightly cooler fill light while retaining the warm global environment
- Minimal garnish

### `sour`

Used for Daiquiris, Gimlets, Margaritas, and classic sours.

- Coupe when served up; rocks glass when specified
- Pale-to-saturated citrus-driven liquid
- Soft opacity where juice is present
- Foam only when the actual recipe calls for egg white or another foaming ingredient
- Bright, fresh garnish

### `highball`

Used for Highballs, Collinses, Rickeys, and many long drinks.

- Tall glass
- Collins spear or stacked clear cubes
- Realistic condensation
- Fine bubbles where carbonated ingredients exist
- Clean vertical composition

### `spritz`

- Large wine glass
- Large clear cubes
- Visible but restrained bubbles
- Luminous liquid
- Citrus garnish
- Airier, brighter treatment than other templates

### `sparkling`

- Flute, coupe, or wine glass according to recipe
- No ice unless specified
- Fine vertical bubble trails
- Elegant highlights
- Never depict overflowing foam

### `smash`

- Rocks or julep-style presentation
- Crushed or pebble ice
- Fresh herbs integrated naturally
- Slightly more abundant garnish, still controlled

### `tropical`

- Hurricane, tiki mug, rocks glass, or other recipe-defined glass
- Pebble or crushed ice
- Richer garnish and brighter palette
- Same background and lighting system; do not turn into a beach scene

### `dessert`

- Creamier palette and softer highlights
- Rocks, coupe, or specialty glass according to recipe
- Cocoa, nutmeg, mint, or cream cues only when present
- Avoid milkshake or ice-cream-sundae exaggeration

## 10. Color System

Color should communicate the drink immediately while staying inside a controlled collection palette.

Core liquid colors:

- Crystal clear: `#DDE2DD`
- Pale citrus: `#D7D39A`
- Warm gold: `#D7A62A`
- Warm amber: `#B06932`
- Mahogany: `#783F28`
- Luminous orange: `#E95B20`
- Grapefruit pink: `#E39B97`
- Ruby garnet: `#7D1827`
- Deep garnet: `#742833`
- Cherry red: `#8B2332`
- Violet berry: `#725184`
- Ivory cream: `#E1D4BD`
- Café cream: `#A88162`

The manifest assigns a starting palette to every drink. Final art may vary slightly to reflect the actual recipe, but the drink must remain within the intended color family.

## 11. Repetition Without Duplication

Related drinks should look intentionally related.

For example:

- All Collins-family illustrations share the tall-glass composition.
- Spirit substitutions alter liquid tone, garnish, and subtle mood—not the camera system.
- All Negroni-family illustrations share jewel-toned lighting and rocks-glass geometry.
- All Martinis share the same elegant negative-space discipline.

Do not reuse the exact same image with recoloring. Each drink should have small, recipe-specific distinctions.

## 12. Brand and Intellectual-Property Rules

- Do not show bottles or packages
- Do not reproduce brand labels
- Do not include logos
- Do not imitate a living illustrator’s exact style
- Use broad editorial-art direction rather than named-artist mimicry

## 13. Master Prompt

```text
Create one premium editorial cocktail illustration for “{name}”.

ART CONSTITUTION — follow exactly:
- Semi-realistic luxury editorial digital painting; tactile and refined, not cartoonish and not photoreal product photography.
- One centered hero drink only. No people, hands, bottles, logos, labels, lettering, captions, borders, or watermarks.
- Three-quarter camera view from slightly above table height, approximately 50 mm visual perspective.
- Dark walnut bar surface; deep emerald-to-charcoal matte backdrop; restrained out-of-focus brass accents.
- Warm amber key light from upper left, soft neutral fill, subtle rim light, rich realistic shadow.
- Consistent negative space around the glass and generous crop-safe margins.
- Accurate glass geometry, believable liquid, physically plausible ice, condensation and bubbles only where appropriate.
- Final image must belong to a cohesive 322-image illustrated cocktail collection.

DRINK-SPECIFIC DIRECTION:
- Cocktail: {name}
- Family: {family}
- Template: {template}
- Glass: {glass}
- Liquid palette: {palette_name} ({palette_hex})
- Ice: {ice}
- Garnish: {garnish}
- Flavor cues: {flavors}
- Key ingredients: {ingredients}

Render the cocktail itself only. Do not show ingredient containers. Do not add decorative fruit or herbs beyond the stated garnish. Do not invent a second garnish. No text.
```

Replace each field using `illustration-manifest.json`.

## 14. Negative Prompt / Exclusion List

Use these exclusions in every generation or QA pass:

```text
text, typography, label, logo, watermark, multiple drinks, duplicate garnish,
extra glass, bottle, can, package, bartender, hand, person, bar tools,
cropped rim, cropped base, malformed stem, warped glass, impossible ice,
floating garnish, plastic fruit, excessive props, beach scene, neon lighting,
harsh flash, blown highlights, muddy shadows, lens distortion, fisheye,
photoreal product photography, cartoon, clip art, generic 3D render
```

## 15. Hero Twenty Calibration Gate

Generate the Hero Twenty before producing the remaining library.

The set should cover:

- Clear and opaque drinks
- Tall and short drinks
- Stemmed and rocks glassware
- Citrus, spirit-forward, sparkling, tropical, creamy, and bitter families
- Pale, amber, orange, pink, red, and cream palettes

Do not begin the full run until the set passes as one coherent collection.

## 16. QA Checklist

Review every image at full size and thumbnail size.

### Accuracy

- Correct glass family
- Correct liquid color
- Correct ice treatment
- Correct garnish
- Correct carbonation
- No foam unless recipe-supported
- No invented ingredients

### Anatomy and physics

- Rim and stem are structurally correct
- Base rests on the surface
- Liquid surface is level
- Ice displacement is plausible
- Garnish has a believable attachment point
- Shadow direction matches lighting
- Reflections are coherent

### Collection consistency

- Camera angle matches the system
- Background matches the system
- Lighting direction matches the system
- Drink scale is consistent with peers
- Safe margins are preserved
- No text or brand marks
- Image remains legible at 512 × 512

### Decision

- `PASS`
- `REGENERATE — accuracy`
- `REGENERATE — anatomy`
- `REGENERATE — style drift`
- `REGENERATE — crop`
- `MANUAL RETOUCH`

## 17. Batch Production Plan

1. Generate Hero Twenty
2. Review as a contact sheet
3. Lock one approved style reference
4. Produce assets family by family
5. Review every batch of 12–20 images
6. Re-run failures before beginning the next family
7. Export masters, runtime WebP files, and thumbnails
8. Validate that all 322 `illustrationKey` values have an asset
9. Run a final duplicate and style-drift review

Recommended family order:

1. Old Fashioned
2. Negroni
3. Manhattan and Martini
4. Sour, Gimlet, Daiquiri, Margarita
5. Highball, Collins, Rickey
6. Spritz and sparkling
7. Smash and Mojito
8. Tropical and Colada
9. Dessert and specialty

## 18. Integration Contract

Runtime file:

```text
/public/images/cocktails/{illustrationKey}.webp
```

Thumbnail file:

```text
/public/images/cocktails/thumbs/{illustrationKey}.webp
```

Fallback behavior:

- Render a styled glass silhouette if an asset is absent
- Preserve the same aspect ratio to avoid layout shift
- Never block recipe rendering while an image loads
- Lazy-load browse-card images
- Eager-load only the opened recipe hero image

## 19. Automated Completeness Check

A build script should:

- Read the cocktail index
- Collect all `illustrationKey` values
- Verify one corresponding runtime image per key
- Report missing, duplicate, and orphaned files
- Fail CI only after the project intentionally switches from placeholder mode to complete-production mode

## 20. Deliverables in This Package

- `ILLUSTRATION_BIBLE.md` — the visual constitution
- `illustration-manifest.json` — art direction and output paths for all 322 cocktails
- `hero-20-prompts.md` — calibration prompts
- `generate-prompt-files.mjs` — creates one prompt text file per cocktail
- `validate-assets.mjs` — checks runtime asset completeness
- `README.md` — implementation instructions
