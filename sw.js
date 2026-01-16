const CACHE = 'img-cache-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;

    if (req.destination === 'image') {
        event.respondWith(
            caches.match(req).then(cached => {
                if (cached) return cached;

                return fetch(req).then(res => {
                    return caches.open(CACHE).then(cache => {
                        cache.put(req, res.clone());
                        return res;
                    });
                });
            })
        );
    }
});