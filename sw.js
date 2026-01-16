console.log('SW LOADED');

const CACHE = 'img-cache-v1';

self.addEventListener('install', () => {
    console.log('SW INSTALL');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('SW ACTIVATE');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) {
                    console.log('FROM CACHE', event.request.url);
                    return cached;
                }
                return fetch(event.request).then(res => {
                    return caches.open(CACHE).then(cache => {
                        cache.put(event.request, res.clone());
                        return res;
                    });
                });
            })
        );
    }
});
