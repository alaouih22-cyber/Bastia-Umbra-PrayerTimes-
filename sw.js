const CACHE_NAME = 'muslim-pro-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

// Gestione Banner Notifiche (quello che volevi tu)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
    const options = {
      body: event.data.body,
      icon: 'icon.png',
      badge: 'icon.png',
      vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40],
      tag: 'prayer-alert',
      renotify: true,
      requireInteraction: true,
      priority: 2
    };
    event.waitUntil(self.registration.showNotification(event.data.title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('./'));
});
