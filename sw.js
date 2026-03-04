const CACHE_NAME = 'muslim-pro-v6';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: 'icon.png',
      badge: 'icon.png',
      vibrate: [500, 110, 500],
      requireInteraction: true,
      tag: 'prayer-alert'
    });
  }
});
