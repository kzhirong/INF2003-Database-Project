import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client with service role key
 * This client bypasses Row Level Security and has full access
 * Use only in server-side contexts
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  if (supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY has not been replaced with actual key')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
