'use client'

import { useState } from 'react'
import { BASE_PATH } from '@/lib/constants'
import type { Archetype } from '@/lib/archetypes'
import type { Dimension } from '@/lib/dimensions'

interface DimensionWithScore extends Dimension {
  score: number
}

interface Props {
  archetype: Archetype
  dimensions: DimensionWithScore[]
  quotes: string[]
  shareCode: string
}

export default function ProfileCard({ archetype, dimensions, quotes, shareCode }: Props) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}${BASE_PATH}/types/${archetype.slug}?ref=${shareCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Hero card */}
      <div className={`bg-gradient-to-br ${archetype.color} px-6 py-16 text-white`}>
        <div className="max-w-sm mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-4">
            Your Founder Profile
          </p>
          <span className="text-7xl block mb-6">{archetype.emoji}</span>
          <h1 className="text-3xl font-bold mb-3">{archetype.name}</h1>
          <p className="text-lg opacity-90 font-medium leading-snug">{archetype.tagline}</p>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-6 space-y-10 pt-10">
        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {archetype.description}
        </p>

        {/* Dimension scores */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Your 5 Dimensions
          </h2>
          <div className="space-y-4">
            {dimensions.map((dim) => (
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

        {/* Reflection quotes */}
        {quotes.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              In Your Own Words
            </h2>
            <div className="space-y-4">
              {quotes.map((quote, i) => (
                <blockquote
                  key={i}
                  className="border-l-4 border-indigo-300 dark:border-indigo-600 pl-4 text-slate-600 dark:text-slate-400 italic text-sm leading-relaxed"
                >
                  &ldquo;{quote}&rdquo;
                </blockquote>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="pt-2">
          <button
            onClick={handleShare}
            className="w-full py-4 rounded-2xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold text-base hover:bg-indigo-50 dark:hover:bg-indigo-950/40 active:scale-[0.98] transition-all"
          >
            {copied ? '✓ Link copied!' : 'Share your profile →'}
          </button>
          <p className="text-center text-xs text-slate-400 mt-3">
            Sharing only reveals your archetype — not your dimension scores or reflections.
          </p>
        </div>
      </div>
    </main>
  )
}
