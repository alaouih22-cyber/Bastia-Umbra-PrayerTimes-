self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Gestione delle notifiche push in background
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Muslim Pro Ultimate';
    const options = {
        body: data.body || 'È arrivato il momento della preghiera.',
        icon: 'icon.png',
        badge: 'icon.png',
        vibrate: [500, 110, 500]
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return client.openWindow('./index.html');
        })
    );
});
