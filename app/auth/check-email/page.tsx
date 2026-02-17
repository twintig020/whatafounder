import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check your email',
}

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <span className="text-5xl mb-6">✉️</span>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        Check your email
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
        We sent a magic link to your inbox. Click it to continue — no password needed.
      </p>
      <p className="mt-8 text-xs text-slate-400">
        Didn&apos;t get it? Check your spam folder.
      </p>
    </main>
  )
}
