import { createBrowserClient } from '@supabase/ssr'

// We use untyped client + explicit type assertions in call sites to avoid
// compatibility issues between manually written Database types and supabase-js v2.96 generics.
export function createClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
