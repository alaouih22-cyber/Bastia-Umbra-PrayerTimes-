/* 
   MUSLIM PRO ULTRA - POWERFUL SERVICE WORKER 
   Gestione Avanzata Notifiche & Background
*/

const CACHE_NAME = 'muslim-pro-elite-v10';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.png'
];

// Installazione rapida e attivazione immediata
self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(clients.claim());
});

// IL CUORE DELLE NOTIFICHE: Riceve l'ordine dall'HTML e lo impone al sistema
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'icon.png',
            badge: 'icon.png',
            // Vibrazione professionale: 3 colpi lunghi
            vibrate: [500, 110, 500, 110, 500],
            tag: 'prayer-alert', // Sostituisce la precedente per non intasare
            renotify: true,
            requireInteraction: true, // Il banner resta finché non lo tocchi
            priority: 2, // Massima priorità per Android (High Priority)
            visualInformation: true,
            data: { url: './' },
            actions: [
                { action: 'open', title: 'Apri App 🤲' },
                { action: 'close', title: 'Chiudi' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(event.data.title, options)
        );
    }
});

// Gestione del click sul banner
self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('./');
        })
    );
});

// Funzionamento Offline
self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
