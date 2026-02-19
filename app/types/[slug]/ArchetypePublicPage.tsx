'use client'

import Link from 'next/link'

import { BASE_PATH } from '@/lib/constants'
import type { Archetype } from '@/lib/archetypes'
import type { Dimension } from '@/lib/dimensions'

interface Props {
  archetype: Archetype
  dimensions: Dimension[]
  refCode?: string
  referrerArchetypeName: string | null
}

export default function ArchetypePublicPage({
  archetype,
  dimensions,
  refCode,
  referrerArchetypeName,
}: Props) {
  const ctaHref = refCode
    ? `${BASE_PATH}/?ref=${refCode}`
    : ``

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${archetype.color} px-6 py-20 text-white`}>
        <div className="max-w-sm mx-auto text-center">
          {referrerArchetypeName && (
            <p className="text-sm font-semibold uppercase tracking-widest opacity-75 mb-6">
              A founder shared their profile
            </p>
          )}
          <span className="text-8xl block mb-6">{archetype.emoji}</span>
          <h1 className="text-4xl font-bold mb-4">{archetype.name}</h1>
          <p className="text-xl opacity-90 font-medium leading-snug">
            {archetype.tagline}
          </p>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-6 space-y-12 pt-12">
        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
          {archetype.description}
        </p>

        {/* What gets measured */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5">
            What the assessment measures
          </h2>
          <div className="space-y-3">
            {dimensions.map((dim) => (
              <div
                key={dim.key}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  archetype.primaryDimensions.includes(dim.key)
                    ? `${dim.borderColor} bg-white dark:bg-slate-900`
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <span className="text-xl">{dim.emoji}</span>
                <div>
                  <p className={`font-semibold text-sm ${
                    archetype.primaryDimensions.includes(dim.key)
                      ? dim.textColor
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {dim.name}
                    {archetype.primaryDimensions.includes(dim.key) && (
                      <span className="ml-1 text-xs font-normal opacity-70">primary</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {dim.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link
            href={ctaHref}
            className="block w-full py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-base text-center hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            Discover your archetype →
          </Link>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            3 days · 4 questions per day · No fluff.
            <br />
            Your profile is generated from how you actually think.
          </p>
        </div>

        {/* Footer nav */}
        <div className="flex justify-center gap-6 text-xs text-slate-400 pt-4">
          <Link href={`/`} className="hover:text-slate-600 transition-colors">
            Home
          </Link>
          <Link href={`/privacy`} className="hover:text-slate-600 transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </main>
  )
}
