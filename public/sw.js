/**
 * Service Worker for Progressive Web App
 * Provides offline shell support and cache management
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `money-transfer-comparison-${CACHE_VERSION}`;

// Assets to cache on install (offline shell)
const OFFLINE_ASSETS = [
  '/',
  '/gbp-to-ngn',
  '/gbp-to-ghs',
  '/gbp-to-zar',
  '/gbp-to-usd',
  '/gbp-to-eur',
  '/gbp-to-cad',
];

/**
 * Install event: Cache offline shell
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching offline assets');
      return cache.addAll(OFFLINE_ASSETS).catch((err) => {
        console.warn('Some assets failed to cache:', err);
        // Don't fail install if some assets fail
      });
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Activate event: Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Claim all clients immediately
  return self.clients.claim();
});

/**
 * Fetch event: Network-first with fallback to cache
 * Strategy: Try network, fall back to cache for API calls, serve offline page for navigation
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // API requests: network-first with cache fallback
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cached API response if available
          return caches.match(request).then((cached) => {
            return cached || new Response(
              JSON.stringify({ error: 'Offline - no cached data' }),
              { 
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }
  
  // Static assets (JS, CSS, images): cache-first
  if (
    request.url.includes('.js') ||
    request.url.includes('.css') ||
    request.url.includes('.woff') ||
    request.url.includes('.png') ||
    request.url.includes('.jpg') ||
    request.url.includes('.svg')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        }).catch(() => {
          return new Response('Resource unavailable offline', { status: 503 });
        });
      })
    );
    return;
  }
  
  // Navigation requests: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cached page
          return caches.match(request).then((cached) => {
            return cached || caches.match('/') || new Response(
              'This page is not available offline',
              { status: 503 }
            );
          });
        })
    );
    return;
  }
  
  // Default: network-first
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Periodic background sync (optional, for future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'update-quotes') {
    event.waitUntil(
      fetch('/api/quotes/live')
        .then((response) => response.json())
        .then((data) => {
          // Could save to IndexedDB or local storage
          console.log('Background sync: Quotes updated', data);
        })
        .catch((err) => console.error('Background sync failed:', err))
    );
  }
});
