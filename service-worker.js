// service-worker.js
const CACHE_NAME = 'dagomys-images-v2';
const IMAGES = [
  '/shapka.webp',
  '/dividers_1.png',
  '/d14.webp', '/d15.webp', '/d16.webp', '/d17.webp',
  '/d20.webp', '/d21.webp', '/d22.webp', '/d23.webp',
  '/d24.webp', '/d25.webp', '/d26.webp', '/d27.webp',
  '/d28.webp', '/d29.webp', '/d30.webp', '/d31.webp',
  '/d32.webp', '/d33.webp', '/d34.webp', '/d35.webp',
  '/2.jpg', '/p6.png', '/favicon.png'
];

// 1. УСТАНОВКА И КЭШИРОВАНИЕ
self.addEventListener('install', event => {
  console.log('⚙️ SW: Начинаю установку и кэширование', IMAGES.length, 'картинок');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Пробуем кэшировать каждую картинку
        const promises = IMAGES.map(url => {
          return cache.add(url).catch(err => {
            console.warn('⚠️ Не удалось кэшировать:', url, err);
            return Promise.resolve();
          });
        });
        return Promise.all(promises);
      })
      .then(() => {
        console.log('✅ SW: Все картинки закэшированы!');
        return self.skipWaiting(); // Активируем СРАЗУ
      })
  );
});

// 2. АКТИВАЦИЯ
self.addEventListener('activate', event => {
  console.log('🚀 SW: Активация, беру контроль над страницами');
  
  event.waitUntil(
    Promise.all([
      // Очищаем старые кэши
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => {
            if (name !== CACHE_NAME) {
              console.log('🗑️ Удаляю старый кэш:', name);
              return caches.delete(name);
            }
          })
        );
      }),
      
      // Немедленно берем контроль над всеми клиентами
      self.clients.claim()
    ]).then(() => {
      console.log('✅ SW: Активирован и контролирую страницы');
      
      // Отправляем сообщение на страницу
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({type: 'SW_ACTIVATED'});
        });
      });
    })
  );
});

// 3. ПЕРЕХВАТ ЗАПРОСОВ (главное!)
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = request.url;
  
  // Перехватываем ТОЛЬКО картинки нашего сайта
  if (request.method === 'GET' && 
      url.includes('артскрин.рф') &&
      url.match(/\.(webp|jpg|jpeg|png|gif|ico|svg)$/i)) {
    
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(cached => {
          // 1. ЕСТЬ В КЭШЕ → отдаем мгновенно
          if (cached) {
            console.log('⚡ SW: Отдаю из кэша:', url.split('/').pop());
            return cached;
          }
          
          // 2. НЕТ В КЭШЕ → грузим, кэшируем, отдаем
          console.log('🌐 SW: Гружу с сервера:', url.split('/').pop());
          return fetch(request).then(response => {
            // Проверяем, что ответ успешный
            if (response && response.status === 200) {
              // Клонируем и кэшируем
              const clone = response.clone();
              cache.put(request, clone)
                .then(() => console.log('💾 SW: Сохранил в кэш:', url.split('/').pop()));
            }
            return response;
          }).catch(err => {
            console.error('❌ SW: Ошибка загрузки:', url, err);
            return new Response('', {status: 404});
          });
        });
      })
    );
  }
});

// 4. СООБЩЕНИЯ ОТ СТРАНИЦЫ
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    caches.open(CACHE_NAME).then(cache => {
      cache.keys().then(keys => {
        event.ports[0].postMessage({
          type: 'CACHE_INFO',
          count: keys.length,
          files: keys.map(k => k.url)
        });
      });
    });
  }
});
