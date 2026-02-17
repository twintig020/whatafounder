import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BASE_PATH } from '@/lib/constants'

// Server-side auth guard for all (protected) routes.
// Middleware handles the redirect for unauthenticated users,
// but we double-check here for robustness.
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`${BASE_PATH}/`)
  }

  return <>{children}</>
}
