// service-worker.js
const CACHE_NAME = 'dagomys-cache-v1.0';
const IMAGES = [
  // Все ваши картинки
  '/shapka.webp',
  '/dividers_1.png',
  '/d1.webp', '/d2.webp', '/d3.webp', '/d4.webp',
  '/d5.webp', '/d6.webp', '/d7.webp', '/d8.webp',
  '/d9.webp', '/d10.webp', '/d11.webp', '/d12.webp',
  '/d13.webp', 
  '/d14.webp', '/d15.webp', '/d16.webp', '/d17.webp',
  '/d20.webp', '/d21.webp', '/d22.webp', '/d23.webp',
  '/d24.webp', '/d25.webp', '/d26.webp', '/d27.webp',
  '/d28.webp', '/d29.webp', '/d30.webp', '/d31.webp',
  '/d32.webp', '/d33.webp', '/d34.webp', '/d35.webp',
  '/p6.png', '/favicon.png', '/01.webp'
];

// 1. УСТАНОВКА - кэшируем картинки при первом посещении
self.addEventListener('install', event => {
  console.log('[SW] Установка и кэширование картинок...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Кэшируем', IMAGES.length, 'картинок');
        // Пробуем кэшировать все картинки
        return Promise.all(
          IMAGES.map(url => {
            return cache.add(url).catch(err => {
              console.log('[SW] Пропущена:', url);
              return Promise.resolve();
            });
          })
        );
      })
      .then(() => {
        console.log('[SW] Все картинки закэшированы!');
        // Активируем SW сразу, без ожидания
        return self.skipWaiting();
      })
  );
});

// 2. АКТИВАЦИЯ - очищаем старые кэши
self.addEventListener('activate', event => {
  console.log('[SW] Активация');
  
  event.waitUntil(
    Promise.all([
      // Удаляем старые версии кэша
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => {
            if (name !== CACHE_NAME) {
              console.log('[SW] Удаляем старый кэш:', name);
              return caches.delete(name);
            }
          })
        );
      }),
      // Немедленно берем контроль над страницами
      self.clients.claim()
    ])
  );
});

// 3. ПЕРЕХВАТ ЗАПРОСОВ КАРТИНОК
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // Перехватываем только картинки
  if (url.match(/\.(webp|jpg|jpeg|png|gif|svg|ico)$/i)) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          // Если есть в кэше - отдаем мгновенно
          if (cached) {
            console.log('[SW] Из кэша:', url.split('/').pop());
            return cached;
          }
          
          // Если нет в кэше - грузим с сервера
          return fetch(event.request)
            .then(response => {
              // Успешно загрузили - сохраняем в кэш
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                    console.log('[SW] Сохранил в кэш:', url.split('/').pop());
                  });
              }
              return response;
            })
            .catch(error => {
              console.log('[SW] Ошибка загрузки:', url);
              // Можно вернуть заглушку
              return new Response(
                '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            });
        })
    );
  }
});

