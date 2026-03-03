// MUSLIM PRO BASTIA - SERVICE WORKER PRO
const CACHE_NAME = 'muslim-pro-v4';

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

// Ascolta l'evento dal file HTML per mostrare il Banner
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
            vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40],
            tag: 'prayer-alert',
            renotify: true,
            requireInteraction: true, // Il banner non scompare finché non lo tocchi
            priority: 2, // Massima priorità per Android
            data: { url: './' }
        };

        event.waitUntil(
            self.registration.showNotification(event.data.title, options)
        );
    }
});

// Cosa succede quando clicchi sul Banner
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('./');
        })
    );
});
