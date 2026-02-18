'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BASE_PATH } from '@/lib/constants'
import Link from 'next/link'

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

type State =
  | { status: 'loading' }
  | { status: 'no-session' }
  | { status: 'no-answers' }
  | { status: 'error'; message: string }

const STORAGE_KEY = 'waf_pending_survey'
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export default function AfterAuthPage() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function run() {
      setState({ status: 'loading' })

      // Step 1: confirm authenticated session
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return

      if (!session) {
        setState({ status: 'no-session' })
        return
      }

      // Step 2: read localStorage
      let pending: PendingSurvey | null = null
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as PendingSurvey
          if (
            parsed.version === 1 &&
            Date.now() - new Date(parsed.completedAt).getTime() < MAX_AGE_MS
          ) {
            pending = parsed
          }
        }
      } catch {
        // malformed JSON — treat as missing
      }

      if (!pending) {
        setState({ status: 'no-answers' })
        return
      }

      // Step 3: submit all answers
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

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setState({ status: 'error', message: body.error || `Server error (${res.status})` })
          return
        }

        // Step 4: clean up and redirect
        localStorage.removeItem(STORAGE_KEY)
        router.push('/profile')
      } catch (err) {
        if (cancelled) return
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Network error. Please try again.',
        })
      }
    }

    run()

    return () => { cancelled = true }
  }, [retryCount, router])

  if (state.status === 'loading') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-slate-600 dark:text-slate-400 text-base font-medium">
            Saving your results…
          </p>
        </div>
      </main>
    )
  }

  if (state.status === 'no-session') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-sm text-center">
          <span className="text-4xl">⏱️</span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
            Session expired
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Your magic link may have expired. Please take the survey again — it only takes a few minutes.
          </p>
          <Link
            href="/survey"
            className="inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            Retake the survey →
          </Link>
        </div>
      </main>
    )
  }

  if (state.status === 'no-answers') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-sm text-center">
          <span className="text-4xl">🔍</span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
            We couldn&apos;t find your answers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            This can happen if you clicked the link in a different browser. Please retake the survey — your account is ready.
          </p>
          <Link
            href="/survey"
            className="inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            Retake the survey →
          </Link>
        </div>
      </main>
    )
  }

  // status === 'error'
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
      <div className="w-full max-w-sm text-center">
        <span className="text-4xl">⚠️</span>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
          {state.message}
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Your answers are still saved — tap retry to try again.
        </p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </main>
  )
}
