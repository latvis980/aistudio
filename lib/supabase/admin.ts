import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client with secret key.
 * Use ONLY in API routes (server-side), never expose to browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}
