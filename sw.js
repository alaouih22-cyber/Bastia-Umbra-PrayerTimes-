/* 
   MUSLIM PRO ABSOLUTE PLATINUM - SERVICE WORKER 
   Gestione Offline Totale e Notifiche ad Alta Priorità
*/

const CACHE_NAME = 'muslim-pro-v18-platinum';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.png',
    'https://www.islamcan.com/audio/adhan/azan1.mp3',
    'https://www.islamcan.com/audio/adhan/azan2.mp3',
    'https://www.islamcan.com/audio/adhan/azan16.mp3',
    'https://www.islamcan.com/audio/adhan/azan10.mp3',
    'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    'https://github.com/anars/blank-audio/raw/master/10-seconds-of-silence.mp3'
];

// 1. INSTALLAZIONE: Salva tutto il sito e gli audio nel telefono
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching in corso...');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. ATTIVAZIONE: Pulisce le vecchie versioni
self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

// 3. GESTORE DEI BANNER (Riceve il segnale dall'index.html)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'icon.png',
            badge: 'icon.png',
            vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40],
            tag: 'prayer-notification',
            renotify: true,
            requireInteraction: true, // Il banner non sparisce da solo
            priority: 2,              // Alta priorità per Android
            importance: 'high',       // Forza la comparsa visiva
            data: { url: './' }
        };

        event.waitUntil(
            self.registration.showNotification(event.data.title, options)
        );
    }
});

// 4. CLICK SUL BANNER: Apre l'app
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('./');
        })
    );
});

// 5. STRATEGIA OFFLINE: Se non c'è campo, usa i file salvati
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
