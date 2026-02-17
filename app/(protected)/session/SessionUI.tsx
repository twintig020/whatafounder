'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BASE_PATH } from '@/lib/constants'
import LikertQuestion from './LikertQuestion'
import ForcedChoiceQuestion from './ForcedChoiceQuestion'
import ReflectionQuestion from './ReflectionQuestion'
import type { Database } from '@/lib/database.types'

type Question = Database['public']['Tables']['questions']['Row']

interface Props {
  userId: string
  day: number
  questions: Question[]
}

export default function SessionUI({ userId, day, questions }: Props) {
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
      const supabase = createClient()

      // Save all answers
      const answerRecords = Object.entries(answers).map(([questionId, rawValue]) => ({
        user_id: userId,
        question_id: questionId,
        day,
        raw_value: rawValue,
      }))

      const { error: insertError } = await supabase
        .from('answers')
        .insert(answerRecords)

      if (insertError) throw insertError

      // Mark day complete and increment current_day
      const { error: updateError } = await supabase
        .from('users')
        .update({
          current_day: day,
          last_session_date: new Date().toISOString().slice(0, 10),
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // If day 3, redirect to profile. Otherwise go to today with completion message.
      if (day === 3) {
        router.push(`${BASE_PATH}/profile`)
      } else {
        router.push(`${BASE_PATH}/today?completed=true&nextDay=${day + 1}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit session')
      setSubmitting(false)
    }
  }

  function handleAnswer(value: string) {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  const QuestionComponent = {
    likert: LikertQuestion,
    forced_choice: ForcedChoiceQuestion,
    reflection: ReflectionQuestion,
  }[currentQuestion.type]

  if (!QuestionComponent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-500">Unknown question type: {currentQuestion.type}</p>
        </div>
      </main>
    )
  }

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
      <div className="flex-1 flex items-center justify-center w-full max-w-sm">
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
          onClick={() => {
            if (isLast) {
              handleSubmit()
            } else {
              setStep((s) => s + 1)
            }
          }}
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
