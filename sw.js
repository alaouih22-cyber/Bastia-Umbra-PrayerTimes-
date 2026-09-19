importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCHVgzE-tYoKlQlJRHgUHtEP-Q0NCEG6WQ",
  authDomain: "muslimprobastia-d5d41.firebaseapp.com",
  projectId: "muslimprobastia-d5d41",
  storageBucket: "muslimprobastia-d5d41.firebasestorage.app",
  messagingSenderId: "854739829236",
  appId: "1:854739829236:web:2ad83ad9c0cdec635ff9a1"
});

const messaging = firebase.messaging();

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Gestione messaggi background specifici Firebase FCM
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Ricevuto messaggio in background FCM:', payload);
    const title = payload.notification?.title || payload.data?.title || 'Muslim Pro Ultimate';
    const options = {
        body: payload.notification?.body || payload.data?.body || 'È arrivato il momento della preghiera.',
        icon: 'icon.png',
        badge: 'icon.png',
        vibrate: [500, 110, 500]
    };
    self.registration.showNotification(title, options);
});

// Gestione dei push generici (fallback)
self.addEventListener('push', (event) => {
    // Se il messaggio è gestito da FCM onBackgroundMessage, ignora per evitare duplicati
    if (event.data) {
        try {
            const json = event.data.json();
            if (json.data && (json.data.firebaseMessageId || json.from)) {
                return; 
            }
        } catch (e) {
            // Non è JSON valido, gestisci come push generico
        }
    }

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
