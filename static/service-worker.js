/**
 * Smart Energy Dashboard - Service Worker
 * PWA Offline Caching Strategy
 * Author: Thiên Hoàng
 */

const CACHE_NAME = 'smart-energy-v2.1';
const OFFLINE_URL = '/';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/static/style.css',
    '/static/responsive.css',
    '/static/enhanced-ui.css',
    '/static/Automation-v5.css',
    '/static/images/icon-192.png',
    '/static/images/icon-512.png'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching static assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Precaching complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Precaching failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Skip API calls - always go to network
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/health')) {
        return;
    }

    // Network first strategy for HTML pages
    if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone response for caching
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Return offline page if available
                            return caches.match(OFFLINE_URL);
                        });
                })
        );
        return;
    }

    // Cache first strategy for static assets (CSS, JS, images)
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version immediately
                    // Also fetch in background to update cache
                    fetch(request)
                        .then((response) => {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, response);
                            });
                        })
                        .catch(() => {}); // Ignore network errors
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then((response) => {
                        // Cache successful responses
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return fallback for images
                        if (request.destination === 'image') {
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#0f172a" width="100" height="100"/><text x="50" y="50" text-anchor="middle" fill="#64748b" font-size="12">Smart Energy</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                    });
            })
    );
});

// Handle messages from main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Smart Energy';
    const options = {
        body: data.body || 'Có thông báo mới',
        icon: '/static/images/icon-192.png',
        badge: '/static/images/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/dashboard'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

console.log('[SW] Smart Energy Service Worker loaded');