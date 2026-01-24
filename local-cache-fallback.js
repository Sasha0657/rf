(function() {
    'use strict';
    
    // Только для вашего локального использования
    const LOCAL_PATH = 'file:///C:/dag/';
    
    // Список ваших изображений
    const IMAGE_MAP = {
        'shapka.webp': true,
        '01.webp': true,
        'dividers_1.png': true,       
        'p6.png': true,
        'd1.webp': true, 'd2.webp': true, 'd3.webp': true,
        'd4.webp': true, 'd5.webp': true, 'd6.webp': true,
        'd7.webp': true, 'd8.webp': true, 'd9.webp': true,
        'd10.webp': true, 'd11.webp': true, 'd12.webp': true,
        'd13.webp': true, 'd14.webp': true, 'd15.webp': true,
        'd16.webp': true, 'd17.webp': true, 'd18.webp': true,
        'd19.webp': true, 'd20.webp': true, 'd21.webp': true,
        'd22.webp': true, 'd23.webp': true, 'd24.webp': true,
        'd25.webp': true, 'd26.webp': true, 'd27.webp': true,
        'd28.webp': true, 'd29.webp': true, 'd30.webp': true,
        'd31.webp': true, 'd32.webp': true, 'd33.webp': true,
        'd34.webp': true, 'd35.webp': true, 'd36.webp': true
    };
    
    // Основная функция
    function initLocalCache() {
        console.log('🔍 Проверяю локальные изображения...');
        
        // Получаем все изображения на странице
        const images = document.getElementsByTagName('img');
        
        for (let img of images) {
            const src = img.src;
            const filename = src.split('/').pop();
            
            // Проверяем, есть ли это изображение в нашем списке
            if (IMAGE_MAP[filename]) {
                const localSrc = LOCAL_PATH + filename;
                
                // Создаем тестовое изображение для проверки
                const testImg = new Image();
                testImg.onload = function() {
                    // Если локальный файл существует, заменяем
                    img.src = localSrc;
                    console.log(`✅ Заменено: ${filename}`);
                };
                testImg.src = localSrc;
            }
        }
        
        // Скрываем индикатор загрузки
        setTimeout(() => {
            const loader = document.getElementById('loading');
            if (loader) {
                loader.style.display = 'none';
                console.log('✅ Индикатор скрыт');
            }
        }, 1000);
    }
    
    // Запускаем после загрузки страницы
    window.addEventListener('load', function() {
        // Ждем немного, чтобы все изображения начали загружаться
        setTimeout(initLocalCache, 500);
    });
})();