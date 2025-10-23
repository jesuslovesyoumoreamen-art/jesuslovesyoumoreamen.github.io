// JELVIN POS Service Worker - v1
// 🔥 IMPORTANT: Update CACHE_NAME to vX when you make changes (e.g., v2, v3...)

const CACHE_NAME = 'jelvin-pos-v1';
const urlsToCache = [
  '/', // Cache the root (index.html)
  '/index.html',
  '/dashboard.html',
  '/sales.html',
  '/inventory.html',
  '/users.html',
  '/reports.html',
  '/audit.html',
  '/settings.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' // ✅ FIXED: Removed trailing spaces
];

// Install: cache all files
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching files...');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[Service Worker] Failed to cache files during install:', err);
      })
  );
});

// Fetch: serve from cache first, then network (cache-first strategy)
self.addEventListener('fetch', event => {
  // ✅ Skip caching for non-GET requests or Chrome extensions
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          console.log(`[Service Worker] Serving cached: ${event.request.url}`);
          return response;
        }
        // Otherwise fetch from network
        console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
        return fetch(event.request);
      })
      .catch(error => {
        console.error('[Service Worker] Fetch failed; returning offline page instead.', error);
        // Optionally return a fallback page here
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});