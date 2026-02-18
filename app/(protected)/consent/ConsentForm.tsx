'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
}

export default function ConsentForm({ userId }: Props) {
  const [dataStorage, setDataStorage] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dataStorage) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('user_consents').insert({
      user_id: userId,
      data_storage: dataStorage,
      ai_processing: aiProcessing,
    })

    if (insertError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    router.push('/today')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-4xl">🔒</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
            Before we start
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            We need your permission to store your answers and generate your profile.
            We never sell your data.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!dataStorage || loading}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Saving…' : 'Continue →'}
          </button>

          <p className="text-center text-xs text-slate-400 mt-2">
            The required consent must be checked to continue.
          </p>
        </form>

        <div className="mt-8 text-center">
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
