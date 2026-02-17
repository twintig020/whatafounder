'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BASE_PATH, PRICES } from '@/lib/constants'

interface Props {
  email: string
  aiProcessing: boolean
  hasPushSubscription: boolean
  hasPurchased: boolean
}

export default function SettingsForm({ email, aiProcessing, hasPushSubscription, hasPurchased }: Props) {
  const router = useRouter()
  const [aiConsent, setAiConsent] = useState(aiProcessing)
  const [pushEnabled, setPushEnabled] = useState(hasPushSubscription)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleAiToggle() {
    const next = !aiConsent
    setAiConsent(next)
    setSaving(true)
    await fetch(`${BASE_PATH}/api/user/consent`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aiProcessing: next }),
    })
    setSaving(false)
  }

  async function handlePushToggle() {
    if (pushEnabled) {
      // Unsubscribe
      const reg = await navigator.serviceWorker.ready.catch(() => null)
      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        await sub?.unsubscribe()
      }
      await fetch(`${BASE_PATH}/api/push/subscribe`, { method: 'DELETE' })
      setPushEnabled(false)
    } else {
      // Subscribe — trigger permission
      if (!('Notification' in window)) return
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const reg = await navigator.serviceWorker.ready.catch(() => null)
      if (!reg) return

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) return

      try {
        const padding = '='.repeat((4 - (vapidKey.length % 4)) % 4)
        const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/')
        const rawData = atob(base64)
        const key = Uint8Array.from(rawData, (c) => c.charCodeAt(0))

        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
        await fetch(`${BASE_PATH}/api/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub.toJSON()),
        })
        setPushEnabled(true)
      } catch {
        // silent
      }
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`${BASE_PATH}/api/user/delete`, { method: 'DELETE' })
    if (res.ok) {
      router.push(`${BASE_PATH}/`)
    } else {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Account */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Account</p>
          <p className="text-slate-800 dark:text-slate-200 font-medium">{email}</p>
        </div>

        {hasPurchased && (
          <div className="p-5 flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Extended Report unlocked</p>
              <p className="text-slate-400 text-sm">Purchased for {PRICES.currencySymbol}{PRICES.full}</p>
            </div>
          </div>
        )}
      </section>

      {/* Consent */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">Data storage</p>
            <p className="text-slate-400 text-sm mt-0.5">Required to use the service.</p>
          </div>
          <div className="flex-shrink-0 w-10 h-6 rounded-full bg-indigo-600 relative">
            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
          </div>
        </div>
        <button
          onClick={handleAiToggle}
          disabled={saving}
          className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">AI processing</p>
            <p className="text-slate-400 text-sm mt-0.5">
              Allow your answers to improve our models. Optional.
            </p>
          </div>
          <div
            className={`flex-shrink-0 w-10 h-6 rounded-full relative transition-colors ${
              aiConsent ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                aiConsent ? 'right-1' : 'left-1'
              }`}
            />
          </div>
        </button>
      </section>

      {/* Notifications */}
      {typeof window !== 'undefined' && 'Notification' in window && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <button
            onClick={handlePushToggle}
            className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-2xl"
          >
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Push notifications</p>
              <p className="text-slate-400 text-sm mt-0.5">
                Daily reminders for Day 2 and Day 3.
              </p>
            </div>
            <div
              className={`flex-shrink-0 w-10 h-6 rounded-full relative transition-colors ${
                pushEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  pushEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </div>
          </button>
        </section>
      )}

      {/* Danger zone */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-900/40">
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">
            Danger zone
          </p>
          {confirmDelete ? (
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                This will permanently delete your account and all your data. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete my account'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors"
            >
              Delete account and all data →
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
