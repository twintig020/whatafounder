import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
export default async function TodayPage({
  searchParams,
}: {
  searchParams: { completed?: string; nextDay?: string; error?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: userData } = await supabase
    .from('users')
    .select('current_day, last_session_date, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  // Guard: onboarding not done
  if (!userData?.onboarding_completed) {
    redirect(`/onboarding`)
  }

  // Guard: all 3 days done → profile
  if ((userData?.current_day ?? 0) >= 3) {
    redirect(`/profile`)
  }

  // If completed=true, show "come back tomorrow"
  if (searchParams.completed === 'true') {
    const nextDay = searchParams.nextDay || String((userData?.current_day ?? 0) + 1)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl mb-6">✅</span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Day {userData?.current_day} complete!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs">
          Great work. Come back tomorrow for Day {nextDay}.
        </p>
      </main>
    )
  }

  // If error, show error screen
  if (searchParams.error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl mb-6">⚠️</span>
        <h1 className="text-2xl font-bold text-red-600 mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs">
          {searchParams.error === 'no_questions'
            ? 'Could not load questions for today. Please try again.'
            : 'An error occurred. Please try again.'}
        </p>
      </main>
    )
  }

  // Otherwise, redirect to session (page.tsx will fetch questions)
  redirect(`/session`)
}
