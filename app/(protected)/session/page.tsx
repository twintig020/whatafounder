import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getQuestionsForDay } from '@/lib/questions'
import SessionUI from './SessionUI'

export default async function SessionPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: userData } = await supabase
    .from('users')
    .select('current_day, last_session_date, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (!userData?.onboarding_completed) {
    redirect(`/onboarding`)
  }

  // next day to complete = completed days + 1
  const day = ((userData?.current_day ?? 0) + 1) as 1 | 2 | 3

  // All 3 days done → profile
  if (day > 3) {
    redirect(`/profile`)
  }

  // Already submitted today → "come back tomorrow"
  const today = new Date().toISOString().slice(0, 10)
  if (userData?.last_session_date === today) {
    redirect(`/today?completed=true&nextDay=${day + 1}`)
  }

  const questions = getQuestionsForDay(day)

  return <SessionUI userId={user.id} day={day} questions={questions} />
}
