// Load offline caching & universal prayer scheduler from sw.js
try { importScripts('./sw.js'); } catch(e) { console.warn('sw.js import skipped:', e); }

const ATHAN_AUDIO_URL = 'https://ia800203.us.archive.org/8/items/AdhanMorocco/Adhan%20Morocco.mp3';

function getAppIcon() {
    return (self.location && self.location.origin) ? (self.location.origin + '/icon.png') : 'icon.png';
}

function broadcastPlayAthan(title, body) {
    return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
            client.postMessage({
                type: 'PLAY_ATHAN',
                title: title,
                body: body,
                sound: ATHAN_AUDIO_URL
            });
        });
    });
}

async function safeShowNotification(title, body, tag) {
    const iconUrl = getAppIcon();
    try {
        return await self.registration.showNotification(title, {
            body: body,
            icon: iconUrl,
            badge: iconUrl,
            vibrate: [500, 110, 500, 110, 1000],
            tag: tag || 'prayer-adhan-alert',
            renotify: true,
            requireInteraction: true,
            data: { url: './index.html?playAthan=1' }
        });
    } catch (e) {
        // Fallback puro per iOS Safari WebKit e Windows
        return await self.registration.showNotification(title, {
            body: body,
            icon: iconUrl,
            tag: tag || 'prayer-adhan-alert',
            data: { url: './index.html?playAthan=1' }
        });
    }
}

// Inizializza Firebase in modo sicuro così non blocca mai il Service Worker su iPhone (iOS) o Windows
try {
    importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

    if (typeof firebase !== 'undefined') {
        firebase.initializeApp({
            apiKey: "AIzaSyCHVgzE-tYoKlQlJRHgUHtEP-Q0NCEG6WQ",
            authDomain: "muslimprobastia-d5d41.firebaseapp.com",
            projectId: "muslimprobastia-d5d41",
            storageBucket: "muslimprobastia-d5d41.firebasestorage.app",
            messagingSenderId: "854739829236",
            appId: "1:854739829236:web:2ad83ad9c0cdec635ff9a1"
        });

        const messaging = firebase.messaging();
        messaging.onBackgroundMessage((payload) => {
            const title = payload.notification?.title || payload.data?.title || 'Muslim Pro Bastia';
            const body = payload.notification?.body || payload.data?.body || 'È arrivato il momento della preghiera.';
            broadcastPlayAthan(title, body);
            return safeShowNotification(title, body, 'prayer-adhan-alert');
        });
    }
} catch (fcmSwErr) {
    console.warn('[firebase-messaging-sw.js] Firebase non attivo in questo contesto, uso Web Push standard:', fcmSwErr);
}

// Gestione dei push generici / Web Push standard (iOS 16.4+, Android, Windows)
self.addEventListener('push', (event) => {
    if (event.data) {
        try {
            const json = event.data.json();
            if (json.notification && (json.from || json.data?.firebaseMessageId)) {
                return;
            }
        } catch (e) {}
    }

    let title = '🕌 Muslim Pro Bastia';
    let body = 'È arrivato il momento della preghiera.';
    if (event.data) {
        try {
            const json = event.data.json();
            title = json.title || json.notification?.title || json.data?.title || title;
            body = json.body || json.notification?.body || json.data?.body || body;
        } catch (e) {
            title = event.data.text() || title;
        }
    }

    event.waitUntil(
        Promise.all([
            broadcastPlayAthan(title, body),
            safeShowNotification(title, body, 'prayer-adhan-alert')
        ])
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.focus();
                    client.postMessage({ type: 'PLAY_ATHAN' });
                    return;
                }
            }
            if (self.clients.openWindow) return self.clients.openWindow('./index.html?playAthan=1');
        })
    );
});
