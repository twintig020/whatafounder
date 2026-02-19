'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BASE_PATH, MIN_REFLECTION_CHARS } from '@/lib/constants'
import LikertQuestion from '@/app/(protected)/session/LikertQuestion'
import ForcedChoiceQuestion from '@/app/(protected)/session/ForcedChoiceQuestion'
import ReflectionQuestion from '@/app/(protected)/session/ReflectionQuestion'
import type { Question } from '@/lib/questions'

interface Props {
  questions: Question[]
}

type Phase = 'questions' | 'email' | 'check-email'

interface PendingSurvey {
  version: 1
  completedAt: string
  consentDataStorage: boolean
  consentAiProcessing: boolean
  answers: Array<{
    questionId: string
    rawValue: string
    day: 1 | 2 | 3
  }>
}

export default function SurveyFlow({ questions }: Props) {
  const [phase, setPhase] = useState<Phase>('questions')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Consent state (now inline in email step)
  const [dataStorage, setDataStorage] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)

  // Email phase state
  const [email, setEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const router = useRouter()

  // ─── Phase 1: Questions ───────────────────────────────────────────────────

  const currentQuestion = questions[step]
  const isLastQuestion = step === questions.length - 1
  const currentAnswer = answers[currentQuestion?.id ?? ''] ?? ''

  const isAnswerValid = (() => {
    if (!currentAnswer) return false
    if (currentQuestion?.type === 'reflection') {
      return currentAnswer.trim().length >= MIN_REFLECTION_CHARS
    }
    return true
  })()

  function handleAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  function handleNext() {
    if (!isAnswerValid) return
    if (isLastQuestion) {
      setPhase('email')
    } else {
      setStep((s) => s + 1)
    }
  }

  // ─── Phase 2: Email + Inline Consent ──────────────────────────────────────

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !dataStorage) return

    setEmailLoading(true)
    setEmailError(null)

    // Save answers + consent to localStorage before auth
    const pending: PendingSurvey = {
      version: 1,
      completedAt: new Date().toISOString(),
      consentDataStorage: true,
      consentAiProcessing: aiProcessing,
      answers: questions.map((q) => ({
        questionId: q.id,
        rawValue: answers[q.id] ?? '',
        day: q.day,
      })),
    }
    localStorage.setItem('waf_pending_survey', JSON.stringify(pending))

    // If user is already authenticated, submit directly
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      try {
        const res = await fetch(`${BASE_PATH}/api/session/submit-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: pending.answers,
            consentDataStorage: pending.consentDataStorage,
            consentAiProcessing: pending.consentAiProcessing,
          }),
        })
        if (res.ok) {
          localStorage.removeItem('waf_pending_survey')
          router.push('/profile')
        } else {
          const body = await res.json().catch(() => ({}))
          setEmailError(body.error || 'Failed to submit. Please try again.')
          setEmailLoading(false)
        }
      } catch {
        setEmailError('Something went wrong. Please try again.')
        setEmailLoading(false)
      }
      return
    }

    // Not authenticated — send magic link
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}${BASE_PATH}/auth/callback?source=survey`,
      },
    })

    if (otpError) {
      setEmailError(otpError.message)
      setEmailLoading(false)
      return
    }

    setPhase('check-email')
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (phase === 'check-email') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-sm text-center">
          <span className="text-5xl">📬</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3">
            Check your inbox
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            We sent a magic link to <strong className="text-slate-700 dark:text-slate-200">{email}</strong>.
            Click it to save your profile.
          </p>
          <p className="text-xs text-slate-400 mt-4">
            Can&apos;t find it? Check your spam folder.
          </p>
          <button
            onClick={() => setPhase('email')}
            className="mt-8 text-sm text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            ← Use a different email
          </button>
        </div>
      </main>
    )
  }

  if (phase === 'email') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-4xl">🧭</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
              Save your profile
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Enter your email and we&apos;ll send a magic link — no password needed.
            </p>
          </div>

          {/* Inline consent */}
          <div className="space-y-3 mb-6">
            {/* Required consent */}
            <label className={`flex gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
              dataStorage
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={dataStorage}
                  onChange={(e) => setDataStorage(e.target.checked)}
                />
                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                  dataStorage
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {dataStorage && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  Data storage <span className="text-indigo-500 font-normal">(required)</span>
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  I agree that What a Founder stores my answers and generates a profile on my behalf. I can delete my data at any time from Settings.
                </p>
              </div>
            </label>

            {/* Optional consent */}
            <label className={`flex gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
              aiProcessing
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={aiProcessing}
                  onChange={(e) => setAiProcessing(e.target.checked)}
                />
                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                  aiProcessing
                    ? 'bg-violet-600 border-violet-600'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {aiProcessing && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  AI processing <span className="text-slate-400 font-normal">(optional)</span>
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  I allow my anonymised reflection answers to be used to improve the scoring model. No personal data is ever shared.
                </p>
              </div>
            </label>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={emailLoading}
              className="w-full px-4 py-3 rounded-xl text-base outline-none focus:ring-2 focus:ring-indigo-500/30 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
            />
            {emailError && (
              <p className="text-red-500 text-sm">{emailError}</p>
            )}
            <button
              type="submit"
              disabled={emailLoading || !dataStorage}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {emailLoading ? 'Sending magic link…' : 'Save my profile →'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-4">
            Free · No app store required · Delete anytime
          </p>
          <div className="mt-4 text-center">
            <a
              href="/privacy"
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
            >
              Read our Privacy Policy
            </a>
          </div>
        </div>
      </main>
    )
  }

  // Phase: questions
  if (!currentQuestion) return null

  const QuestionComponent =
    currentQuestion.type === 'likert'
      ? LikertQuestion
      : currentQuestion.type === 'forced_choice'
      ? ForcedChoiceQuestion
      : ReflectionQuestion

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-white dark:bg-slate-950">
      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-end mb-6">
          <span className="text-xs text-slate-400">
            {step + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center w-full max-w-sm py-8">
        <QuestionComponent
          question={currentQuestion}
          value={currentAnswer}
          onChange={handleAnswer}
        />
      </div>

      {/* Navigation */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={handleNext}
          disabled={!isAnswerValid}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLastQuestion ? 'Complete →' : 'Next →'}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-full py-3 text-slate-400 text-sm hover:text-slate-600 transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </main>
  )
}
