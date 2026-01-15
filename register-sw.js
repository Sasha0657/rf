// register-sw.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
(function() {
  if (!('serviceWorker' in navigator)) {
    console.log('Браузер не поддерживает Service Worker');
    return;
  }
  
  // Регистрируем СРАЗУ, не ждем load
  navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      console.log('✅ SW зарегистрирован');
      
      // Принудительная активация
      if (registration.waiting) {
        registration.waiting.postMessage({type: 'SKIP_WAITING'});
      }
      
      if (registration.installing) {
        registration.installing.addEventListener('statechange', function() {
          if (this.state === 'installed') {
            console.log('SW установлен, принудительно активирую...');
            registration.waiting.postMessage({type: 'SKIP_WAITING'});
            location.reload(); // Перезагружаем страницу
          }
        });
      }
      
      // Проверяем обновления
      setInterval(() => registration.update(), 60 * 60 * 1000);
      
      // Слушаем сообщения от SW
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'SW_ACTIVATED') {
          console.log('✅ SW активирован! Версия:', event.data.version);
        }
      });
      
    })
    .catch(function(error) {
      console.log('❌ Ошибка регистрации SW:', error);
    });
  
  // При загрузке страницы проверяем состояние
  window.addEventListener('load', function() {
    setTimeout(() => {
      if (navigator.serviceWorker.controller) {
        console.log('🎯 Страница контролируется SW');
        
        // Проверяем кэш
        caches.open('dagomys-cache-v1.1').then(cache => {
          cache.keys().then(keys => {
            console.log(`📦 В кэше: ${keys.length} файлов`);
          });
        });
      } else {
        console.log('🔄 SW еще не контролирует страницу...');
        console.log('Перезагрузите страницу или откройте сайт в новой вкладке!');
      }
    }, 1000);
  });
})();


