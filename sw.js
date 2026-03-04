importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "INSERISCI_LA_TUA_API_KEY",
    projectId: "TUO-PROGETTO_ID",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
        vibrate: [500, 110, 500],
        requireInteraction: true,
        tag: 'prayer-push'
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_PRAYER_BANNER') {
        const options = {
            body: event.data.body,
            icon: 'https://cdn-icons-png.flaticon.com/512/2619/2619277.png',
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
