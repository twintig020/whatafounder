// What a Founder — Service Worker
const CACHE_NAME = 'whatafounder-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        '/whatafounder/',
        '/whatafounder/manifest.json',
      ])
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Network-first for API calls
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request)
    )
  )
})

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'What a Founder', body: event.data.text() }
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'What a Founder', {
      body: data.body,
      icon: '/whatafounder/icons/icon-192.png',
      badge: '/whatafounder/icons/icon-192.png',
      data: { url: data.url ?? '/whatafounder/today' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/whatafounder/today'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      const client = windowClients.find((c) => c.url.includes(url))
      if (client) return client.focus()
      return clients.openWindow(url)
    })
  )
})
