import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BASE_PATH } from '@/lib/constants'
import ConsentForm from './ConsentForm'

export default async function ConsentPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // If consent already given, go to today
  const { data: existingConsent } = await supabase
    .from('user_consents')
    .select('data_storage')
    .eq('user_id', user.id)
    .limit(1)

  if (existingConsent?.[0]?.data_storage) {
    redirect(`/today`)
  }

  return <ConsentForm userId={user.id} />
}
