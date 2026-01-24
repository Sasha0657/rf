// local-cache-simple-fixed.js
(function() {
    'use strict';
    
    console.log('⚡ Быстрый локальный кэш');
    
    // Список изображений
    const IMAGES = [
        'shapka.webp', '01.webp', 
        'd1.webp', 'd2.webp', 'd3.webp', 'd4.webp', 'd5.webp',
        'd6.webp', 'd7.webp', 'd8.webp', 'd9.webp', 'd10.webp',
        'd11.webp', 'd12.webp', 'd13.webp', 'd14.webp', 'd15.webp',
        'd16.webp', 'd17.webp', 'd18.webp', 'd19.webp', 'd20.webp',
        'd21.webp', 'd22.webp', 'd23.webp', 'd24.webp', 'd25.webp',
        'd26.webp', 'd27.webp', 'd28.webp', 'd29.webp', 'd30.webp',
        'd31.webp', 'd32.webp', 'd33.webp', 'd34.webp', 'd35.webp',
        'd36.webp'
    ];
    
    // Функция проверки и замены
    function checkAndReplaceImages() {
        console.log('🔍 Проверяю изображения...');
        
        // Создаем индикатор прогресса
        const progress = document.createElement('div');
        progress.style.cssText = `
            position: fixed;
            bottom: 20px; right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        progress.textContent = '🔄 Проверяю локальные файлы...';
        document.body.appendChild(progress);
        
        let checked = 0;
        let replaced = 0;
        
        // Проверяем каждое изображение
        IMAGES.forEach(filename => {
            // Находим все соответствующие img элементы
            const imgElements = document.querySelectorAll(`img[src*="${filename}"]`);
            
            if (imgElements.length > 0) {
                // Создаем тестовое изображение
                const testImg = new Image();
                const localPath = `file:///C:/dag/${filename}`;
                
                testImg.onload = function() {
                    // Если локальный файл загрузился
                    imgElements.forEach(img => {
                        img.src = localPath;
                        replaced++;
                    });
                    checked++;
                    updateProgress();
                };
                
                testImg.onerror = function() {
                    // Локальный файл не найден
                    checked++;
                    updateProgress();
                };
                
                testImg.src = localPath;
            } else {
                checked++;
                updateProgress();
            }
        });
        
        function updateProgress() {
            const percent = Math.round((checked / IMAGES.length) * 100);
            progress.textContent = `📊 ${percent}% (${replaced} заменено)`;
            
            if (checked === IMAGES.length) {
                setTimeout(() => {
                    progress.remove();
                    console.log(`✅ Проверка завершена. Заменено: ${replaced}`);
                    
                    // Скрываем основной индикатор
                    hideLoader();
                    
                    if (replaced > 0) {
                        showNotification(`🔄 Заменено ${replaced} изображений на локальные`);
                    }
                }, 500);
            }
        }
        
        // На случай, если что-то пойдет не так
        setTimeout(() => {
            progress.remove();
            hideLoader();
        }, 5000);
    }
    
    // Показываем уведомление
    function showNotification(message) {
        const note = document.createElement('div');
        note.style.cssText = `
            position: fixed;
            top: 20px; right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease;
        `;
        note.textContent = message;
        document.body.appendChild(note);
        
        setTimeout(() => {
            note.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => note.remove(), 300);
        }, 3000);
        
        // Добавляем стили для анимации
        if (!document.querySelector('#cache-styles')) {
            const style = document.createElement('style');
            style.id = 'cache-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Скрываем индикатор
    function hideLoader() {
        const loader = document.getElementById('loading');
        if (loader) {
            loader.style.transition = 'opacity 0.5s ease';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                console.log('👋 Индикатор загрузки скрыт');
            }, 500);
        }
    }
    
    // Основная инициализация
    function init() {
        console.log('🚀 Запускаю проверку локальных файлов...');
        
        // Ждем полной загрузки DOM
        if (document.readyState === 'complete') {
            setTimeout(checkAndReplaceImages, 800);
        } else {
            window.addEventListener('load', () => {
                setTimeout(checkAndReplaceImages, 800);
            });
        }
    }
    
    // Запуск
    init();
    
    // Для ручного вызова из консоли
    window.checkLocalImages = checkAndReplaceImages;
    
})();