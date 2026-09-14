self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

// Ricezione Notifiche Push da Server Remoto (VAPID / Firebase)
self.addEventListener('push', (e) => {
    let data = { title: 'Muslim Pro', body: 'È ora della preghiera!' };
    if (e.data) {
        try {
            data = e.data.json();
        } catch (err) {
            data.body = e.data.text();
        }
    }
    const options = {
        body: data.body,
        icon: 'icon.png',
        vibrate: [500, 110, 500],
        requireInteraction: true,
        data: data.url || '/'
    };
    e.waitUntil(self.registration.showNotification(data.title, options));
});

// Gestione del click sulla notifica a schermo chiuso
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(e.notification.data || '/');
        })
    );
});
