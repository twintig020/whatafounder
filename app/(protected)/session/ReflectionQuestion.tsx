import type { Question } from '@/lib/questions'

interface Props {
  question: Question
  value?: string
  onChange: (value: string) => void
}

export default function ReflectionQuestion({ question, value, onChange }: Props) {
  const charCount = value?.length ?? 0
  const MIN_CHARS = 30

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug mb-2">
          {question.text}
        </h3>
        {question.contextText && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{question.contextText}</p>
        )}
      </div>

      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your thoughts here…"
        maxLength={500}
        className="w-full h-44 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all resize-none text-sm"
      />

      <div className="flex justify-between items-center text-xs">
        <span className={charCount < MIN_CHARS ? 'text-amber-500' : 'text-slate-400'}>
          {charCount < MIN_CHARS
            ? `${MIN_CHARS - charCount} more characters needed`
            : 'Looking good'}
        </span>
        <span className="text-slate-400">{charCount} / 500</span>
      </div>
    </div>
  )
}
