import type { ReadinessState } from '../types/cocktail'

type Palette = { from: string; to: string; accent: string }

const PLACEHOLDER_COLORS: Record<string, Palette> = {
  'old-fashioned': { from: '#3d2a14', to: '#8b5a2b', accent: '#d4a574' },
  manhattan: { from: '#4a1520', to: '#8b2e3c', accent: '#e8a0a8' },
  martini: { from: '#1a2e28', to: '#3d5c54', accent: '#c5d5ce' },
  daiquiri: { from: '#1a3d32', to: '#2d6b5a', accent: '#a8e0d0' },
  margarita: { from: '#1e3d28', to: '#4a7c59', accent: '#c4e0b0' },
  negroni: { from: '#4a1810', to: '#c45c26', accent: '#f0a070' },
  'whiskey-sour': { from: '#3d3018', to: '#c4a35a', accent: '#f5e6b8' },
  'gin-and-tonic': { from: '#1a3038', to: '#4a7a88', accent: '#b8dce8' },
  paloma: { from: '#3d1828', to: '#e88a9a', accent: '#ffd0d8' },
  'tom-collins': { from: '#1a3828', to: '#6b9e7a', accent: '#d0e8d4' },
  southside: { from: '#1a3820', to: '#3d7a4a', accent: '#a8d4b0' },
  sazerac: { from: '#2a2010', to: '#8b6914', accent: '#e8d090' },
}

function hashHue(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h % 360
}

export function getPlaceholderPalette(illustrationKey: string): Palette {
  if (PLACEHOLDER_COLORS[illustrationKey]) return PLACEHOLDER_COLORS[illustrationKey]
  const hue = hashHue(illustrationKey)
  return {
    from: `hsl(${hue} 35% 16%)`,
    to: `hsl(${(hue + 28) % 360} 42% 28%)`,
    accent: `hsl(${(hue + 40) % 360} 48% 68%)`,
  }
}

export function resolveGlassStyle(glassware?: string) {
  const g = (glassware ?? '').toLowerCase()
  if (g.includes('flute') || g.includes('wine')) {
    return {
      bowl: 'M175 70h50l-12 140c-2 20-10 30-18 30s-16-10-18-30L175 70z',
      stem: 'M200 240v70',
      base: 'M165 318h70',
      liquid: 'M182 140h36l-6 55c-1 10-5 15-12 15s-11-5-12-15l-6-55z',
    }
  }
  if (
    g.includes('highball') ||
    g.includes('collins') ||
    g.includes('copa') ||
    g.includes('copper') ||
    g.includes('hurricane') ||
    g.includes('tall')
  ) {
    return {
      bowl: 'M145 80h110v190c0 12-10 22-22 22h-66c-12 0-22-10-22-22V80z',
      stem: '',
      base: '',
      liquid:
        'M155 120h90v130c0 6-5 12-12 12h-66c-7 0-12-6-12-12V120z',
    }
  }
  if (g.includes('julep')) {
    return {
      bowl: 'M140 95h120v165c0 28-25 50-60 50s-60-22-60-50V95z',
      stem: '',
      base: '',
      liquid: 'M155 130h90v110c0 18-16 32-45 32s-45-14-45-32V130z',
    }
  }
  if (g.includes('coupe') || g.includes('martini') || g.includes('nick')) {
    return {
      bowl: 'M120 110h160l-55 85c-8 12-20 20-25 20s-17-8-25-20L120 110z',
      stem: 'M200 215v75',
      base: 'M155 300h90',
      liquid:
        'M150 125h100l-35 55c-5 8-12 12-15 12s-10-4-15-12l-35-55z',
    }
  }
  return {
    bowl: 'M140 95h120v155c0 18-15 32-35 32h-50c-20 0-35-14-35-32V95z',
    stem: '',
    base: '',
    liquid: 'M155 135h90v95c0 10-8 18-20 18h-50c-12 0-20-8-20-18v-95z',
  }
}

export function readinessClass(state: ReadinessState): string {
  return `readiness readiness--${state}`
}
