// service-worker.js
const CACHE_NAME = 'site-cache-v1.0';
const PRELOAD_IMAGES = [
  '/d01.webp',
  '/shapka.webp',
  '/d1.webp',
  '/d2.webp',
  '/d3.webp',
  '/d4.webp',
  '/d5.webp',
  '/d6.webp',
  '/d7.webp',
  '/d8.webp',
  '/d9.webp',
  '/d10.webp',
  '/d11.webp',
  '/d12.webp',
  '/d13.webp',
  '/d14.webp',
  '/d15.webp',
  '/d16.webp',
  '/d17.webp',
  '/d18.webp',
  '/d19.webp',
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
  '/d35.webp'
  // Добавьте ВСЕ картинки, которые хотите кэшировать
];

// 1. УСТАНОВКА - кэшируем картинки сразу при первом посещении
self.addEventListener('install', event => {
  console.log('[SW] Установка...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Начинаем кэшировать картинки...');
        
        // Пробуем загрузить и закэшировать каждую картинку
        const cachePromises = PRELOAD_IMAGES.map(imageUrl => {
          return fetch(imageUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${imageUrl}`);
              }
              return cache.put(imageUrl, response);
            })
            .catch(error => {
              console.log(`[SW] Пропущена: ${imageUrl}`, error);
              return Promise.resolve(); // Продолжаем несмотря на ошибки
            });
        });
        
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('[SW] Все картинки закэшированы!');
        // Активируем SW сразу, без ожидания перезагрузки
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('[SW] Ошибка установки:', error);
      })
  );
});

// 2. АКТИВАЦИЯ - очищаем старые кэши
self.addEventListener('activate', event => {
  console.log('[SW] Активация...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Удаляем все старые версии кэша
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Берем управление всеми вкладками сразу
      return self.clients.claim();
    })
  );
});

// 3. ПЕРЕХВАТ ЗАПРОСОВ - отдаем картинки из кэша
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Обрабатываем ТОЛЬКО картинки
  if (url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg|ico)$/i)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // 1. Если есть в кэше - отдаем мгновенно
          if (cachedResponse) {
            console.log('[SW] Из кэша:', url.pathname);
            return cachedResponse;
          }
          
          // 2. Если нет в кэше - загружаем с сети
          return fetch(event.request)
            .then(networkResponse => {
              // Проверяем, что ответ успешный
              if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
              }
              
              // Клонируем ответ
              const responseToCache = networkResponse.clone();
              
              // Сохраняем в кэш для будущего
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                  console.log('[SW] Сохранили в кэш:', url.pathname);
                });
              
              return networkResponse;
            })
            .catch(error => {
              console.log('[SW] Ошибка загрузки:', url.pathname, error);
              
              // Можно вернуть заглушку
              return new Response(
                '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/></svg>',
                {
                  headers: { 'Content-Type': 'image/svg+xml' }
                }
              );
            });
        })
    );
  }
  
  // Для HTML страниц - обычная загрузка
  // (не перехватываем, чтобы не мешать навигации)

});
