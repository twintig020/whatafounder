import type { Question } from '@/lib/questions'

interface Props {
  question: Question
  value?: string
  onChange: (value: string) => void
}

export default function LikertQuestion({ question, value, onChange }: Props) {
  const scaleMin = question.scaleMin ?? 1
  const scaleMax = question.scaleMax ?? 7
  const scale = Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i)
  const midpoint = Math.ceil((scaleMin + scaleMax) / 2)

  return (
    <div className="w-full space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug mb-2">
          {question.text}
        </h3>
        {question.contextText && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{question.contextText}</p>
        )}
      </div>

      <div className="space-y-2">
        {scale.map((point) => {
          let label = String(point)
          if (point === scaleMin) label = `${point} — Strongly Disagree`
          else if (point === midpoint) label = `${point} — Neutral`
          else if (point === scaleMax) label = `${point} — Strongly Agree`

          return (
            <button
              key={point}
              onClick={() => onChange(String(point))}
              className={`w-full py-3 px-4 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                value === String(point)
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
