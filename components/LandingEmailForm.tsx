'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BASE_PATH } from '@/lib/constants'

interface Props {
  dark?: boolean
}

export default function LandingEmailForm({ dark = false }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (otpError) {
      setError(otpError.message)
      setLoading(false)
      return
    }

    router.push('/auth/check-email')
  }

  const inputClass = dark
    ? 'bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:ring-white/50'
    : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white'

  const btnClass = dark
    ? 'bg-white text-indigo-600 font-semibold hover:bg-indigo-50'
    : 'bg-indigo-600 text-white font-semibold hover:bg-indigo-700'

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={loading}
        className={`w-full px-4 py-3 rounded-xl text-base outline-none focus:ring-2 transition-all ${inputClass}`}
      />
      {error && (
        <p className={`text-sm ${dark ? 'text-red-200' : 'text-red-500'}`}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl text-base transition-colors disabled:opacity-60 ${btnClass}`}
      >
        {loading ? 'Sending magic link…' : 'Start for free →'}
      </button>
    </form>
  )
}
