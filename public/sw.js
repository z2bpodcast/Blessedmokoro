// FILE: public/sw.js
// Z2B Table Banquet — Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  if (!event.data) return
  const data = event.data.json()
  const options = {
    body:    data.body || 'The Open Table awaits you.',
    icon:    '/logo.jpg',
    badge:   '/logo.jpg',
    vibrate: [200, 100, 200],
    data:    { url: data.url || '/open-table' },
    actions: [
      { action: 'open',    title: '🍽️ Enter the Table' },
      { action: 'dismiss', title: 'Later' },
    ],
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Z2B Open Table', options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url || '/open-table'
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

self.addEventListener('install',  () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())
