const CACHE_VERSION = 'peak-aquatic-v1'
const CORE_ASSETS = ['/', '/offline.html', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const cloned = response.clone()
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, cloned))
        return response
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('/offline.html'))
      )
  )
})
