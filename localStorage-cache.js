// localStorage-cache.js
(function() {
    console.log('💾 LocalStorage кэш');
    
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
    
    // Функция загрузки и кэширования
    async function cacheAndReplace() {
        console.log('🔄 Кэширую изображения...');
        
        for (const filename of IMAGES) {
            const imgElements = document.querySelectorAll(`img[src*="${filename}"]`);
            
            if (imgElements.length > 0) {
                // Проверяем, есть ли уже в кэше
                const cacheKey = `img_${filename}`;
                const cached = localStorage.getItem(cacheKey);
                
                if (cached) {
                    // Используем кэш
                    imgElements.forEach(img => {
                        img.src = cached;
                    });
                    console.log(`✅ ${filename} из кэша`);
                } else {
                    // Загружаем и кэшируем
                    const originalSrc = imgElements[0].src;
                    
                    try {
                        const response = await fetch(originalSrc);
                        const blob = await response.blob();
                        
                        // Конвертируем в base64
                        const reader = new FileReader();
                        reader.onload = function() {
                            const base64 = reader.result;
                            
                            // Сохраняем в localStorage
                            localStorage.setItem(cacheKey, base64);
                            
                            // Применяем
                            imgElements.forEach(img => {
                                img.src = base64;
                            });
                            
                            console.log(`💾 ${filename} закэширован`);
                        };
                        reader.readAsDataURL(blob);
                    } catch (error) {
                        console.log(`❌ Ошибка кэширования ${filename}:`, error);
                    }
                }
            }
        }
        
        hideLoader();
    }
    
    function hideLoader() {
        setTimeout(() => {
            const loader = document.getElementById('loading');
            if (loader) {
                loader.style.display = 'none';
                console.log('👋 Индикатор скрыт');
            }
        }, 1000);
    }
    
    // Проверяем поддержку
    if (!window.localStorage) {
        console.log('❌ LocalStorage не поддерживается');
        hideLoader();
        return;
    }
    
    // Запускаем
    window.addEventListener('load', function() {
        setTimeout(cacheAndReplace, 500);
    });
    
    // Команда для очистки кэша
    window.clearImageCache = function() {
        IMAGES.forEach(filename => {
            localStorage.removeItem(`img_${filename}`);
        });
        console.log('🗑️ Кэш очищен');
        location.reload();
    };
})();