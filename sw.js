/* 
   MUSLIM PRO SUPREME - SERVICE WORKER 
   Gestione Notifiche Banner e Modalità Offline
*/

const CACHE_NAME = 'muslim-pro-platinum-v8';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon.png',
    'https://www.islamcan.com/audio/adhan/azan1.mp3',
    'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
];

// 1. Installazione: Salva i file necessari nella memoria del telefono
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. Attivazione: Pulisce le vecchie cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. Gestione Banner Notifica (Comando ricevuto dal file Index.html)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'icon.png',
            badge: 'icon.png',
            vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40],
            tag: 'prayer-alert', // Evita notifiche doppie
            renotify: true,
            requireInteraction: true, // Il banner resta finché non viene rimosso
            priority: 2, // Massima priorità per Android/Samsung
            importance: 'high',
            data: { url: './' }
        };

        event.waitUntil(
            self.registration.showNotification(event.data.title, options)
        );
    }
});

// 4. Click sulla notifica: Apre o mette a fuoco l'applicazione
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});

// 5. Fetch: Permette all'app di caricarsi istantaneamente anche senza internet
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
