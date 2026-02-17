import type { Database } from '@/lib/database.types'

type Question = Database['public']['Tables']['questions']['Row']

interface Props {
  question: Question
  value?: string
  onChange: (value: string) => void
}

export default function LikertQuestion({ question, value, onChange }: Props) {
  const scaleMin = question.scale_min ?? 1
  const scaleMax = question.scale_max ?? 5
  const scale = Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i)

  return (
    <div className="text-center space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {question.text}
        </h3>
        {question.context_text && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{question.context_text}</p>
        )}
      </div>

      <div className="space-y-3">
        {scale.map((point) => (
          <button
            key={point}
            onClick={() => onChange(String(point))}
            className={`w-full py-3 px-4 rounded-xl border-2 font-medium transition-all ${
              value === String(point)
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {point === scaleMin && 'Strongly Disagree'}
            {point === Math.ceil((scaleMin + scaleMax) / 2) && 'Neutral'}
            {point === scaleMax && 'Strongly Agree'}
            {point !== scaleMin && point !== Math.ceil((scaleMin + scaleMax) / 2) && point !== scaleMax && point}
          </button>
        ))}
      </div>
    </div>
  )
}
