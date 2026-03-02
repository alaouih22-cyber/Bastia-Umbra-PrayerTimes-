const CACHE_NAME = 'muslim-pro-bastia-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
  'https://cdn-icons-png.flaticon.com/512/149/149022.png',
  'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  'https://www.islamcan.com/audio/adhan/azan1.mp3'
];

// Installa e salva tutto in memoria (per far funzionare tutto offline)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Gestione del click sul Banner della notifica
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow('./');
    })
  );
});

// Recupero file (Offline mode)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Ascolta i comandi per mostrare i Banner Push/Pop-up
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Preghiera', body: 'È ora!' };
  const options = {
    body: data.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
    vibrate: [300, 100, 300],
    requireInteraction: true
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
