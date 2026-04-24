// lib/utils.ts

import { Lang } from './types'

/**
 * Generate a URL-safe slug from a title.
 * "Tatlin Apartments" → "tatlin-apartments"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Merge Tailwind class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format a date string for display.
 * "2024-03-15" → "15 March 2024" (en) or locale-appropriate
 */
export function formatDate(dateStr: string | null, lang: Lang): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const localeMap: Record<Lang, string> = {
      en: 'en-GB',
      ru: 'ru-RU',
      ar: 'ar-SA',
      zh: 'zh-CN',
      es: 'es-ES',
    }
    return date.toLocaleDateString(localeMap[lang], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Get the language from cookies (server-side).
 * Returns 'en' as default if no cookie is set.
 */
export function getLangFromCookies(cookieStore: {
  get: (name: string) => { value: string } | undefined
}): Lang {
  const cookie = cookieStore.get('lang')
  const lang = cookie?.value as Lang
  if (lang && ['en', 'ru', 'ar', 'zh', 'es'].includes(lang)) return lang
  return 'en'
}
