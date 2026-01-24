// indexeddb-cache-fixed.js
(function() {
    console.log('🗄️ IndexedDB кэш (исправленный)');
    
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
    
    const DB_NAME = 'imageCacheDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'images';
    
    // Открытие базы данных
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'filename' });
                }
            };
        });
    }
    
    // Получить изображение из кэша
    async function getImageFromCache(db, filename) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(filename);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Сохранить изображение в кэш
    async function saveImageToCache(db, filename, dataUrl) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const request = store.put({
                filename: filename,
                data: dataUrl,
                timestamp: Date.now(),
                size: dataUrl.length
            });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // Конвертировать blob в Data URL
    function blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    
    // Основная функция кэширования
    async function cacheImages() {
        try {
            const db = await openDB();
            console.log('✅ База данных открыта');
            
            let fromCache = 0;
            let newlyCached = 0;
            let errors = 0;
            
            // Обрабатываем изображения последовательно
            for (const filename of IMAGES) {
                const imgElements = document.querySelectorAll(`img[src*="${filename}"]`);
                
                if (imgElements.length === 0) {
                    console.log(`⏭️ ${filename} не найден на странице`);
                    continue;
                }
                
                try {
                    // Пробуем получить из кэша
                    const cached = await getImageFromCache(db, filename);
                    
                    if (cached && cached.data) {
                        // Используем кэш
                        imgElements.forEach(img => {
                            img.src = cached.data;
                        });
                        fromCache++;
                        console.log(`✅ ${filename} из кэша`);
                    } else {
                        // Загружаем с сервера
                        const originalSrc = imgElements[0].src;
                        const response = await fetch(originalSrc);
                        
                        if (!response.ok) {
                            console.log(`❌ ${filename}: HTTP ${response.status}`);
                            errors++;
                            continue;
                        }
                        
                        const blob = await response.blob();
                        
                        // Конвертируем в Data URL
                        const dataUrl = await blobToDataURL(blob);
                        
                        // Сохраняем в кэш
                        await saveImageToCache(db, filename, dataUrl);
                        
                        // Применяем к изображениям
                        imgElements.forEach(img => {
                            img.src = dataUrl;
                        });
                        
                        newlyCached++;
                        console.log(`💾 ${filename} закэширован (${Math.round(dataUrl.length/1024)}KB)`);
                    }
                    
                } catch (error) {
                    console.log(`⚠️ Ошибка ${filename}:`, error.message);
                    errors++;
                }
            }
            
            console.log(`📊 Итого: ${fromCache} из кэша, ${newlyCached} закэшировано, ${errors} ошибок`);
            
        } catch (error) {
            console.error('❌ Критическая ошибка:', error);
        }
    }
    
    // Скрыть индикатор
    function hideLoader() {
        const loader = document.getElementById('loading');
        if (loader) {
            setTimeout(() => {
                loader.style.display = 'none';
                console.log('👋 Индикатор скрыт');
            }, 1000);
        }
    }
    
    // Очистка кэша
    async function clearCache() {
        try {
            const db = await openDB();
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = resolve;
                request.onerror = reject;
            });
            console.log('🗑️ IndexedDB кэш очищен');
        } catch (error) {
            console.error('❌ Ошибка очистки:', error);
        }
    }
    
    // Запуск
    window.addEventListener('load', async function() {
        if (!('indexedDB' in window)) {
            console.log('❌ IndexedDB не поддерживается');
            hideLoader();
            return;
        }
        
        setTimeout(async () => {
            await cacheImages();
            hideLoader();
        }, 500);
    });
    
    // Экспорт для отладки
    window.imageCache = {
        clear: clearCache,
        reload: cacheImages,
        stats: async function() {
            try {
                const db = await openDB();
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const count = await new Promise(resolve => {
                    const request = store.count();
                    request.onsuccess = () => resolve(request.result);
                });
                return `В кэше: ${count} изображений`;
            } catch (error) {
                return 'Ошибка получения статистики';
            }
        }
    };
    
})();