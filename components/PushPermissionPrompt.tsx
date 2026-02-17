'use client'

import { useState } from 'react'
import { BASE_PATH } from '@/lib/constants'

export default function PushPermissionPrompt({ onDismiss }: { onDismiss: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEnable() {
    setLoading(true)
    setError(null)

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        onDismiss()
        return
      }

      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        onDismiss()
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      })

      await fetch(`${BASE_PATH}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      onDismiss()
    } catch (err) {
      setError('Could not enable notifications. Please try again.')
      console.error('[push]', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-6 sm:pb-8">
      <div className="max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl flex-shrink-0">🔔</span>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Don&apos;t forget Day 2
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Get a morning nudge so you don&apos;t lose your streak. No spam — just one notification per day.
            </p>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleEnable}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Enabling…' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0))
}
