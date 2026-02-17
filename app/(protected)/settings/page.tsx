import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BASE_PATH } from '@/lib/constants'
import SettingsForm from './SettingsForm'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`${BASE_PATH}/`)

  const admin = createAdminClient()

  const [{ data: userData }, { data: consentData }] = await Promise.all([
    admin.from('users').select('has_purchased, push_subscription').eq('id', user.id).maybeSingle(),
    admin.from('user_consents').select('ai_processing').eq('user_id', user.id).maybeSingle(),
  ])

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-sm mx-auto px-4 pt-10 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`${BASE_PATH}/profile`}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            ←
          </Link>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Settings</h1>
        </div>

        <SettingsForm
          email={user.email ?? ''}
          aiProcessing={consentData?.ai_processing ?? false}
          hasPushSubscription={!!userData?.push_subscription}
          hasPurchased={userData?.has_purchased ?? false}
        />
      </div>
    </main>
  )
}
