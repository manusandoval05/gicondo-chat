// src/routes/+layout.ts
import { invalidate } from '$app/navigation'
import { PUBLIC_LOCAL_SUPABASE_ANON_KEY, PUBLIC_LOCAL_SUPABASE_URL } from '$env/static/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import type { Database } from '../../types/supabase.js'
export const load = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = createSupabaseLoadClient<Database>({
    supabaseUrl: PUBLIC_LOCAL_SUPABASE_URL,
    supabaseKey: PUBLIC_LOCAL_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { supabase, session }
}