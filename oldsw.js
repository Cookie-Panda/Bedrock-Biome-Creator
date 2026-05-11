const CACHE_NAME = 'bedrock-biome-creator-v3'; // Bumped version to ensure clean cache
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/vs2015.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/monolith.min.css',
    'https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/pickr.min.js',
    'https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:wght@400;500;600&display=swap'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Forces the waiting service worker to become the active service worker
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', event => {
    // Clean up old caches when a new version activates
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Runtime caching specifically for Google Fonts files
    if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then(networkResponse => {
                    // Cache the fetched font for next time
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
        );
        return; 
    }

    // Standard Cache-First approach for everything else
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});