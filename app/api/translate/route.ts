import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

/**
 * POST /api/translate
 * Body: { fields: { title: "...", description: "...", body: "..." } }
 * Returns: { translations: { title: { ru: "...", ar: "...", zh: "...", es: "..." }, ... } }
 */
export async function POST(request: NextRequest) {
  try {
    const { fields } = await request.json()

    if (!fields || typeof fields !== 'object') {
      return NextResponse.json({ error: 'Provide a fields object' }, { status: 400 })
    }

    // Only translate non-empty fields
    const toTranslate = Object.entries(fields as Record<string, string>)
      .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)

    if (toTranslate.length === 0) {
      return NextResponse.json({ translations: {} })
    }

    const fieldList = toTranslate
      .map(([key, value]) => `### ${key}\n${value}`)
      .join('\n\n')

    const prompt = `You are a professional translator for an architectural studio's website. Translate the following content fields from English into Russian (ru), Arabic (ar), Simplified Chinese (zh), and Spanish (es).

Preserve all formatting exactly — line breaks, markdown (bold, italic, headers), and special characters. For architectural and technical terms, use the correct professional terminology in each target language.

Fields to translate:
${fieldList}

Return a single valid JSON object with this exact structure — no markdown, no explanation, just the JSON:
{
  "fieldName1": { "ru": "...", "ar": "...", "zh": "...", "es": "..." },
  "fieldName2": { "ru": "...", "ar": "...", "zh": "...", "es": "..." }
}

Replace fieldName1, fieldName2, etc. with the actual field names from above.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response (handles cases where model adds surrounding text)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON in translation response:', text)
      return NextResponse.json({ error: 'Unexpected response format from translation model' }, { status: 500 })
    }

    const translations = JSON.parse(jsonMatch[0])
    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 }
    )
  }
}
