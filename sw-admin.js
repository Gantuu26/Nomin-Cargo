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
  if (event.request.method !== 'GET') return;
  
  // Stale-while-revalidate strategy for admin app to ensure fresh data
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the new response if it's an asset
        if (event.request.url.includes('.html') || event.request.url.includes('.css')) {
           const clonedResponse = networkResponse.clone();
           caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
        }
        return networkResponse;
      }).catch(() => {
         // Network failed, rely purely on cache.
         return cachedResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
