// app/api/set-lang/route.ts

import { NextResponse } from 'next/server'
import { Lang } from '@/lib/types'

const VALID_LANGS: Lang[] = ['en', 'ru', 'ar', 'zh', 'es']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') as Lang

  // Validate the lang param before trusting it
  if (!lang || !VALID_LANGS.includes(lang)) {
    return NextResponse.json({ error: 'Invalid lang' }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('lang', lang, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return response
}
