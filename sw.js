const CACHE_NAME = 'bedrock-biome-creator-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  './',
    './vs2015.min.css',
    './highlight.min.js',
    './jszip.min.js',
    './monolith.min.css',
    './pickr.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(ASSETS_TO_CACHE))
    .then(self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', function(evt) {
  if (!evt.request.url.includes(evt.request.referrer)){
    return;
  }
  evt.respondWith(fromCache(evt.request));
  evt.waitUntil(
    update(evt.request)
  );
});

function fromCache(request) {
  return caches.open(CACHE_NAME).then(function(cache) {
    return cache.match(request);
  });
}

function update(request) {
  return caches.open(CACHE_NAME).then(function(cache) {
    return fetch(request).then(function(response) {
      return cache.put(request, response.clone()).then(function() {
        return response;
      });
    });
  });
}
