'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BASE_PATH } from '@/lib/constants'

const STEPS = [
  {
    emoji: '🧭',
    title: 'This isn\'t a 5-minute quiz.',
    body: 'Most founder assessments tell you what you want to hear. This one is calibrated to how you actually think, decide, and handle pressure — over 3 short sessions.',
    cta: 'Got it →',
  },
  {
    emoji: '📊',
    title: '5 dimensions. 1 archetype.',
    body: 'We measure Clarity, Resilience, Velocity, Empathy, and Vision across 12 carefully crafted questions. The result is your Founder Profile — not a personality type, a real map.',
    cta: 'Keep going →',
  },
  {
    emoji: '🗓️',
    title: 'Day 3: your Founder Profile.',
    body: '4 questions today. 4 tomorrow. 4 the day after. On Day 3 you\'ll see your archetype, your dimension scores, and reflection quotes pulled from your own words.',
    cta: 'Start Day 1 →',
  },
]

export default function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isLast = step === STEPS.length - 1

  async function handleNext() {
    if (!isLast) {
      setStep((s) => s + 1)
      return
    }

    // Mark onboarding complete
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user.id)
    }

    router.push(`${BASE_PATH}/consent`)
  }

  const current = STEPS[step]

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-white dark:bg-slate-950">
      {/* Progress dots */}
      <div className="flex gap-2 self-center">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step
                ? 'w-6 bg-indigo-600'
                : i < step
                ? 'w-2 bg-indigo-300'
                : 'w-2 bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm w-full gap-6">
        <span className="text-6xl" role="img">{current.emoji}</span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-snug">
          {current.title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
          {current.body}
        </p>
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm">
        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? 'Just a moment…' : current.cta}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-full mt-3 py-3 text-slate-400 text-sm hover:text-slate-600 transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </main>
  )
}
