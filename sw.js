/* MUSLIM PRO SUPREME - OFFLINE ENGINE v15 */
const CACHE_NAME = 'muslim-pro-offline-v15';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.png',
    'https://www.islamcan.com/audio/adhan/azan1.mp3',
    'https://www.islamcan.com/audio/adhan/azan2.mp3',
    'https://www.islamcan.com/audio/adhan/azan16.mp3',
    'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
];

// Installazione: scarica e salva tutto in cache
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Gestione Banner Notifica (Riceve il segnale da index.html)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'icon.png',
            badge: 'icon.png',
            vibrate: [500, 110, 500, 110, 500],
            requireInteraction: true,
            tag: 'prayer-alert',
            renotify: true,
            priority: 2
        };
        event.waitUntil(self.registration.showNotification(event.data.title, options));
    }
});

// Click sulla notifica: apre l'app
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.openWindow('./'));
});

// Strategia Offline: prima cerca in cache, poi in rete
self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
