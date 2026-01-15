// service-worker.js
const CACHE_NAME = 'dagomys-cache-v1.0';
const IMAGES_TO_CACHE = [
  '/shapka.webp',
  '/dividers_1.png',
  '/d14.webp',
  '/d15.webp',
  '/d16.webp',
  '/d17.webp',
  '/d20.webp',
  '/d21.webp',
  '/d22.webp',
  '/d23.webp',
  '/d24.webp',
  '/d25.webp',
  '/d26.webp',
  '/d27.webp',
  '/d28.webp',
  '/d29.webp',
  '/d30.webp',
  '/d31.webp',
  '/d32.webp',
  '/d33.webp',
  '/d34.webp',
  '/d35.webp',
  '/2.jpg',
  '/p6.png',
  '/favicon.png',
  '/01.webp'
];

// Установка
self.addEventListener('install', event => {
  console.log('[SW] Установка');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Кэшируем картинки');
        return cache.addAll(IMAGES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация
self.addEventListener('activate', event => {
  console.log('[SW] Активация');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // Только для картинок
  if (url.match(/\.(webp|jpg|jpeg|png|gif|ico|svg)$/i)) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          // Если есть в кэше
          if (cached) {
            console.log('[SW] Из кэша:', url);
            return cached;
          }
          
          // Иначе грузим
          return fetch(event.request)
            .then(response => {
              // Кэшируем для будущего
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone));
              return response;
            })
            .catch(err => {
              console.log('[SW] Ошибка:', url);
              return new Response('', { status: 404 });
            });
        })
    );
  }
});