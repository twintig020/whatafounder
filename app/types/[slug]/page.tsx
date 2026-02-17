import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ARCHETYPE_LIST } from '@/lib/archetypes'
import { DIMENSIONS, DIMENSION_ORDER } from '@/lib/dimensions'
import type { DimensionKey } from '@/lib/dimensions'
import { APP_NAME, BASE_PATH } from '@/lib/constants'
import { createAdminClient } from '@/lib/supabase/admin'
import ArchetypePublicPage from './ArchetypePublicPage'

interface Props {
  params: { slug: string }
  searchParams: { ref?: string }
}

export async function generateStaticParams() {
  return ARCHETYPE_LIST.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const archetype = ARCHETYPE_LIST.find((a) => a.slug === params.slug)
  if (!archetype) return {}

  return {
    title: `${archetype.name} — ${APP_NAME}`,
    description: archetype.tagline,
    openGraph: {
      title: `I'm ${archetype.name} ${archetype.emoji}`,
      description: `"${archetype.tagline}" — Discover your founder archetype in 3 days.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `I'm ${archetype.name} ${archetype.emoji}`,
      description: `"${archetype.tagline}" — Discover your founder archetype.`,
    },
  }
}

export default async function ArchetypeSlugPage({ params, searchParams }: Props) {
  const archetype = ARCHETYPE_LIST.find((a) => a.slug === params.slug)
  if (!archetype) notFound()

  // Track referral click if ref query param present
  let referrerArchetypeName: string | null = null

  if (searchParams.ref) {
    const admin = createAdminClient()

    const { data: profile } = await admin
      .from('founder_profiles')
      .select('user_id, archetype_key')
      .eq('share_code', searchParams.ref)
      .maybeSingle()

    if (profile) {
      referrerArchetypeName = archetype.name // same archetype shown (visitor sees their own)

      // Record click (ignore errors — best-effort telemetry)
      await admin.from('referrals').insert({
        referrer_user_id: profile.user_id,
        referral_code: searchParams.ref,
        clicked_at: new Date().toISOString(),
      }).select().maybeSingle()
    }
  }

  const dimensionData = DIMENSION_ORDER.map((dim: DimensionKey) => DIMENSIONS[dim])

  return (
    <ArchetypePublicPage
      archetype={archetype}
      dimensions={dimensionData}
      refCode={searchParams.ref}
      referrerArchetypeName={referrerArchetypeName}
    />
  )
}
