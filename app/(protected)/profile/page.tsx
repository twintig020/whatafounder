import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BASE_PATH, PRICES } from '@/lib/constants'
import { ARCHETYPES } from '@/lib/archetypes'
import { DIMENSIONS, DIMENSION_ORDER } from '@/lib/dimensions'
import type { DimensionKey } from '@/lib/dimensions'
import type { ArchetypeKey } from '@/lib/archetypes'
import type { ExtendedReport } from '@/lib/templates'
import ProfileCard from './ProfileCard'

interface Props {
  searchParams: { purchased?: string; offer?: string; token?: string }
}

export default async function ProfilePage({ searchParams }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const admin = createAdminClient()

  const [{ data: profile }, { data: userData }] = await Promise.all([
    admin.from('founder_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    admin
      .from('users')
      .select('current_day, has_purchased, discount_token, discount_token_expires_at')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  // No profile yet — check if they're mid-journey
  if (!profile) {
    const day = (userData?.current_day ?? 0) + 1
    if (day <= 3) {
      redirect(`/today`)
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

  // Purchase state — ?purchased=true is set after mock checkout redirect
  const justPurchased = searchParams.purchased === 'true'
  const hasPurchased = (userData?.has_purchased ?? false) || justPurchased

  // Validate discount token from Day 4 email link
  let discountPrice: number | undefined
  if (searchParams.offer === 'discount' && searchParams.token) {
    const tokenMatches = userData?.discount_token === searchParams.token
    const notExpired =
      userData?.discount_token_expires_at &&
      new Date(userData.discount_token_expires_at) > new Date()
    if (tokenMatches && notExpired) {
      discountPrice = PRICES.discounted
    }
  }

  const archetypeKey = profile.archetype_key as ArchetypeKey
  const archetype = ARCHETYPES[archetypeKey]
  const scores = profile.dimension_scores as Record<DimensionKey, number>
  const quotes = profile.reflection_quotes as string[]
  const extendedReport = profile.extended_report as ExtendedReport | null

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
      hasPurchased={hasPurchased}
      justPurchased={justPurchased}
      extendedReport={extendedReport}
      discountPrice={discountPrice}
      discountToken={searchParams.token}
    />
  )
}
