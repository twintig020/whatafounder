'use client'

import { useEffect } from 'react'
import { BASE_PATH } from '@/lib/constants'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` })
      .catch((err) => {
        console.warn('SW registration failed:', err)
      })
  }, [])

  return null
}
