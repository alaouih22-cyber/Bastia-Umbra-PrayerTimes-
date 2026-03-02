self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Gestisce l'apparizione del banner pop-up
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
            vibrate: [200, 100, 200],
            tag: 'prayer-time',
            renotify: true,
            requireInteraction: true // Il banner resta finché non lo chiudi
        };
        event.waitUntil(self.registration.showNotification(event.data.title, options));
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow('./'));
});
