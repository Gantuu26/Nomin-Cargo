const CACHE_NAME = 'nomin-admin-v1';
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
  // Only handle GET requests and skip data: URLs or other non-http schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;
  
  // Stale-while-revalidate strategy for admin app to ensure fresh data
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the new response if it's a valid successful response and is an asset
        if (networkResponse && networkResponse.ok && (event.request.url.includes('.html') || event.request.url.includes('.css') || event.request.url.includes('.js'))) {
           const clonedResponse = networkResponse.clone();
           caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
        }
        return networkResponse;
      }).catch((err) => {
         // Network failed, if we have a cache, use it.
         if (cachedResponse) return cachedResponse;
         // If no cache and network fails, we must throw or return a valid error response
         throw err;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
