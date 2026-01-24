// local-folder-only.js
(function() {
    console.log('📁 Только локальная папка C:\\dag\\');
    
    const IMAGES = [
        'shapka.webp', '01.webp', 'd1.webp', 'd2.webp', 'd3.webp',
        'd4.webp', 'd5.webp', 'd6.webp', 'd7.webp', 'd8.webp',
        'd9.webp', 'd10.webp', 'd11.webp', 'd12.webp', 'd13.webp',
        'd14.webp', 'd15.webp', 'd16.webp', 'd17.webp', 'd18.webp',
        'd19.webp', 'd20.webp', 'd21.webp', 'd22.webp', 'd23.webp',
        'd24.webp', 'd25.webp', 'd26.webp', 'd27.webp', 'd28.webp',
        'd29.webp', 'd30.webp', 'd31.webp', 'd32.webp', 'd33.webp',
        'd34.webp', 'd35.webp', 'd36.webp'
    ];
    
    // Основная функция
    function loadFromLocalFolder() {
        console.log('🔍 Ищу картинки в C:\\dag\\...');
        
        let loaded = 0;
        let notFound = 0;
        
        IMAGES.forEach(filename => {
            const imgElements = document.querySelectorAll(`img[src*="${filename}"]`);
            
            if (imgElements.length > 0) {
                const localUrl = `file:///C:/dag/${filename}`;
                
                // Создаем тестовое изображение для проверки
                const testImg = new Image();
                
                testImg.onload = function() {
                    // Файл существует - заменяем
                    imgElements.forEach(img => {
                        img.src = localUrl;
                    });
                    loaded++;
                    console.log(`✅ ${filename} загружен с диска`);
                    
                    // Если это последнее - скрываем индикатор
                    checkCompletion();
                };
                
                testImg.onerror = function() {
                    // Файл не найден
                    notFound++;
                    console.log(`❌ ${filename} не найден в C:\\dag\\`);
                    checkCompletion();
                };
                
                testImg.src = localUrl;
            }
        });
        
        function checkCompletion() {
            if (loaded + notFound === IMAGES.length) {
                console.log(`📊 Результат: ${loaded} загружено с диска, ${notFound} не найдено`);
                
                if (loaded > 0) {
                    console.log(`🎉 ${loaded} изображений загружены с локального диска!`);
                } else {
                    console.log('⚠️ Ни одного локального файла не найдено');
                }
                
                // Скрываем индикатор
                hideLoader();
            }
        }
        
        // На всякий случай таймаут
        setTimeout(() => {
            hideLoader();
        }, 3000);
    }
    
    function hideLoader() {
        const loader = document.getElementById('loading');
        if (loader) {
            loader.style.display = 'none';
            console.log('👋 Индикатор скрыт');
        }
    }
    
    // Запускаем
    window.addEventListener('load', function() {
        setTimeout(loadFromLocalFolder, 500);
    });
    
    // Для проверки из консоли
    window.testLocalFolder = function() {
        console.log('Тестирую доступ к C:\\dag\\...');
        
        const testImg = new Image();
        testImg.onload = function() {
            console.log('✅ C:\\dag\\ ДОСТУПЕН! Можно загружать картинки.');
            console.log('Пример URL: file:///C:/dag/shapka.webp');
        };
        testImg.onerror = function() {
            console.log('❌ C:\\dag\\ НЕДОСТУПЕН! Браузер блокирует file:// протокол.');
            console.log('Решение: запустите сайт локально через python -m http.server');
        };
        testImg.src = 'file:///C:/dag/shapka.webp';
    };
    
})();