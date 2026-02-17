import type { Metadata } from 'next'
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants'
import { ARCHETYPE_LIST } from '@/lib/archetypes'
import type { ArchetypeKey } from '@/lib/archetypes'
import { DIMENSION_ORDER, DIMENSIONS } from '@/lib/dimensions'
import LandingEmailForm from '@/components/LandingEmailForm'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
}

interface Props {
  searchParams: { ref?: string; error?: string }
}

export default async function LandingPage({ searchParams }: Props) {
  // Resolve referral banner archetype from share code
  let referralArchetype: (typeof ARCHETYPE_LIST)[number] | null = null

  if (searchParams.ref) {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('founder_profiles')
      .select('archetype_key')
      .eq('share_code', searchParams.ref)
      .maybeSingle()

    if (profile) {
      referralArchetype =
        ARCHETYPE_LIST.find((a) => a.key === (profile.archetype_key as ArchetypeKey)) ?? null
    }
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* ─── Referral banner ──────────────────────────────────────────── */}
      {referralArchetype && (
        <div className={`bg-gradient-to-r ${referralArchetype.color} text-white px-4 py-3 text-center text-sm font-medium`}>
          {referralArchetype.emoji} A {referralArchetype.name} thinks you should take this.
        </div>
      )}

      {/* ─── Auth error ───────────────────────────────────────────────── */}
      {searchParams.error === 'auth' && (
        <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 px-4 py-3 text-center text-sm">
          Authentication failed. Please try again.
        </div>
      )}

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <span className="text-5xl mb-4">🧭</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 max-w-sm">
          Discover your<br />founder archetype
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 max-w-xs">
          4 questions a day. 3 days. One brutally honest profile.
        </p>
        <LandingEmailForm />
        <p className="mt-4 text-xs text-slate-400">
          Free to start · No app store required
        </p>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-white dark:bg-slate-950 max-w-md mx-auto w-full">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-8 text-center">
          How it works
        </h2>
        <ol className="space-y-6">
          {[
            { step: '1', title: 'Day 1–3: 4 questions each day', body: 'Not a quiz. A calibration. Each question is designed to surface how you actually think and act.' },
            { step: '2', title: 'Across 5 founder dimensions', body: 'Clarity · Resilience · Velocity · Empathy · Vision — scored from your real answers.' },
            { step: '3', title: 'Your Founder Profile on Day 3', body: 'An archetype, dimension scores, and reflection quotes from your own words.' },
          ].map(({ step, title, body }) => (
            <li key={step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center">
                {step}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{title}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── 5 Dimensions ─────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 text-center">
            5 founder dimensions
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8">
            Grounded in decision-making, stress, and leadership research.
          </p>
          <div className="space-y-3">
            {DIMENSION_ORDER.map((key) => {
              const d = DIMENSIONS[key]
              return (
                <div key={key} className={`flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700`}>
                  <span className="text-2xl">{d.emoji}</span>
                  <div>
                    <p className={`font-semibold text-sm ${d.textColor}`}>{d.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{d.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Archetypes grid ──────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-white dark:bg-slate-950">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 text-center">
            6 founder archetypes
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8">
            Which one are you?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ARCHETYPE_LIST.map((a) => (
              <div key={a.key} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                <span className="text-3xl">{a.emoji}</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm mt-2">{a.name}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-tight">{a.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────────────── */}
      <section className="px-4 py-16 bg-indigo-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to find out?</h2>
        <p className="text-indigo-200 text-sm mb-8 max-w-xs mx-auto">
          Join founders who&apos;ve mapped their strengths and blind spots.
        </p>
        <LandingEmailForm dark />
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer className="px-4 py-8 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-md mx-auto flex flex-col items-center gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} What a Founder</p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-slate-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
