const CACHE_NAME = 'muslim-pro-bastia-v3';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Questo pezzo permette alla notifica di apparire come Pop-Up (Heads-up notification)
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: "Preghiera", body: "È ora!" };
    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
        vibrate: [500, 110, 500],
        requireInteraction: true,
        priority: "high", // Forza il banner su Android
        tag: 'prayer-push'
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Gestione del click sulla notifica
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('./');
        })
    );
});
