import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BASE_PATH } from '@/lib/constants'

// Full session flow is built in Phase 3.
// This stub routes users based on their current_day state.
export default async function TodayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`${BASE_PATH}/`)

  const { data: userData } = await supabase
    .from('users')
    .select('current_day, last_session_date, onboarding_completed')
    .eq('id', user.id)
    .limit(1)

  const row = userData?.[0]

  // Guard: onboarding not done
  if (!row?.onboarding_completed) {
    redirect(`${BASE_PATH}/onboarding`)
  }

  // Guard: all 3 days done → profile
  if ((row?.current_day ?? 0) >= 3) {
    redirect(`${BASE_PATH}/profile`)
  }

  // Otherwise show the day placeholder (Phase 3 will replace this)
  const nextDay = (row?.current_day ?? 0) + 1
  const today = new Date().toISOString().slice(0, 10)
  const alreadyDoneToday = row?.last_session_date === today

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {alreadyDoneToday ? (
        <>
          <span className="text-5xl mb-6">✅</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Day {row?.current_day} complete!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs">
            Come back tomorrow for Day {(row?.current_day ?? 0) + 1}.
          </p>
        </>
      ) : (
        <>
          <span className="text-5xl mb-6">🗓️</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Day {nextDay}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-8">
            4 questions today. Your session is ready.
          </p>
          <p className="text-xs text-slate-400 italic">
            (Session UI coming in Phase 3)
          </p>
        </>
      )}
    </main>
  )
}
