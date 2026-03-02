self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

// Gestione click sulla notifica per aprire l'app
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            if (windowClients.length > 0) {
                return windowClients[0].focus();
            }
            return clients.openWindow('./');
        })
    );
});

// Ascolta messaggi per mostrare notifiche (se necessario estenderlo)
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'Preghiera', body: 'È ora!' };
    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png'
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});
