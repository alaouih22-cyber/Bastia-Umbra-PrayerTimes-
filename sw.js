/* 
   MUSLIM PRO ULTRA - OFFLINE ENGINE
   Questo script salva l'app sul disco del telefono.
*/

const CACHE_NAME = 'muslim-pro-offline-v11';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.png',
    'https://www.islamcan.com/audio/adhan/azan1.mp3',
    'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
];

// Installa e salva tutto in Cache
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Notifica Banner Locale (Funziona OFFLINE)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: 'icon.png',
            badge: 'icon.png',
            vibrate: [500, 110, 500, 110, 500],
            tag: 'prayer-alert',
            renotify: true,
            requireInteraction: true,
            priority: 2
        });
    }
});

// Click sulla notifica
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.openWindow('./'));
});

// Recupera i file dalla cache se non c'è internet
self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
