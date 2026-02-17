import type { Question } from '@/lib/questions'

interface Props {
  question: Question
  value?: string
  onChange: (value: string) => void
}

export default function ForcedChoiceQuestion({ question, value, onChange }: Props) {
  const options = [
    { id: 'a', label: question.optionA },
    { id: 'b', label: question.optionB },
  ].filter((o): o is { id: string; label: string } => Boolean(o.label))

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

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`w-full py-4 px-5 rounded-2xl border-2 text-sm font-medium text-left leading-relaxed transition-all ${
              value === option.id
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
