import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BASE_PATH } from '@/lib/constants'
import { ARCHETYPES } from '@/lib/archetypes'
import { DIMENSIONS, DIMENSION_ORDER } from '@/lib/dimensions'
import type { DimensionKey } from '@/lib/dimensions'
import type { ArchetypeKey } from '@/lib/archetypes'
import ProfileCard from './ProfileCard'

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`${BASE_PATH}/`)

  const { data: profile } = await supabase
    .from('founder_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // No profile yet — check if they're mid-journey
  if (!profile) {
    const { data: userData } = await supabase
      .from('users')
      .select('current_day')
      .eq('id', user.id)
      .maybeSingle()

    const day = (userData?.current_day ?? 0) + 1
    if (day <= 3) {
      redirect(`${BASE_PATH}/today`)
    }

    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl mb-6">⏳</span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Profile generating…
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs">
          Something went wrong generating your profile. Please contact support.
        </p>
      </main>
    )
  }

  const archetypeKey = profile.archetype_key as ArchetypeKey
  const archetype = ARCHETYPES[archetypeKey]
  const scores = profile.dimension_scores as Record<DimensionKey, number>
  const quotes = profile.reflection_quotes as string[]

  const dimensionData = DIMENSION_ORDER.map((dim) => ({
    ...DIMENSIONS[dim],
    score: scores[dim] ?? 50,
  }))

  return (
    <ProfileCard
      archetype={archetype}
      dimensions={dimensionData}
      quotes={quotes}
      shareCode={profile.share_code}
    />
  )
}
