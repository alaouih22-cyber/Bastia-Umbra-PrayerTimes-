/* 
   MUSLIM PRO SUPREME - ENGINE v17 
   Gestione Totale Offline e Notifiche Banner ad Alta Priorità
*/

const CACHE_NAME = 'muslim-pro-absolute-v17';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon.png',
    // Salvataggio audio in cache per funzionamento offline
    'https://www.islamcan.com/audio/adhan/azan1.mp3',
    'https://www.islamcan.com/audio/adhan/azan2.mp3',
    'https://www.islamcan.com/audio/adhan/azan16.mp3',
    'https://www.islamcan.com/audio/adhan/azan10.mp3',
    'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    'https://github.com/anars/blank-audio/raw/master/10-seconds-of-silence.mp3'
];

// 1. Installazione: Scarica tutti i file e l'audio nella memoria del telefono
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching System: Salvataggio risorse per modalità Offline...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. Attivazione: Pulisce le vecchie versioni dell'app
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

// 3. IL CUORE DEI BANNER: Riceve il comando dall'index.html e lo mostra a schermo
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'icon.png',
            badge: 'icon.png',
            // Vibrazione professionale: 3 colpi lunghi (tipico delle app preghiera)
            vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40],
            tag: 'prayer-alert',
            renotify: true,
            requireInteraction: true, // Il banner resta finché l'utente non lo chiude
            priority: 2,              // Alta priorità per Android/Samsung
            data: { url: './' }
        };

        event.waitUntil(
            self.registration.showNotification(event.data.title, options)
        );
    }
});

// 4. Gestione Click: Quando l'utente tocca il banner, apre l'app istantaneamente
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (let client of clientList) {
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

// 5. Strategia Fetch: Se non c'è internet, usa i file salvati nel telefono
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
