self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'icon.png',
            badge: 'icon.png',
            vibrate: [500, 110, 500],
            requireInteraction: true,
            tag: 'prayer-alert'
        };
        self.registration.showNotification(event.data.title, options);
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow('./'));
});
