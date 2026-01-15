// register-sw.js - регистрируем Service Worker
(function() {
  // Проверяем поддержку
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker не поддерживается');
    return;
  }
  
  // Ждем полной загрузки страницы
  window.addEventListener('load', function() {
    // Регистрируем Service Worker
    navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
        console.log('Service Worker зарегистрирован:', registration.scope);
        
        // Проверяем обновления
        registration.addEventListener('updatefound', function() {
          const newWorker = registration.installing;
          console.log('Обновление Service Worker:', newWorker.state);
          
          newWorker.addEventListener('statechange', function() {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Новый SW установлен, можно обновить
              console.log('Новая версия SW готова!');
            }
          });
        });
      })
      .catch(function(error) {
        console.log('Ошибка регистрации Service Worker:', error);
      });
      
    // Проверяем, контролирует ли SW страницу
    if (navigator.serviceWorker.controller) {
      console.log('Эта страница контролируется Service Worker');
    }
    
    // Отладочные сообщения от SW
    navigator.serviceWorker.addEventListener('message', function(event) {
      console.log('Сообщение от SW:', event.data);
    });
  });
})();