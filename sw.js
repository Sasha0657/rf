/* ===== Service Worker for GitHub Pages ===== */
/* Cache images (.webp, .jpg, .png) strictly from cache */

console.log('SW LOADED');

const CACHE_NAME = 'image-cache-v1';

/* ---------- INSTALL ---------- */
self.addEventListener('install', event => {
    console.log('SW INSTALL');
    self.skipWaiting();
});

/* ---------- ACTIVATE ---------- */
self.addEventListener('activate', event => {
    console.log('SW ACTIVATE');
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(keys =>
                Promise.all(
                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))
                )
            )
        ])
    );
});

/* ---------- FETCH ---------- */
self.addEventListener('fetch', event => {
    const req = event.request;

    // Кэшируем ЛЮБЫЕ картинки (img + css background)
    if (req.method === 'GET' && req.url.match(/\.(webp|png|jpg|jpeg|svg)$/i)) {
        event.respondWith(
            caches.match(req).then(cached => {
                if (cached) {
                    console.log('IMG FROM CACHE:', req.url);
                    return cached;
                }

                return fetch(req)
                    .then(response => {
                        // если сеть вернула ошибку — не кэшируем
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(req, response.clone());
                            console.log('IMG CACHED:', req.url);
                            return response;
                        });
                    })
                    .catch(() => cached);
            })
        );
    }
});
