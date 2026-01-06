// Service Worker for PWA offline functionality
const CACHE_NAME = 'fasttube-v1.0.0';
const STATIC_CACHE = 'fasttube-static-v1';
const DYNAMIC_CACHE = 'fasttube-dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/config.js',
    '/js/api.js',
    '/js/player.js',
    '/js/storage.js',
    '/js/app.js',
    '/js/pwa.js',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
            })
    );
    
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        // For YouTube API and embed, use network only
        if (url.hostname.includes('youtube.com') || url.hostname.includes('googleapis.com')) {
            event.respondWith(fetch(request));
            return;
        }
    }
    
    // Cache-first strategy for static assets
    if (STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    return response || fetch(request);
                })
        );
        return;
    }
    
    // Network-first strategy for dynamic content
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Clone the response
                const responseClone = response.clone();
                
                // Cache successful responses
                if (response.status === 200) {
                    caches.open(DYNAMIC_CACHE)
                        .then((cache) => {
                            cache.put(request, responseClone);
                        });
                }
                
                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(request)
                    .then((response) => {
                        return response || caches.match('/index.html');
                    });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    return caches.delete(cache);
                })
            );
        });
    }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-saved-videos') {
        event.waitUntil(syncSavedVideos());
    }
});

// Sync saved videos when online
async function syncSavedVideos() {
    console.log('Service Worker: Syncing saved videos');
    // Placeholder for sync logic
    return Promise.resolve();
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-cache') {
        event.waitUntil(updateCache());
    }
});

// Update cache periodically
async function updateCache() {
    const cache = await caches.open(STATIC_CACHE);
    const requests = await cache.keys();
    
    await Promise.all(
        requests.map(async (request) => {
            try {
                const response = await fetch(request);
                await cache.put(request, response);
            } catch (error) {
                console.error('Failed to update cache:', error);
            }
        })
    );
}

// Push notification support (for future features)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('FastTube', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
