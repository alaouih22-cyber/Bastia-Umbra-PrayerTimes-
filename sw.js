/* 
   MUSLIM PRO BASTIA - Service Worker 
   Questo file gestisce il funzionamento in background e le notifiche professionali.
*/

// 1. Importa le librerie Firebase per il Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 2. Inizializzazione Firebase (USA LE STESSE CHIAVI DEL TUO INDEX.HTML)
firebase.initializeApp({
    apiKey: "INSERISCI_API_KEY",
    authDomain: "INSERISCI_DOMAIN",
    projectId: "INSERISCI_PROJECT_ID",
    storageBucket: "INSERISCI_BUCKET",
    messagingSenderId: "INSERISCI_SENDER_ID",
    appId: "INSERISCI_APP_ID"
});

const messaging = firebase.messaging();

// 3. Gestione Messaggi in Background (Push inviate da console Firebase)
messaging.onBackgroundMessage(function(payload) {
    console.log('[sw.js] Ricevuto messaggio push in background:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
        vibrate: [500, 110, 500, 110, 450],
        tag: 'prayer-push', // Evita notifiche doppie
        renotify: true,
        requireInteraction: true // Il banner resta finché non lo chiudi
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. Gestione Notifiche Locali (Comando inviato dal Timer del tuo HTML)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
            vibrate: [500, 110, 500, 110, 450],
            tag: 'prayer-local',
            renotify: true,
            requireInteraction: true,
            data: { url: './' } // Apre l'app al click
        };
        self.registration.showNotification(event.data.title, options);
    }
});

// 5. Gestione Click sulla Notifica (Banner)
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Chiude il banner

    // Prova a riaprire l'app o a portarla in primo piano
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});

// 6. Cache dei file per il funzionamento Offline
const CACHE_NAME = 'muslim-pro-bastia-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn-icons-png.flaticon.com/512/2619/2619277.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

// Recupero dei file dalla Cache (permette all'app di aprirsi senza internet)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
