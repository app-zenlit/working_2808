const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URL = '/offline.html';
const AUTH_PREFIX = 'supabase.co/auth/v1/';
const RETRY_LIMIT = 1; // small retry limit

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

async function networkFirstWithRetry(request) {
  for (let attempt = 0; attempt <= RETRY_LIMIT; attempt++) {
    try {
      return await fetch(request);
    } catch (err) {
      if (attempt === RETRY_LIMIT) {
        return caches.match(OFFLINE_URL);
      }
    }
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.includes(AUTH_PREFIX)) {
    event.respondWith(networkFirstWithRetry(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
