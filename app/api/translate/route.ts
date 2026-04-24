// app/api/translate/route.ts

import { NextRequest, NextResponse } from 'next/server'

// Auto-detect endpoint: free keys end with ":fx", paid keys don't
function getDeepLUrl(apiKey: string): string {
  const base = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com'
    : 'https://api.deepl.com'
  return `${base}/v2/translate`
}

// Map internal language codes to DeepL codes
const DEEPL_CODES: Record<string, string> = {
  en: 'EN',
  ru: 'RU',
  ar: 'AR',
  zh: 'ZH-HANS',
  es: 'ES',
}

const ALL_LANGS = ['en', 'ru', 'ar', 'zh', 'es'] as const

/**
 * POST /api/translate
 * Body: { fields: { title: "...", description: "...", body: "..." }, source_lang?: "en" }
 * Returns: { translations: { title: { ru: "...", ar: "...", zh: "...", es: "..." }, ... } }
 *
 * source_lang defaults to "en". When a non-English source is used, English
 * is included in the target languages and the source language is excluded.
 *
 * Requires DEEPL_API_KEY env var.
 * Auto-detects free vs paid endpoint based on key format.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'DEEPL_API_KEY is not configured' }, { status: 500 })
  }

  const deeplUrl = getDeepLUrl(apiKey)

  try {
    const { fields, source_lang: srcLang = 'en' } = await request.json()

    if (!fields || typeof fields !== 'object') {
      return NextResponse.json({ error: 'Provide a fields object' }, { status: 400 })
    }

    const sourceLang = (srcLang as string).toLowerCase()
    const sourceDeepL = DEEPL_CODES[sourceLang]
    if (!sourceDeepL) {
      return NextResponse.json({ error: `Unsupported source language: ${srcLang}` }, { status: 400 })
    }

    // Target = all languages except the source
    const targetLangs = ALL_LANGS
      .filter((code) => code !== sourceLang)
      .map((code) => ({ code, deepl: DEEPL_CODES[code] }))

    // Only translate non-empty fields
    const entries = Object.entries(fields as Record<string, string>)
      .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)

    if (entries.length === 0) {
      return NextResponse.json({ translations: {} })
    }

    const fieldKeys = entries.map(([k]) => k)
    const fieldTexts = entries.map(([, v]) => v)

    // Translate to all target languages in parallel (one request per language)
    const results = await Promise.all(
      targetLangs.map(async ({ code, deepl }) => {
        const res = await fetch(deeplUrl, {
          method: 'POST',
          headers: {
            Authorization: `DeepL-Auth-Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: fieldTexts,
            source_lang: sourceDeepL,
            target_lang: deepl,
            preserve_formatting: true,
          }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(`DeepL error for ${deepl}: ${res.status} ${err}`)
        }

        const data = await res.json() as { translations: { text: string }[] }
        return { code, texts: data.translations.map((t) => t.text) }
      })
    )

    // Reshape: { fieldKey: { ru: "...", ar: "...", zh: "...", es: "..." } }
    const translations: Record<string, Record<string, string>> = {}
    for (let i = 0; i < fieldKeys.length; i++) {
      const key = fieldKeys[i]
      translations[key] = {}
      for (const { code, texts } of results) {
        translations[key][code] = texts[i]
      }
    }

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 }
    )
  }
}