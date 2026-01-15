// register-sw.js - полная версия с обновлением
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
        console.log('SW зарегистрирован:', registration.scope);
        
        // === КОД ОБНОВЛЕНИЯ ===
        // 1. Проверяем обновления при загрузке
        registration.update();
        
        // 2. Слушаем событие обновления
        registration.addEventListener('updatefound', function() {
          const newWorker = registration.installing;
          console.log('Найдено обновление SW! Состояние:', newWorker.state);
          
          newWorker.addEventListener('statechange', function() {
            console.log('Состояние нового SW:', newWorker.state);
            
            // Когда новый SW установлен
            if (newWorker.state === 'installed') {
              // Если есть контролирующий SW (страница уже работает со SW)
              if (navigator.serviceWorker.controller) {
                console.log('Новая версия SW готова! Перезагрузите страницу.');
                
                // Можно показать уведомление пользователю
                if (confirm('Доступна новая версия сайта. Обновить?')) {
                  window.location.reload();
                }
              } else {
                console.log('SW установлен впервые');
              }
            }
          });
        });
        // === КОНЕЦ КОДА ОБНОВЛЕНИЯ ===
        
      })
      .catch(function(error) {
        console.log('Ошибка регистрации SW:', error);
      });
    
    // Периодическая проверка обновлений
    setInterval(function() {
      navigator.serviceWorker.getRegistration()
        .then(reg => reg && reg.update());
    }, 60 * 60 * 1000); // Каждый час
  });
}
