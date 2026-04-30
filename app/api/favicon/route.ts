// app/api/favicon/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'favicons'

/**
 * POST /api/favicon
 * Body: { url: "https://example.com/some-article" }
 * Returns: { favicon_url: "https://xxx.supabase.co/storage/v1/object/public/favicons/example.com.png" }
 *
 * Fetches favicon via Google's service and stores it in Supabase storage.
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Provide a url string' }, { status: 400 })
    }

    let domain: string
    try {
      domain = new URL(url).hostname
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Fetch favicon from Google's service
    const faviconRes = await fetch(
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    )

    if (!faviconRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch favicon: ${faviconRes.status}` },
        { status: 502 }
      )
    }

    const imageBuffer = await faviconRes.arrayBuffer()
    const filename = `${domain}.png`

    // Upload to Supabase storage
    const supabase = createAdminClient()
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, imageBuffer, {
        upsert: true,
        contentType: 'image/png',
      })

    if (uploadError) {
      console.error('Favicon upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename)

    // Re-fetches overwrite the same path, so the URL is identical without
    // a cache-buster — the CDN/browser/Next.js image optimizer keeps the
    // old bytes. Stamp it so each refetch produces a unique URL.
    const versionedUrl = `${publicUrl}?v=${Date.now()}`

    return NextResponse.json({ favicon_url: versionedUrl })
  } catch (error) {
    console.error('Favicon error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Favicon fetch failed' },
      { status: 500 }
    )
  }
}
