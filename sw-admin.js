const CACHE_NAME = 'nomin-admin-v2';
const ASSETS_TO_CACHE = [
  './admin.html',
  './admin-orders.html',
  './admin-banners.html',
  './admin-notifications.html',
  './admin-order-detail.html',
  './styles.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Skip data URLs and other schemes
  const url = event.request.url;
  if (!url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response immediately if available, while updating cache in background
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // -----------------------------------------------------------------------------
          // FIX for Cloudflare Pages Clean URLs (HTML redirects) + Service Worker Bug
          // Chrome blocks 'redirected: true' responses for 'navigate' requests for security.
          // If we detect a redirect, we explicitly tell the browser to redirect.
          // -----------------------------------------------------------------------------
          if (networkResponse.redirected && event.request.mode === 'navigate') {
             return Response.redirect(networkResponse.url, 302);
          }

          if (networkResponse && networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails and no cache, this will still result in an error,
          // but we'll try to return the cached response if it exists.
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
