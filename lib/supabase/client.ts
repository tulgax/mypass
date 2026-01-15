import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

export function createClient() {
  // NOTE: Similar to server client, Supabase generic inference can sometimes
  // resolve to `never` in build/typecheck. Cast to unblock compilation.
  return (createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as any)
}
