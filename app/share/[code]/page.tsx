import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ARCHETYPES } from '@/lib/archetypes'
import { DIMENSIONS, DIMENSION_ORDER } from '@/lib/dimensions'
import type { ArchetypeKey } from '@/lib/archetypes'
import type { DimensionKey } from '@/lib/dimensions'
import { APP_NAME, BASE_PATH } from '@/lib/constants'

interface Props {
  params: { code: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('founder_profiles')
    .select('archetype_key, share_code')
    .eq('share_code', params.code)
    .maybeSingle()

  if (!profile) return { title: APP_NAME }

  const archetype = ARCHETYPES[profile.archetype_key as ArchetypeKey]
  const title = `I'm ${archetype.name} ${archetype.emoji} — ${archetype.tagline}`
  const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/og/profile/${params.code}`

  return {
    title,
    description: `${archetype.description} Discover your own founder archetype.`,
    openGraph: {
      title,
      description: archetype.description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: archetype.description,
      images: [ogImageUrl],
    },
  }
}

export default async function SharePage({ params }: Props) {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('founder_profiles')
    .select('archetype_key, dimension_scores, share_code')
    .eq('share_code', params.code)
    .maybeSingle()

  if (!profile) notFound()

  const archetypeKey = profile.archetype_key as ArchetypeKey
  const archetype = ARCHETYPES[archetypeKey]
  const scores = profile.dimension_scores as Record<DimensionKey, number>

  const dimensionData = DIMENSION_ORDER.map((dim) => ({
    ...DIMENSIONS[dim],
    score: scores[dim] ?? 50,
  }))

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${archetype.color} px-6 py-16 text-white`}>
        <div className="max-w-sm mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-4">
            Founder Profile
          </p>
          <span className="text-7xl block mb-6">{archetype.emoji}</span>
          <h1 className="text-3xl font-bold mb-3">{archetype.name}</h1>
          <p className="text-lg opacity-90 font-medium leading-snug">{archetype.tagline}</p>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-6 space-y-10 pt-10 pb-16">
        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {archetype.description}
        </p>

        {/* Dimension scores */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            5 Dimensions
          </h2>
          <div className="space-y-4">
            {dimensionData.map((dim) => (
              <div key={dim.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>{dim.emoji}</span>
                    {dim.name}
                  </span>
                  <span className={`text-sm font-bold ${dim.textColor}`}>{dim.score}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${dim.color} transition-all duration-700`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl p-6 text-center">
          <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
            What&apos;s your founder type?
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
            4 questions a day · 3 days · One honest profile.
          </p>
          <Link
            href={`/?ref=${profile.share_code}`}
            className="inline-block w-full py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all text-center"
          >
            Discover your archetype →
          </Link>
        </div>
      </div>
    </main>
  )
}
