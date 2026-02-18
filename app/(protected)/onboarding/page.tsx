import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BASE_PATH } from '@/lib/constants'
import OnboardingFlow from './OnboardingFlow'

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // If already onboarded, skip to consent or today
  const { data: userData } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', user.id)
    .limit(1)

  if (userData?.[0]?.onboarding_completed) {
    redirect(`/today`)
  }

  return <OnboardingFlow />
}
