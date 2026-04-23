const DEEPL_CODES: Record<string, string> = { ar: 'AR', zh: 'ZH-HANS' }

function getDeepLUrl(apiKey: string) {
  const base = apiKey.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com'
  return `${base}/v2/translate`
}

export async function translateText(text: string, targetLang: 'ar' | 'zh'): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey || !text.trim()) return text
  try {
    const res = await fetch(getDeepLUrl(apiKey), {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: [text],
        source_lang: 'RU',
        target_lang: DEEPL_CODES[targetLang],
        preserve_formatting: true,
      }),
    })
    if (!res.ok) return text
    const data = await res.json() as { translations: { text: string }[] }
    return data.translations[0]?.text ?? text
  } catch {
    return text
  }
}
