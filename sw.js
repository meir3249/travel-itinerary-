/**
 * Service Worker for Offline PWA Support - Phase 2
 * 
 * NOTE: Network-First strategy for places.json is enabled during development 
 * so data updates are reflected immediately without stale cache locks. 
 * For production, switch places.json back to Cache-First strategy.
 */

const CACHE_NAME = 'rome-map-v3';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/config.js',
  './js/api.js',
  './js/map.js',
  './js/ui.js',
  './js/app.js',
  './js/date.js',
  './js/storage.js',
  './js/scale.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap'
];

// Install Event - Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching static assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Hybrid Caching Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-First strategy specifically for places.json (Development Mode)
  if (url.pathname.endsWith('places.json')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          console.log('[SW] Network failed for places.json, serving from cache fallback.');
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-First strategy for all other static assets
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(err => {
        console.warn('[SW] Fetch failed offline:', err);
      });
    })
  );
});
