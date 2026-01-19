// register-sw.js - безопасная регистрация Service Worker
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
        console.log('SW зарегистрирован:', registration.scope);
        
        // Когда SW готов
        return navigator.serviceWorker.ready;
      })
      .then(function() {
        console.log('SW готов, картинки закэшированы');
        
        // БЕЗОПАСНАЯ попытка скрыть индикатор
        try {
          const loader = document.getElementById('loading');
          if (loader && loader.style) {
            loader.style.display = 'none';
            console.log('Индикатор загрузки скрыт');
          } else {
            console.log('Элемент #loading не найден - это нормально');
          }
        } catch (error) {
          console.log('Ошибка при скрытии индикатора:', error);
        }
      })
      .catch(function(error) {
        console.log('Ошибка регистрации SW:', error);
        
        // Все равно пытаемся скрыть индикатор
        try {
          const loader = document.getElementById('loading');
          if (loader) loader.style.display = 'none';
        } catch (e) {
          // Игнорируем ошибку
        }
      });
  });
})();