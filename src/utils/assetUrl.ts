/**
 * Prefix a public asset path with Vite's base (needed on GitHub Pages).
 * Accepts "/images/...", "images/...", or absolute http(s) URLs.
 */
export function assetUrl(path: string | undefined | null): string {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/i.test(path)) return path

  const base = import.meta.env.BASE_URL || '/'
  const normalized = path.replace(/^\/+/, '')
  return `${base}${normalized}`
}
