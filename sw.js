const CACHE_NAME = 'muslim-pro-titanium-v12';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.png',
    'https://www.islamcan.com/audio/adhan/azan1.mp3',
    'https://www.islamcan.com/audio/adhan/azan2.mp3',
    'https://www.islamcan.com/audio/adhan/azan16.mp3',
    'https://www.islamcan.com/audio/adhan/azan10.mp3',
    'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: 'icon.png',
            badge: 'icon.png',
            vibrate: [500, 110, 500, 110, 500],
            requireInteraction: true,
            tag: 'prayer-alert',
            renotify: true
        });
    }
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.openWindow('./'));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
