// register-sw.js
(function() {
  // Проверяем поддержку Service Worker
  if (!('serviceWorker' in navigator)) {
    console.log('Ваш браузер не поддерживает Service Worker');
    return;
  }
  
  // Ждем загрузки страницы
  window.addEventListener('load', function() {
    // Регистрируем Service Worker
    navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
        console.log('✅ Service Worker зарегистрирован:', registration.scope);
        
        // Когда SW готов
        return navigator.serviceWorker.ready;
      })
      .then(function() {
        console.log('✅ Service Worker готов, картинки закэшированы');
        
        // Проверяем что в кэше (для отладки)
        caches.open('dagomys-cache-v1.0').then(cache => {
          cache.keys().then(keys => {
            console.log('📦 В кэше сохранено картинок:', keys.length);
          });
        });
      })
      .catch(function(error) {
        console.log('❌ Ошибка регистрации Service Worker:', error);
      });
  });
})();

