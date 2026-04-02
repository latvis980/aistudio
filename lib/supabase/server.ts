import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client.
 * Uses the publishable key — safe for read-only public data in SSR.
 * Call this inside server components or route handlers.
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  )
}
