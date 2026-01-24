(function() {
    'use strict';
    
    console.log('🔍 Проверяю локальные изображения...');
    
    const IMAGE_MAP = {
        'shapka.webp': true,
        '01.webp': true,
        'd1.webp': true, 'd2.webp': true, 'd3.webp': true,
        // ... все картинки
        'd36.webp': true
    };
    
    // Функция для загрузки через iframe прокси
    function loadViaProxy(filename) {
        return new Promise((resolve) => {
            const iframeId = 'proxy-' + Date.now();
            const proxyUrl = `file:///C:/dag/local-cache-proxy.html?file=${encodeURIComponent(filename)}`;
            
            // Слушаем сообщения от iframe
            function handleMessage(event) {
                if (event.data.type === 'imageLoaded' && event.data.file === filename) {
                    window.removeEventListener('message', handleMessage);
                    document.getElementById(iframeId)?.remove();
                    resolve(true);
                }
            }
            
            window.addEventListener('message', handleMessage);
            
            // Создаем iframe
            const iframe = document.createElement('iframe');
            iframe.id = iframeId;
            iframe.style.display = 'none';
            iframe.src = proxyUrl;
            
            // Таймаут
            setTimeout(() => {
                window.removeEventListener('message', handleMessage);
                iframe.remove();
                resolve(false);
            }, 1000);
            
            document.body.appendChild(iframe);
        });
    }
    
    async function initLocalCache() {
        console.log('🔄 Инициализация локального кэша...');
        
        // Проверяем доступность первого файла
        const testFile = 'shapka.webp';
        const hasAccess = await loadViaProxy(testFile);
        
        if (!hasAccess) {
            console.log('❌ Локальная папка недоступна');
            hideLoader();
            return;
        }
        
        console.log('✅ Локальная папка найдена!');
        
        // Заменяем изображения
        const images = document.querySelectorAll('img');
        const replaced = [];
        
        for (let img of images) {
            const src = img.src;
            const filename = src.split('/').pop();
            
            if (IMAGE_MAP[filename] && !replaced.includes(filename)) {
                // Устанавливаем новый src через наш прокси
                const newSrc = `file:///C:/dag/local-cache-proxy.html?file=${encodeURIComponent(filename)}#img`;
                img.src = newSrc;
                replaced.push(filename);
                console.log(`✅ ${filename}`);
            }
        }
        
        console.log(`📊 Заменено: ${replaced.length} изображений`);
        hideLoader();
    }
    
    function hideLoader() {
        setTimeout(() => {
            const loader = document.getElementById('loading');
            if (loader) {
                loader.style.display = 'none';
                console.log('✅ Индикатор скрыт');
            }
        }, 500);
    }
    
    // Запуск
    window.addEventListener('load', () => {
        setTimeout(initLocalCache, 500);
    });
})();