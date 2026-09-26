// sw.js - Universal Service Worker per iOS (iPhone/iPad), Android e Windows PC
const CACHE_NAME = 'muslim-pro-bastia-v2.7';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

let scheduledSwTimers = [];

function getSwAppIcon() {
  return (self.location && self.location.origin) ? (self.location.origin + '/icon.png') : 'icon.png';
}

async function showUniversalSwNotification(title, body, extraData) {
  const iconUrl = getSwAppIcon();
  const fullOptions = {
    body: body,
    icon: iconUrl,
    badge: iconUrl,
    tag: (extraData && extraData.tag) ? extraData.tag : 'prayer-adhan-alert',
    renotify: true,
    requireInteraction: true,
    vibrate: [500, 150, 500, 150, 1000],
    data: Object.assign({ url: './index.html?playAthan=1' }, extraData || {})
  };

  try {
    await self.registration.showNotification(title, fullOptions);
  } catch (err) {
    // Fallback compatibile con Safari iOS e browser Windows restrittivi
    try {
      await self.registration.showNotification(title, {
        body: body,
        icon: iconUrl,
        tag: (extraData && extraData.tag) ? extraData.tag : 'prayer-adhan-alert',
        data: { url: './index.html?playAthan=1' }
      });
    } catch (e2) {
      console.warn('[sw.js] showNotification fallback warning:', e2);
    }
  }
}

function broadcastSwPlayAthan(title, body, prayerIndex) {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    clientList.forEach((client) => {
      client.postMessage({
        type: 'PLAY_ATHAN',
        title: title,
        body: body,
        prayerIndex: prayerIndex
      });
    });
  });
}

function schedulePrayersInServiceWorker(prayers) {
  scheduledSwTimers.forEach((id) => clearTimeout(id));
  scheduledSwTimers = [];

  if (!Array.isArray(prayers)) return;
  const now = Date.now();

  prayers.forEach((p) => {
    const delay = p.timestamp - now;
    // Programma i timer per le prossime 24 ore (86400000 ms)
    if (delay > 0 && delay <= 86400000) {
      const timerId = setTimeout(() => {
        Promise.all([
          showUniversalSwNotification(p.title, p.body, {
            tag: 'prayer-' + p.id,
            prayerIndex: p.prayerIndex
          }),
          broadcastSwPlayAthan(p.title, p.body, p.prayerIndex)
        ]).catch(() => {});
      }, delay);
      scheduledSwTimers.push(timerId);

      // Se il browser supporta TimestampTrigger nativo (Chromium/Edge/Android)
      if ('TimestampTrigger' in self && self.registration && self.registration.showNotification) {
        try {
          self.registration.showNotification(p.title, {
            body: p.body,
            icon: getSwAppIcon(),
            badge: getSwAppIcon(),
            tag: 'trigger-prayer-' + p.id,
            showTrigger: new self.TimestampTrigger(p.timestamp),
            data: { url: './index.html?playAthan=1', prayerIndex: p.prayerIndex }
          }).catch(() => {});
        } catch (e) {}
      }
    }
  });
}

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SCHEDULE_PRAYERS') {
    schedulePrayersInServiceWorker(event.data.prayers || []);
  } else if (event.data.type === 'TRIGGER_NOW_NOTIFICATION') {
    const title = event.data.title || '🕌 Muslim Pro Bastia';
    const body = event.data.body || 'È il momento della preghiera.';
    event.waitUntil(
      showUniversalSwNotification(title, body, { tag: event.data.tag || 'athan-push-now' })
    );
  }
});

// Installazione: scarica e memorizza le risorse principali in cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of ASSETS_TO_CACHE) {
        try {
          await cache.add(url);
        } catch (err) {}
      }
    }).then(() => self.skipWaiting())
  );
});

// Attivazione: rimuove le vecchie versioni della cache per aggiornare all'istante
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategia Network-First con fallback alla Cache
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
