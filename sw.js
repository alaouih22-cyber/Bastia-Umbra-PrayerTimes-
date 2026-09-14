const CACHE_NAME = 'muslim-pro-ultimate-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://github.com/anars/blank-audio/raw/master/10-seconds-of-silence.mp3'
];

// Installazione del Service Worker e salvataggio dei file in cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Attivazione e pulizia delle vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercettazione delle richieste di rete (Funzionamento Offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Ritorna il file dalla cache se esiste, altrimenti lo scarica da internet
        return response || fetch(event.request);
      })
  );
});

// Gestione dell'interazione con le Notifiche Push
self.addEventListener('notificationclick', event => {
  event.notification.close(); // Chiude la notifica quando viene toccata
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Se l'app è già aperta in background, la riporta in primo piano
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // Se l'app è chiusa, la apre
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
