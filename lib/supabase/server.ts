// lib/supabase/server.ts

import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client.
 * Uses the publishable key — safe for read-only public data in SSR.
 * Call this inside server components or route handlers.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    console.error(
      '[Supabase] Missing env vars — NEXT_PUBLIC_SUPABASE_URL:',
      !!url,
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:',
      !!key
    )
    throw new Error('Supabase environment variables are not configured')
  }
  return createClient(url, key)
}
