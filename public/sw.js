// Minimal service worker to handle existing registrations
// This prevents errors from previously registered service workers

const CACHE_NAME = 'empathy-cache-v1';

// Install event - minimal setup
self.addEventListener('install', event => {
  console.log('[SW] Service worker installing...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Service worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - pass through to network, no caching for API calls
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip API requests - let them go directly to network
  if (url.pathname.startsWith('/api/')) {
    console.log('[SW] Skipping API request:', url.pathname);
    return; // Let the browser handle it normally
  }
  
  // For other requests, try network first
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful responses for static assets
        if (response.ok && !url.pathname.startsWith('/api/')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(error => {
        console.log('[SW] Network failed for:', event.request.url);
        // Try to get from cache
        return caches.match(event.request);
      })
  );
});

// Message event - handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CLAIM_CLIENTS':
        self.clients.claim();
        break;
      default:
        console.log('[SW] Unknown message:', event.data);
    }
  }
});