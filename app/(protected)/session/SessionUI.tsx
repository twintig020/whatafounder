'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BASE_PATH } from '@/lib/constants'
import LikertQuestion from './LikertQuestion'
import ForcedChoiceQuestion from './ForcedChoiceQuestion'
import ReflectionQuestion from './ReflectionQuestion'
import type { Question } from '@/lib/questions'

interface Props {
  userId: string
  day: 1 | 2 | 3
  questions: Question[]
}

export default function SessionUI({ day, questions }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const currentQuestion = questions[step]
  const isLast = step === questions.length - 1
  const answered = answers[currentQuestion.id] !== undefined

  async function handleSubmit() {
    if (!isLast || !answered) return

    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        day,
        answers: Object.entries(answers).map(([questionId, rawValue]) => ({
          questionId,
          rawValue,
        })),
      }

      const res = await fetch(`${BASE_PATH}/api/session/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Submit failed (${res.status})`)
      }

      const { redirect: redirectPath } = await res.json()
      router.push(redirectPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit session')
      setSubmitting(false)
    }
  }

  function handleAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Day {day}
          </h2>
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
          value={answers[currentQuestion.id]}
          onChange={handleAnswer}
        />
      </div>

      {/* Navigation */}
      <div className="w-full max-w-sm space-y-3">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={() => (isLast ? handleSubmit() : setStep((s) => s + 1))}
          disabled={!answered || submitting}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : isLast ? 'Complete Day' : 'Next →'}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={submitting}
            className="w-full py-3 text-slate-400 text-sm hover:text-slate-600 transition-colors disabled:opacity-40"
          >
            ← Back
          </button>
        )}
      </div>
    </main>
  )
}
