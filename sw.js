self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow('./'));
});

// Gestione messaggi push o notifiche dal thread principale
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
            vibrate: [200, 100, 200],
            requireInteraction: true
        };
        self.registration.showNotification(event.data.title, options);
    }
});
