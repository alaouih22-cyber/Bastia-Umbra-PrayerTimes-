self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('./');
        })
    );
});

// Ascolta messaggi specifici se necessario, ma gestisce principalmente il banner native
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    event.waitUntil(
        self.registration.showNotification(data.title || "Preghiera", {
            body: data.body || "È ora della preghiera",
            icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png'
        })
    );
});
