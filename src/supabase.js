import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gbgvkxkkawwadbudbfez.supabase.co'
const supabaseKey = 'sb_publishable__zKSEYx8uTpBbNLBLwZzGA_b_kjl0p9'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'ilda_central_auth_v1',
    flowType: 'pkce'
  }
})