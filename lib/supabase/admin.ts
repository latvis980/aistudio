// lib/supabase/admin.ts

import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client with secret key.
 * Use ONLY in API routes (server-side), never expose to browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) {
    console.error(
      '[Supabase Admin] Missing env vars — NEXT_PUBLIC_SUPABASE_URL:',
      !!url,
      'SUPABASE_SECRET_KEY:',
      !!key
    )
    throw new Error('Supabase admin environment variables are not configured')
  }
  return createClient(url, key)
}
