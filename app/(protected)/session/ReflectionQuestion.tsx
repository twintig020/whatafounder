import type { Database } from '@/lib/database.types'

type Question = Database['public']['Tables']['questions']['Row']

interface Props {
  question: Question
  value?: string
  onChange: (value: string) => void
}

export default function ReflectionQuestion({ question, value, onChange }: Props) {
  return (
    <div className="space-y-4 w-full">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {question.text}
        </h3>
        {question.context_text && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{question.context_text}</p>
        )}
      </div>

      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your thoughts here…"
        className="w-full h-40 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all resize-none"
      />

      <p className="text-xs text-slate-400">
        {value?.length || 0} / 500 characters
      </p>
    </div>
  )
}
