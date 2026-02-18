'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BASE_PATH, PRICES } from '@/lib/constants'
import type { Archetype } from '@/lib/archetypes'
import type { Dimension } from '@/lib/dimensions'
import type { ExtendedReport } from '@/lib/templates'

interface DimensionWithScore extends Dimension {
  score: number
}

interface Props {
  archetype: Archetype
  dimensions: DimensionWithScore[]
  quotes: string[]
  shareCode: string
  hasPurchased: boolean
  justPurchased: boolean
  extendedReport: ExtendedReport | null
  discountPrice?: number
  discountToken?: string
}

export default function ProfileCard({
  archetype,
  dimensions,
  quotes,
  shareCode,
  hasPurchased,
  justPurchased,
  extendedReport,
  discountPrice,
  discountToken,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(justPurchased)

  useEffect(() => {
    if (justPurchased) {
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [justPurchased])

  function handleShare() {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}${BASE_PATH}/types/${archetype.slug}?ref=${shareCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handlePurchase() {
    setPurchasing(true)
    const body: { discountToken?: string } = {}
    if (discountToken) body.discountToken = discountToken

    const res = await fetch(`${BASE_PATH}/api/revolut/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const { checkout_url } = (await res.json()) as { checkout_url: string }
      window.location.href = checkout_url
    } else {
      setPurchasing(false)
    }
  }

  const price = discountPrice ?? PRICES.full

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 relative">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center max-w-xs mx-4 shadow-2xl">
            <span className="text-6xl block mb-4">🎉</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Extended Report unlocked!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Your full profile is now revealed below.
            </p>
          </div>
        </div>
      )}

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

        {/* Extended Report — unlocked */}
        {hasPurchased && extendedReport ? (
          <div className="space-y-8">
            {extendedReport.strengths.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Your Strengths
                </h2>
                <div className="space-y-3">
                  {extendedReport.strengths.map((s, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/40"
                    >
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extendedReport.growthZones.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Growth Zones
                </h2>
                <div className="space-y-3">
                  {extendedReport.growthZones.map((g, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40"
                    >
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{g}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                Co-founder Match
              </h2>
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {extendedReport.cofounderMatch}
                </p>
              </div>
            </div>

            {extendedReport.warnings.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Watch Out For
                </h2>
                <div className="space-y-3">
                  {extendedReport.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40"
                    >
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Locked extended report teaser */
          <div className="relative">
            <div className="select-none pointer-events-none" aria-hidden>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                Extended Report
              </h2>
              <div className="space-y-3 blur-sm opacity-50">
                {['Your Strengths', 'Growth Zones', 'Co-founder Match', 'Watch Out For'].map(
                  (label) => (
                    <div
                      key={label}
                      className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 space-y-2"
                    >
                      <p className="text-xs font-semibold text-slate-400 uppercase">{label}</p>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50 dark:via-slate-950/80 dark:to-slate-950 rounded-2xl">
              <div className="text-center px-6 py-8">
                <span className="text-3xl block mb-3">🔒</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                  Unlock Extended Report
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs">
                  Strengths, growth zones, co-founder match, and blind-spot warnings — based on
                  your actual answers.
                </p>
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
                >
                  {purchasing
                    ? 'Loading…'
                    : discountPrice
                      ? `Unlock — ${PRICES.currencySymbol}${discountPrice} (50% off)`
                      : `Unlock — ${PRICES.currencySymbol}${price}`}
                </button>
                {discountPrice && (
                  <p className="text-xs text-indigo-400 mt-2">Limited-time discount applied</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Share + Settings */}
        <div className="pt-2 space-y-3">
          <button
            onClick={handleShare}
            className="w-full py-4 rounded-2xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold text-base hover:bg-indigo-50 dark:hover:bg-indigo-950/40 active:scale-[0.98] transition-all"
          >
            {copied ? '✓ Link copied!' : 'Share your profile →'}
          </button>
          <p className="text-center text-xs text-slate-400">
            Sharing only reveals your archetype — not your dimension scores or reflections.
          </p>
          <div className="flex justify-center pt-1">
            <Link
              href={`/settings`}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
