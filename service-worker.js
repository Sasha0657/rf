// service-worker.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
const CACHE_NAME = 'dagomys-cache-v1.1'; // Измените версию!
const IMAGES = [
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

// 1. УСТАНОВКА
self.addEventListener('install', event => {
  console.log('[SW] Установка...');
  
  // Пропускаем фазу ожидания СРАЗУ
  self.skipWaiting();
  
  // Кэшируем в фоне, не блокируя активацию
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Начинаю кэширование', IMAGES.length, 'картинок');
        
        // Кэшируем без ожидания завершения всех
        const promises = IMAGES.map(url => {
          return fetch(url, { cache: 'no-cache' })
            .then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
              return Promise.resolve();
            })
            .catch(err => {
              console.log('[SW] Пропущена:', url);
              return Promise.resolve();
            });
        });
        
        return Promise.all(promises);
      })
      .then(() => {
        console.log('[SW] Кэширование завершено!');
      })
  );
});

// 2. АКТИВАЦИЯ
self.addEventListener('activate', event => {
  console.log('[SW] Активация!');
  
  event.waitUntil(
    Promise.all([
      // Очищаем ВСЕ старые кэши
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => {
            console.log('[SW] Найден кэш:', name);
            if (name !== CACHE_NAME) {
              console.log('[SW] Удаляю старый кэш:', name);
              return caches.delete(name);
            }
          })
        );
      }),
      
      // НЕМЕДЛЕННО берем контроль над ВСЕМИ вкладками
      self.clients.claim()
    ])
    .then(() => {
      console.log('[SW] Активирован и контролирую все вкладки!');
      
      // Сообщаем всем вкладкам об активации
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({type: 'SW_ACTIVATED', version: CACHE_NAME});
        });
      });
    })
  );
});

// 3. ПЕРЕХВАТ ЗАПРОСОВ
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // Только для картинок нашего сайта
  if (url.includes('артскрин.рф') && 
      url.match(/\.(webp|jpg|jpeg|png|gif|svg|ico)$/i)) {
    
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cached => {
          // Если есть в кэше - отдаем
          if (cached) {
            console.log('[SW] ⚡ Из кэша:', url.split('/').pop());
            return cached;
          }
          
          // Если нет - грузим
          console.log('[SW] 🌐 Гружу:', url.split('/').pop());
          return fetch(event.request)
            .then(response => {
              // Кэшируем для будущего
              if (response.ok) {
                const clone = response.clone();
                cache.put(event.request, clone)
                  .then(() => {
                    console.log('[SW] 💾 Сохранено:', url.split('/').pop());
                  });
              }
              return response;
            })
            .catch(err => {
              console.log('[SW] ❌ Ошибка:', url);
              return new Response('');
            });
        });
      })
    );
  }
});


