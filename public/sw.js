// Z2B Table Banquet — Service Worker
// Enables offline access and PWA install

const CACHE_NAME = 'z2b-v1'
const OFFLINE_URL = '/offline'

const PRECACHE = [
  '/',
  '/workshop',
  '/dashboard',
  '/type-as-you-feel',
  '/marketplace',
  '/logo.jpg',
  '/offline',
]

// Install — precache key pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE).catch(() => {
        // Fail silently if some pages not available yet
      })
    })
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// Fetch — network first, cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return
  // Skip API requests — always go to network
  if (event.request.url.includes('/api/')) return
  // Skip Supabase requests
  if (event.request.url.includes('supabase.co')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached
          // If navigating to a page — show offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
        })
      })
  )
})
