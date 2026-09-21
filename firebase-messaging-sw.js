importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Inizializza Firebase con la stessa configurazione
firebase.initializeApp({
  apiKey: "AIzaSyCHVgzE-tYoKlQlJRHgUHtEP-Q0NCEG6WQ",
  authDomain: "muslimprobastia-d5d41.firebaseapp.com",
  projectId: "muslimprobastia-d5d41",
  storageBucket: "muslimprobastia-d5d41.firebasestorage.app",
  messagingSenderId: "854739829236",
  appId: "1:854739829236:web:2ad83ad9c0cdec635ff9a1"
});

const messaging = firebase.messaging();

// Gestione dei messaggi quando la PWA/browser è in background o chiuso
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Messaggio ricevuto in background: ', payload);
  const notificationTitle = payload.notification?.title || 'MuslimProBastia';
  const notificationOptions = {
    body: payload.notification?.body || 'Nuovo avviso orario preghiera',
    icon: 'icon.png',
    vibrate: [500, 110, 500]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
