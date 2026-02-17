import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BASE_PATH } from '@/lib/constants'
import SessionUI from './SessionUI'
import type { Database } from '@/lib/database.types'

type Question = Database['public']['Tables']['questions']['Row']

export default async function SessionPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`${BASE_PATH}/`)

  // Get user's current day (starting from day 1 if 0)
  const { data: userData } = await supabase
    .from('users')
    .select('current_day, last_session_date, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (!userData?.onboarding_completed) {
    redirect(`${BASE_PATH}/onboarding`)
  }

  const currentDay = Math.max(userData.current_day || 0, 1)

  // If all 3 days done, go to profile
  if (currentDay > 3) {
    redirect(`${BASE_PATH}/profile`)
  }

  // Check if user already submitted today
  const today = new Date().toISOString().slice(0, 10)
  if (userData.last_session_date === today) {
    // Already done today, show "come back tomorrow" screen
    const nextDay = Math.min(currentDay + 1, 3)
    redirect(`${BASE_PATH}/today?completed=true&nextDay=${nextDay}`)
  }

  // Fetch 4 questions for this day
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('day', currentDay)
    .order('order_index', { ascending: true })
    .limit(4)

  if (!questions || questions.length === 0) {
    redirect(`${BASE_PATH}/today?error=no_questions`)
  }

  return <SessionUI userId={user.id} day={currentDay} questions={questions as Question[]} />
}
