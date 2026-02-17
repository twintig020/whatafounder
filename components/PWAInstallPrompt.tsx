'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already installed or dismissed this session
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      sessionStorage.getItem('pwa-prompt-dismissed')
    ) {
      return
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const inSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent)

    if (ios && inSafari) {
      setIsIOS(true)
      // Show iOS instructions after a short delay
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  function handleDismiss() {
    sessionStorage.setItem('pwa-prompt-dismissed', '1')
    setShow(false)
    setDismissed(true)
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  if (!show || dismissed) return null

  if (isIOS) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-6">
        <div className="max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Add to Home Screen</h3>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Tap <strong>Share</strong> then <strong>&ldquo;Add to Home Screen&rdquo;</strong> to install What a Founder on your iPhone.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="text-4xl">↑</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-6">
      <div className="max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl flex-shrink-0">📲</span>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Install the app
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Add What a Founder to your home screen for a better experience.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
